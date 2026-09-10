/**
 * Corepack Architecture & Orchestration Types
 * Implements Cognitive Substrate (v3.0) & Corepack Blueprint (v2.0)
 */

export type ModelName =
  | 'gemini-3.8-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-flash-image'
  | 'gemini-3.5-transcribe';

export type ConfidenceRating = 'fact' | 'inference' | 'guess';

export type CalibrationStatus = 'FULLY GROUNDED' | 'PROVISIONAL' | 'FEASIBILITY ESTIMATE';

export interface UncertaintyMarkers {
  iKnowThis: boolean;
  iBelieveThis: boolean;
  iAmInferringThis: boolean;
  iDoNotKnow: boolean;
  iCannotVerify: boolean;
}

export interface CorepackMetadata {
  id: string;
  name: string;
  version: string;
  specialtyRole: string;
  targetAudience: string;
  coreObjective: string;
  domainExpertise: string[];
  substrateBinding: string;
  author: string;
  lastModified: string;
}

export interface ExecutionProtocols {
  initialAnalysisSteps: string[];
  operationalSteps: string[];
  safetyRules: string[];
  failFastBehavior: boolean;
  idempotentOperations: boolean;
  rootCauseOnFailure: boolean;
  antiBloatPrompting: boolean;
  segregateHistoryFromProjections: boolean;
  customProtocolDirectives: string;
}

export interface RiskProfile {
  acceptableImprovisation: string;
  narrowingGuidance: string;
  refusalRules: string;
  primaryRiskVector: string;
}

export interface ToolParameter {
  id: string;
  name: string;
  type: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  description: string;
  required: boolean;
  defaultValue?: string;
  enumOptions?: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'ledger' | 'devops' | 'validation' | 'custom';
  enabled: boolean;
  parameters: ToolParameter[];
  mockReturnValue?: string;
}

export interface SkillManifestStateRoute {
  from: string;
  to: string;
  condition: string;
}

export interface SkillManifestConfig {
  sandboxReadPaths: string[];
  sandboxWritePaths: string[];
  allowedApis: string[];
  supportedStates: string[];
  stateTransitions: SkillManifestStateRoute[];
}

export interface ModelParameters {
  model: ModelName;
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  thinkingLevel: 'HIGH' | 'LOW' | 'MINIMAL';
  responseMimeType: 'text/plain' | 'application/json';
  enforceRevenueGradeProtocol: boolean;
  enforceUncertaintyMarkers: boolean;
  enableAdaptiveDegradation: boolean;
  seed?: number;
}

export interface CorepackConfig {
  metadata: CorepackMetadata;
  protocols: ExecutionProtocols;
  riskProfile: RiskProfile;
  tools: ToolDefinition[];
  skillManifest: SkillManifestConfig;
  modelParameters: ModelParameters;
  rawSystemPromptOverride?: string;
}

export interface CompiledArtifacts {
  systemPromptMd: string;
  skillManifestYml: string;
  schemasTs: string;
  testPromptsMd: string;
  defectValidationResult: DefectValidationResult;
}

export interface DefectValidationResult {
  passed: boolean;
  checklist: {
    hasSubstrateBinding: boolean;
    hasRevenueGradeSections: boolean;
    bannedPolitenessBoilerplate: boolean;
    hasThreeTierConfidenceMatrix: boolean;
    hasIdempotentFailFastDirectives: boolean;
    hasExplicitVerificationStep: boolean;
  };
  errors: string[];
  warnings: string[];
}

export interface ParsedRevenueGradeOutput {
  raw: string;
  roleHeader: string;
  taskTitle: string;
  calibrationStatus: CalibrationStatus;
  dataGrounding: string;
  primaryRiskVector: string;
  isProvisional: boolean;
  confidenceCalibration: ConfidenceRating;
  executiveSummary: string;
  tradeOffMatrix: {
    proposedPathName: string;
    noGoAlternativeName: string;
    complexityCost: { proposed: string; noGo: string };
    spofFailureMode: { proposed: string; noGo: string };
    resourceFootprint: { proposed: string; noGo: string };
    criticalVulnerability: string;
    noGoJustification: string;
  } | null;
  proposedImplementation?: string;
  confidenceAssessment: {
    verifiedFacts: string[];
    approximateRecollections: string[];
    guessesInferences: string[];
    requiredVerificationSteps: string[];
  } | null;
  parsingMethod: 'strict_ast' | 'regex_fallback' | 'microcorrection' | 'raw_unparsed';
}

export type TaskStatus =
  | 'PENDING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export interface TaskLog {
  id: string;
  taskId: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface HitlTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  originAgent: string;
  isProvisional: boolean;
  confidenceCalibration: ConfidenceRating;
  payload: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  rejectionReason?: string;
  logs: TaskLog[];
  taskType?: string;
  summary?: string;
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  reviewerNotes?: string;
}

export interface DegradationStepResult {
  step: 1 | 2 | 3 | 4;
  stepName: string;
  status: 'passed' | 'failed' | 'bypassed';
  durationMs: number;
  outputSnippet?: string;
  extractedMetadata?: {
    is_provisional?: boolean;
    confidence_calibration?: string;
  };
  details: string;
}

export interface DegradationSimulation {
  rawInput: string;
  steps: DegradationStepResult[];
  finalResult: {
    is_provisional: boolean;
    confidence_calibration: string;
    resolvedBy: string;
  };
}

export interface LedgerEntry {
  entry_id: string;
  account_id: string;
  account_name: string;
  amount_cents: number;
  direction: 'debit' | 'credit';
  is_provisional: boolean;
  recorded_at: string;
}

export interface LedgerAuditResult {
  ledger_id: string;
  organization_id: string;
  entries_count: number;
  total_debits_cents: number;
  total_credits_cents: number;
  imbalance_delta_cents: number;
  is_balanced: boolean;
  non_negative_valid: boolean;
  provisional_count: number;
  issues: string[];
}

export interface AuthpackRule {
  id: string;
  role: string;
  action: string;
  targetCorepackId: string; // 'ALL' or specific ID
  allowed: boolean;
  minConfidenceRequired: 'fact' | 'inference' | 'guess';
}

export interface AuthpackVerificationRequest {
  agentId: string;
  role: string;
  action: string;
  targetCorepackId: string;
  confidenceRating: 'fact' | 'inference' | 'guess';
}

export interface AuthpackVerificationResponse {
  granted: boolean;
  reason: string;
  requestedAt: string;
  authToken?: string;
  auditChain: string[];
}

