'use client';

import React from 'react';
import { Device, DeviceStatus } from '@/types';
import { useIoT } from '@/context/iot-context';
import { 
  Cpu, 
  Wifi, 
  Battery, 
  BatteryCharging, 
  Power, 
  Sliders, 
  Layers, 
  MapPin, 
  Activity, 
  Clock,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onSelect?: () => void;
}

export function DeviceCard({ device, onSelect }: DeviceCardProps) {
  const { toggleDeviceActuator, latestTelemetry, setSelectedDevice, setActiveView } = useIoT();

  const telem = latestTelemetry[device.id];

  const statusStyles: Record<DeviceStatus, { label: string; color: string; border: string; dot: string }> = {
    ONLINE: { label: 'ONLINE', color: 'text-emerald-400 bg-emerald-950/40', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    OFFLINE: { label: 'OFFLINE', color: 'text-slate-400 bg-slate-800/60', border: 'border-slate-700', dot: 'bg-slate-500' },
    SLEEPING: { label: 'SLEEPING (NB-IoT)', color: 'text-indigo-400 bg-indigo-950/40', border: 'border-indigo-500/30', dot: 'bg-indigo-400' },
    WARNING: { label: 'WARNING', color: 'text-amber-400 bg-amber-950/40', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    CRITICAL: { label: 'CRITICAL HAZARD', color: 'text-rose-400 bg-rose-950/40', border: 'border-rose-500/40', dot: 'bg-rose-500 animate-ping' },
    MAINTENANCE: { label: 'MAINTENANCE', color: 'text-cyan-400 bg-cyan-950/40', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
    UNKNOWN: { label: 'UNKNOWN', color: 'text-slate-400 bg-slate-800', border: 'border-slate-700', dot: 'bg-slate-500' },
  };

  const currentStatus = statusStyles[device.status] || statusStyles.ONLINE;

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDevice(device);
    setActiveView('devices');
  };

  return (
    <div
      onClick={handleInspect}
      className="group relative flex flex-col justify-between rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-cyan-950/20 cursor-pointer light:bg-white light:border-slate-200 light:hover:border-indigo-300"
    >
      
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#090e1c] border border-[#1e293b] text-cyan-400 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all light:bg-indigo-50 light:text-indigo-600 light:border-indigo-100">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white light:text-slate-900 group-hover:text-cyan-300 transition-colors">
                {device.name}
              </h4>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                <span className="font-mono text-cyan-400 font-semibold">{device.type}</span>
                <span>•</span>
                <span className="truncate max-w-[120px]">{device.zone}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold border ${currentStatus.color} ${currentStatus.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
            <span>{currentStatus.label}</span>
          </div>
        </div>

        {/* Connectivity & Hardware Meta Row */}
        <div className="mt-4 flex items-center space-x-4 text-[11px] text-slate-400 font-mono border-b border-[#1e293b]/60 pb-3 light:border-slate-100">
          <div className="flex items-center space-x-1">
            <Wifi className="h-3.5 w-3.5 text-indigo-400" />
            <span>{device.signalDbm} dBm</span>
          </div>
          <div className="flex items-center space-x-1">
            <Battery className={`h-3.5 w-3.5 ${device.batteryLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>{device.batteryLevel}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{device.firmwareVersion}</span>
          </div>
        </div>

        {/* Live Telemetry Sensors Grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          {device.sensors.slice(0, 4).map((sensor) => {
            const liveVal = telem && sensor.type === 'temperature' 
              ? telem.temperature 
              : telem && sensor.type === 'humidity' 
              ? telem.humidity 
              : telem && sensor.type === 'pressure' 
              ? telem.pressure 
              : telem && sensor.type === 'air_quality' 
              ? telem.airQuality 
              : sensor.currentValue;

            return (
              <div
                key={sensor.id}
                className="rounded-xl bg-[#090e1c]/80 border border-[#1e293b] p-2.5 flex flex-col justify-between light:bg-slate-50 light:border-slate-200"
              >
                <span className="text-[10px] font-semibold text-slate-400 truncate">
                  {sensor.name}
                </span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-sm font-extrabold text-white light:text-slate-900 font-mono">
                    {liveVal}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sensor.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer: Quick Actuators & Inspect Link */}
      <div className="mt-4 pt-3 border-t border-[#1e293b]/80 flex items-center justify-between light:border-slate-100">
        <div className="flex items-center space-x-2">
          {device.actuators.slice(0, 2).map((act) => {
            const isBool = typeof act.state === 'boolean';
            return (
              <button
                key={act.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isBool) {
                    toggleDeviceActuator(device.id, act.id, !act.state);
                  }
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                  act.state
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                    : 'bg-[#090e1c] text-slate-400 border-[#1e293b] hover:text-slate-200 light:bg-slate-100 light:border-slate-200'
                }`}
                title={`Toggle ${act.name}`}
              >
                <Power className={`h-3 w-3 ${act.state ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate max-w-[70px]">{act.name.split(' ')[0]}</span>
                <span>{String(act.state)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
          <span>Twin & Logs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
