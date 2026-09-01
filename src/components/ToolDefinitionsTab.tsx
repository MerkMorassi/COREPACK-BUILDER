import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Code2,
  Database,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { CorepackConfig, ToolDefinition, ToolParameter } from '../types';

interface ToolDefinitionsTabProps {
  config: CorepackConfig;
  onChange: (updated: CorepackConfig) => void;
}

export const ToolDefinitionsTab: React.FC<ToolDefinitionsTabProps> = ({
  config,
  onChange,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    config.tools[0]?.id || ''
  );
  const [newParamName, setNewParamName] = useState('');
  const [newParamType, setNewParamType] = useState<ToolParameter['type']>('STRING');
  const [newParamDesc, setNewParamDesc] = useState('');
  const [newParamReq, setNewParamReq] = useState(true);

  const [testParamInputs, setTestParamInputs] = useState<Record<string, string>>({});
  const [testResultOutput, setTestResultOutput] = useState<string | null>(null);

  const [newReadPath, setNewReadPath] = useState('');
  const [newWritePath, setNewWritePath] = useState('');

  const selectedTool = config.tools.find((t) => t.id === selectedToolId) || config.tools[0];

  const updateTools = (updatedTools: ToolDefinition[]) => {
    onChange({
      ...config,
      tools: updatedTools,
    });
  };

  const toggleToolEnabled = (id: string) => {
    const updated = config.tools.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    updateTools(updated);
  };

  const addNewCustomTool = () => {
    const newId = 'customTool_' + Date.now();
    const newTool: ToolDefinition = {
      id: newId,
      name: 'customValidatorAction',
      description: 'Custom execution and audit function declaration',
      category: 'custom',
      enabled: true,
      parameters: [
        {
          id: 'p_' + Date.now(),
          name: 'targetPayload',
          type: 'STRING',
          description: 'Input data object to audit',
          required: true,
        },
      ],
      mockReturnValue: '{"status": "SUCCESS", "verifiedAt": "' + new Date().toISOString() + '"}',
    };

    updateTools([...config.tools, newTool]);
    setSelectedToolId(newId);
  };

  const deleteTool = (id: string) => {
    const updated = config.tools.filter((t) => t.id !== id);
    updateTools(updated);
    if (selectedToolId === id && updated.length > 0) {
      setSelectedToolId(updated[0].id);
    }
  };

  const updateSelectedToolField = (field: keyof ToolDefinition, value: any) => {
    if (!selectedTool) return;
    const updated = config.tools.map((t) =>
      t.id === selectedTool.id ? { ...t, [field]: value } : t
    );
    updateTools(updated);
  };

  const addParameterToSelectedTool = () => {
    if (!selectedTool || !newParamName.trim()) return;
    const newParam: ToolParameter = {
      id: 'param_' + Date.now(),
      name: newParamName.trim().replace(/\s+/g, '_'),
      type: newParamType,
      description: newParamDesc.trim() || 'Parameter specification',
      required: newParamReq,
    };

    const updatedParams = [...selectedTool.parameters, newParam];
    updateSelectedToolField('parameters', updatedParams);
    setNewParamName('');
    setNewParamDesc('');
  };

  const removeParameter = (paramId: string) => {
    if (!selectedTool) return;
    const updatedParams = selectedTool.parameters.filter((p) => p.id !== paramId);
    updateSelectedToolField('parameters', updatedParams);
  };

  const handleRunMockTool = () => {
    if (!selectedTool) return;
    try {
      const parsedMock = selectedTool.mockReturnValue
        ? JSON.parse(selectedTool.mockReturnValue)
        : { status: 'OK', executionTimeMs: 14.2 };
      setTestResultOutput(JSON.stringify(parsedMock, null, 2));
    } catch {
      setTestResultOutput(selectedTool.mockReturnValue || '{"status": "SUCCESS"}');
    }
  };

  const addSandboxReadPath = () => {
    if (!newReadPath.trim()) return;
    onChange({
      ...config,
      skillManifest: {
        ...config.skillManifest,
        sandboxReadPaths: [...config.skillManifest.sandboxReadPaths, newReadPath.trim()],
      },
    });
    setNewReadPath('');
  };

  const removeSandboxReadPath = (idx: number) => {
    const updated = [...config.skillManifest.sandboxReadPaths];
    updated.splice(idx, 1);
    onChange({
      ...config,
      skillManifest: {
        ...config.skillManifest,
        sandboxReadPaths: updated,
      },
    });
  };

  const addSandboxWritePath = () => {
    if (!newWritePath.trim()) return;
    onChange({
      ...config,
      skillManifest: {
        ...config.skillManifest,
        sandboxWritePaths: [...config.skillManifest.sandboxWritePaths, newWritePath.trim()],
      },
    });
    setNewWritePath('');
  };

  const removeSandboxWritePath = (idx: number) => {
    const updated = [...config.skillManifest.sandboxWritePaths];
    updated.splice(idx, 1);
    onChange({
      ...config,
      skillManifest: {
        ...config.skillManifest,
        sandboxWritePaths: updated,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            Tool Declarations, Function Calling & Router Manifest
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure function calling parameters, Zod validation models, sandbox filesystem boundaries, and router states.
          </p>
        </div>

        <button
          onClick={addNewCustomTool}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Custom Tool
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tool List Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-200">Declared Tools ({config.tools.length})</span>
              <span className="text-[10px] text-slate-400">
                {config.tools.filter((t) => t.enabled).length} Enabled
              </span>
            </div>

            <div className="space-y-2">
              {config.tools.map((tool) => {
                const isSelected = selectedTool?.id === tool.id;
                return (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedToolId(tool.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500/80 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-100">{tool.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{tool.description}</p>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={tool.enabled}
                        onChange={() => toggleToolEnabled(tool.id)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        title="Enable/Disable Tool"
                      />
                      {config.tools.length > 1 && (
                        <button
                          onClick={() => deleteTool(tool.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sandbox Filesystem Boundaries */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Sandbox Filesystem Permissions
            </h4>

            {/* Read Paths */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">Allowed Read Paths</label>
              <div className="space-y-1">
                {config.skillManifest.sandboxReadPaths.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
                    <span>{p}</span>
                    <button onClick={() => removeSandboxReadPath(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newReadPath}
                  onChange={(e) => setNewReadPath(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSandboxReadPath()}
                  placeholder="/workspace/configs/"
                  className="flex-1 bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button onClick={addSandboxReadPath} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Write Paths */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-300 block">Allowed Write Paths</label>
              <div className="space-y-1">
                {config.skillManifest.sandboxWritePaths.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
                    <span>{p}</span>
                    <button onClick={() => removeSandboxWritePath(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newWritePath}
                  onChange={(e) => setNewWritePath(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSandboxWritePath()}
                  placeholder="/workspace/out/"
                  className="flex-1 bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button onClick={addSandboxWritePath} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Tool Parameter Schema & Mock Runner */}
        {selectedTool && (
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Tool Details */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <h3 className="text-sm font-bold text-slate-200 font-mono">
                    FunctionDeclaration: {selectedTool.name}
                  </h3>
                </div>
                <span className="text-xs text-indigo-400 font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {selectedTool.parameters.length} Parameters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Function Name</label>
                  <input
                    type="text"
                    value={selectedTool.name}
                    onChange={(e) => updateSelectedToolField('name', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={selectedTool.category}
                    onChange={(e) => updateSelectedToolField('category', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="system">System / Architecture</option>
                    <option value="ledger">Ledger / Financial</option>
                    <option value="devops">DevOps / SRE</option>
                    <option value="validation">Validation / Linting</option>
                    <option value="custom">Custom Application Action</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={selectedTool.description}
                  onChange={(e) => updateSelectedToolField('description', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Parameter Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">Parameters Schema</h4>
                  <span className="text-[10px] text-slate-400">Generates Zod & Type declarations</span>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Parameter Name</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Required</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/50 font-mono text-[11px]">
                      {selectedTool.parameters.map((param) => (
                        <tr key={param.id} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-indigo-300 font-bold">{param.name}</td>
                          <td className="px-3 py-2 text-slate-300">{param.type}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                                param.required
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {param.required ? 'REQUIRED' : 'OPTIONAL'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-400 font-sans">{param.description}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => removeParameter(param.id)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New Parameter Form */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">Add Parameter Field</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newParamName}
                      onChange={(e) => setNewParamName(e.target.value)}
                      placeholder="Param name (e.g. amount_cents)"
                      className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    <select
                      value={newParamType}
                      onChange={(e) => setNewParamType(e.target.value as any)}
                      className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="STRING">STRING</option>
                      <option value="INTEGER">INTEGER (Non-negative)</option>
                      <option value="NUMBER">NUMBER</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="ARRAY">ARRAY</option>
                      <option value="OBJECT">OBJECT</option>
                    </select>
                    <input
                      type="text"
                      value={newParamDesc}
                      onChange={(e) => setNewParamDesc(e.target.value)}
                      placeholder="Description of parameter"
                      className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:col-span-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newParamReq}
                        onChange={(e) => setNewParamReq(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      Is Required Field
                    </label>

                    <button
                      onClick={addParameterToSelectedTool}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md shadow-sm flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Parameter
                    </button>
                  </div>
                </div>
              </div>

              {/* Mock Return Value JSON */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mock Execution Return Value (JSON)
                </label>
                <textarea
                  rows={2}
                  value={selectedTool.mockReturnValue || ''}
                  onChange={(e) => updateSelectedToolField('mockReturnValue', e.target.value)}
                  className="w-full bg-slate-950 text-indigo-300 text-xs font-mono border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder='{"status": "SUCCESS"}'
                />
              </div>

              {/* Live Mock Tool Invoker */}
              <div className="bg-slate-950 p-4 rounded-lg border border-indigo-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Live Tool Invocation Simulator
                  </div>
                  <button
                    onClick={handleRunMockTool}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Execute Mock Call
                  </button>
                </div>

                {testResultOutput && (
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-md border border-slate-800 overflow-x-auto">
                    {testResultOutput}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
