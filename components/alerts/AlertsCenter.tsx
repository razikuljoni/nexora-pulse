'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { AlertSeverity, AlertStatus, ConditionOperator } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  Trash2,
  MessageSquare,
  Check,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';

export function AlertsCenter() {
  const {
    alertEvents,
    alertRules,
    acknowledgeAlert,
    resolveAlert,
    addAlertRule,
    deleteAlertRule,
    toggleAlertRule,
    devices,
    setSelectedDevice,
    setActiveView
  } = useIoT();

  const [activeTab, setActiveTab] = useState<'incidents' | 'rules'>('incidents');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');

  // Rule Creation modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleMetric, setRuleMetric] = useState('temperature');
  const [ruleOperator, setRuleOperator] = useState<ConditionOperator>('GREATER_THAN');
  const [ruleThreshold, setRuleThreshold] = useState<number>(30);
  const [ruleSeverity, setRuleSeverity] = useState<AlertSeverity>('CRITICAL');
  const [ruleGrace, setRuleGrace] = useState<number>(30);

  // Acknowledge modal note
  const [ackModalEventId, setAckModalEventId] = useState<string | null>(null);
  const [ackNote, setAckNote] = useState('');

  const filteredEvents = alertEvents.filter((ev) => {
    const matchesSev = filterSeverity === 'ALL' || ev.severity === filterSeverity;
    const matchesStat = filterStatus === 'ALL' || ev.status === filterStatus;
    return matchesSev && matchesStat;
  });

  const activeCriticalCount = alertEvents.filter((a) => a.status === 'TRIGGERED' && a.severity === 'CRITICAL').length;
  const activeWarningCount = alertEvents.filter((a) => a.status === 'TRIGGERED' && a.severity === 'WARNING').length;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    addAlertRule({
      name: ruleName.trim(),
      metric: ruleMetric,
      operator: ruleOperator,
      threshold: Number(ruleThreshold),
      severity: ruleSeverity,
      gracePeriodSeconds: Number(ruleGrace),
      enabled: true,
    });

    setShowRuleModal(false);
    setRuleName('');
  };

  const handleConfirmAck = () => {
    if (ackModalEventId) {
      acknowledgeAlert(ackModalEventId, ackNote);
      setAckModalEventId(null);
      setAckNote('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Incident Response Center
            </h1>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-xs font-mono text-rose-400">
              4-Stage Lifecycle Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold breaches, device disconnection alarms, and audit resolution logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRuleModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Configure Alert Rule</span>
          </button>
        </div>
      </div>

      {/* Triage Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#0f172a] border border-rose-500/30 p-4.5 flex items-center justify-between light:bg-white light:border-slate-200">
          <div>
            <span className="text-xs text-rose-400 font-bold uppercase font-mono">Critical Incidents</span>
            <div className="text-2xl font-black text-white light:text-slate-900 font-mono mt-1">
              {activeCriticalCount}
            </div>
            <span className="text-[10px] text-slate-400">Immediate operator action required</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-400">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f172a] border border-amber-500/30 p-4.5 flex items-center justify-between light:bg-white light:border-slate-200">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase font-mono">Warnings / Drift</span>
            <div className="text-2xl font-black text-white light:text-slate-900 font-mono mt-1">
              {activeWarningCount}
            </div>
            <span className="text-[10px] text-slate-400">Threshold approaching limit</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f172a] border border-emerald-500/30 p-4.5 flex items-center justify-between light:bg-white light:border-slate-200">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase font-mono">Active Guard Rules</span>
            <div className="text-2xl font-black text-white light:text-slate-900 font-mono mt-1">
              {alertRules.filter((r) => r.enabled).length}
            </div>
            <span className="text-[10px] text-slate-400">Monitoring telemetry stream 24/7</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs: Incidents vs Rules */}
      <div className="flex items-center space-x-2 border-b border-[#1e293b] pb-2 light:border-slate-200">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'incidents'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'text-slate-400 border-transparent hover:bg-slate-900 light:text-slate-600'
          }`}
        >
          Incident Alarms Feed ({alertEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'rules'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'text-slate-400 border-transparent hover:bg-slate-900 light:text-slate-600'
          }`}
        >
          Alert Rules Configuration ({alertRules.length})
        </button>
      </div>

      {/* VIEW 1: INCIDENTS FEED */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-3.5 rounded-2xl border border-[#1e293b] text-xs light:bg-white light:border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Severity:</span>
              {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                    filterSeverity === s
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Status:</span>
              {(['ALL', 'TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-12 text-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-white">All Alarms Cleared</p>
                <p className="text-xs text-slate-400 mt-1">No alerts match the selected filter criteria.</p>
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isCritical = ev.severity === 'CRITICAL';
                const isTriggered = ev.status === 'TRIGGERED';
                const isAcked = ev.status === 'ACKNOWLEDGED';
                const isResolved = ev.status === 'RESOLVED';

                return (
                  <div
                    key={ev.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isTriggered && isCritical
                        ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/30'
                        : isTriggered
                        ? 'bg-amber-950/10 border-amber-500/40'
                        : 'bg-[#0f172a] border-[#1e293b] light:bg-white light:border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            {ev.severity}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              isTriggered
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : isAcked
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {ev.status}
                          </span>

                          <h3 className="text-sm font-black text-white light:text-slate-900">
                            {ev.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed pt-1">
                          {ev.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
                          <span>
                            Device: <strong className="text-cyan-400">{ev.deviceName}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Value: <strong className="text-rose-400">{ev.currentValue}</strong> (Limit: {ev.thresholdValue})
                          </span>
                          <span>•</span>
                          <span>Triggered: {new Date(ev.triggeredAt).toLocaleTimeString()}</span>
                        </div>

                        {ev.notes && (
                          <div className="mt-2 p-2.5 rounded-xl bg-[#090d16] border border-[#1e293b] text-xs font-mono text-slate-300 light:bg-slate-100 light:text-slate-800">
                            <span className="text-cyan-400 font-bold">Operator Note: </span>
                            {ev.notes}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {isTriggered && (
                          <button
                            onClick={() => {
                              setAckModalEventId(ev.id);
                              setAckNote('');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold hover:bg-cyan-600/30 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}

                        {!isResolved && (
                          <button
                            onClick={() => resolveAlert(ev.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 transition-colors flex items-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Resolve Incident</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RULES CONFIGURATION */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertRules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-3xl bg-[#0f172a] border border-[#1e293b] space-y-3 light:bg-white light:border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white light:text-slate-900">{rule.name}</h4>
                <button
                  onClick={() => toggleAlertRule(rule.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    rule.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d16] border border-[#1e293b] text-xs font-mono space-y-1 light:bg-slate-50">
                <div className="flex justify-between">
                  <span className="text-slate-400">Metric Channel:</span>
                  <span className="text-cyan-300 font-bold">{rule.metric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Condition Threshold:</span>
                  <span className="text-amber-300 font-bold">
                    {rule.operator === 'GREATER_THAN' ? '>' : '<'} {rule.threshold}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity Level:</span>
                  <span className="text-rose-400 font-bold">{rule.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grace Period:</span>
                  <span className="text-slate-300">{rule.gracePeriodSeconds}s</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => deleteAlertRule(rule.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs flex items-center space-x-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete Rule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acknowledge Modal */}
      {ackModalEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Acknowledge Incident Alarm
            </h3>
            <p className="text-xs text-slate-400">
              Record an operator note confirming triage and initial mitigation steps:
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Verified ventilation ducting; fan boost enabled via command console."
              value={ackNote}
              onChange={(e) => setAckNote(e.target.value)}
              className="w-full rounded-2xl bg-[#090d16] border border-[#1e293b] p-3 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setAckModalEventId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAck}
                className="px-5 py-2 rounded-xl bg-cyan-600 text-black text-xs font-bold hover:bg-cyan-500 transition-colors"
              >
                Confirm Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Create Sentinel Alert Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Thermal Overheat (>32°C)"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Metric</label>
                  <select
                    value={ruleMetric}
                    onChange={(e) => setRuleMetric(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="temperature">Temperature</option>
                    <option value="humidity">Humidity</option>
                    <option value="airQuality">Air Quality (AQI)</option>
                    <option value="battery">Battery Level (%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Severity</label>
                  <select
                    value={ruleSeverity}
                    onChange={(e) => setRuleSeverity(e.target.value as AlertSeverity)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Operator</label>
                  <select
                    value={ruleOperator}
                    onChange={(e) => setRuleOperator(e.target.value as ConditionOperator)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="GREATER_THAN">Greater Than (&gt;)</option>
                    <option value="LESS_THAN">Less Than (&lt;)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Threshold</label>
                  <input
                    type="number"
                    value={ruleThreshold}
                    onChange={(e) => setRuleThreshold(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
