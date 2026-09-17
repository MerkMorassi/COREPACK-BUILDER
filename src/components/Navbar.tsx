import React from 'react';
import { useAppStore } from '../store';
import {
  Layers,
  FileCode,
  Sliders,
  Wrench,
  Terminal,
  ShieldAlert,
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  Download,
  RotateCcw,
  Fingerprint,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';
import { CorepackConfig } from '../types';
import { compileAllArtifacts } from '../utils/compiler';

export const Navbar = () => {
  const { activeTab, setActiveTab, config, presets, setConfig, setPresets } = useAppStore();

  const artifacts = compileAllArtifacts(config);
  const defectCount = artifacts.defectValidationResult.errors.length;

  const handleSelectPreset = (presetId: string) => {
    if (presets[presetId]) {
      setConfig(JSON.parse(JSON.stringify(presets[presetId])));
    }
  };

  const handleResetToDefault = () => {
    useAppStore.getState().resetToDefault();
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.metadata.id}-corepack-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: 'Launch', category: 'Core' },
    { id: 'prompts', label: 'Prompt Def', icon: FileCode, badge: null, category: 'Core' },
    { id: 'model', label: 'Model Params', icon: Sliders, badge: null, category: 'Core' },
    { id: 'tools', label: 'Tool Def', icon: Wrench, badge: `${config.tools.filter((t) => t.enabled).length} Tools`, category: 'Core' },
    
    { id: 'stacker', label: 'Stack Builder', icon: Layers, badge: 'New', category: 'Orchestration' },
    { id: 'playground', label: 'Playground', icon: Terminal, badge: 'Live', category: 'Orchestration' },
    
    { id: 'artifacts', label: 'Artifacts', icon: Layers, badge: defectCount === 0 ? 'Verified' : `${defectCount} Issues`, category: 'Compliance' },
    { id: 'degradation', label: 'Degradation', icon: ShieldAlert, badge: 'Adaptive', category: 'Compliance' },
    { id: 'hitl', label: 'HITL Queue', icon: ClipboardCheck, badge: 'Audit', category: 'Compliance' },
    { id: 'authpack', label: 'AUTHPACK', icon: Fingerprint, badge: 'Secure', category: 'Compliance' },
    { id: 'commpack', label: 'COMMPACK', icon: MessageSquare, badge: 'Protocol', category: 'Compliance' },
  ];

  let currentCategory = '';
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">COREPACK BUILDER</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                  v2.0 Engine
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Substrate Bound
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cognitive Substrate v3.0 • Revenue-Grade Output Protocol • Node.js Runtime
              </p>
            </div>
          </div>

          {/* Preset Selector & Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
              <Sparkles className="w-4 h-4 text-amber-400 ml-1" />
              <label htmlFor="preset-select" className="text-xs font-medium text-slate-300">
                Preset:
              </label>
              <select
                id="preset-select"
                value={config.metadata.id}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {(Object.values(presets) as CorepackConfig[]).map((preset) => (
                  <option key={preset.metadata.id} value={preset.metadata.id}>
                    {preset.metadata.name} (v{preset.metadata.version})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Export Full Corepack JSON Configuration"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/80 rounded-lg transition-colors"
              title="Reset to default preset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 py-2.5 border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showHeader = tab.category !== currentCategory;
            currentCategory = tab.category;
            
            return (
              <React.Fragment key={tab.id}>
                {showHeader && (
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 pr-1 border-r border-slate-800 mr-1">
                    {tab.category}
                  </div>
                )}
                <button
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${
                        tab.badge.includes('Issues')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : tab.badge === 'Verified'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
