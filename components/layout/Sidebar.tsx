'use client';

import React from 'react';
import { useIoT } from '@/context/iot-context';
import {
  LayoutDashboard,
  Cpu,
  Workflow,
  AlertTriangle,
  BarChart3,
  MapPin,
  History,
  Users,
  BookOpen,
  Terminal,
  Radio,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const { 
    activeView, 
    setActiveView, 
    alertEvents, 
    devices, 
    isSimulatorOpen, 
    setIsSimulatorOpen 
  } = useIoT();

  const activeAlertsCount = alertEvents.filter((a) => a.status === 'TRIGGERED').length;
  const onlineDevicesCount = devices.filter((d) => d.status === 'ONLINE').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Realtime Dashboard',
      icon: LayoutDashboard,
      badge: `${onlineDevicesCount}/${devices.length}`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'devices',
      label: 'Device Fleet',
      icon: Cpu,
      badge: `${devices.length}`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'automations',
      label: 'Rule Canvas',
      icon: Workflow,
      badge: 'Visual',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      id: 'alerts',
      label: 'Incident Center',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} Active` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
    },
    {
      id: 'analytics',
      label: 'Telemetry Analytics',
      icon: BarChart3,
    },
    {
      id: 'locations',
      label: 'Locations & Zones',
      icon: MapPin,
    },
    {
      id: 'activity',
      label: 'Audit & Activity',
      icon: History,
    },
    {
      id: 'members',
      label: 'Team & RBAC',
      icon: Users,
    },
    {
      id: 'docs',
      label: 'Architecture & API',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-[#1e293b] bg-[#090d16] p-4 justify-between light:bg-slate-50 light:border-slate-200">
      
      {/* Top Nav Items */}
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Command & Control
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 text-cyan-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50 light:from-indigo-50 light:to-white light:text-indigo-900 light:border-indigo-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 light:text-slate-600 light:hover:bg-slate-200/60 light:hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-cyan-400 light:text-indigo-600' : 'text-slate-400 group-hover:text-slate-300'
                    }`} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Interactive Hardware Simulator Launcher Widget */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0f172a] to-slate-950 p-3.5 shadow-lg shadow-cyan-950/20 light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 light:text-slate-800">ESP32 Simulator</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
            ONLINE
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Inject real-time MQTT sensor telemetry & trigger physical actuator spikes without physical hardware.
        </p>
        <button
          id="sidebar-simulator-launcher"
          onClick={() => setIsSimulatorOpen(true)}
          className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Launch Simulator</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </aside>
  );
}
