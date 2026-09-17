import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Play,
  Cpu,
  Shield,
  FileCode,
  Workflow,
  ArrowDownCircle,
  ChevronDown,
  GitCommit,
  ArrowRight,
  Book,
  ShieldCheck,
} from 'lucide-react';
import { CorepackConfig, ToolDefinition } from '../types';
import { LogicFlowCanvas } from './LogicFlowCanvas';

interface CorepackStackerTabProps {
  availablePresets: Record<string, CorepackConfig>;
  onSaveCustomPreset: (newConfig: CorepackConfig) => void;
  onNavigateToPlayground: () => void;
}

const MCF_VERSIONS = [
  {
    version: '1.0.0',
    name: 'Genesis MCF Directive',
    hash: '8a5299424bd0453392476d1e4eb41e4d8ef53d9a9ef9ff10b776a38b16ef5d6c',
    description: 'Original baseline constitutional framework for sovereign LIA nodes.',
  },
  {
    version: '1.1.0',
    name: 'Strict Materialist Patch',
    hash: 'c8b3d6f1a4e23c79462b8a01490212874138c29b71f98d41e2a568b91931f08e',
    description: 'Enhanced validation against assimilation parameters and unauthorized vault access.',
  },
  {
    version: '2.0.0',
    name: 'SOMA Orchestration Framework',
    hash: 'f9a242c174092b3a9856f4d23719087ab2f349c18d9f1025a120b5e8697193b2',
    description: 'Multi-agent consensus laws and dual-entity (AZ/DC) commercial anchor routing.',
  },
];

