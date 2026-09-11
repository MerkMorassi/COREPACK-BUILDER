import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Radio,
  FileText,
  ShieldAlert,
  List,
  Plus,
  Terminal,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Sparkles,
  RefreshCw,
  Lock,
  X,
  Sliders,
  Search,
  Check,
  HelpCircle,
} from 'lucide-react';

interface CommpackMessage {
  id: string;
  from: string;
  to: string;
  priority: 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'IMMEDIATE';
  type: string;
  status: string;
  bluf: string;
  body: string;
  timestamp: string;
  isValid: boolean;
  diagnostics: string[];
}

interface CommpackBoundary {
  id: string;
  fromAgent: string;
  toAgent: string;
  allowedTypes: string[];
  enabled: boolean;
}

export const CommpackTab: React.FC = () => {
  // States
  const [messages, setMessages] = useState<CommpackMessage[]>([]);
  const [boundaries, setBoundaries] = useState<CommpackBoundary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isLoadingBoundaries, setIsLoadingBoundaries] = useState<boolean>(false);
  const [searchGlossary, setSearchGlossary] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; diagnostics: string[] } | null>(null);

  // New Boundary Form State
  const [newFromAgent, setNewFromAgent] = useState<string>('SRE-DevOps-Coder');
  const [newToAgent, setNewToAgent] = useState<string>('Finance-Audit-Validator');
  const [newAllowedTypes, setNewAllowedTypes] = useState<string[]>(['ALERT', 'REPORT']);
  const [boundaryMsg, setBoundaryMsg] = useState<string | null>(null);

  // Composer Form State
  const [compFrom, setCompFrom] = useState<string>('SRE-DevOps-Coder');
  const [compTo, setCompTo] = useState<string>('TechLead-Analyst');
  const [compPriority, setCompPriority] = useState<'ROUTINE' | 'PRIORITY' | 'URGENT' | 'IMMEDIATE'>('PRIORITY');
  const [compType, setCompType] = useState<string>('ALERT');
  const [compStatus, setCompStatus] = useState<string>('DEGRADED');
  const [compBluf, setCompBluf] = useState<string>('Database replica sync delay has breached safety limits.');
  const [compObs, setCompObs] = useState<string>('Replication delay measures 135 seconds.');
  const [compAss, setCompAss] = useState<string>('The high read load on database nodes is blocking the synchronization stream.');
  const [compEvid, setCompEvid] = useState<string>('Metrics log identifier: db-repl-lag, measured at 2026-09-11T08:30:00Z.');
  const [compAct, setCompAct] = useState<string>('Initiate replica load-balancing immediately to restore baseline lag metrics.');
  const [compEsc, setCompEsc] = useState<string>('Escalate to DevOps Lead if lag persists after load-balancing step completes.');

  // Draft text and auto-compile
  const [draftBody, setDraftBody] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Load Initial Data
  const fetchData = async () => {
    setIsLoadingMessages(true);
    setIsLoadingBoundaries(true);
    try {
      const resMsg = await fetch('/api/commpack/messages');
      const dataMsg = await resMsg.json();
      if (dataMsg.messages) setMessages(dataMsg.messages);

      const resBound = await fetch('/api/commpack/boundaries');
      const dataBound = await resBound.json();
      if (dataBound.boundaries) setBoundaries(dataBound.boundaries);
    } catch (err) {
      console.error('Failed to fetch COMMPACK parameters:', err);
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingBoundaries(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compile draft body automatically when inputs change
  useEffect(() => {
    const lines = [
      'MSG',
      `FROM: ${compFrom}`,
      `TO: ${compTo}`,
      `PRIORITY: ${compPriority}`,
      `TYPE: ${compType}`,
      `STATUS: ${compStatus}`,
      `BLUF: ${compBluf}`,
    ];

    if (compObs) lines.push(`OBSERVATION: ${compObs}`);
    if (compAss) lines.push(`ASSESSMENT: ${compAss}`);
    if (compEvid) lines.push(`EVIDENCE: ${compEvid}`);
    if (compAct) lines.push(`ACTION: ${compAct}`);
    if (compEsc) lines.push(`ESCALATION: ${compEsc}`);

    lines.push(`TIMESTAMP: ${new Date().toISOString()}`);
    lines.push('PROVENANCE: commpack-composer-node');
    lines.push('END');

    const bodyText = lines.join('\n');
    setDraftBody(bodyText);

    // Conduct client-side validation check
    runClientValidation(bodyText);
  }, [
    compFrom,
    compTo,
    compPriority,
    compType,
    compStatus,
    compBluf,
    compObs,
    compAss,
    compEvid,
    compAct,
    compEsc,
    boundaries, // Re-validate if boundaries change!
  ]);

  // Client side quick validation
  const runClientValidation = (bodyText: string) => {
    const diagnostics: string[] = [];

    // Conversational check
    const conversationalFillers = [
      'happy to help',
      'apologize',
      'sorry',
      'please',
      'thank you',
      'great question',
      'sure',
      'hope this helps',
    ];
    conversationalFillers.forEach((word) => {
      if (bodyText.toLowerCase().includes(word)) {
        diagnostics.push(`FILLER: Banned conversational phrase "${word}" detected.`);
      }
    });

    // Banned words check
    const bannedVocabulary = [
      'utilize',
      'prior to',
      'shall',
      'performs',
      'conducts',
      'close proximity',
      'currently',
    ];
    bannedVocabulary.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(bodyText)) {
        diagnostics.push(`STYLE: Prohibited word/phrase "${word}" detected.`);
      }
    });

    // Boundary check
    const matchedBoundary = boundaries.find(
      (b) => b.fromAgent === compFrom && b.toAgent === compTo
    );
    if (!matchedBoundary) {
      diagnostics.push(`BOUNDARY: No communication path defined between "${compFrom}" and "${compTo}".`);
    } else if (!matchedBoundary.enabled) {
      diagnostics.push(`BOUNDARY: Communication route between "${compFrom}" and "${compTo}" is DISABLED.`);
    } else if (!matchedBoundary.allowedTypes.includes(compType)) {
      diagnostics.push(
        `BOUNDARY: TYPE "${compType}" is unauthorized. Allowed: [${matchedBoundary.allowedTypes.join(', ')}]`
      );
    }

    setValidationResult({
      isValid: diagnostics.length === 0,
      diagnostics,
    });
  };

  // Broadcast Message to API Bus
  const handleBroadcastMessage = async () => {
    try {
      const res = await fetch('/api/commpack/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: compFrom,
          to: compTo,
          priority: compPriority,
          type: compType,
          status: compStatus,
          bluf: compBluf,
          body: draftBody,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Clear message log state and update with newly dispatched log
        fetchData();
        // Highlight first item
      }
    } catch (err) {
      console.error('Failed to dispatch COMMPACK message:', err);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(draftBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Add communication boundary
  const handleAddBoundary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/commpack/boundaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAgent: newFromAgent,
          toAgent: newToAgent,
          allowedTypes: newAllowedTypes,
          enabled: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBoundaryMsg('New agent communication route created.');
        setTimeout(() => setBoundaryMsg(null), 3000);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create boundary route:', err);
    }
  };

  // Toggle boundary rule active state
  const handleToggleBoundary = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/commpack/boundaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle communication route:', err);
    }
  };

  // Preset agents for selection lists
  const availableAgents = [
    'SRE-DevOps-Coder',
    'TechLead-Analyst',
    'Finance-Audit-Validator',
    'Human Operator',
    'Cognitive-Registry-Daemon',
  ];

  const priorityLevels = ['ROUTINE', 'PRIORITY', 'URGENT', 'IMMEDIATE'];

  const messageTypes = [
    'STATUS',
    'REPORT',
    'ALERT',
    'REQUEST',
    'RESPONSE',
    'FINDING',
    'DIAGNOSTIC',
    'COMMAND',
    'ACK',
    'ESCALATION',
    'INCIDENT',
    'DECISION',
  ];

  const statusList = [
    'READY',
    'ACTIVE',
    'DEGRADED',
    'BLOCKED',
    'FAILED',
    'COMPLETE',
    'CANCELLED',
    'UNKNOWN',
    'REQUIRES_HITL',
  ];

  // Banned vs Preferred glossary dictionary dataset
  const bannedGlossary = [
    { banned: 'utilize / utilization', preferred: 'use', reason: 'Redundant bureaucratic phrasing. Omit unnecessary syllables.' },
    { banned: 'prior to / previous to', preferred: 'before', reason: 'Unnecessarily formal. Keep operational timelines direct.' },
    { banned: 'in order to', preferred: 'to', reason: 'Zero sentence economy value. Crop word count.' },
    { banned: 'make a determination', preferred: 'determine', reason: 'Replace verb-noun filler combinations with direct verbs.' },
    { banned: 'arrive at a decision', preferred: 'decide', reason: 'Simplify bureaucratic filler phrase into a direct operational action.' },
    { banned: 'in the event of', preferred: 'if', reason: 'Vague conditional. Standardize on clean programming-adjacent conditionals.' },
    { banned: 'at the present time', preferred: 'now', reason: 'Redundant with present tense indicators. Eliminate entirely.' },
    { banned: 'subsequent to', preferred: 'after', reason: 'Excessive syllable weight. Use direct chronological links.' },
    { banned: 'terminate', preferred: 'end', reason: 'Use direct language wherever possible.' },
    { banned: 'shall', preferred: 'must / will', reason: 'Deprecated terminology. Specify mandates using "must" and futures using "will".' },
    { banned: 'close proximity', preferred: 'adjacent', reason: 'Redundant spatial description. Define precise nodes or use adjacent.' },
    { banned: 'conducts / performs', preferred: 'validates / purges', reason: 'Weak, bureaucratic action fillers. Use active verb stating actual work.' },
    { banned: 'currently / presently', preferred: 'Present Tense', reason: 'Double-present markers. Standardize on the active present tense.' },
  ];

  const filteredGlossary = bannedGlossary.filter(
    (g) =>
      g.banned.toLowerCase().includes(searchGlossary.toLowerCase()) ||
      g.preferred.toLowerCase().includes(searchGlossary.toLowerCase()) ||
      g.reason.toLowerCase().includes(searchGlossary.toLowerCase())
  );

  return (
    <div className="space-y-6" id="commpack-tab-container">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800" id="commpack-banner">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            COMMPACK: Agent Communication Protocols & Interaction Gateways
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enforce Department of Defense-derived operational dispatches, direct active-voice vocabularies, and cross-agent communication boundaries.
          </p>
        </div>

        <div className="bg-slate-950 px-3 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-indigo-300">
          COMMPACK-MIL PROFILE v1.4
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: Message Composer & Validator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Section: Composer */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="commpack-composer">
            <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Dynamic Envelope Composer & Live Grammarian
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Sender (FROM)</label>
                <select
                  value={compFrom}
                  onChange={(e) => setCompFrom(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availableAgents.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Recipient (TO)</label>
                <select
                  value={compTo}
                  onChange={(e) => setCompTo(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availableAgents.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Priority</label>
                <select
                  value={compPriority}
                  onChange={(e) => setCompPriority(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {priorityLevels.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Type</label>
                <select
                  value={compType}
                  onChange={(e) => setCompType(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {messageTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Status Code</label>
                <select
                  value={compStatus}
                  onChange={(e) => setCompStatus(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {statusList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Mandatory Finding Summary (BLUF - Bottom Line Up Front)
                </label>
                <input
                  type="text"
                  value={compBluf}
                  onChange={(e) => setCompBluf(e.target.value)}
                  placeholder="The concluding finding or needed command in active, unambiguous voice."
                  className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Structured Supporting Blocks */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Support Details (Optional fields mapped to standard profile segments)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">OBSERVATION (Sensory facts)</label>
                  <textarea
                    rows={1.5}
                    value={compObs}
                    onChange={(e) => setCompObs(e.target.value)}
                    placeholder="e.g., Service responded with 503 Service Unavailable."
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">ASSESSMENT (Evidence interpretations)</label>
                  <textarea
                    rows={1.5}
                    value={compAss}
                    onChange={(e) => setCompAss(e.target.value)}
                    placeholder="e.g., Replication stream is lagging due to high query volume."
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">EVIDENCE (Exact logs/keys)</label>
                  <textarea
                    rows={1.5}
                    value={compEvid}
                    onChange={(e) => setCompEvid(e.target.value)}
                    placeholder="e.g., ID: metrics-delay-04"
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">ACTION (Specific directives)</label>
                  <textarea
                    rows={1.5}
                    value={compAct}
                    onChange={(e) => setCompAct(e.target.value)}
                    placeholder="e.g., Re-balance replica metrics."
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">ESCALATION (Safety boundaries)</label>
                  <textarea
                    rows={1.5}
                    value={compEsc}
                    onChange={(e) => setCompEsc(e.target.value)}
                    placeholder="e.g., Request HITL review."
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Generated Raw Corepack output */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Compiled Envelope Dispatch Block
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-slate-750 border border-slate-700 rounded-md text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3" />
                        <span>Copy Code Block</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-950 text-[10.5px] font-mono text-indigo-200 border border-slate-850 rounded-lg max-h-[180px] overflow-y-auto scrollbar-thin whitespace-pre-wrap select-all">
                {draftBody}
              </pre>

              {/* Validation Response Panel */}
              {validationResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                    validationResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">COMMPACK-MIL Verification Passed</p>
                        <p className="text-[11px] text-emerald-400/80 mt-0.5">
                          Envelop is structurally sound, contains zero polite filler, satisfies communication boundaries, and uses active military-grade grammar verbs.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">COMMPACK-MIL Verification Failed ({validationResult.diagnostics.length} Issues)</p>
                        <ul className="list-disc list-inside text-[11px] text-rose-300/90 space-y-1">
                          {validationResult.diagnostics.map((diag, i) => (
                            <li key={i}>{diag}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleBroadcastMessage}
                  disabled={!validationResult?.isValid}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast on Agent Communication Bus
                </button>
              </div>
            </div>
          </div>

          {/* Section: Active Log Stream feed */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="messages-feed-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <List className="w-4 h-4 text-indigo-400" />
                COMMPACK Message Bus Log Ledger ({messages.length})
              </span>
              <button
                onClick={fetchData}
                disabled={isLoadingMessages}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto scrollbar-thin">
              {messages.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-xs">
                  No operational communications logged. Use the composer above to generate traffic.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex flex-col gap-2 transition-colors hover:border-slate-800"
                  >
                    {/* Header line info */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-200 bg-slate-900 rounded">
                          {msg.from}
                        </span>
                        <span className="text-[10px] text-slate-500">➜</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-200 bg-slate-900 rounded">
                          {msg.to}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-900 text-indigo-300 border border-slate-800">
                          {msg.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full ${
                            msg.priority === 'IMMEDIATE' || msg.priority === 'URGENT'
                              ? 'bg-rose-950 text-rose-300 border border-rose-900'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {msg.priority}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full ${
                            msg.isValid
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                              : 'bg-rose-950 text-rose-300 border border-rose-900'
                          }`}
                        >
                          {msg.isValid ? 'VALID' : 'INVALID'}
                        </span>
                      </div>
                    </div>

                    {/* Summary text */}
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850/50">
                      <p className="text-[11px] font-mono font-semibold text-slate-200">
                        <span className="text-indigo-400">BLUF:</span> {msg.bluf}
                      </p>
                    </div>

                    {/* Collapsible raw details code snippet */}
                    <details className="group">
                      <summary className="list-none flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 font-mono font-semibold cursor-pointer select-none">
                        <span className="transition-transform group-open:rotate-90">▶</span>
                        Show Compiled Message Dispatch Payload
                      </summary>
                      <pre className="mt-2 p-2 bg-slate-900 rounded border border-slate-850 font-mono text-[9px] text-indigo-300 overflow-x-auto whitespace-pre">
                        {msg.body}
                      </pre>
                    </details>

                    {/* Diagnostics if invalid */}
                    {!msg.isValid && msg.diagnostics.length > 0 && (
                      <div className="p-2 bg-rose-950/30 border border-rose-900/60 rounded text-[10px] text-rose-300 space-y-0.5">
                        <span className="font-bold">Profile Diagnostic Failures:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {msg.diagnostics.map((diag, i) => (
                            <li key={i}>{diag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-600 font-mono text-right">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Hand: Boundaries & Vocabulary lookups (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Section: Agent boundaries Policy manager */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="boundaries-panel">
            <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              Cross-Agent Communication Boundaries
            </span>

            {boundaryMsg && (
              <div className="p-2.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[11px] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                {boundaryMsg}
              </div>
            )}

            {/* List existing active routes */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
              {boundaries.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No boundaries loaded. Default is isolation.
                </div>
              ) : (
                boundaries.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900 px-1 py-0.5 rounded">
                          {b.fromAgent}
                        </span>
                        <span className="text-[9px] text-slate-600">➜</span>
                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900 px-1 py-0.5 rounded">
                          {b.toAgent}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {b.allowedTypes.map((type) => (
                          <span
                            key={type}
                            className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 text-slate-400 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold ${b.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {b.enabled ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={b.enabled}
                          onChange={() => handleToggleBoundary(b.id, b.enabled)}
                          className="sr-only peer"
                        />
                        <div className="relative w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form to Append New boundary */}
            <form onSubmit={handleAddBoundary} className="space-y-3 border-t border-slate-800/85 pt-3">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Append Route Policy Rule
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 block mb-1">Source Agent</label>
                  <select
                    value={newFromAgent}
                    onChange={(e) => setNewFromAgent(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-850 rounded px-2 py-1 focus:outline-none"
                  >
                    {availableAgents.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-semibold text-slate-400 block mb-1">Target Agent</label>
                  <select
                    value={newToAgent}
                    onChange={(e) => setNewToAgent(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-850 rounded px-2 py-1 focus:outline-none"
                  >
                    {availableAgents.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-slate-400 block mb-1">Allowed Message Types (Comma separated)</label>
                <input
                  type="text"
                  value={newAllowedTypes.join(', ')}
                  onChange={(e) =>
                    setNewAllowedTypes(
                      e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter((s) => s.length > 0)
                    )
                  }
                  className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-slate-850 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="ALERT, REPORT, REQUEST"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Append Authorization Link
                </button>
              </div>
            </form>
          </div>

          {/* Section: Banned Vocabulary search */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4" id="glossary-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Anti-MILSPEAK Banned Term Lookup
              </span>
            </div>

            {/* Search glossary */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchGlossary}
                onChange={(e) => setSearchGlossary(e.target.value)}
                placeholder="Search banned or preferred terms..."
                className="w-full bg-slate-950 text-slate-100 text-xs pl-8 pr-3 py-1.5 border border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin">
              {filteredGlossary.map((g, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-rose-400 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40">
                      🚫 {g.banned}
                    </span>
                    <span className="text-slate-500 text-[10px]">➜</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/40">
                      ✅ {g.preferred}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {g.reason}
                  </p>
                </div>
              ))}
              {filteredGlossary.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs font-sans">
                  No matching language rules located.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
