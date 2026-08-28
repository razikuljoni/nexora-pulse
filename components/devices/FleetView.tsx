'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { Device, DeviceStatus, DeviceType } from '@/types';
import { DeviceCard } from './DeviceCard';
import { RegisterDeviceModal } from './RegisterDeviceModal';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  RotateCcw,
  Power,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles
} from 'lucide-react';

export function FleetView() {
  const {
    devices,
    zones,
    setSelectedDevice,
    triggerBatchActuator,
    rebootAllDevices,
  } = useIoT();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  // Filter logic
  const filteredDevices = devices.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || dev.status === filterStatus;
    const matchesType = filterType === 'ALL' || dev.type === filterType;
    const matchesZone = filterZone === 'ALL' || dev.zone === filterZone;

    return matchesSearch && matchesStatus && matchesType && matchesZone;
  });

  const handleBulkRelay = (state: boolean) => {
    triggerBatchActuator('relay_1', state);
    setBulkFeedback(`Broadcast: All primary relays set to ${state ? 'ENABLED' : 'DISABLED'}`);
    setTimeout(() => setBulkFeedback(null), 3500);
  };

  const handleBulkReboot = () => {
    rebootAllDevices();
    setBulkFeedback('Broadcast: Microcontroller reboot signal dispatched to all online nodes.');
    setTimeout(() => setBulkFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Fleet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Hardware Fleet Explorer
            </h1>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
              {devices.length} Nodes Provisioned
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time health, sensory telemetry registers, and digital twin state across all managed nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="register-node-btn"
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Provision New Node</span>
          </button>
        </div>
      </div>

      {/* Bulk Fleet Actions Toolbar */}
      <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-3.5 flex flex-wrap items-center justify-between gap-3 light:bg-white light:border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300 light:text-slate-700">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span>Fleet Broadcast Commands:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleBulkRelay(true)}
            className="px-3 py-1.5 rounded-xl bg-[#090e1c] border border-cyan-500/30 hover:border-cyan-500/60 text-xs font-mono font-bold text-cyan-300 transition-colors flex items-center space-x-1.5 light:bg-slate-100"
          >
            <Power className="h-3.5 w-3.5 text-cyan-400" />
            <span>Turn All Relays ON</span>
          </button>

          <button
            onClick={() => handleBulkRelay(false)}
            className="px-3 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 hover:border-slate-500 text-xs font-mono font-bold text-slate-300 transition-colors flex items-center space-x-1.5 light:bg-slate-100 light:text-slate-800"
          >
            <Power className="h-3.5 w-3.5 text-slate-400" />
            <span>Turn All Relays OFF</span>
          </button>

          <button
            onClick={handleBulkReboot}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-mono font-bold text-indigo-300 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
            <span>Reboot Fleet</span>
          </button>
        </div>
      </div>

      {bulkFeedback && (
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{bulkFeedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-3xl border border-[#1e293b] light:bg-white light:border-slate-200">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, IP, MAC address, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-[#090d16] border border-[#1e293b] py-2 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none light:bg-slate-100 light:text-slate-900"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#090d16] border border-[#1e293b] text-xs font-mono text-cyan-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 light:bg-slate-100 light:text-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="ONLINE">ONLINE</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#090d16] border border-[#1e293b] text-xs font-mono text-cyan-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 light:bg-slate-100 light:text-slate-900"
          >
            <option value="ALL">All Hardware Types</option>
            <option value="ESP32">ESP32</option>
            <option value="RASPBERRY_PI">Raspberry Pi</option>
            <option value="ARDUINO_MKR">Arduino MKR</option>
            <option value="STM32_NODE">STM32</option>
            <option value="NORDIC_NRF">Nordic nRF</option>
          </select>

          {/* Zone filter */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-[#090d16] border border-[#1e293b] text-xs font-mono text-cyan-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 light:bg-slate-100 light:text-slate-900"
          >
            <option value="ALL">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-xl border border-[#1e293b] light:bg-slate-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* DEVICE LIST / GRID */}
      {filteredDevices.length === 0 ? (
        <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-12 text-center text-slate-400 light:bg-white light:border-slate-200">
          <Cpu className="h-10 w-10 mx-auto text-slate-500 mb-3" />
          <h3 className="text-sm font-bold text-white light:text-slate-900">No Nodes Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try relaxing your search query or status filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onSelect={() => setSelectedDevice(device)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] overflow-hidden shadow-xl light:bg-white light:border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#090d16] text-slate-400 border-b border-[#1e293b] light:bg-slate-50">
                <tr>
                  <th className="p-4">Device Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Zone</th>
                  <th className="p-4">Signal</th>
                  <th className="p-4">Battery</th>
                  <th className="p-4">Twin Sync</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-300 light:divide-slate-200 light:text-slate-800">
                {filteredDevices.map((dev) => (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors light:hover:bg-slate-100"
                  >
                    <td className="p-4 font-bold text-white light:text-slate-900 font-sans">
                      {dev.name}
                      <span className="block text-[10px] font-mono text-slate-500">{dev.id}</span>
                    </td>
                    <td className="p-4 text-cyan-300">{dev.type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        dev.status === 'ONLINE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {dev.status}
                      </span>
                    </td>
                    <td className="p-4">{dev.zone}</td>
                    <td className="p-4 text-cyan-400">{dev.signalDbm} dBm</td>
                    <td className="p-4 text-emerald-400">{dev.batteryLevel}%</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        dev.twin.inSync ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {dev.twin.inSync ? 'SYNCHRONIZED' : 'DELTA PENDING'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDevice(dev);
                        }}
                        className="px-3 py-1 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Device Modal */}
      <RegisterDeviceModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

    </div>
  );
}
