import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ArrowDown,
  Terminal,
  Zap,
  Code2,
  FileCode,
} from 'lucide-react';
import { simulateAdaptiveDegradation } from '../utils/parser';
import { DegradationSimulation } from '../types';

export const AdaptiveDegradationTab: React.FC = () => {
  const samplePayloads = [
    {
      title: 'Scenario A: Dropped Closing Brace (Model Cutoff)',
      raw: `### SRE-DEVOPS-CODER: RECOVERY SYSTEM
\`\`\`json
{
  "is_provisional": false,
  "confidence_calibration": "fact",
  "payload": {
    "script": "systemctl restart postgresql"
`,
    },
    {
      title: 'Scenario B: Markdown Key-Value List (No JSON block)',
      raw: `Hey operator, here is the provisional layout you requested.

**is_provisional**: true
*confidence_calibration*: inference

I recommend running dry-run testing before applying.`,
    },
    {
      title: 'Scenario C: Conversational Noise with Apologies',
      raw: `Ah, I apologize for the confusion! I cannot compile that specific database migrations module.
Let me know if you would like me to try another task instead.`,
    },
    {
      title: 'Scenario D: Fully Valid JSON AST Payload',
      raw: `{
  "sender_agent": "Finance-Audit-Validator",
  "target_agent": "Executive-Dashboard",
  "is_provisional": false,
  "confidence_calibration": "fact",
  "payload": {
    "ledger_id": "tx_2026_q3",
    "total_cents": 450000
  }
}`,
    },
  ];

  const [inputPayload, setInputPayload] = useState<string>(samplePayloads[0].raw);
  const [simulation, setSimulation] = useState<DegradationSimulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSimulation = (rawToTest?: string) => {
    const text = rawToTest || inputPayload;
    if (!text.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const result = simulateAdaptiveDegradation(text);
      setSimulation(result);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Adaptive Degradation Gateway & Fault-Tolerant Ingress
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bypasses the probabilistic parser bottleneck by cascading through AST, regex salvage, microcorrection, and safe fallback.
          </p>
        </div>

        <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800">
          Zero Execution Paralysis
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stress Test Payload Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-200">Raw Model Ingress Payload</span>
              <span className="text-[10px] text-slate-400">Un-parsed Stream</span>
            </div>

            <textarea
              rows={8}
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
              placeholder="Paste raw LLM response text with dropped braces or markdown..."
            />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setInputPayload('')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>

              <button
                disabled={isRunning || !inputPayload.trim()}
                onClick={() => handleRunSimulation()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                Run Gateway Cascade
              </button>
            </div>

            {/* Presets */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Load Malformed / Stress Scenarios:
              </span>
              <div className="space-y-1.5">
                {samplePayloads.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputPayload(sample.raw);
                      handleRunSimulation(sample.raw);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 transition-colors line-clamp-1"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cascade Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200">
                Gateway Ingress State Machine
              </span>
              {simulation && (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                  Resolved by: {simulation.finalResult.resolvedBy}
                </span>
              )}
            </div>

            {!simulation && !isRunning && (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-400">Degradation Gateway Idle</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Click "Run Gateway Cascade" to observe how the 4-tier pipeline rescues metadata without pipeline paralysis.
                </p>
              </div>
            )}

            {simulation && (
              <div className="space-y-4">
                {/* 4-Tier Pipeline Cards */}
                <div className="space-y-3">
                  {simulation.steps.map((step, idx) => {
                    const isPassed = step.status === 'passed';
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isPassed
                            ? 'bg-emerald-950/20 border-emerald-500/60 shadow-sm'
                            : 'bg-slate-950/80 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                                isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {step.step}
                            </span>
                            <span className="text-xs font-bold text-slate-200">{step.stepName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">
                              {step.durationMs}ms
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isPassed
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {isPassed ? 'PASSED / SALVAGED' : 'FAILED / SKIPPED'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mb-2">{step.details}</p>

                        {step.extractedMetadata && (
                          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-300 flex items-center gap-4">
                            <span>
                              is_provisional:{' '}
                              <strong className={step.extractedMetadata.is_provisional ? 'text-amber-400' : 'text-emerald-400'}>
                                {String(step.extractedMetadata.is_provisional)}
                              </strong>
                            </span>
                            <span>
                              confidence_calibration:{' '}
                              <strong className="text-slate-200">
                                "{step.extractedMetadata.confidence_calibration}"
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Final State Extraction Outcome */}
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Final Salvaged Metadata Envelope
                    </span>
                    <span className="text-xs text-indigo-400 font-mono">
                      Safe Handoff Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">is_provisional:</span>
                      <span className="text-slate-100 font-bold">
                        {String(simulation.finalResult.is_provisional)}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">confidence_calibration:</span>
                      <span className="text-slate-100 font-bold">
                        "{simulation.finalResult.confidence_calibration}"
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
