'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { 
  Radio, 
  Terminal, 
  Workflow, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2
} from 'lucide-react';

export function SignalTimeline() {
  const { mqttStream, clearMqttStream, commands, executionTraces, alertEvents } = useIoT();
  const [filterType, setFilterType] = useState<'ALL' | 'TELEMETRY' | 'COMMANDS' | 'AUTOMATIONS' | 'ALERTS'>('ALL');

  // Combine live events into chronological timeline
  const combinedEvents: Array<{
    id: string;
    timestamp: string;
    type: 'TELEMETRY' | 'COMMAND' | 'AUTOMATION' | 'ALERT';
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    raw?: any;
  }> = [];

  // MQTT Stream packets
  mqttStream.slice(0, 15).forEach((msg) => {
    const isTelem = msg.topic.includes('telemetry');
    const isCmd = msg.topic.includes('command') || msg.topic.includes('state');
    const isStatus = msg.topic.includes('status');

    combinedEvents.push({
      id: msg.id,
      timestamp: msg.timestamp,
      type: isTelem ? 'TELEMETRY' : isCmd ? 'COMMAND' : 'TELEMETRY',
      title: msg.topic.split('/').slice(-2).join(' / '),
      subtitle: typeof msg.payload === 'object' ? JSON.stringify(msg.payload) : String(msg.payload),
      badge: msg.direction === 'INBOUND' ? 'INBOUND' : 'OUTBOUND',
      badgeColor: msg.direction === 'INBOUND' 
        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      raw: msg.payload,
    });
  });

  // Commands
  commands.slice(0, 8).forEach((cmd) => {
    combinedEvents.push({
      id: cmd.id,
      timestamp: cmd.createdAt,
      type: 'COMMAND',
      title: `Command: ${cmd.deviceName}`,
      subtitle: `Payload: ${JSON.stringify(cmd.payload)} -> Status: ${cmd.status}`,
      badge: cmd.status,
      badgeColor: cmd.status === 'COMPLETED' 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
        : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      raw: cmd,
    });
  });

  // Automation traces
  executionTraces.slice(0, 6).forEach((trace) => {
    combinedEvents.push({
      id: trace.id,
      timestamp: trace.triggeredAt,
      type: 'AUTOMATION',
      title: `Automation: ${trace.ruleName}`,
      subtitle: trace.triggerReason,
      badge: trace.status,
      badgeColor: trace.status === 'SUCCESS' 
        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
        : 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      raw: trace,
    });
  });

  // Alert events
  alertEvents.slice(0, 6).forEach((al) => {
    combinedEvents.push({
      id: al.id,
      timestamp: al.triggeredAt,
      type: 'ALERT',
      title: `Alert: ${al.title}`,
      subtitle: al.message,
      badge: al.severity,
      badgeColor: al.severity === 'CRITICAL' 
        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
        : 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      raw: al,
    });
  });

  // Sort descending by timestamp
  const sorted = combinedEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filtered = sorted.filter((ev) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'TELEMETRY') return ev.type === 'TELEMETRY';
    if (filterType === 'COMMANDS') return ev.type === 'COMMAND';
    if (filterType === 'AUTOMATIONS') return ev.type === 'AUTOMATION';
    if (filterType === 'ALERTS') return ev.type === 'ALERT';
    return true;
  });

  return (
    <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-xl light:bg-white light:border-slate-200">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b] light:border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white light:text-slate-900">
              SignalTimeline™ Event Bus
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Realtime MQTT packets, command dispatches, and rule execution traces
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-xl border border-[#1e293b] light:bg-slate-100 light:border-slate-200 text-[11px]">
            {(['ALL', 'TELEMETRY', 'COMMANDS', 'AUTOMATIONS', 'ALERTS'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  filterType === type
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={clearMqttStream}
            className="p-1.5 rounded-lg border border-[#1e293b] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            title="Clear Stream Buffer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Events Stream Feed */}
      <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No events match current filter.
          </div>
        ) : (
          filtered.slice(0, 20).map((ev) => (
            <div
              key={ev.id}
              className="flex items-start justify-between p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b]/70 hover:border-slate-600 transition-all light:bg-slate-50 light:border-slate-200"
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0 pr-3">
                <div className="mt-0.5">
                  {ev.type === 'TELEMETRY' && <Activity className="h-4 w-4 text-cyan-400" />}
                  {ev.type === 'COMMAND' && <Terminal className="h-4 w-4 text-indigo-400" />}
                  {ev.type === 'AUTOMATION' && <Workflow className="h-4 w-4 text-emerald-400" />}
                  {ev.type === 'ALERT' && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white light:text-slate-900 truncate">
                      {ev.title}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full border ${ev.badgeColor}`}>
                      {ev.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {ev.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
