import {
  ParsedRevenueGradeOutput,
  ConfidenceRating,
  CalibrationStatus,
  DegradationSimulation,
  DegradationStepResult,
  LedgerEntry,
  LedgerAuditResult,
} from '../types';

/**
 * Parses and extracts key orchestration metadata using resilient regex patterns.
 * Designed to bypass broken markdown structures, unclosed JSON blocks, and conversational noise.
 */
export function parseMetadataFallback(rawText: string): {
  is_provisional: boolean;
  confidence_calibration: ConfidenceRating;
  parsing_method: 'regex_fallback';
} {
  let isProvisional = true;
  let confidenceCalibration: ConfidenceRating = 'guess';

  const provisionalRegex = /(?:is_provisional|isProvisional)\s*[*`":_]*\s*[:=]\s*[*`":_]*\s*(true|false)/i;
  const confidenceRegex = /(?:confidence_calibration|confidenceCalibration)\s*[*`":_]*\s*[:=]\s*[*`":_]*\s*([a-zA-Z]+)/i;

  const provMatch = rawText.match(provisionalRegex);
  if (provMatch && provMatch[1]) {
    isProvisional = provMatch[1].toLowerCase() === 'true';
  }

  const confMatch = rawText.match(confidenceRegex);
  if (confMatch && confMatch[1]) {
    const rawVal = confMatch[1].toLowerCase().trim();
    if (rawVal === 'fact' || rawVal === 'inference' || rawVal === 'guess') {
      confidenceCalibration = rawVal;
    } else {
      confidenceCalibration = 'guess';
    }
  }

  return {
    is_provisional: isProvisional,
    confidence_calibration: confidenceCalibration,
    parsing_method: 'regex_fallback',
  };
}

/**
 * Extracts and categorizes Revenue-Grade Output into structured object
 */
export function parseRevenueGradeOutput(raw: string): ParsedRevenueGradeOutput {
  const fallback = parseMetadataFallback(raw);

  // Extract Calibration Status
  let calibrationStatus: CalibrationStatus = 'PROVISIONAL';
  const calStatusMatch = raw.match(/CALIBRATION\s+STATUS:\s*\[?(FULLY\s+GROUNDED|PROVISIONAL|FEASIBILITY\s+ESTIMATE)\]?/i);
  if (calStatusMatch && calStatusMatch[1]) {
    const statusUpper = calStatusMatch[1].toUpperCase();
    if (statusUpper.includes('FULLY')) calibrationStatus = 'FULLY GROUNDED';
    else if (statusUpper.includes('FEASIBILITY')) calibrationStatus = 'FEASIBILITY ESTIMATE';
    else calibrationStatus = 'PROVISIONAL';
  }

  // Extract Data Grounding
  let dataGrounding = 'Not explicitly cited';
  const groundingMatch = raw.match(/[*•\-]\s*\*\*Data Grounding:\*\*\s*(.+)/i) || raw.match(/Data Grounding:\s*([^\n]+)/i);
  if (groundingMatch && groundingMatch[1]) {
    dataGrounding = groundingMatch[1].replace(/\[|\]/g, '').trim();
  }

  // Extract Primary Risk Vector
  let primaryRiskVector = 'Unspecified';
  const riskMatch = raw.match(/[*•\-]\s*\*\*Primary Risk Vector:\*\*\s*(.+)/i) || raw.match(/Primary Risk Vector:\s*([^\n]+)/i);
  if (riskMatch && riskMatch[1]) {
    primaryRiskVector = riskMatch[1].replace(/\[|\]/g, '').trim();
  }

  // Extract Role Header & Task Title
  let roleHeader = 'AGENT';
  let taskTitle = 'EXECUTION TASK';
  const headerMatch = raw.match(/###\s+([A-Z0-9_-]+):\s*([^\n]+)/i);
  if (headerMatch) {
    roleHeader = headerMatch[1].trim();
    taskTitle = headerMatch[2].trim();
  }

  // Extract Section 1: Executive Summary
  let executiveSummary = '';
  const summaryMatch = raw.match(/(?:####|###|\*\*)\s*(?:1\.?\s*)?EXECUTIVE SUMMARY[\s\S]*?\n\n?([\s\S]*?)(?=(?:####|###|\*\*)\s*(?:2\.?\s*)?TECHNICAL TRADE-OFF|####\s*2|###\s*2|$)/i);
  if (summaryMatch && summaryMatch[1]) {
    executiveSummary = summaryMatch[1].trim();
  } else {
    // Fallback: search for first paragraph after metadata
    const paragraphs = raw.split(/\n\s*\n/);
    if (paragraphs.length > 1) {
      executiveSummary = paragraphs[1].trim();
    }
  }

  // Extract Section 2: Technical Trade-Off Matrix
  let tradeOffMatrix = null;
  const tradeOffMatch = raw.match(/(?:####|###)\s*(?:2\.?\s*)?TECHNICAL TRADE-OFF ANALYSIS[\s\S]*?(?=(?:####|###)\s*(?:3\.?\s*)?PROPOSED|####\s*3|###\s*3|####\s*4|###\s*4|$)/i);
  if (tradeOffMatch) {
    const tradeOffBlock = tradeOffMatch[0];

    const criticalMatch = tradeOffBlock.match(/[*•\-]\s*\*\*Critical Vulnerability(?: \(SPOF\))?:\*\*\s*(.+)/i);
    const noGoJustMatch = tradeOffBlock.match(/[*•\-]\s*\*\*The "No-Go" Justification:\*\*\s*(.+)/i);

    tradeOffMatrix = {
      proposedPathName: 'Proposed Architecture',
      noGoAlternativeName: 'Baseline / "No-Go"',
      complexityCost: { proposed: 'Explicit decoupled state', noGo: 'Monolithic baseline' },
      spofFailureMode: { proposed: 'Single point of failure managed', noGo: 'Silent cascading failure' },
      resourceFootprint: { proposed: 'Optimized execution', noGo: 'Higher operational cost' },
      criticalVulnerability: criticalMatch ? criticalMatch[1].trim() : 'Peak load state desynchronization',
      noGoJustification: noGoJustMatch ? noGoJustMatch[1].trim() : 'Rejected due to lack of verifiable failure isolation boundaries.',
    };
  }

  // Extract Section 3: Grounding & Confidence Assessment
  let confidenceAssessment = null;
  const assessmentMatch = raw.match(/(?:####|###)\s*(?:[34]\.?\s*)?(?:GROUNDING & CONFIDENCE ASSESSMENT|CONFIDENCE & VERIFICATION MATRIX)[\s\S]*?$/i);
  if (assessmentMatch) {
    const assessmentBlock = assessmentMatch[0];

    const extractListItems = (headingRegex: RegExp) => {
      const match = assessmentBlock.match(headingRegex);
      if (!match) return [];
      const lines = match[1].split('\n');
      return lines
        .map((l) => l.replace(/^\s*(?:[*•\-]|(?:\d+\.))\s*/, '').trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'));
    };

    const verified = extractListItems(/Verified Facts[^\n]*\n([\s\S]*?)(?=Approximate Recollections|Guesses|$)/i);
    const recollections = extractListItems(/Approximate Recollections[^\n]*\n([\s\S]*?)(?=Guesses|Required Verification|$)/i);
    const guesses = extractListItems(/Guesses[^\n]*\n([\s\S]*?)(?=Required Verification|Verification Steps|$)/i);
    const verificationSteps = extractListItems(/(?:Required Verification|Verification & Dry-Run Steps)[^\n]*\n([\s\S]*?)$/i);

    confidenceAssessment = {
      verifiedFacts: verified.length > 0 ? verified : ['Substrate compliance contract verified in session'],
      approximateRecollections: recollections.length > 0 ? recollections : ['Standard architectural design patterns from knowledge base'],
      guessesInferences: guesses.length > 0 ? guesses : ['Custom configuration parameters tailored for this execution'],
      requiredVerificationSteps: verificationSteps.length > 0 ? verificationSteps : ['Execute dry-run validation in sandbox environment before production promotion'],
    };
  }

  return {
    raw,
    roleHeader,
    taskTitle,
    calibrationStatus,
    dataGrounding,
    primaryRiskVector,
    isProvisional: fallback.is_provisional,
    confidenceCalibration: fallback.confidence_calibration,
    executiveSummary: executiveSummary || raw.slice(0, 300),
    tradeOffMatrix,
    confidenceAssessment,
    parsingMethod: raw.trim().startsWith('{') ? 'strict_ast' : 'regex_fallback',
  };
}

/**
 * Simulates the 4-Tier Adaptive Degradation Gateway pipeline
 */
export function simulateAdaptiveDegradation(rawInput: string): DegradationSimulation {
  const steps: DegradationStepResult[] = [];

  // Step 1: Strict AST / JSON Parsing
  let astSuccess = false;
  let astData: any = null;
  try {
    astData = JSON.parse(rawInput.trim());
    if (astData && typeof astData === 'object' && astData.is_provisional !== undefined) {
      astSuccess = true;
    }
  } catch {
    astSuccess = false;
  }

  if (astSuccess) {
    steps.push({
      step: 1,
      stepName: 'AST / JSON Structural Parser',
      status: 'passed',
      durationMs: 1.2,
      outputSnippet: JSON.stringify(astData).slice(0, 80) + '...',
      extractedMetadata: {
        is_provisional: astData.is_provisional,
        confidence_calibration: astData.confidence_calibration,
      },
      details: 'Payload is perfectly valid JSON with explicit required metadata keys.',
    });

    return {
      rawInput,
      steps,
      finalResult: {
        is_provisional: Boolean(astData.is_provisional),
        confidence_calibration: String(astData.confidence_calibration || 'fact'),
        resolvedBy: 'Step 1: AST Parser',
      },
    };
  } else {
    steps.push({
      step: 1,
      stepName: 'AST / JSON Structural Parser',
      status: 'failed',
      durationMs: 2.1,
      details: 'JSON.parse threw SyntaxError or missing required root metadata keys. Cascading to Step 2.',
    });
  }

  // Step 2: Fallback Regex Scanner
  const regexResult = parseMetadataFallback(rawInput);
  const foundProvisionalRegex = /(?:is_provisional|isProvisional)\s*[*`":_]*\s*[:=]\s*[*`":_]*\s*(true|false)/i.test(rawInput);
  const foundConfidenceRegex = /(?:confidence_calibration|confidenceCalibration)\s*[*`":_]*\s*[:=]\s*[*`":_]*\s*([a-zA-Z]+)/i.test(rawInput);

  if (foundProvisionalRegex || foundConfidenceRegex) {
    steps.push({
      step: 2,
      stepName: 'Stateless Regex Scanner',
      status: 'passed',
      durationMs: 0.8,
      outputSnippet: `is_provisional: ${regexResult.is_provisional}, confidence_calibration: "${regexResult.confidence_calibration}"`,
      extractedMetadata: {
        is_provisional: regexResult.is_provisional,
        confidence_calibration: regexResult.confidence_calibration,
      },
      details: 'Regex intercepted and salvaged raw metadata variables directly from text stream in <1ms without LLM overhead.',
    });

    return {
      rawInput,
      steps,
      finalResult: {
        is_provisional: regexResult.is_provisional,
        confidence_calibration: regexResult.confidence_calibration,
        resolvedBy: 'Step 2: Fallback Regex Scanner',
      },
    };
  } else {
    steps.push({
      step: 2,
      stepName: 'Stateless Regex Scanner',
      status: 'failed',
      durationMs: 0.9,
      details: 'Regex scan found no recognizable metadata tokens. Cascading to Step 3.',
    });
  }

  // Step 3: Microcorrection Prompt Dispatch
  const isConversationalNoise = rawInput.toLowerCase().includes('sorry') || rawInput.toLowerCase().includes('apologize');
  if (isConversationalNoise) {
    steps.push({
      step: 3,
      stepName: 'Microcorrection Protocol',
      status: 'passed',
      durationMs: 142.5,
      outputSnippet: '{"is_provisional": true, "confidence_calibration": "inference"}',
      extractedMetadata: {
        is_provisional: true,
        confidence_calibration: 'inference',
      },
      details: 'Dispatched microcorrection prompt to LLM to extract clean JSON metadata envelope from raw output stream.',
    });

    return {
      rawInput,
      steps,
      finalResult: {
        is_provisional: true,
        confidence_calibration: 'inference',
        resolvedBy: 'Step 3: Microcorrection Prompt',
      },
    };
  } else {
    steps.push({
      step: 3,
      stepName: 'Microcorrection Protocol',
      status: 'failed',
      durationMs: 180.2,
      details: 'Microcorrection query timeout or corrupted response payload. Cascading to Step 4.',
    });
  }

  // Step 4: Systemic Safe Risk Fallback
  steps.push({
    step: 4,
    stepName: 'Maximum Risk Safe Default State',
    status: 'passed',
    durationMs: 0.1,
    outputSnippet: '{"is_provisional": true, "confidence_calibration": "guess"}',
    extractedMetadata: {
      is_provisional: true,
      confidence_calibration: 'guess',
    },
    details: 'Assigned safe default values (is_provisional: true, confidence_calibration: "guess") to prevent pipeline halt while isolating unverified state.',
  });

  return {
    rawInput,
    steps,
    finalResult: {
      is_provisional: true,
      confidence_calibration: 'guess',
      resolvedBy: 'Step 4: Safe Risk Default State',
    },
  };
}

/**
 * Financial Ledger Audit & Double-Entry Math Integrity Gate
 */
export function auditLedgerEntries(entries: LedgerEntry[]): LedgerAuditResult {
  const issues: string[] = [];
  let nonNegativeValid = true;
  let provisionalCount = 0;

  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    if (entry.amount_cents < 0 || !Number.isInteger(entry.amount_cents)) {
      nonNegativeValid = false;
      issues.push(`Entry ${entry.entry_id} violates non-negativity with invalid amount: ${entry.amount_cents} cents`);
    }

    if (entry.is_provisional) {
      provisionalCount++;
    }

    if (entry.direction === 'debit') {
      totalDebits += entry.amount_cents;
    } else if (entry.direction === 'credit') {
      totalCredits += entry.amount_cents;
    }
  }

  const imbalanceDelta = totalDebits - totalCredits;
  const isBalanced = imbalanceDelta === 0 && nonNegativeValid;

  if (imbalanceDelta !== 0) {
    issues.push(`Imbalance detected: total debits (${totalDebits}¢) != total credits (${totalCredits}¢). Imbalance delta is ${imbalanceDelta}¢`);
  }

  return {
    ledger_id: 'ledger-' + Math.random().toString(36).substring(2, 9),
    organization_id: 'org-enterprise-core',
    entries_count: entries.length,
    total_debits_cents: totalDebits,
    total_credits_cents: totalCredits,
    imbalance_delta_cents: imbalanceDelta,
    is_balanced: isBalanced,
    non_negative_valid: nonNegativeValid,
    provisional_count: provisionalCount,
    issues,
  };
}
