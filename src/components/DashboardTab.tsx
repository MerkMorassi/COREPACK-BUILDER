import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Fingerprint,
  FileCode,
  Sliders,
  Wrench,
  Terminal,
  ShieldAlert,
  ClipboardCheck,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Server,
  Shield,
  Zap,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { CorepackConfig } from '../types';

interface DashboardTabProps {
  config: CorepackConfig;
  defectCount: number;
  onNavigateTab: (tabId: string) => void;
}

interface SimulatedLog {
  timestamp: string;
  category: 'SYSTEM' | 'SECURITY' | 'COMPILER' | 'INTEGRATION';
  message: string;
  status: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  config,
  defectCount,
  onNavigateTab,
}) => {
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [simulatedLogs, setSimulatedLogs] = useState<SimulatedLog[]>([
    {
      timestamp: '10:02:30',
      category: 'SYSTEM',
      message: 'Substrate Bound Orchestration Engine v3.0 booted successfully.',
      status: 'SUCCESS',
    },
    {
      timestamp: '10:02:31',
      category: 'COMPILER',
      message: `Preset Corepack template '${config.metadata.name}' loaded into workspace memory.`,
      status: 'INFO',
    },
    {
      timestamp: '10:02:33',
      category: 'SECURITY',
      message: 'AUTHPACK Dynamic Policy Matrix compiled (7 system rules operational).',
      status: 'SUCCESS',
    },
    {
      timestamp: '10:02:35',
      category: 'SYSTEM',
      message: 'DEGRADATION failover gateway initialized. Base state verified.',
      status: 'SUCCESS',
    },
  ]);

  // Compute scoring metrics dynamically
  const isSpecialtySet = config.metadata.specialtyRole.length > 10;
  const hasSafetyRules = config.protocols.safetyRules.length >= 3;
  const hasEnabledTools = config.tools.some((t) => t.enabled);
  const hasRiskProfile = config.riskProfile.primaryRiskVector.length > 10;
  const isCompilerClean = defectCount === 0;

  let integrityScore = 0;
  if (isSpecialtySet) integrityScore += 20;
  if (hasSafetyRules) integrityScore += 20;
  if (hasEnabledTools) integrityScore += 20;
  if (hasRiskProfile) integrityScore += 20;
  if (isCompilerClean) integrityScore += 20;

  // Walkthrough checklist status
  const checklistSteps = [
    {
      id: 'step-role',
      title: 'Design Role & Specialist Context',
      description: 'Define the agent identity, core objective, and areas of expertise.',
      completed: isSpecialtySet,
      tab: 'prompts',
      icon: FileCode,
    },
    {
      id: 'step-model',
      title: 'Tune Temperature & Safety Parameters',
      description: 'Configure constraints, calibration ratings, and model thresholds.',
      completed: config.modelParameters.temperature !== 0.7 || config.modelParameters.maxOutputTokens !== 1024,
      tab: 'model',
      icon: Sliders,
    },
    {
      id: 'step-tools',
      title: 'Enable Integration System Tools',
      description: 'Assign functions, capabilities, and parameters for execution.',
      completed: hasEnabledTools,
      tab: 'tools',
      icon: Wrench,
    },
    {
      id: 'step-artifacts',
      title: 'Compile and Verify Substrate Code',
      description: 'Verify system prompts and clear compile-time syntax defects.',
      completed: isCompilerClean,
      tab: 'artifacts',
      icon: Layers,
    },
    {
      id: 'step-playground',
      title: 'Test System Commands in the Playground',
      description: 'Interactively run prompt logic and verify tool execution triggers.',
      completed: false, // User triggered tab test
      tab: 'playground',
      icon: Terminal,
    },
    {
      id: 'step-authpack',
      title: 'Formulate AUTHPACK Permission Gates',
      description: 'Define who can execute mutations like mounting tools or running commands.',
      completed: true, // Auto-marked as active with initial rules
      tab: 'authpack',
      icon: Fingerprint,
    },
  ];

  const completedStepsCount = checklistSteps.filter((s) => s.completed).length;

  // Add random simulated audit log event
  const handleTriggerSimulatedEvent = () => {
    const categories: SimulatedLog['category'][] = ['SYSTEM', 'SECURITY', 'COMPILER', 'INTEGRATION'];
    const logsPool = [
      {
        category: 'SECURITY' as const,
        message: 'AUTHPACK verification evaluated requester agent-vox-09 (role: SRE-DevOps-Coder, action: MOUNT) -> GRANTED (token issued).',
        status: 'SUCCESS' as const,
      },
      {
        category: 'INTEGRATION' as const,
        message: `Tool invocation dispatched successfully: '${config.tools.find(t => t.enabled)?.name || 'auditArchitectureComplexity'}'.`,
        status: 'INFO' as const,
      },
      {
        category: 'SYSTEM' as const,
        message: 'DEGRADATION gateway trigger tripped: high horizontal peak write-lock threshold detected.',
        status: 'WARNING' as const,
      },
      {
        category: 'SECURITY' as const,
        message: "Access Denied. Role 'ReadOnlyGuest' explicitly blocked from mutation actions.",
        status: 'CRITICAL' as const,
      },
      {
        category: 'COMPILER' as const,
        message: `System prompt re-evaluated for '${config.metadata.id}'. Token footprint within safe boundary bounds.`,
        status: 'SUCCESS' as const,
      },
    ];

    const randomLog = logsPool[Math.floor(Math.random() * logsPool.length)];
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    setSimulatedLogs((prev) => [
      ...prev,
      {
        timestamp,
        category: randomLog.category,
        message: randomLog.message,
        status: randomLog.status,
      },
    ].slice(-10)); // Keep last 10 logs
  };

  return (
    <div className="space-y-6" id="dashboard-tab-container">
      {/* Top Banner Dashboard Intro */}
      <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="dashboard-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">COREPACK OPERATIONAL COMMAND CENTER</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time analytics, integrity scores, package diagnostics, and onboarding walkthroughs for the cognitive substrate workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerSimulatedEvent}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Generate Sandbox Log
          </button>

          <span className="bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-[10px] font-mono text-indigo-300">
            CURRENT BOUNDARY: ESTABLISHED
          </span>
        </div>
      </div>

      {/* First Launch Walkthrough Dismissible Tutorial */}
      {showTutorial && (
        <div className="p-5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl relative overflow-hidden space-y-3" id="welcome-tutorial-panel">
          <div className="absolute right-3 top-3">
            <button
              onClick={() => setShowTutorial(false)}
              className="text-indigo-400 hover:text-indigo-200 text-xs font-semibold cursor-pointer px-2 py-0.5 rounded bg-indigo-900/40 hover:bg-indigo-900/80 transition-all"
            >
              Dismiss Guide
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100">Welcome to Corepack Builder v2 Engine!</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            A <strong>Corepack</strong> is a standardized cognitive template that binds specialized agent roles, execution instructions, risk boundaries, and tools to the <strong>Mythos Cognitive Substrate</strong>. Follow our interactive walkthrough below to configure your prompts, map operational APIs, verify compiler health, and safely simulate commands within secure AUTHPACK sandboxes.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-indigo-200 pt-1 font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero-Hallucination Boundaries
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Secure Multi-Agent Orchestration
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-indigo-400" /> Live Microservice Simulation
            </span>
          </div>
        </div>
      )}

      {/* Big Action / Quick Launch CTAs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="quick-launch-ctas">
        {/* Card 1: Create Corepack */}
        <button
          onClick={() => onNavigateTab('prompts')}
          className="p-5 bg-slate-900/90 hover:bg-slate-900/100 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-left flex flex-col justify-between space-y-4 group transition-all duration-200 shadow-sm hover:shadow-indigo-950/20 cursor-pointer"
          id="cta-create-corepack"
        >
          <div className="space-y-2.5">
            <div className="p-2.5 w-11 h-11 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">STEP 1 • ORCHESTRATION</h4>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 mt-0.5 flex items-center gap-1.5 transition-colors">
                Design Prompt Corepack
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Define specialized system identities, core operating objectives, custom constraints, and zero-hallucination guardrails.
            </p>
          </div>
          <div className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded w-fit">
            Configure Prompt Templates
          </div>
        </button>

        {/* Card 2: Assemble Stack */}
        <button
          onClick={() => onNavigateTab('stacker')}
          className="p-5 bg-slate-900/90 hover:bg-slate-900/100 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-left flex flex-col justify-between space-y-4 group transition-all duration-200 shadow-sm hover:shadow-indigo-950/20 cursor-pointer"
          id="cta-create-stack"
        >
          <div className="space-y-2.5">
            <div className="p-2.5 w-11 h-11 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">STEP 2 • AGGREGATION</h4>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 mt-0.5 flex items-center gap-1.5 transition-colors">
                Layer Cognitive Stack
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Bundle and stack multiple modular templates, capabilities, and system directives into structured agent hierarchies.
            </p>
          </div>
          <div className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded w-fit">
            Stack Multiple Templates
          </div>
        </button>

        {/* Card 3: Interactive Sandbox */}
        <button
          onClick={() => onNavigateTab('playground')}
          className="p-5 bg-slate-900/90 hover:bg-slate-900/100 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-left flex flex-col justify-between space-y-4 group transition-all duration-200 shadow-sm hover:shadow-indigo-950/20 cursor-pointer"
          id="cta-run-sandbox"
        >
          <div className="space-y-2.5">
            <div className="p-2.5 w-11 h-11 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">STEP 3 • SIMULATION</h4>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 mt-0.5 flex items-center gap-1.5 transition-colors">
                Sandbox Playground
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Execute system instructions dynamically, inspect parameter boundaries, and test dynamic tool execution scopes.
            </p>
          </div>
          <div className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded w-fit">
            Launch Simulation Sandbox
          </div>
        </button>
      </div>

      {/* Grid: Stats Widgets, Integrity Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Stats Section: 4 cols */}
        <div className="md:col-span-4 space-y-6">
          {/* Dynamic Integrity Gauge */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col items-center text-center space-y-4" id="integrity-gauge-panel">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Substrate Integrity Score
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">ALIGNED</span>
            </div>

            {/* Circular SVG Progress Gauge */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke={
                    integrityScore >= 80
                      ? '#10b981'
                      : integrityScore >= 50
                      ? '#6366f1'
                      : '#f43f5e'
                  }
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - integrityScore / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
                  {integrityScore}%
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {integrityScore >= 80
                    ? 'Production Ready'
                    : integrityScore >= 60
                    ? 'Substrate Valid'
                    : 'Unstable Draft'}
                </span>
              </div>
            </div>

            {/* Parameter Compliance Meter Checklist */}
            <div className="w-full text-left space-y-1.5 pt-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[10px]">Identities & Role Scope</span>
                <span className={isSpecialtySet ? 'text-emerald-400' : 'text-slate-500'}>
                  {isSpecialtySet ? 'PASS (+20%)' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[10px]">Safety Rules (&ge;3 rules)</span>
                <span className={hasSafetyRules ? 'text-emerald-400' : 'text-slate-500'}>
                  {hasSafetyRules ? 'PASS (+20%)' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[10px]">Configured Operations / Tools</span>
                <span className={hasEnabledTools ? 'text-emerald-400' : 'text-slate-500'}>
                  {hasEnabledTools ? 'PASS (+20%)' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[10px]">Risk Profile Parameters</span>
                <span className={hasRiskProfile ? 'text-emerald-400' : 'text-slate-500'}>
                  {hasRiskProfile ? 'PASS (+20%)' : 'MISSING'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[10px]">Zero Syntax Defects</span>
                <span className={isCompilerClean ? 'text-emerald-400' : 'text-rose-500 font-bold'}>
                  {isCompilerClean ? 'PASS (+20%)' : `FAIL (${defectCount} DEFECTS)`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Active Tools</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-slate-100">
                  {config.tools.filter((t) => t.enabled).length}
                </span>
                <span className="text-xs text-slate-500">/ {config.tools.length}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Defect Warnings</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold font-mono ${defectCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {defectCount}
                </span>
                <span className="text-xs text-slate-500">issues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dashboard Body: 8 cols */}
        <div className="md:col-span-8 space-y-6">
          {/* Diagnostic Pack Controllers */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="pack-diagnostics-panel">
            <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Substrate Package Diagnostics Cockpit
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* VOXCONPACK */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">VOXCONPACK</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-slate-500">Handles acoustic ingress, confidence metrics, and speech transcription pipelines.</p>
                </div>
                <div className="flex items-center justify-between text-[10px] border-t border-slate-900 pt-2 text-slate-400">
                  <span>Status: <strong className="text-emerald-400">ONLINE</strong></span>
                  <span>98% Conf</span>
                </div>
              </div>

              {/* AUTHPACK */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">AUTHPACK</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-slate-500">Verifies identities and evaluates dynamic permission rules. Generates signature tokens.</p>
                </div>
                <div className="flex items-center justify-between text-[10px] border-t border-slate-900 pt-2 text-slate-400">
                  <span>Status: <strong className="text-indigo-400">ENFORCING</strong></span>
                  <span>7 Active Rules</span>
                </div>
              </div>

              {/* DEGRADATION */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">DEGRADATION</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[10px] text-slate-500">Manages high-load failover scenarios. Automatically triggers lightweight prompts.</p>
                </div>
                <div className="flex items-center justify-between text-[10px] border-t border-slate-900 pt-2 text-slate-400">
                  <span>Gateway: <strong className="text-emerald-400">NORMAL</strong></span>
                  <span>0ms Overhead</span>
                </div>
              </div>
            </div>
          </div>

          {/* First Launch Walkthrough Checklist Checklist */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="walkthrough-checklist-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                First Launch Walkthrough Checklist ({completedStepsCount}/6)
              </span>

              <div className="w-32 bg-slate-950 rounded-full h-1.5 border border-slate-850 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(completedStepsCount / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {checklistSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.id}
                    onClick={() => onNavigateTab(step.tab)}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer flex items-start gap-3 transition-all duration-150 group"
                  >
                    <div className="pt-0.5">
                      {step.completed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-900 text-slate-500 border border-slate-700 group-hover:text-indigo-400 group-hover:border-indigo-500/30 flex items-center justify-center font-mono text-[10px] font-bold">
                          •
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 block flex items-center gap-1">
                        {step.title}
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <p className="text-[10px] text-slate-400 leading-normal">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Event Log Terminal Area */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3" id="operational-logs-terminal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            Operational Substrate Audit Event Feed (Simulation Console)
          </span>

          <span className="text-[10px] text-slate-500 font-mono">
            POLLING RATE: LIVE STREAM
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[10.5px] leading-relaxed space-y-2 max-h-[180px] overflow-y-auto scrollbar-thin">
          {simulatedLogs.map((log, index) => {
            let statusColor = 'text-slate-300';
            let statusText = 'INFO';
            if (log.status === 'SUCCESS') {
              statusColor = 'text-emerald-400 bg-emerald-950/30';
              statusText = 'PASS';
            } else if (log.status === 'WARNING') {
              statusColor = 'text-amber-400 bg-amber-950/30';
              statusText = 'WARN';
            } else if (log.status === 'CRITICAL') {
              statusColor = 'text-rose-400 bg-rose-950/30';
              statusText = 'DENY';
            } else {
              statusColor = 'text-indigo-300 bg-indigo-950/30';
            }

            return (
              <div key={index} className="flex items-start gap-2.5">
                <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColor}`}>
                  {statusText}
                </span>
                <span className="text-indigo-400 font-semibold select-none">[{log.category}]</span>
                <span className="text-slate-300 flex-1">{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
