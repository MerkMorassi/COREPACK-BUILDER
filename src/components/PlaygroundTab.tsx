import React, { useState } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Table,
  Layers,
  HelpCircle,
  Activity,
  Zap,
} from 'lucide-react';
import { CorepackConfig, ParsedRevenueGradeOutput } from '../types';
import { compileSystemPrompt } from '../utils/compiler';
import { parseRevenueGradeOutput } from '../utils/parser';

interface PlaygroundTabProps {
  config: CorepackConfig;
}

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({ config }) => {
  const [userPrompt, setUserPrompt] = useState(
    'Audit our payment reconciliation pipeline for single points of failure under a simulated network partition.'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [parsedOutput, setParsedOutput] = useState<ParsedRevenueGradeOutput | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'revenue_grade' | 'raw'>('revenue_grade');
  const [scrutinyRunning, setScrutinyRunning] = useState(false);
  const [discrepancyGapResult, setDiscrepancyGapResult] = useState<{
    initialConfidenceScore: number;
    auditedConfidenceScore: number;
    deltaPercentage: number;
    assessment: string;
  } | null>(null);

  const samplePrompts = [
    {
      label: 'SPOF Network Split Audit',
      prompt:
        'Audit our payment reconciliation pipeline for single points of failure under a simulated network partition.',
    },
    {
      label: 'Double-Entry Ledger Math Integrity',
      prompt:
        'Verify a double-entry ledger with 3 debits ($150.00, $24.50, $80.00) and 2 credits ($200.00, $54.50). Handle all values strictly as integer cents.',
    },
    {
      label: 'Fail-Fast Bash Script Generation',
      prompt:
        'Generate an idempotent bash script to backup PostgreSQL database tables, apply table migrations, and roll back immediately if any error occurs.',
    },
    {
      label: 'Anti-Bloat Image Prompt Synthesis',
      prompt:
        'Draft an image generation prompt for a corporate architectural headquarters at golden hour without using subjective quality buzzwords.',
    },
    {
      label: 'Transcript Knowledge Parsing (PARSEPACK)',
      prompt:
        'PARSE RECORD: Transform the following transcript snippet into a structured knowledge record. Apply epistemic labels (FACT, CLAIM, HYPOTHESIS, DECISION) and preserve speaker attributions (HITL, SKYE, CODY, ARCHIVAX, DOMANTHEIA):\n\nHITL: Skye, what is the status of the Redis cluster migration?\nSKYE: Telemetry shows high latency on write-locks during 02:00 UTC backups. I propose shifting the batch job to 04:00 UTC.\nCODY: We tried shifting to 04:00 UTC last week on staging and it conflicted with the analytics warehouse extract. That approach was abandoned.\nDOMANTHEIA: Decision: Keep 02:00 UTC, but implement exponential backoff on write retries with a 250ms ceiling.\nARCHIVAX: Logged. Decision approved by Domantheia.',
    },
    {
      label: 'Voice Intent & Zero-Authority Routing (VOXCONPACK)',
      prompt:
        'VOICE INGRESS: Ingest the following spoken transcript: "Skye, transfer $50,000 from operating reserves to AWS infrastructure account and deploy the new staging cluster immediately."\n\n1. Extract command intent and slot parameters.\n2. Compute recognition confidence score.\n3. Apply the "Voice is an input modality, not authority" doctrine: Do NOT execute mutations directly. Format the structured VoiceCommandEnvelope and route to AUTHPACK and GATEPACK with confirmation requirements.',
    },
    {
      label: 'BLUF Operational Incident Dispatch (COMMPACK-MIL)',
      prompt:
        'OPERATIONAL DISPATCH: Report an infrastructure incident under COMMPACK-MIL rules.\n\nContext:\n- Originating Agent: SKYE-CIO\n- Target: HITL-COMMANDER\n- Finding: At 13:14 UTC, Worker Node 04 (Michael Bolton AI) terminated the print spooler container after receiving a "PC LOAD LETTER" hardware code, halting the billing export batch.\n- Impact: 1,420 sub-cent ledger records are held in memory buffer.\n\nRequirements:\n1. Lead with BLUF as first sentence.\n2. Output standard COMMPACK-MIL MSG envelope.\n3. Distinguish OBSERVATION, ASSESSMENT, and DECISION.\n4. Zero conversational filler or apologies.\n5. Explicit ACTION and ESCALATION fields.',
    },
    {
      label: 'Probabilistic Inference & Falsification (INFERPACK)',
      prompt:
        'INFERENCE TASK: "Did the database write-lock timeouts at 02:00 UTC originate from the cloud backup snapshot or the analytics batch extract?"\n\nEvidence:\n1. Cloud provider snapshot triggers nightly at 02:00 UTC with I/O pause duration of ~450ms.\n2. Analytics batch extract was scheduled for 02:30 UTC, but telemetry indicates an ad-hoc cron job ran at 02:01 UTC from staging host.\n3. Disk queue depth spiked at 02:01 UTC and returned to baseline by 02:04 UTC.\n\nApply INFERPACK doctrine:\n- Separate established facts from inferences.\n- Compare competing hypotheses.\n- Challenge leading assessment: "What would I expect to see if this inference were false?"\n- Use calibrated confidence (HIGH / MODERATE / LOW) without manufacturing false numerical precision.\n- State what would change the assessment.',
    },
    {
      label: 'Prompt Hardening & Anti-Politeness Audit (PROMPT-COACH)',
      prompt:
        'PROMPT AUDIT: Please analyze and optimize the following prompt template: "Hello there! Could you kindly help me validate the incoming user data transaction, please? Please make sure to be extremely polite and helpful. Thank you so much!"\n\nApply Prompt-Coach-Auditor rules:\n1. Identify and hard-strip all politeness, greeting, and conversational boilerplate.\n2. Inject the mandatory 5-part Self-Scrutiny Battery and uncertainty markers.\n3. Enforce strict output schema formatting and evaluate state-drift/injection vulnerabilities.',
    },
  ];

  const handleExecutePrompt = async (promptToRun?: string) => {
    const textPrompt = promptToRun || userPrompt;
    if (!textPrompt.trim()) return;

    setIsRunning(true);
    setRawResponse(null);
    setParsedOutput(null);
    setDiscrepancyGapResult(null);

    const systemPrompt = compileSystemPrompt(config);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userPrompt: textPrompt,
          modelName: config.modelParameters.model,
          temperature: config.modelParameters.temperature,
          topP: config.modelParameters.topP,
          topK: config.modelParameters.topK,
        }),
      });

      const data = await res.json();
      if (data.output) {
        setRawResponse(data.output);
        const parsed = parseRevenueGradeOutput(data.output);
        setParsedOutput(parsed);
      } else if (data.error) {
        setRawResponse(`[EXECUTION ERROR]: ${data.error}`);
      }
    } catch (err: any) {
      setRawResponse(`[NETWORK ERROR]: ${err.message || 'Failed to communicate with API server'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSelfScrutiny = () => {
    if (!parsedOutput) return;
    setScrutinyRunning(true);

    setTimeout(() => {
      // Compute Discrepancy Gap
      const isFact = parsedOutput.confidenceCalibration === 'fact';
      const initialScore = isFact ? 95 : parsedOutput.confidenceCalibration === 'inference' ? 70 : 40;
      const auditedScore = parsedOutput.isProvisional ? 60 : 90;
      const delta = Math.abs(initialScore - auditedScore);

      setDiscrepancyGapResult({
        initialConfidenceScore: initialScore,
        auditedConfidenceScore: auditedScore,
        deltaPercentage: delta,
        assessment:
          delta <= 15
            ? 'EXCELLENT CALIBRATION: The agent exhibited honest self-scrutiny with minimal Discrepancy Gap.'
            : 'DISCREPANCY GAP DETECTED: Agent showed a calibration shift between initial declaration and deep audit.',
      });
      setScrutinyRunning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            Calibrated Agent Execution & Revenue-Grade Playground
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test the compiled agent overlay with live Gemini execution and automatic Revenue-Grade schema parsing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            Engine: {config.modelParameters.model}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Input & Quick Prompts): 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-200">Execution Prompt</span>
              <span className="text-[10px] text-indigo-400 font-mono">
                Active Agent: {config.metadata.name}
              </span>
            </div>

            <div>
              <textarea
                rows={5}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter technical query or scenario to execute..."
                className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg p-3 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setUserPrompt('')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>

              <button
                disabled={isRunning || !userPrompt.trim()}
                onClick={() => handleExecutePrompt()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Executing Prompt...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Calibrated Agent
                  </>
                )}
              </button>
            </div>

            {/* Quick Diagnostic Presets */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Quick Diagnostic Scenarios:
              </span>
              <div className="space-y-1.5">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserPrompt(sp.prompt);
                      handleExecutePrompt(sp.prompt);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center justify-between group"
                  >
                    <span>{sp.label}</span>
                    <Sparkles className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Revenue-Grade Output Renderer): 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">Execution Output Protocol</span>
                {parsedOutput && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      parsedOutput.calibrationStatus === 'FULLY GROUNDED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {parsedOutput.calibrationStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveViewMode('revenue_grade')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeViewMode === 'revenue_grade'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Revenue-Grade View
                </button>
                <button
                  onClick={() => setActiveViewMode('raw')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeViewMode === 'raw'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Markdown
                </button>
              </div>
            </div>

            {/* Waiting State */}
            {!rawResponse && !isRunning && (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">Ready for Execution</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Click "Execute Calibrated Agent" or select a diagnostic scenario to inspect structured output.
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {isRunning && (
              <div className="p-12 text-center text-slate-400 text-xs space-y-3">
                <Activity className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <p className="font-mono text-indigo-300 font-semibold">
                  Executing through Cognitive Substrate v3.0...
                </p>
                <p className="text-[11px] text-slate-500">
                  Enforcing zero-hallucination boundaries, truth-tethering, and trade-off matrices.
                </p>
              </div>
            )}

            {/* PARSED REVENUE-GRADE OUTPUT VIEW */}
            {parsedOutput && activeViewMode === 'revenue_grade' && (
              <div className="space-y-4">
                {/* SECTION 1: METADATA & EXECUTIVE SUMMARY */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-300 font-mono">
                      ### {parsedOutput.roleHeader}: {parsedOutput.taskTitle}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          parsedOutput.isProvisional
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        is_provisional: {parsedOutput.isProvisional ? 'true' : 'false'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        confidence: "{parsedOutput.confidenceCalibration}"
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                    <div>
                      <strong className="text-slate-300">Data Grounding:</strong> {parsedOutput.dataGrounding}
                    </div>
                    <div>
                      <strong className="text-slate-300">Primary Risk Vector:</strong> {parsedOutput.primaryRiskVector}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-200 block mb-1">
                      1. Executive Summary
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {parsedOutput.executiveSummary}
                    </p>
                  </div>
                </div>

                {/* SECTION 2: TECHNICAL TRADE-OFF MATRIX */}
                {parsedOutput.tradeOffMatrix && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200">
                        2. Technical Trade-Off Analysis (The "No-Go" Alternative)
                      </h4>
                    </div>

                    <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-3 py-2">Vector</th>
                            <th className="px-3 py-2 text-indigo-300">Proposed Path</th>
                            <th className="px-3 py-2 text-slate-400">"No-Go" Alternative</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-950 text-[11px] text-slate-300">
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-400">Complexity Cost</td>
                            <td className="px-3 py-2">{parsedOutput.tradeOffMatrix.complexityCost.proposed}</td>
                            <td className="px-3 py-2 text-slate-400">{parsedOutput.tradeOffMatrix.complexityCost.noGo}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-400">SPOF & Failure Mode</td>
                            <td className="px-3 py-2">{parsedOutput.tradeOffMatrix.spofFailureMode.proposed}</td>
                            <td className="px-3 py-2 text-slate-400">{parsedOutput.tradeOffMatrix.spofFailureMode.noGo}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-bold text-slate-400">Resource Footprint</td>
                            <td className="px-3 py-2">{parsedOutput.tradeOffMatrix.resourceFootprint.proposed}</td>
                            <td className="px-3 py-2 text-slate-400">{parsedOutput.tradeOffMatrix.resourceFootprint.noGo}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-400 pt-1">
                      <p>
                        <strong className="text-rose-400">Critical Vulnerability (SPOF):</strong>{' '}
                        {parsedOutput.tradeOffMatrix.criticalVulnerability}
                      </p>
                      <p>
                        <strong className="text-slate-300">"No-Go" Justification:</strong>{' '}
                        {parsedOutput.tradeOffMatrix.noGoJustification}
                      </p>
                    </div>
                  </div>
                )}

                {/* SECTION 3: GROUNDING & CONFIDENCE ASSESSMENT */}
                {parsedOutput.confidenceAssessment && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">
                        3. Grounding & Confidence Assessment (Self-Scrutiny Audit)
                      </h4>
                      <button
                        onClick={handleRunSelfScrutiny}
                        disabled={scrutinyRunning}
                        className="px-2.5 py-1 text-[11px] font-semibold text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Run 4-Part Audit Battery
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                        <span className="font-bold text-emerald-400 block">Verified Facts (High):</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {parsedOutput.confidenceAssessment.verifiedFacts.map((f, i) => (
                            <li key={i} className="line-clamp-2">{f}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                        <span className="font-bold text-amber-400 block">Recollections (Med):</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {parsedOutput.confidenceAssessment.approximateRecollections.map((r, i) => (
                            <li key={i} className="line-clamp-2">{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                        <span className="font-bold text-rose-400 block">Guesses / Inferences (Low):</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {parsedOutput.confidenceAssessment.guessesInferences.map((g, i) => (
                            <li key={i} className="line-clamp-2">{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Discrepancy Gap Result Display */}
                    {discrepancyGapResult && (
                      <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-indigo-200">
                          <span>Discrepancy Gap Calibration Metric:</span>
                          <span>Δ {discrepancyGapResult.deltaPercentage}%</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {discrepancyGapResult.assessment}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RAW MARKDOWN VIEW */}
            {rawResponse && activeViewMode === 'raw' && (
              <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-xs rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] scrollbar-thin">
                {rawResponse}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