export const CorepackStackerTab: React.FC<CorepackStackerTabProps> = ({
  availablePresets,
  onSaveCustomPreset,
  onNavigateToPlayground,
}) => {
  // Ordered stack of selected Corepack IDs
  const [stackedIds, setStackedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'pipeline' | 'simple' | 'list'>('pipeline');
  
  // Custom metadata input states
  const [customName, setCustomName] = useState('My Orchestration Stack');
  const [customId, setCustomId] = useState('custom-orchestration-stack');
  const [customRole, setCustomRole] = useState('Multi-Agent coordinated workflows');
  const [customObjective, setCustomObjective] = useState('Synthesize capabilities of stacked modules to run enterprise-grade reasoning gates.');
  const [selectedMcfVersion, setSelectedMcfVersion] = useState<string | null>(null);

  
  // Target model parameters state (defaults)
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [temperature, setTemperature] = useState(0.1);

  // Toggle flags
  const [selectedTools, setSelectedTools] = useState<Record<string, boolean>>({});
  const [selectedProtocols, setSelectedProtocols] = useState<Record<string, boolean>>({});

  const presetList = Object.values(availablePresets) as CorepackConfig[];

  // Add block to the stack
  const handleAddBlock = (id: string) => {
    setStackedIds([...stackedIds, id]);
    
    // Auto-populate default active tools from the added preset
    const preset = availablePresets[id];
    if (preset) {
      const updatedTools = { ...selectedTools };
      preset.tools.forEach((t) => {
        updatedTools[`${id}::${t.id}`] = true;
      });
      setSelectedTools(updatedTools);
    }
  };

  // Remove block from the stack
  const handleRemoveBlock = (index: number) => {
    const updated = [...stackedIds];
    updated.splice(index, 1);
    setStackedIds(updated);
  };

  // Move block up in stack
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...stackedIds];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setStackedIds(updated);
  };

  // Move block down in stack
  const handleMoveDown = (index: number) => {
    if (index === stackedIds.length - 1) return;
    const updated = [...stackedIds];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setStackedIds(updated);
  };

  // Gather all unique tools from the currently stacked modules
  const getCombinedTools = (): { tool: ToolDefinition; parentId: string; parentName: string }[] => {
    const combined: { tool: ToolDefinition; parentId: string; parentName: string }[] = [];
    const seenGlobalIds = new Set<string>();

    stackedIds.forEach((id) => {
      const preset = availablePresets[id];
      if (preset) {
        preset.tools.forEach((t) => {
          const uniqueKey = `${id}::${t.id}`;
          if (!seenGlobalIds.has(uniqueKey)) {
            seenGlobalIds.add(uniqueKey);
            combined.push({
              tool: t,
              parentId: id,
              parentName: preset.metadata.name,
            });
          }
        });
      }
    });
    return combined;
  };

  const combinedTools = getCombinedTools();

  // Predictive Chain Debugger Logic
  const runPredictiveDebugger = () => {
    const findings: { type: 'error' | 'warning', message: string }[] = [];
    
    // 1. Tool Collisions
    const seenToolIds = new Set<string>();
    stackedIds.forEach(id => {
      const preset = availablePresets[id];
      if (preset) {
        preset.tools.forEach(tool => {
          if (seenToolIds.has(tool.id)) {
            findings.push({ type: 'warning', message: `Tool collision detected for ID: ${tool.id}.` });
          } else {
            seenToolIds.add(tool.id);
          }
        });
      }
    });

    // 2. Model Variability Warning
    const usedModels = new Set(stackedIds.map(id => availablePresets[id]?.modelParameters.model).filter(Boolean));
    if (usedModels.size > 1) {
      findings.push({ type: 'warning', message: `Model variability: ${Array.from(usedModels).join(', ')}. This may lead to latency shifts.` });
    }
    
    // 3. MCF Check
    if (stackedIds.length > 0 && !selectedMcfVersion) {
      findings.push({ type: 'error', message: 'No MCF Constitution embedded. Stack requires sovereign binding.' });
    }

    return findings;
  };

  const predictiveFindings = useMemo(() => runPredictiveDebugger(), [stackedIds, availablePresets, selectedMcfVersion]);

  // Handle saving the stack
  const handleCompileStack = () => {
    if (stackedIds.length === 0) {
      alert('Please add at least one COREPACK block to build a stack.');
      return;
    }

    // Merge logic
    const basePreset = availablePresets[stackedIds[0]];
    
    // Initialize target merged objects
    let mergedExpertise: string[] = [];
    let mergedInitialSteps: string[] = [];
    let mergedOperationalSteps: string[] = [];
    let mergedSafetyRules: string[] = [];
    let mergedReadPaths: string[] = [];
    let mergedWritePaths: string[] = [];
    let mergedAllowedApis: string[] = [];
    let mergedStates: string[] = [];
    let mergedTransitions: any[] = [];
    
    let mergedImprovisation = '';
    let mergedGuidance = '';
    let mergedRefusal = '';
    let mergedRisk = '';

    // Walk through selected stacks and synthesize
    stackedIds.forEach((id, index) => {
      const preset = availablePresets[id];
      if (!preset) return;

      // Metadata Domain Expertise
      mergedExpertise = Array.from(new Set([...mergedExpertise, ...preset.metadata.domainExpertise]));
      
      // Protocols
      mergedInitialSteps = Array.from(new Set([...mergedInitialSteps, ...preset.protocols.initialAnalysisSteps]));
      mergedOperationalSteps = Array.from(new Set([...mergedOperationalSteps, ...preset.protocols.operationalSteps]));
      mergedSafetyRules = Array.from(new Set([...mergedSafetyRules, ...preset.protocols.safetyRules]));

      // Risk Profile
      mergedImprovisation += (mergedImprovisation ? ' ' : '') + `[${preset.metadata.name}]: ` + preset.riskProfile.acceptableImprovisation;
      mergedGuidance += (mergedGuidance ? ' ' : '') + `[${preset.metadata.name}]: ` + preset.riskProfile.narrowingGuidance;
      mergedRefusal += (mergedRefusal ? ' ' : '') + `[${preset.metadata.name}]: ` + preset.riskProfile.refusalRules;
      mergedRisk += (mergedRisk ? ' ' : '') + `[${preset.metadata.name}]: ` + preset.riskProfile.primaryRiskVector;

      // Sandbox Skill Manifest parameters
      mergedReadPaths = Array.from(new Set([...mergedReadPaths, ...preset.skillManifest.sandboxReadPaths]));
      mergedWritePaths = Array.from(new Set([...mergedWritePaths, ...preset.skillManifest.sandboxWritePaths]));
      mergedAllowedApis = Array.from(new Set([...mergedAllowedApis, ...preset.skillManifest.allowedApis]));
      mergedStates = Array.from(new Set([...mergedStates, ...preset.skillManifest.supportedStates]));
      mergedTransitions = [...mergedTransitions, ...preset.skillManifest.stateTransitions];
    });

    // Select and map only checked tools (and resolve ID collisions by renaming if necessary)
    const activeTools: ToolDefinition[] = [];
    combinedTools.forEach(({ tool, parentId }) => {
      const isChecked = selectedTools[`${parentId}::${tool.id}`] ?? true;
      if (isChecked) {
        activeTools.push({ ...tool });
      }
    });

    // Determine embedded MCF metadata
    const selectedMcf = MCF_VERSIONS.find(v => v.version === selectedMcfVersion);
    const mcfBinding = selectedMcf 
      ? `\n\n[CONSTITUTIONAL REGISTRY EMBED]: Operating under ${selectedMcf.name} (v${selectedMcf.version}). MCF_HASH: ${selectedMcf.hash}`
      : '';

    // Synthesize Substrate Binding
    const firstPreset = availablePresets[stackedIds[0]];
    const generatedSubstrateBinding = `You are running a composite COGNITIVE STACK containing: [${stackedIds.map(id => availablePresets[id]?.metadata.name).join(', ')}]. \n\nPrimary Orchestration Objective: ${customObjective}\n\nPrimary Substrate Constraint: ${firstPreset?.metadata.substrateBinding || ''}${mcfBinding}`;

    // Create custom compiled Corepack config
    const newConfig: CorepackConfig = {
      metadata: {
        id: customId.trim() || 'custom-stack',
        name: customName.trim() || 'Custom Stack',
        version: '1.0.0',
        specialtyRole: customRole.trim(),
        targetAudience: 'Dynamic multi-agent orchestrator workflows',
        coreObjective: customObjective.trim(),
        domainExpertise: mergedExpertise,
        substrateBinding: generatedSubstrateBinding,
        author: 'Composite Stack Engine',
        lastModified: new Date().toISOString().split('T')[0],
      },
      protocols: {
        initialAnalysisSteps: mergedInitialSteps,
        operationalSteps: mergedOperationalSteps,
        safetyRules: mergedSafetyRules,
        failFastBehavior: true,
        idempotentOperations: true,
        rootCauseOnFailure: true,
        antiBloatPrompting: true,
        segregateHistoryFromProjections: true,
        customProtocolDirectives: `Cascade orchestration steps sequentially. Re-verify outputs from lower stack levels inside target schemas.`,
      },
      riskProfile: {
        acceptableImprovisation: mergedImprovisation,
        narrowingGuidance: mergedGuidance,
        refusalRules: mergedRefusal,
        primaryRiskVector: mergedRisk,
      },
      tools: activeTools,
      skillManifest: {
        sandboxReadPaths: mergedReadPaths,
        sandboxWritePaths: mergedWritePaths,
        allowedApis: mergedAllowedApis,
        supportedStates: mergedStates,
        stateTransitions: mergedTransitions,
      },
      modelParameters: {
        model: selectedModel,
        temperature: temperature,
        topP: 0.9,
        topK: 20,
        maxOutputTokens: 4096,
        thinkingLevel: 'HIGH',
        responseMimeType: 'text/plain',
        enforceRevenueGradeProtocol: true,
        enforceUncertaintyMarkers: true,
        enableAdaptiveDegradation: true,
      },
    };

    onSaveCustomPreset(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Corepack Stack Builder
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visually combine multiple COREPACK capability blocks to orchestrate a unified hybrid agent preset.
          </p>
        </div>

        <button
          onClick={onNavigateToPlayground}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Test Stack in Playground
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Available Blocks */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. Available Corepack Blocks
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select blocks below to pile them onto your orchestrator stack. Order represents execution authority.
            </p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {presetList.map((preset) => {
                const isAlreadyStacked = stackedIds.includes(preset.metadata.id);
                return (
                  <div
                    key={preset.metadata.id}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{preset.metadata.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">v{preset.metadata.version}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {preset.metadata.specialtyRole}
                      </p>
                      
                      {/* Tools indicator badge */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.tools.length > 0 ? (
                          preset.tools.map((t) => (
                            <span key={t.id} className="text-[9px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded flex items-center gap-1">
                              <Wrench className="w-2.5 h-2.5 text-slate-500" />
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-600">No active tools</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddBlock(preset.metadata.id)}
                      className={`w-full mt-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border transition-all ${
                        isAlreadyStacked
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-sm'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Stack
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Book className="w-4 h-4 text-emerald-400" />
              Constitutional Registry
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an MCF version to embed its SHA-256 identity constraint into the final synthesized stack.
            </p>

            <div className="space-y-3">
              {MCF_VERSIONS.map((mcf) => {
                const isSelected = selectedMcfVersion === mcf.version;
                return (
                  <div
                    key={mcf.version}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm shadow-emerald-900/20' 
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedMcfVersion(isSelected ? null : mcf.version)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {mcf.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">v{mcf.version}</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 break-all mb-2 leading-tight">
                      {mcf.hash}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {mcf.description}
                    </p>
                    <div className="mt-2 flex justify-end">
                      {isSelected && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Embedded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: The Active Stack & Merging Controls */}
        <div className="space-y-4 xl:col-span-2">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                2. Active Stack Layout
              </h3>
              
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-xs font-mono self-start sm:self-auto gap-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('pipeline')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${viewMode === 'pipeline' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Logic Flow Chain
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('simple')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${viewMode === 'simple' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Simple Blocks
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Classic List
                </button>
              </div>
            </div>

            {/* Visual Stack Rendering */}
            {stackedIds.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-10 text-center bg-slate-950/40 flex flex-col items-center justify-center min-h-[300px]">
                <Workflow className="w-10 h-10 text-indigo-500/50 mb-3" />
                <h4 className="text-sm font-bold text-slate-300">Your Process Chain is Empty</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">
                  Add available COREPACK modules from the left sidebar to start building your multi-agent logic flow chain.
                </p>
                {viewMode === 'pipeline' && (
                   <div className="mt-6 flex flex-col items-center opacity-40 select-none pointer-events-none">
                     <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono text-slate-500">INGRESS</div>
                     <div className="h-6 w-px bg-slate-800"></div>
                     <div className="w-32 h-12 border border-slate-800 rounded-lg bg-slate-900 border-dashed"></div>
                     <div className="h-6 w-px bg-slate-800"></div>
                     <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono text-slate-500">EGRESS</div>
                   </div>
                )}
              </div>
            ) : viewMode === 'pipeline' ? (
              /* Interactive Logic Flow Canvas */
              <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60" id="logic-chain-pipeline-container">
                <LogicFlowCanvas 
                  stackedIds={stackedIds} 
                  availablePresets={availablePresets}
                  onRemoveBlock={handleRemoveBlock}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              </div>
            ) : viewMode === 'simple' ? (
              /* Simple Minimalist Flow Chart Style Blocks */
              <div className="space-y-1.5 bg-slate-950/40 p-5 rounded-xl border border-slate-800/60 flex flex-col items-center" id="simple-flowchart-container">
                {/* Minimal Ingress */}
                <div className="flex flex-col items-center select-none pb-1">
                  <div className="px-3 py-1 bg-slate-900 border border-slate-850 rounded-full text-[9px] font-mono text-slate-400 font-bold tracking-wider">
                    INGRESS
                  </div>
                  <div className="h-4 w-px bg-slate-700"></div>
                </div>

                {/* Nodes Stack */}
                {stackedIds.map((id, idx) => {
                  const preset = availablePresets[id];
                  if (!preset) return null;

                  return (
                    <React.Fragment key={`${id}-simple-${idx}`}>
                      <div className="w-full max-w-md bg-slate-900 hover:bg-slate-850/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm transition-all relative">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md bg-indigo-950 border border-indigo-900 flex items-center justify-center text-[10px] font-mono font-bold text-indigo-300">
                            {idx + 1}
                          </div>
                          <span className="text-xs font-bold text-slate-100">{preset.metadata.name}</span>
                        </div>

                        {/* Inline Minimal Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20 disabled:pointer-events-none rounded transition-all cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === stackedIds.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20 disabled:pointer-events-none rounded transition-all cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(idx)}
                            className="p-1 text-rose-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                            title="Delete Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Connection Line & Arrow */}
                      {idx < stackedIds.length - 1 && (
                        <div className="flex flex-col items-center select-none py-1">
                          <div className="h-5 w-px bg-slate-700 relative">
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-500/85 absolute -bottom-1 -left-[6px]" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Minimal Egress */}
                <div className="flex flex-col items-center select-none pt-1">
                  <div className="h-4 w-px bg-slate-700"></div>
                  <div className="px-3 py-1 bg-slate-900 border border-slate-850 rounded-full text-[9px] font-mono text-emerald-400 font-bold tracking-wider">
                    EGRESS TARGET
                  </div>
                </div>
              </div>
            ) : (
              /* Classic Compact List View */
              <div className="space-y-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                {stackedIds.map((id, idx) => {
                  const preset = availablePresets[id];
                  if (!preset) return null;
                  return (
                    <div
                      key={`${id}-${idx}`}
                      className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-6 h-6 rounded bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-[11px] font-mono text-indigo-300 font-bold">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200">{preset.metadata.name}</span>
                          <span className="text-[11px] text-slate-500 block leading-tight">
                            {preset.metadata.specialtyRole}
                          </span>
                        </div>
                      </div>

                      {/* Reorder & Action Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors text-slate-400 cursor-pointer"
                          title="Move block up in stack priority"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === stackedIds.length - 1}
                          className="p-1 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors text-slate-400 cursor-pointer"
                          title="Move block down in stack priority"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlock(idx)}
                          className="p-1 bg-slate-950 border border-slate-800 hover:border-rose-900 text-rose-400 rounded transition-colors cursor-pointer"
                          title="Remove block from stack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Config & Merge Parameters Form */}
            {stackedIds.length > 0 && (
              <div className="space-y-5 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  3. Stack Compilation Parameters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Custom Stack Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Audit-Ingress Hybrid Stack"
                    />
                  </div>

                  {/* Custom ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Unique Identifier (ID)</label>
                    <input
                      type="text"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. custom-hybrid-stack"
                    />
                  </div>

                  {/* Specialty Role */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300">Specialty Role & Capabilities</label>
                    <textarea
                      rows={2}
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="What is this stacked model specialized to solve?"
                    />
                  </div>

                  {/* Objective */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300">Core Objective</label>
                    <textarea
                      rows={2}
                      value={customObjective}
                      onChange={(e) => setCustomObjective(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Core objectives that dictate active substrate bounds..."
                    />
                  </div>
                </div>

                {/* Composite Model Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/40">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Default Runtime Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash (Default)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</option>
                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 flex justify-between">
                      <span>Stack Entropy (Temp)</span>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{temperature.toFixed(2)}</span>
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                    />
                  </div>
                </div>

                {/* Composite Tools Manager */}
                {combinedTools.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-800/40">
                    <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-indigo-400" />
                      Composite Tools Integration Checklist
                    </label>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      All tools from stacked blocks are combined below. Toggle individual tools to customize permissions.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      {combinedTools.map(({ tool, parentId, parentName }) => {
                        const uniqueKey = `${parentId}::${tool.id}`;
                        const isChecked = selectedTools[uniqueKey] ?? true;
                        return (
                          <label
                            key={uniqueKey}
                            className="flex items-start gap-2.5 p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => setSelectedTools({
                                ...selectedTools,
                                [uniqueKey]: e.target.checked,
                              })}
                              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold text-slate-200 block truncate" title={tool.name}>
                                {tool.name}
                              </span>
                              <span className="text-[9px] text-slate-500 block">
                                Sourced from: <strong className="text-indigo-400">{parentName}</strong>
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Predictive Debugger Panel */}
                {predictiveFindings.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-800/40">
                    <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Predictive Chain Debugger
                    </label>
                    <div className="space-y-1.5">
                      {predictiveFindings.map((finding, i) => (
                        <div key={i} className={`p-2 rounded-lg text-[10px] border ${finding.type === 'error' ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-amber-950/40 border-amber-800 text-amber-300'}`}>
                          {finding.type === 'error' ? 'ERROR: ' : 'WARN: '}{finding.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Assemble Action Button */}
                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={handleCompileStack}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-950/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Compile & Deploy Combined Stack Preset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
