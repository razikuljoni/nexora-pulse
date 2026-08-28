'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { AuditLog } from '@/types';
import {
  History,
  Shield,
  Terminal,
  Cpu,
  Workflow,
  AlertTriangle,
  Layers,
  Filter,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function AuditFeed() {
  const { auditLogs } = useIoT();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const categoryIcons: Record<string, any> = {
    DEVICE: Cpu,
    COMMAND: Terminal,
    AUTOMATION: Workflow,
    ALERT: AlertTriangle,
    SECURITY: Shield,
    ORGANIZATION: Layers,
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Security Audit & Activity Feed
            </h1>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
              Immutable Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete chronological record of all commands, config updates, automations, and auth events.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] light:bg-white light:border-slate-200">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1">
          {['ALL', 'DEVICE', 'COMMAND', 'AUTOMATION', 'ALERT', 'SECURITY', 'ORGANIZATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-[#090d16] text-slate-400 border-[#1e293b] hover:text-slate-200 light:bg-slate-100 light:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#090d16] border border-[#1e293b] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none light:bg-slate-100 light:text-slate-900"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-xl light:bg-white light:border-slate-200">
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit logs found matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const Icon = categoryIcons[log.category] || History;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-all hover:border-slate-600 light:bg-slate-50 light:border-slate-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a] border border-[#1e293b] text-cyan-400 shrink-0 light:bg-white">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white light:text-slate-900 text-xs">
                          {log.action}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
                          {log.category}
                        </span>
                        {log.severity === 'CRITICAL' && (
                          <span className="px-2 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 font-sans text-xs pt-0.5">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 sm:text-right">
                    <div>
                      <span className="text-cyan-300 font-bold block">{log.actor}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{log.actorRole}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
