'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { 
  Radio, 
  Bell, 
  Cpu, 
  Search, 
  Moon, 
  Sun, 
  Layers, 
  ShieldCheck, 
  Check, 
  Activity, 
  Zap, 
  ChevronDown, 
  Terminal,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { UserRole } from '@/types';

export function Navbar() {
  const {
    organization,
    currentMember,
    setCurrentMemberRole,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    alertEvents,
    theme,
    toggleTheme,
    isSimulatorOpen,
    setIsSimulatorOpen,
    simulationActive,
    globalSearch,
    setGlobalSearch,
    setActiveView,
  } = useIoT();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const activeCriticalAlerts = alertEvents.filter((a) => a.status === 'TRIGGERED' && a.severity === 'CRITICAL').length;
  const rolesList: UserRole[] = ['OWNER', 'ADMIN', 'ENGINEER', 'OPERATOR', 'VIEWER'];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#090d16]/90 backdrop-blur-md transition-colors light:bg-white/90 light:border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand Identity & Organization Selector */}
        <div className="flex items-center space-x-4">
          <button 
            id="brand-home-btn"
            onClick={() => setActiveView('dashboard')}
            className="flex items-center space-x-2.5 text-left group focus:outline-none"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16] light:bg-white">
                <Radio className="h-4 w-4 text-cyan-400 light:text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold tracking-tight text-white light:text-slate-900 text-base">
                  NEXORA
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PULSE
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-slate-400 font-mono block uppercase">
                Device Intelligence
              </span>
            </div>
          </button>

          {/* Org Pill */}
          <div className="hidden md:flex items-center space-x-2 rounded-lg bg-[#0f172a] border border-[#1e293b] px-3 py-1.5 light:bg-slate-100 light:border-slate-200">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-slate-200 light:text-slate-800">
              {organization.name}
            </span>
            <span className="text-[10px] rounded bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 font-mono">
              {organization.tier}
            </span>
          </div>

          {/* Live Broker Connection Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>MQTT TLS 1.3</span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden sm:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="navbar-global-search"
              type="text"
              placeholder="Search devices, sensors, alerts, telemetry (e.g. ESP32, Temp)..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#1e293b] py-1.5 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all light:bg-slate-100 light:border-slate-200 light:text-slate-900"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                esc
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Simulator Dock, Notifications & User */}
        <div className="flex items-center space-x-3">
          
          {/* Simulator Toggle Button */}
          <button
            id="toggle-hardware-simulator-btn"
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
              isSimulatorOpen 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20' 
                : 'bg-[#0f172a] text-slate-300 border-[#1e293b] hover:border-cyan-500/40 hover:text-cyan-400 light:bg-slate-100 light:border-slate-200 light:text-slate-700'
            }`}
            title="Open Hardware ESP32 Simulator"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Hardware Simulator</span>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${simulationActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-400 hover:bg-[#0f172a] hover:text-slate-200 border border-transparent hover:border-[#1e293b] transition-all light:hover:bg-slate-100 light:hover:text-slate-900"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-[#0f172a] hover:text-slate-200 border border-transparent hover:border-[#1e293b] transition-all light:hover:bg-slate-100 light:hover:text-slate-900"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0f172a] border border-[#1e293b] p-3 shadow-2xl z-50 light:bg-white light:border-slate-200 light:shadow-lg">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e293b] light:border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white light:text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] px-1.5 font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                          n.unread 
                            ? 'bg-slate-800/60 border border-slate-700/60 text-slate-200 light:bg-indigo-50 light:border-indigo-100 light:text-slate-800' 
                            : 'bg-transparent text-slate-400 hover:bg-slate-800/30 light:hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-[11px] text-white light:text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 light:text-slate-600 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher & Profile */}
          <div className="relative">
            <button
              id="user-profile-role-btn"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center space-x-2 rounded-xl bg-[#0f172a] border border-[#1e293b] p-1.5 pr-2.5 hover:border-slate-600 transition-all light:bg-slate-100 light:border-slate-200"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 text-black font-black text-xs ring-1 ring-cyan-500/30">
                {currentMember.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[11px] font-semibold text-white light:text-slate-900 leading-tight">
                  {currentMember.name}
                </p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    {currentMember.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f172a] border border-[#1e293b] p-2 shadow-2xl z-50 light:bg-white light:border-slate-200">
                <div className="px-2 py-1.5 border-b border-[#1e293b] mb-1 light:border-slate-100">
                  <p className="text-xs font-bold text-white light:text-slate-900">Switch Preview Role (RBAC)</p>
                  <p className="text-[10px] text-slate-400">Test organization permissions</p>
                </div>
                <div className="space-y-1">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setCurrentMemberRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentMember.role === r
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60 light:text-slate-700 light:hover:bg-slate-100'
                      }`}
                    >
                      <span>{r}</span>
                      {currentMember.role === r && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
