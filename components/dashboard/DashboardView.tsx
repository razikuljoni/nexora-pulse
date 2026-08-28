'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { AtmospherePanel } from './AtmospherePanel';
import { PulseCard } from './PulseCard';
import { SignalTimeline } from './SignalTimeline';
import { DeviceCard } from '../devices/DeviceCard';
import { RegisterDeviceModal } from '../devices/RegisterDeviceModal';
import { 
  Radio, 
  Cpu, 
  AlertTriangle, 
  Workflow, 
  Activity, 
  Plus, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  onRegisterDeviceClick?: () => void;
}

export function DashboardView({ onRegisterDeviceClick }: DashboardViewProps) {
  const { 
    devices, 
    alertEvents, 
    automations, 
    organization, 
    globalSearch, 
    setActiveView,
    setIsSimulatorOpen 
  } = useIoT();

  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const activeAlerts = alertEvents.filter((a) => a.status === 'TRIGGERED');
  const totalAutomationsCount = automations.reduce((acc, a) => acc + a.executionCount, 0);

  // Filter devices
  const filteredDevices = devices.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.type.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.zone.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(globalSearch.toLowerCase()));

    const matchesZone = selectedZoneFilter === 'ALL' || d.zone === selectedZoneFilter;
    return matchesSearch && matchesZone;
  });

  const uniqueZones = Array.from(new Set(devices.map((d) => d.zone)));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Hero Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
              Live Fleet Overview
            </h1>
            <span className="flex items-center space-x-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Realtime Telemetry Ingestion</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous IoT device observation, event-driven rules, and remote actuator intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="launch-hardware-simulator-hero-btn"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-[#0f172a] border border-cyan-500/40 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-950/30 shadow-md transition-all light:bg-white light:border-slate-300 light:text-indigo-600"
          >
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>ESP32 Hardware Simulator</span>
          </button>

          <button
            id="register-new-device-hero-btn"
            onClick={onRegisterDeviceClick || (() => setInternalModalOpen(true))}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Connect Device</span>
          </button>
        </div>
      </div>

      {/* KPI PulseCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PulseCard
          id="kpi-online-devices"
          title="Active Devices"
          value={`${onlineCount}/${devices.length}`}
          unit="nodes"
          trend={{ value: '100%', direction: 'up', label: 'Availability' }}
          icon={Cpu}
          status={onlineCount === devices.length ? 'success' : 'warning'}
          sparklineData={[4, 4, 5, 5, 5, 4, 5, 5, 5, 5]}
          onClick={() => setActiveView('devices')}
        />

        <PulseCard
          id="kpi-active-alerts"
          title="Incident Alarms"
          value={activeAlerts.length}
          unit="active"
          trend={
            activeAlerts.length > 0
              ? { value: `${activeAlerts.length} Critical`, direction: 'up' }
              : { value: 'All nominal', direction: 'neutral' }
          }
          icon={AlertTriangle}
          status={activeAlerts.length > 0 ? 'critical' : 'normal'}
          sparklineData={[0, 1, 0, 0, 2, 1, 0, 1, 0, activeAlerts.length]}
          onClick={() => setActiveView('alerts')}
        />

        <PulseCard
          id="kpi-automations-executed"
          title="Rules Executed"
          value={totalAutomationsCount}
          unit="actions"
          trend={{ value: '+18 today', direction: 'up' }}
          icon={Workflow}
          status="normal"
          sparklineData={[12, 14, 18, 22, 28, 35, 41, 46, 51, totalAutomationsCount]}
          onClick={() => setActiveView('automations')}
        />

        <PulseCard
          id="kpi-telemetry-ingested"
          title="Telemetry Stream"
          value={(organization.totalTelemetryIngested / 1000).toFixed(1)}
          unit="k msgs"
          trend={{ value: '2.5s cycle', direction: 'neutral' }}
          icon={Activity}
          status="normal"
          sparklineData={[100, 105, 110, 118, 125, 130, 140, 145, 148, 150]}
        />
      </div>

      {/* Signature AtmospherePanel Component */}
      <AtmospherePanel />

      {/* Main Content Layout: Devices Fleet Grid + Realtime SignalTimeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Device Fleet Cards */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-900">
                Connected Hardware Nodes
              </h3>
              <p className="text-xs text-slate-400">
                Realtime sensor telemetry, wireless signal dBm, and immediate actuator switches
              </p>
            </div>

            {/* Zone Filter Chips */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedZoneFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedZoneFilter === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-[#0f172a] text-slate-400 border-[#1e293b] hover:text-slate-200 light:bg-slate-100 light:border-slate-200'
                }`}
              >
                All Zones ({devices.length})
              </button>
              {uniqueZones.map((z) => (
                <button
                  key={z}
                  onClick={() => setSelectedZoneFilter(z)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedZoneFilter === z
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-[#0f172a] text-slate-400 border-[#1e293b] hover:text-slate-200 light:bg-slate-100 light:border-slate-200'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Device Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDevices.length === 0 ? (
              <div className="col-span-2 rounded-3xl border border-[#1e293b] bg-[#0f172a] p-12 text-center text-slate-400">
                <Cpu className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm font-semibold text-white">No devices found</p>
                <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new IoT device.</p>
              </div>
            ) : (
              filteredDevices.map((dev) => (
                <DeviceCard key={dev.id} device={dev} />
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: SignalTimeline Live Stream */}
        <div className="xl:col-span-1">
          <SignalTimeline />
        </div>

      </div>

      <RegisterDeviceModal
        isOpen={internalModalOpen}
        onClose={() => setInternalModalOpen(false)}
      />

    </div>
  );
}
