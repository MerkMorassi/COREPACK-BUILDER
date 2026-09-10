import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Play,
  Terminal,
  Info,
  Server,
  Lock,
} from 'lucide-react';
import { AuthpackRule, AuthpackVerificationResponse } from '../types';

interface AuthpackTabProps {
  isStandalone?: boolean;
  onExitStandalone?: () => void;
  onEnterStandalone?: () => void;
}

export const AuthpackTab: React.FC<AuthpackTabProps> = ({
  isStandalone = false,
  onExitStandalone,
  onEnterStandalone,
}) => {
  const [rules, setRules] = useState<AuthpackRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ruleMessage, setRuleMessage] = useState<string | null>(null);

  // New Rule Form State
  const [newRole, setNewRole] = useState<string>('SRE-DevOps-Coder');
  const [newAction, setNewAction] = useState<string>('MOUNT');
  const [newTarget, setNewTarget] = useState<string>('ALL');
  const [newAllowed, setNewAllowed] = useState<boolean>(true);
  const [newMinConfidence, setNewMinConfidence] = useState<'fact' | 'inference' | 'guess'>('fact');

  // Simulator Request State
  const [simAgentId, setSimAgentId] = useState<string>('agent-vox-09');
  const [simRole, setSimRole] = useState<string>('SRE-DevOps-Coder');
  const [simAction, setSimAction] = useState<string>('MOUNT');
  const [simTarget, setSimTarget] = useState<string>('techlead-analyst');
  const [simConfidence, setSimConfidence] = useState<'fact' | 'inference' | 'guess'>('fact');

  // Simulator Result State
  const [verificationResult, setVerificationResult] = useState<AuthpackVerificationResponse | null>(null);
  const [simIsRunning, setSimIsRunning] = useState<boolean>(false);

  // Fetch all active rules
  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/authpack/rules');
      const data = await res.json();
      if (data.rules) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed to fetch AUTHPACK rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Submit new rule
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/authpack/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newRole,
          action: newAction,
          targetCorepackId: newTarget,
          allowed: newAllowed,
          minConfidenceRequired: newMinConfidence,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRuleMessage('Policy rule appended to AUTHPACK successfully.');
        setTimeout(() => setRuleMessage(null), 3000);
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to create AUTHPACK rule:', err);
    }
  };

  // Delete existing rule
  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/authpack/rules/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  // Run verification simulation
  const handleVerifyRequest = async () => {
    setSimIsRunning(true);
    try {
      const res = await fetch('/api/authpack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: simAgentId,
          role: simRole,
          action: simAction,
          targetCorepackId: simTarget,
          confidenceRating: simConfidence,
        }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error('Authority verification request failed:', err);
    } finally {
      setSimIsRunning(false);
    }
  };

  const rolesList = [
    'SuperAdmin',
    'SRE-DevOps-Coder',
    'TechLead-Analyst',
    'Finance-Audit-Validator',
    'ReadOnlyGuest',
  ];

  const actionsList = [
    'MOUNT',
    'UNMOUNT',
    'EXECUTE_BASH',
    'RECONCILE_LEDGER',
    'PURGE_CACHE',
    'ALL',
  ];

  const content = (
    <div className="space-y-6" id="authpack-container">
      {/* Visual Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800" id="authpack-header">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-400 animate-pulse" />
            AUTHPACK: Cognitive Authority Gate & Role Policy Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define, update, and programmatically assert agent execution authority, mount permissions, and cryptographic trust tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isStandalone && onEnterStandalone && (
            <button
              onClick={onEnterStandalone}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-950"
            >
              <Server className="w-3.5 h-3.5 text-indigo-200" />
              Open Standalone Mockup App
            </button>
          )}

          <div className="bg-slate-950 px-3 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-indigo-300">
            SECURE TRUST REALM
          </div>
        </div>
      </div>

      {ruleMessage && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-xl text-xs text-indigo-300 flex items-center gap-2" id="rule-success-banner">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          {ruleMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rule list and addition (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Rules List Panel */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="rules-list-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-400" />
                Active Policy Rules Matrix ({rules.length})
              </span>
              {isLoading && <span className="text-[10px] text-slate-500 animate-pulse">Querying...</span>}
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-thin">
              {rules.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No policy rules defined. System is closed-by-default.
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between group transition-colors hover:border-slate-700"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded">
                          {rule.role}
                        </span>
                        <span className="text-[11px] text-slate-400">can</span>
                        <span className="text-xs font-mono font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded">
                          {rule.action}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>Target: <strong className="text-slate-400">{rule.targetCorepackId}</strong></span>
                        <span className="flex items-center gap-1">
                          Effect: 
                          <span className={`font-bold ${rule.allowed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {rule.allowed ? 'ALLOW' : 'DENY'}
                          </span>
                        </span>
                        <span>Confidence req: <strong className="text-slate-400">{rule.minConfidenceRequired}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition-all"
                      title="Revoke Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Rule Form Panel */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="add-rule-panel">
            <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2">
              Append Access Policy Rule
            </span>

            <form onSubmit={handleAddRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Agent Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                    <option value="ALL">ALL (Wildcard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Requested Action</label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {actionsList.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Target Corepack / ID</label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="e.g. ALL, voxconpack, techlead-analyst"
                    className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Min Confidence Required</label>
                  <select
                    value={newMinConfidence}
                    onChange={(e) => setNewMinConfidence(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="fact">Fact (Highest Verification)</option>
                    <option value="inference">Inference (Medium Verification)</option>
                    <option value="guess">Guess (Low Verification)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">Rule Effect:</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAllowed}
                      onChange={(e) => setNewAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    <span className="ms-2 text-xs font-mono font-bold text-slate-300">
                      {newAllowed ? 'ALLOW' : 'DENY'}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Append Access Rule
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Verification Simulator Panel (7 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="simulator-panel">
            <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-indigo-400" />
              Interactive Authority Verification Simulator
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Presenter Agent ID</label>
                <input
                  type="text"
                  value={simAgentId}
                  onChange={(e) => setSimAgentId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Presented Role</label>
                <select
                  value={simRole}
                  onChange={(e) => setSimRole(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {rolesList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Target Action</label>
                <select
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {actionsList.filter(a => a !== 'ALL').map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Target Corepack ID</label>
                <input
                  type="text"
                  value={simTarget}
                  onChange={(e) => setSimTarget(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Presenter Calibration</label>
                <select
                  value={simConfidence}
                  onChange={(e) => setSimConfidence(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="fact">Fact</option>
                  <option value="inference">Inference</option>
                  <option value="guess">Guess</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleVerifyRequest}
              disabled={simIsRunning}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              {simIsRunning ? 'Evaluating Authority Engine...' : 'Evaluate Authority Request'}
            </button>

            {verificationResult && (
              <div className="space-y-4 pt-2 border-t border-slate-800" id="verification-result-display">
                {/* Result Title */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Verification Outcome:</span>
                  <div className="flex items-center gap-1.5">
                    {verificationResult.granted ? (
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                        ACCESS GRANTED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded text-xs font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        ACCESS DENIED
                      </span>
                    )}
                  </div>
                </div>

                {/* Authority Token or Rejection Reason */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                    {verificationResult.granted ? 'Cryptographic Authority Token' : 'Reason For Rejection'}
                  </span>
                  {verificationResult.granted ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 select-all">
                        {verificationResult.authToken}
                      </span>
                      <span className="text-[9px] text-slate-600">Dynamic Base64 Signature</span>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-rose-300">
                      {verificationResult.reason}
                    </p>
                  )}
                </div>

                {/* Verification Trace Terminal */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    AUTHPACK Decision Audit Trail Trace:
                  </span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10px] font-mono text-slate-300 space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                    {verificationResult.auditChain.map((trace, i) => (
                      <div
                        key={i}
                        className={`leading-relaxed border-l-2 pl-2 ${
                          trace.includes('GRANTED')
                            ? 'border-emerald-600 text-emerald-300 bg-emerald-950/20 py-0.5'
                            : trace.includes('DENIED')
                            ? 'border-rose-600 text-rose-300 bg-rose-950/20 py-0.5'
                            : 'border-indigo-600/40 text-slate-300'
                        }`}
                      >
                        {trace}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
        {/* Standalone Dashboard Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
              <Fingerprint className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-slate-100 font-mono">AUTHPACK® AUTHORIZATION ENGINE</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">STANDALONE INSTANCE • v1.2.0-STABLE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-slate-500 border-r border-slate-800 pr-4">
              <span>Rule Engine: <strong className="text-emerald-400">ONLINE</strong></span>
              <span>Tokens Minted: <strong className="text-indigo-400">{verificationResult && verificationResult.granted ? '1 ACTIVE' : '0'}</strong></span>
            </div>

            {onExitStandalone && (
              <button
                onClick={onExitStandalone}
                className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-805 hover:text-slate-100 text-slate-300 text-xs font-semibold rounded-lg border border-slate-750 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Exit Standalone Console
              </button>
            )}
          </div>
        </header>

        {/* Standalone Body Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {content}
        </main>

        {/* Standalone Footer */}
        <footer className="bg-slate-900/40 border-t border-slate-850 py-3 text-center text-[11px] text-slate-500 font-mono">
          AUTHPACK Authorization and Rule Management System • Isolated Security Boundary Protocol v2.4
        </footer>
      </div>
    );
  }

  return content;
};
