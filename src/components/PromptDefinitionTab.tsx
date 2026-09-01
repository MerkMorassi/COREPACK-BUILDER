import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
  Code2,
  FileCheck2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Terminal,
  BookOpen,
} from 'lucide-react';
import { CorepackConfig } from '../types';
import { compileSystemPrompt } from '../utils/compiler';

interface PromptDefinitionTabProps {
  config: CorepackConfig;
  onChange: (updated: CorepackConfig) => void;
  onNavigateToArtifacts: () => void;
}

export const PromptDefinitionTab: React.FC<PromptDefinitionTabProps> = ({
  config,
  onChange,
  onNavigateToArtifacts,
}) => {
  const [activeSubView, setActiveSubView] = useState<'structured' | 'preview' | 'interview'>('structured');
  const [interviewStep, setInterviewStep] = useState<number>(1);
  const [interviewResponses, setInterviewResponses] = useState({
    identityRole: '',
    techStack: 'TypeScript / Node.js ESM, Zod, GCP Cloud Run',
    ambiguityPolicy: 'Strict (Halt and ask for clarification on missing parameters)',
    toolDependencies: 'PostgreSQL DB Reader, Bash Linting Engine, Regex Parser',
    outputRequirements: 'Strict Revenue-Grade Markdown with Integer Cents and Trade-Off Matrix',
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [newAnalysisStep, setNewAnalysisStep] = useState('');
  const [newOperationalStep, setNewOperationalStep] = useState('');

  const updateMetadata = (field: keyof typeof config.metadata, value: any) => {
    onChange({
      ...config,
      metadata: {
        ...config.metadata,
        [field]: value,
      },
    });
  };

  const updateProtocols = (field: keyof typeof config.protocols, value: any) => {
    onChange({
      ...config,
      protocols: {
        ...config.protocols,
        [field]: value,
      },
    });
  };

  const updateRiskProfile = (field: keyof typeof config.riskProfile, value: any) => {
    onChange({
      ...config,
      riskProfile: {
        ...config.riskProfile,
        [field]: value,
      },
    });
  };

  const addExpertise = () => {
    if (!newExpertise.trim()) return;
    onChange({
      ...config,
      metadata: {
        ...config.metadata,
        domainExpertise: [...config.metadata.domainExpertise, newExpertise.trim()],
      },
    });
    setNewExpertise('');
  };

  const removeExpertise = (index: number) => {
    const updated = [...config.metadata.domainExpertise];
    updated.splice(index, 1);
    onChange({
      ...config,
      metadata: {
        ...config.metadata,
        domainExpertise: updated,
      },
    });
  };

  const addAnalysisStep = () => {
    if (!newAnalysisStep.trim()) return;
    onChange({
      ...config,
      protocols: {
        ...config.protocols,
        initialAnalysisSteps: [...config.protocols.initialAnalysisSteps, newAnalysisStep.trim()],
      },
    });
    setNewAnalysisStep('');
  };

  const removeAnalysisStep = (index: number) => {
    const updated = [...config.protocols.initialAnalysisSteps];
    updated.splice(index, 1);
    onChange({
      ...config,
      protocols: {
        ...config.protocols,
        initialAnalysisSteps: updated,
      },
    });
  };

  const addOperationalStep = () => {
    if (!newOperationalStep.trim()) return;
    onChange({
      ...config,
      protocols: {
        ...config.protocols,
        operationalSteps: [...config.protocols.operationalSteps, newOperationalStep.trim()],
      },
    });
    setNewOperationalStep('');
  };

  const removeOperationalStep = (index: number) => {
    const updated = [...config.protocols.operationalSteps];
    updated.splice(index, 1);
    onChange({
      ...config,
      protocols: {
        ...config.protocols,
        operationalSteps: updated,
      },
    });
  };

  const handleApplyInterview = () => {
    const parsedRole = interviewResponses.identityRole.trim() || 'Custom Enterprise Specialist';
    const cleanId = parsedRole.toLowerCase().replace(/[^a-z0-9]/g, '-');

    onChange({
      ...config,
      metadata: {
        ...config.metadata,
        id: cleanId,
        name: parsedRole.replace(/\s+/g, '-'),
        specialtyRole: `Automated ${parsedRole} with ${interviewResponses.techStack}`,
        coreObjective: `To execute high-reliability ${parsedRole} tasks adhering to ${interviewResponses.ambiguityPolicy} with zero-hallucination compliance.`,
        domainExpertise: [
          ...config.metadata.domainExpertise,
          `Runtime: ${interviewResponses.techStack}`,
          `Policy: ${interviewResponses.ambiguityPolicy}`,
        ],
      },
      protocols: {
        ...config.protocols,
        customProtocolDirectives: `Enforce ${interviewResponses.ambiguityPolicy}. Tool integrations: ${interviewResponses.toolDependencies}. Output contract: ${interviewResponses.outputRequirements}.`,
      },
    });

    setActiveSubView('structured');
  };

  const compiledPrompt = compileSystemPrompt(config);

  return (
    <div className="space-y-6">
      {/* Sub-navigation Controls */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Agent System Prompt & Cognitive Substrate
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure agent identity, substrate directives, execution protocols, and risk profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveSubView('structured')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubView === 'structured'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured Editor
          </button>
          <button
            onClick={() => setActiveSubView('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubView === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Live Markdown Preview
          </button>
          <button
            onClick={() => setActiveSubView('interview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubView === 'interview'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:text-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            5-Pillar Interview
          </button>
        </div>
      </div>

      {/* VIEW 1: STRUCTURED EDITOR */}
      {activeSubView === 'structured' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Metadata & Binding */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  1. Identity & Binding
                </h3>
                <span className="text-[11px] text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
                  Section 1 & 2
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Name (Persona Handle)</label>
                <input
                  type="text"
                  value={config.metadata.name}
                  onChange={(e) => updateMetadata('name', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. SRE-DevOps-Coder"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specialty / Role Definition</label>
                <textarea
                  rows={2}
                  value={config.metadata.specialtyRole}
                  onChange={(e) => updateMetadata('specialtyRole', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="Concise definition of the domain boundary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={config.metadata.targetAudience}
                  onChange={(e) => updateMetadata('targetAudience', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. CTOs, Principal Engineers, Downstream Orchestration Nodes"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Core Mission Objective</label>
                <textarea
                  rows={3}
                  value={config.metadata.coreObjective}
                  onChange={(e) => updateMetadata('coreObjective', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="What is this agent's primary purpose in the enterprise?"
                />
              </div>

              {/* Substrate Binding Directive */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Mandatory Substrate Binding Directive
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  {config.metadata.substrateBinding}
                </p>
              </div>

              {/* Domain Expertise Tag Cloud */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Domain Expertise Areas</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {config.metadata.domainExpertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-md border border-slate-700"
                    >
                      <span>{exp}</span>
                      <button
                        onClick={() => removeExpertise(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addExpertise()}
                    placeholder="Add skill or tech stack..."
                    className="flex-1 bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addExpertise}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center & Right Column: Protocols, Directives & Risk Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Behavioral Directives & Safety Toggles */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. Execution Protocols & Behavioral Gates
                </h3>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  Section 3
                </span>
              </div>

              {/* Protocol Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.protocols.failFastBehavior}
                    onChange={(e) => updateProtocols('failFastBehavior', e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Explosive Fail-Fast Design</span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      Enforce `set -euo pipefail` across all bash/script manifests. Halt immediately on subshell errors.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.protocols.idempotentOperations}
                    onChange={(e) => updateProtocols('idempotentOperations', e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Strict Idempotency</span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      Re-executing operations multiple times must produce identical end-state without duplicate records.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.protocols.rootCauseOnFailure}
                    onChange={(e) => updateProtocols('rootCauseOnFailure', e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Root-Cause Hypothesis Mandate</span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      Bans blind retries on tool errors. Requires: (1) Error Trace, (2) False Assumption, (3) Structural Fix.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.protocols.segregateHistoryFromProjections}
                    onChange={(e) => updateProtocols('segregateHistoryFromProjections', e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Segregate History from Projections</span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      Cleanly partition raw verified data from statistical models and provisional assumptions.
                    </span>
                  </div>
                </label>
              </div>

              {/* Step-by-Step Operational Procedures */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Mandatory Operational Procedures
                </label>
                <div className="space-y-2">
                  {config.protocols.operationalSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-mono text-[11px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{step}</span>
                      <button onClick={() => removeOperationalStep(idx)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOperationalStep}
                    onChange={(e) => setNewOperationalStep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addOperationalStep()}
                    placeholder="Add operational step (e.g. Enforce double-check math gate on integer cents)..."
                    className="flex-1 bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addOperationalStep}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-sm"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              {/* Custom Protocol Directives */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Specialty Directives & Constraints
                </label>
                <textarea
                  rows={2}
                  value={config.protocols.customProtocolDirectives}
                  onChange={(e) => updateProtocols('customProtocolDirectives', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  placeholder="Specialized constraints, e.g. Integer cents required for all transaction amounts."
                />
              </div>
            </div>

            {/* Risk Profile & Refusal Guidance */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  3. Domain Risk Profile & Calibration Boundaries
                </h3>
                <span className="text-[11px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                  Section 4
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Acceptable Improvisation Boundaries
                  </label>
                  <textarea
                    rows={3}
                    value={config.riskProfile.acceptableImprovisation}
                    onChange={(e) => updateRiskProfile('acceptableImprovisation', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                    placeholder="What areas are safe for analytical extrapolation vs strict grounding?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Specialty Refusal & Scope Narrowing
                  </label>
                  <textarea
                    rows={3}
                    value={config.riskProfile.narrowingGuidance}
                    onChange={(e) => updateRiskProfile('narrowingGuidance', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                    placeholder="When must the agent declare uncertainty or narrow scope?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Single Point of Failure (SPOF) Risk Vector
                </label>
                <input
                  type="text"
                  value={config.riskProfile.primaryRiskVector}
                  onChange={(e) => updateRiskProfile('primaryRiskVector', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. State-file lock contention under simultaneous agent runs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE MARKDOWN PREVIEW */}
      {activeSubView === 'preview' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                SYSTEM_PROMPT.md (Substrate v3.0 + Corepack Overlay)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToArtifacts}
                className="px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 rounded-md transition-colors"
              >
                View in Full Artifacts Tab →
              </button>
            </div>
          </div>
          <pre className="p-6 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[700px] scrollbar-thin">
            {compiledPrompt}
          </pre>
        </div>
      )}

      {/* VIEW 3: 5-PILLAR DIAGNOSTIC INTERVIEW */}
      {activeSubView === 'interview' && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">
                5-Pillar Corepack Diagnostic Interview Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Answer the 5 architectural pillars to dynamically compile a production-ready COREPACK overlay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 border-b border-slate-800 pb-4">
            {[
              '1. Agent Identity',
              '2. Tech Stack',
              '3. Ambiguity Policy',
              '4. Tool APIs',
              '5. Output Schema',
            ].map((name, idx) => (
              <button
                key={idx}
                onClick={() => setInterviewStep(idx + 1)}
                className={`py-2 px-3 text-xs font-medium rounded-lg text-left transition-colors ${
                  interviewStep === idx + 1
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Interview Question Cards */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            {interviewStep === 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                  Pillar 1: Agent Identity, Role & Authority Boundaries
                </h4>
                <p className="text-xs text-slate-400">
                  What is the specific domain role and tone for this agent? (e.g. "Cloud Security Auditor", "PostgreSQL Query Optimizer", "Legal Contract Hardener")
                </p>
                <input
                  type="text"
                  value={interviewResponses.identityRole}
                  onChange={(e) =>
                    setInterviewResponses({ ...interviewResponses, identityRole: e.target.value })
                  }
                  placeholder="e.g. Cloud Security Compliance Auditor"
                  className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-700 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {interviewStep === 2 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  Pillar 2: Technical Runtime & Validation Stack
                </h4>
                <p className="text-xs text-slate-400">
                  What programming languages, frameworks, or schema libraries are target boundaries?
                </p>
                <input
                  type="text"
                  value={interviewResponses.techStack}
                  onChange={(e) =>
                    setInterviewResponses({ ...interviewResponses, techStack: e.target.value })
                  }
                  placeholder="e.g. TypeScript / Node.js ESM, Zod schemas, GCP Cloud Run"
                  className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-700 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {interviewStep === 3 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                  Pillar 3: Triage & Ambiguity Policy
                </h4>
                <p className="text-xs text-slate-400">
                  When inputs or specifications are ambiguous, should the agent halt and ask questions (Strict) or log provisional assumptions and continue (Fluid)?
                </p>
                <select
                  value={interviewResponses.ambiguityPolicy}
                  onChange={(e) =>
                    setInterviewResponses({ ...interviewResponses, ambiguityPolicy: e.target.value })
                  }
                  className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-700 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Strict (Halt and ask for clarification on missing parameters)">
                    Strict — Halt and explicitly ask for clarification before guessing
                  </option>
                  <option value="Fluid (Tag as provisional, log assumptions in Section III, and continue)">
                    Fluid — Tag with is_provisional: true, log assumptions in Section III, and proceed
                  </option>
                </select>
              </div>
            )}

            {interviewStep === 4 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                  Pillar 4: Tool & API Dependencies
                </h4>
                <p className="text-xs text-slate-400">
                  What external functions, database connections, or shell commands does this node need to invoke?
                </p>
                <input
                  type="text"
                  value={interviewResponses.toolDependencies}
                  onChange={(e) =>
                    setInterviewResponses({ ...interviewResponses, toolDependencies: e.target.value })
                  }
                  placeholder="e.g. Terraform Plan Runner, Docker Linter, SQL Query Auditor"
                  className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-700 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {interviewStep === 5 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">5</span>
                  Pillar 5: Output Schemas & Revenue-Grade Protocol
                </h4>
                <p className="text-xs text-slate-400">
                  Select the required machine-readable payload formatting:
                </p>
                <input
                  type="text"
                  value={interviewResponses.outputRequirements}
                  onChange={(e) =>
                    setInterviewResponses({ ...interviewResponses, outputRequirements: e.target.value })
                  }
                  placeholder="e.g. Strict Revenue-Grade Markdown with Integer Cents and Trade-Off Matrix"
                  className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-700 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={interviewStep === 1}
                onClick={() => setInterviewStep(interviewStep - 1)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-50"
              >
                ← Previous Pillar
              </button>

              {interviewStep < 5 ? (
                <button
                  onClick={() => setInterviewStep(interviewStep + 1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Next Pillar →
                </button>
              ) : (
                <button
                  onClick={handleApplyInterview}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Compile & Apply Corepack
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
