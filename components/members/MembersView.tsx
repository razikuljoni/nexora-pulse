'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { UserRole } from '@/types';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  Check,
  Shield,
  Key,
  Trash2,
  Sparkles
} from 'lucide-react';

export function MembersView() {
  const {
    organization,
    members,
    currentRole,
    setCurrentRole,
    inviteMember,
    removeMember,
    updateMemberRole,
  } = useIoT();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    inviteMember(name.trim(), email.trim(), role);
    setShowInviteModal(false);
    setEmail('');
    setName('');
  };

  const roleDescriptions: Record<UserRole, string> = {
    OWNER: 'Full administrative control, billing access, API token management, and member delegation.',
    ADMIN: 'Manage hardware fleet, write automation rules, acknowledge incidents, and invite operators.',
    ENGINEER: 'Configure device twins, flash firmware, manage simulator testbeds, and provision hardware nodes.',
    OPERATOR: 'Execute actuator commands, acknowledge alerts, apply digital twins, and monitor live telemetry.',
    VIEWER: 'Read-only access to live dashboards, telemetry timeseries, and audit events.',
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Team Members & Role-Based Access (RBAC)
            </h1>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
              Enterprise Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforce granular operational permissions across hardware operators and analysts.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Role Simulator Banner */}
      <div className="rounded-3xl border border-indigo-500/40 bg-indigo-950/20 p-5 light:bg-indigo-50 light:border-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                Active Session RBAC Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-700">
              Switch your simulation persona to test UI permission gating in real-time:
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#090d16] p-1.5 rounded-2xl border border-[#1e293b] light:bg-white light:border-slate-300">
            {(['OWNER', 'ADMIN', 'ENGINEER', 'OPERATOR', 'VIEWER'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setCurrentRole(r)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  currentRole === r
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-white light:text-slate-900 mb-4">
          Organization Members ({members.length})
        </h3>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 light:bg-slate-50 light:border-slate-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-sm">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white light:text-slate-900">{member.name}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={member.role}
                  onChange={(e) => updateMemberRole(member.id, e.target.value as UserRole)}
                  className="bg-[#0f172a] border border-[#1e293b] text-xs font-mono font-bold text-cyan-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 light:bg-white light:border-slate-300 light:text-slate-900"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>

                <button
                  onClick={() => removeMember(member.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC Permission Matrix Reference */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl space-y-4 light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-white light:text-slate-900">
          Security Role Permission Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['OWNER', 'ADMIN', 'OPERATOR', 'VIEWER'] as const).map((r) => (
            <div
              key={r}
              className="p-4 rounded-2xl bg-[#090e1c] border border-[#1e293b] space-y-2 light:bg-slate-50 light:border-slate-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">{r}</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{roleDescriptions[r]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Invite Organization Member
            </h3>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Mitchell"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.mitchell@nexoralabs.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 light:bg-slate-100 light:text-slate-900"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
