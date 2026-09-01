import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  DollarSign,
  Calculator,
  RefreshCw,
  Eye,
  Check,
  X,
  FileCode,
} from 'lucide-react';
import { HitlTask } from '../types';

export const HitlQueueTab: React.FC = () => {
  const [tasks, setTasks] = useState<HitlTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<HitlTask | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Financial Ledger Double-Check Gate state
  const [debitInputs, setDebitInputs] = useState<string>('150.00, 24.50, 80.00');
  const [creditInputs, setCreditInputs] = useState<string>('200.00, 54.50');
  const [ledgerAuditResult, setLedgerAuditResult] = useState<{
    debitsCents: number;
    creditsCents: number;
    balanced: boolean;
    deltaCents: number;
    hasNegativeValues: boolean;
  } | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hitl/tasks');
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        if (data.tasks.length > 0 && !selectedTask) {
          setSelectedTask(data.tasks[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load HITL tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleApprove = async (taskId: string) => {
    try {
      const res = await fetch('/api/hitl/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, reviewerNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Task ${taskId} APPROVED successfully.`);
        setTimeout(() => setActionMessage(null), 3000);
        fetchTasks();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      const res = await fetch('/api/hitl/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, reviewerNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Task ${taskId} REJECTED.`);
        setTimeout(() => setActionMessage(null), 3000);
        fetchTasks();
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  const runLedgerAudit = () => {
    const parseToCents = (str: string): number[] => {
      return str
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
          const num = parseFloat(s);
          if (isNaN(num)) return 0;
          return Math.round(num * 100);
        });
    };

    const debits = parseToCents(debitInputs);
    const credits = parseToCents(creditInputs);

    const hasNegative = debits.some((d) => d < 0) || credits.some((c) => c < 0);
    const totalDebits = debits.reduce((sum, val) => sum + val, 0);
    const totalCredits = credits.reduce((sum, val) => sum + val, 0);
    const delta = totalDebits - totalCredits;

    setLedgerAuditResult({
      debitsCents: totalDebits,
      creditsCents: totalCredits,
      balanced: delta === 0 && !hasNegative,
      deltaCents: delta,
      hasNegativeValues: hasNegative,
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            Human-In-The-Loop (HITL) Queue & Ledger Audit Gate
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit and approve high-risk agent operations and verify strict double-entry ledger integrity.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionMessage}
        </div>
      )}

      {/* Task Queue Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200">Escalated Tasks ({tasks.length})</span>
              <div className="flex items-center gap-1">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilter(st)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                      filter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto scrollbar-thin">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No tasks matching the selected filter.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = selectedTask?.id === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setReviewerNotes(task.reviewerNotes || '');
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {task.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            task.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : task.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-semibold">{task.taskType}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{task.summary}</div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Risk: {task.riskLevel}</span>
                        <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Task Inspector & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTask ? (
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400">{selectedTask.id}</span>
                  <h3 className="text-sm font-bold text-slate-100">{selectedTask.taskType}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                      selectedTask.riskLevel === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : selectedTask.riskLevel === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    Risk Level: {selectedTask.riskLevel}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Task Summary & Escalation Vector:
                  </label>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {selectedTask.summary}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Structured Payload JSON:
                  </label>
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto max-h-[160px] scrollbar-thin">
                    {JSON.stringify(selectedTask.payload, null, 2)}
                  </pre>
                </div>

                {selectedTask.status === 'PENDING' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Reviewer Sign-Off Notes:
                      </label>
                      <input
                        type="text"
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        placeholder="e.g. Verified database backup confirmed, approved for deployment."
                        className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReject(selectedTask.id)}
                        className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Reject Task
                      </button>

                      <button
                        onClick={() => handleApprove(selectedTask.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Execute Operation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              Select a task from the list to inspect payload and sign-off.
            </div>
          )}

          {/* Financial Double-Check Gate Simulator */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200">
                  Financial Ledger Math Integrity Gate (Integer Cents Engine)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Zero Floating-Point Drift</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Debits ($ list, comma-separated)
                </label>
                <input
                  type="text"
                  value={debitInputs}
                  onChange={(e) => setDebitInputs(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Credits ($ list, comma-separated)
                </label>
                <input
                  type="text"
                  value={creditInputs}
                  onChange={(e) => setCreditInputs(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs font-mono border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={runLedgerAudit}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit Double-Entry Integrity
              </button>

              {ledgerAuditResult && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-300">
                    Debits: ${(ledgerAuditResult.debitsCents / 100).toFixed(2)} ({ledgerAuditResult.debitsCents}¢)
                  </span>
                  <span className="text-slate-300">
                    Credits: ${(ledgerAuditResult.creditsCents / 100).toFixed(2)} ({ledgerAuditResult.creditsCents}¢)
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      ledgerAuditResult.balanced
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {ledgerAuditResult.balanced ? 'BALANCED' : `UNBALANCED (Δ ${ledgerAuditResult.deltaCents}¢)`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
