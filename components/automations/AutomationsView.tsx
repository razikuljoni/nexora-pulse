'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { AutomationRule, ActionType, ConditionOperator, TriggerType } from '@/types';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Bell,
  Clock,
  Trash2,
  Edit2,
  Layers,
  ChevronRight,
  ArrowDown,
  Sparkles,
  Check,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export function AutomationsView() {
  const {
    automations,
    executionTraces,
    addAutomation,
    deleteAutomation,
    toggleAutomation,
    testRunAutomation,
    devices,
  } = useIoT();

  const [selectedRuleId, setSelectedRuleId] = useState<string>(automations[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  // New Rule Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerMetric, setTriggerMetric] = useState('temperature');
  const [triggerDeviceId, setTriggerDeviceId] = useState(devices[0]?.id || '');
  const [conditionOperator, setConditionOperator] = useState<ConditionOperator>('GREATER_THAN');
  const [conditionValue, setConditionValue] = useState<number>(30);
  const [actionType, setActionType] = useState<ActionType>('SEND_COMMAND');
  const [actionPayload, setActionPayload] = useState('{"fan_speed": 100}');
  const [alertSeverity, setAlertSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('WARNING');

  const selectedRule = automations.find((a) => a.id === selectedRuleId) || automations[0];

  const handleTestRun = (ruleId: string) => {
    const trace = testRunAutomation(ruleId);
    setTestResult(trace);
    setTimeout(() => setTestResult(null), 6000);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let actions = [];
    if (actionType === 'SEND_COMMAND') {
      try {
        const parsed = JSON.parse(actionPayload);
        actions.push({
          id: `act-${Date.now()}`,
          type: 'SEND_COMMAND' as ActionType,
          targetDeviceId: triggerDeviceId,
          commandPayload: parsed,
        });
      } catch {
        actions.push({
          id: `act-${Date.now()}`,
          type: 'SEND_COMMAND' as ActionType,
          targetDeviceId: triggerDeviceId,
          commandPayload: { state: true },
        });
      }
    } else if (actionType === 'CREATE_ALERT') {
      actions.push({
        id: `act-${Date.now()}`,
        type: 'CREATE_ALERT' as ActionType,
        alertTitle: `Automation Alert: ${name}`,
        alertSeverity,
      });
    } else {
      actions.push({
        id: `act-${Date.now()}`,
        type: 'SEND_NOTIFICATION' as ActionType,
        notificationText: `Automated rule "${name}" executed successfully.`,
      });
    }

    addAutomation({
      name: name.trim(),
      description: description.trim() || 'Custom IoT automation pipeline rule',
      enabled: true,
      logic: 'AND',
      trigger: {
        type: 'TELEMETRY_THRESHOLD',
        deviceId: triggerDeviceId,
        metric: triggerMetric,
      },
      conditions: [
        {
          id: `cond-${Date.now()}`,
          metric: triggerMetric,
          operator: conditionOperator,
          value: Number(conditionValue),
        },
      ],
      actions,
    });

    setShowCreateModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Automation Rule Canvas
            </h1>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
              Event-Driven Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual workflow engine connecting real-time sensor events with actuator commands and alerts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Automation Workflow</span>
        </button>
      </div>

      {/* Main Grid: Rule List + Visual Flow Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Rule Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Active Rules ({automations.length})
          </h3>

          <div className="space-y-2.5">
            {automations.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f172a] border-cyan-500/60 shadow-lg shadow-cyan-950/20 light:bg-white light:border-indigo-400'
                      : 'bg-[#090d16] border-[#1e293b] hover:border-slate-700 light:bg-slate-50 light:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Workflow className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <h4 className="text-xs font-bold text-white light:text-slate-900 truncate max-w-[180px]">
                        {rule.name}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAutomation(rule.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#1e293b]/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Runs: {rule.executionCount}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestRun(rule.id);
                        }}
                        className="text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <Play className="h-2.5 w-2.5" />
                        <span>Test Run</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAutomation(rule.id);
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Visual Interactive Rule Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRule ? (
            <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-2xl relative overflow-hidden light:bg-white light:border-slate-200">
              
              {/* Canvas Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b] light:border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white light:text-slate-900">
                      {selectedRule.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      v{selectedRule.version}.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedRule.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestRun(selectedRule.id)}
                    className="flex items-center space-x-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/20"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Simulate Execution</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div className="mt-4 p-3 rounded-2xl bg-[#090e1c] border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Simulation Result: {testResult.status} ({testResult.executionTimeMs}ms)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Actions: {testResult.executedActions.length}</span>
                </div>
              )}

              {/* Visual Node Graph Flow */}
              <div className="mt-6 flex flex-col items-center space-y-4">
                
                {/* Node 1: Trigger Node */}
                <div className="w-full max-w-md rounded-2xl bg-[#090e1c] border border-cyan-500/40 p-4 shadow-lg shadow-cyan-950/20 relative light:bg-slate-50 light:border-slate-300">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-cyan-400 font-mono uppercase">1. Trigger Event</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-500/10 text-cyan-300">
                      {selectedRule.trigger.type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white light:text-slate-900 mt-1">
                    Telemetry Stream from <code className="text-cyan-300">{selectedRule.trigger.deviceId || 'Any Device'}</code>
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono block mt-1">
                    Metric: {selectedRule.trigger.metric}
                  </span>
                </div>

                {/* Connecting Arrow */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-cyan-500/50" />
                  <ArrowDown className="h-4 w-4 text-cyan-400 -mt-1" />
                </div>

                {/* Node 2: Logic Condition Node */}
                <div className="w-full max-w-md rounded-2xl bg-[#090e1c] border border-indigo-500/40 p-4 shadow-lg shadow-indigo-950/20 light:bg-slate-50 light:border-slate-300">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-indigo-400 font-mono uppercase">2. Logic Evaluation</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-500/10 text-indigo-300">
                      {selectedRule.logic}
                    </span>
                  </div>
                  {selectedRule.conditions.map((cond) => (
                    <div key={cond.id} className="mt-2 text-xs font-mono text-slate-200 light:text-slate-800 bg-[#0f172a] p-2.5 rounded-xl border border-[#1e293b]">
                      IF <span className="text-cyan-300 font-bold">{cond.metric}</span> {cond.operator === 'GREATER_THAN' ? '>' : cond.operator === 'LESS_THAN' ? '<' : '=='} <span className="text-emerald-400 font-bold">{cond.value}</span>
                    </div>
                  ))}
                </div>

                {/* Connecting Arrow */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-indigo-500/50" />
                  <ArrowDown className="h-4 w-4 text-indigo-400 -mt-1" />
                </div>

                {/* Node 3: Action Nodes */}
                <div className="w-full max-w-md rounded-2xl bg-[#090e1c] border border-emerald-500/40 p-4 shadow-lg shadow-emerald-950/20 space-y-2 light:bg-slate-50 light:border-slate-300">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-400 font-mono uppercase">3. Executed Actions ({selectedRule.actions.length})</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300">
                      Synchronous RPC
                    </span>
                  </div>

                  {selectedRule.actions.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs font-mono flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {act.type === 'SEND_COMMAND' && <Send className="h-3.5 w-3.5 text-indigo-400" />}
                        {act.type === 'CREATE_ALERT' && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
                        {act.type === 'SEND_NOTIFICATION' && <Bell className="h-3.5 w-3.5 text-cyan-400" />}
                        <span className="text-slate-200 light:text-slate-800">{act.type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {act.commandPayload ? JSON.stringify(act.commandPayload) : act.alertTitle || act.notificationText}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Execution Traces History Table */}
              <div className="mt-8 pt-6 border-t border-[#1e293b] light:border-slate-200">
                <h4 className="text-xs font-bold text-white light:text-slate-900 mb-3">
                  Recent Automation Execution Traces
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {executionTraces.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No executions logged yet.</p>
                  ) : (
                    executionTraces.slice(0, 5).map((trace) => (
                      <div
                        key={trace.id}
                        className="p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex items-center justify-between text-xs font-mono light:bg-slate-50 light:border-slate-200"
                      >
                        <div>
                          <span className="font-bold text-white light:text-slate-900">{trace.ruleName}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{trace.triggerReason}</p>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px]">
                          <span className="text-cyan-400">{trace.executionTimeMs}ms</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            {trace.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Create Automation Workflow
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overheat Exhaust Trigger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Automatically starts ventilation when temperature exceeds 28°C"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Trigger Device</label>
                  <select
                    value={triggerDeviceId}
                    onChange={(e) => setTriggerDeviceId(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Sensor Metric</label>
                  <select
                    value={triggerMetric}
                    onChange={(e) => setTriggerMetric(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="temperature">Temperature (°C)</option>
                    <option value="humidity">Humidity (%)</option>
                    <option value="airQuality">Air Quality (AQI)</option>
                    <option value="pressure">Pressure (hPa)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Operator</label>
                  <select
                    value={conditionOperator}
                    onChange={(e) => setConditionOperator(e.target.value as ConditionOperator)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="GREATER_THAN">Greater Than (&gt;)</option>
                    <option value="LESS_THAN">Less Than (&lt;)</option>
                    <option value="EQUALS">Equals (==)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Threshold Value</label>
                  <input
                    type="number"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                >
                  <option value="SEND_COMMAND">Send Actuator Command (MQTT)</option>
                  <option value="CREATE_ALERT">Raise Incident Alert</option>
                  <option value="SEND_NOTIFICATION">In-App Notification</option>
                </select>
              </div>

              {actionType === 'SEND_COMMAND' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Command JSON Payload</label>
                  <input
                    type="text"
                    value={actionPayload}
                    onChange={(e) => setActionPayload(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs font-mono text-cyan-300 light:bg-slate-100 light:text-slate-900"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Save & Activate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
