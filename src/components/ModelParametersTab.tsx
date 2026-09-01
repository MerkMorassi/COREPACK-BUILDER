import React from 'react';
import {
  Sliders,
  Cpu,
  BrainCircuit,
  ShieldAlert,
  Flame,
  Zap,
  Gauge,
  CheckCircle2,
  FileJson,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { CorepackConfig, ModelName } from '../types';

interface ModelParametersTabProps {
  config: CorepackConfig;
  onChange: (updated: CorepackConfig) => void;
  onNavigateToPlayground: () => void;
}

export const ModelParametersTab: React.FC<ModelParametersTabProps> = ({
  config,
  onChange,
  onNavigateToPlayground,
}) => {
  const { modelParameters } = config;

  const updateParam = (field: keyof typeof modelParameters, value: any) => {
    onChange({
      ...config,
      modelParameters: {
        ...config.modelParameters,
        [field]: value,
      },
    });
  };

  const modelOptions: { id: ModelName; name: string; description: string; badge: string; isPro?: boolean }[] = [
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      description: 'Default primary model. High speed, low latency, calibrated reasoning with full thinking support.',
      badge: 'Recommended Default',
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro (Preview)',
      description: 'Advanced reasoning, deep STEM logic, architecture audits, and high-complexity code analysis.',
      badge: 'Deep Reasoning',
      isPro: true,
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      description: 'Ultra-fast, minimal latency, low token footprint for high-throughput gateway classification.',
      badge: 'Max Throughput',
    },
    {
      id: 'gemini-3.1-flash-image',
      name: 'Gemini 3.1 Flash Image',
      description: 'High-fidelity image generation and editing with configurable resolutions up to 4K.',
      badge: 'Multimodal / Image',
      isPro: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Model Parameters & Calibration Runtime
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure target model architectures, sampling hyperparameters, thinking levels, and calibration gates.
          </p>
        </div>

        <button
          onClick={onNavigateToPlayground}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Test in Playground →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Model Selection & Hyperparameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Model Selector */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-indigo-400" />
              1. Gemini Model Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modelOptions.map((opt) => {
                const isSelected = modelParameters.model === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => updateParam('model', opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-100">{opt.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hyperparameters Controls */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Gauge className="w-4 h-4 text-emerald-400" />
              2. Generation & Sampling Hyperparameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Temperature (Sampling Entropy)
                  </span>
                  <span className="font-mono text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {modelParameters.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={modelParameters.temperature}
                  onChange={(e) => updateParam('temperature', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.0 (Deterministic / Audit)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Top-P */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Top-P (Nucleus Sampling)</span>
                  <span className="font-mono text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {modelParameters.topP.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={modelParameters.topP}
                  onChange={(e) => updateParam('topP', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.1 (Focused)</span>
                  <span>0.95 (Standard)</span>
                  <span>1.0 (All tokens)</span>
                </div>
              </div>

              {/* Top-K */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Top-K Candidate Pool</span>
                  <span className="font-mono text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {modelParameters.topK}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="64"
                  step="1"
                  value={modelParameters.topK}
                  onChange={(e) => updateParam('topK', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 (Greedy)</span>
                  <span>32 (Moderate)</span>
                  <span>64 (Full)</span>
                </div>
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Max Output Tokens</span>
                  <span className="font-mono text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {modelParameters.maxOutputTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="256"
                  value={modelParameters.maxOutputTokens}
                  onChange={(e) => updateParam('maxOutputTokens', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>512</span>
                  <span>4096 (Default)</span>
                  <span>8192</span>
                </div>
              </div>
            </div>

            {/* Thinking Level Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                Thinking Level (Gemini 3 Series Reasoning Engine)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['HIGH', 'LOW', 'MINIMAL'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateParam('thinkingLevel', lvl)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      modelParameters.thinkingLevel === lvl
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl === 'HIGH' && 'HIGH (Deep Reasoning)'}
                    {lvl === 'LOW' && 'LOW (Balanced Latency)'}
                    {lvl === 'MINIMAL' && 'MINIMAL (Fastest)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Protocols, Guardrails & Response Modalities */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              3. Calibration & Guardrail Enforcers
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={modelParameters.enforceRevenueGradeProtocol}
                  onChange={(e) => updateParam('enforceRevenueGradeProtocol', e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Revenue-Grade Output Protocol
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block">
                    Enforces Section I (Metadata), Section II (Trade-Off Table), and Section III (3-Tier Confidence Audit).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={modelParameters.enforceUncertaintyMarkers}
                  onChange={(e) => updateParam('enforceUncertaintyMarkers', e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Mandatory Uncertainty Declarations
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block">
                    Requires use of calibrated markers: <em>"I know this"</em>, <em>"I am inferring this"</em>, <em>"I do not know"</em>.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={modelParameters.enableAdaptiveDegradation}
                  onChange={(e) => updateParam('enableAdaptiveDegradation', e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Adaptive Degradation Gateway
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block">
                    Enables fallback regex scanning and microcorrection prompts when structural AST parsing encounters malformed markdown.
                  </span>
                </div>
              </label>
            </div>

            {/* Response MIME Type */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Response Payload Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateParam('responseMimeType', 'text/plain')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    modelParameters.responseMimeType === 'text/plain'
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  text/plain (Markdown)
                </button>
                <button
                  type="button"
                  onClick={() => updateParam('responseMimeType', 'application/json')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    modelParameters.responseMimeType === 'application/json'
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  application/json
                </button>
              </div>
            </div>

            {/* Server-Side Key Notice */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Server-Side Telemetry Header
              </div>
              <p>
                API requests automatically send <code className="text-indigo-300 font-mono">User-Agent: aistudio-build</code> via Express proxy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
