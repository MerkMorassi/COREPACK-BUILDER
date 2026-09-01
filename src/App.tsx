/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CorepackConfig } from './types';
import { DEFAULT_COREPACK, PRESET_COREPACKS } from './data/presets';
import { compileAllArtifacts } from './utils/compiler';

import { Navbar } from './components/Navbar';
import { PromptDefinitionTab } from './components/PromptDefinitionTab';
import { ModelParametersTab } from './components/ModelParametersTab';
import { ToolDefinitionsTab } from './components/ToolDefinitionsTab';
import { CompiledArtifactsTab } from './components/CompiledArtifactsTab';
import { PlaygroundTab } from './components/PlaygroundTab';
import { AdaptiveDegradationTab } from './components/AdaptiveDegradationTab';
import { HitlQueueTab } from './components/HitlQueueTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('prompts');
  const [config, setConfig] = useState<CorepackConfig>(DEFAULT_COREPACK);

  // Compute validation issues count
  const artifacts = compileAllArtifacts(config);
  const defectCount = artifacts.defectValidationResult.errors.length;

  const handleSelectPreset = (presetId: string) => {
    if (PRESET_COREPACKS[presetId]) {
      // Clone deeply to prevent mutability leaks
      setConfig(JSON.parse(JSON.stringify(PRESET_COREPACKS[presetId])));
    }
  };

  const handleResetToDefault = () => {
    setConfig(JSON.parse(JSON.stringify(DEFAULT_COREPACK)));
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Tabbed Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentConfig={config}
        onSelectPreset={handleSelectPreset}
        onResetToDefault={handleResetToDefault}
        onExportJson={handleExportJson}
        defectCount={defectCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'prompts' && (
          <PromptDefinitionTab
            config={config}
            onChange={setConfig}
            onNavigateToArtifacts={() => setActiveTab('artifacts')}
          />
        )}

        {activeTab === 'model' && (
          <ModelParametersTab
            config={config}
            onChange={setConfig}
            onNavigateToPlayground={() => setActiveTab('playground')}
          />
        )}

        {activeTab === 'tools' && (
          <ToolDefinitionsTab
            config={config}
            onChange={setConfig}
          />
        )}

        {activeTab === 'artifacts' && (
          <CompiledArtifactsTab
            config={config}
          />
        )}

        {activeTab === 'playground' && (
          <PlaygroundTab
            config={config}
          />
        )}

        {activeTab === 'degradation' && (
          <AdaptiveDegradationTab />
        )}

        {activeTab === 'hitl' && (
          <HitlQueueTab />
        )}
      </main>

      {/* Footer System Status Bar */}
      <footer className="bg-slate-900/80 border-t border-slate-800/80 py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Substrate Runtime v3.0</span>
            <span>•</span>
            <span className="font-mono text-indigo-400 font-semibold">{config.metadata.name}</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Revenue-Grade Protocol • Zero-Hallucination Boundaries • Safe Degradation Ingress
          </div>
        </div>
      </footer>
    </div>
  );
}
