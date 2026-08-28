'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import {
  Cpu,
  Sliders,
  Flame,
  WifiOff,
  BatteryLow,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  Sparkles,
  Send
} from 'lucide-react';

export function HardwareSimulatorDrawer() {
  const {
    devices,
    isSimulatorOpen,
    setIsSimulatorOpen,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    triggerManualSpike,
    toggleDeviceOnlineStatus,
    mqttStream,
    updateDeviceSensorManual,
  } = useIoT();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'controls' | 'serial'>('controls');

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  if (!isSimulatorOpen) {
    return (
      <button
        id="open-hardware-simulator-fab"
        onClick={() => setIsSimulatorOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center space-x-2 rounded-2xl bg-[#090e1c] border border-cyan-500/50 px-4 py-3 text-xs font-mono font-bold text-cyan-300 shadow-2xl shadow-cyan-950/50 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all light:bg-white light:border-indigo-400 light:text-indigo-900"
      >
        <Cpu className="h-4 w-4 text-cyan-400 animate-spin-slow" />
        <span>ESP32 Hardware Simulator</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-64 z-50 rounded-t-3xl border-t border-x border-[#1e293b] bg-[#090d16]/95 backdrop-blur-xl p-5 shadow-2xl transition-all max-h-[460px] overflow-y-auto light:bg-white/95 light:border-slate-300">
      
      {/* Top Dock Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1e293b] light:border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-black">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                ESP32 Hardware Simulator Workbench
              </h3>
              <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Active Runtime
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Simulates physical hardware interrupts, I2C sensor bus drift, and real-time MQTT publishing.
            </p>
          </div>
        </div>

        {/* Global Sim Controls & Close */}
        <div className="flex items-center space-x-2">
          
          {/* Pause / Play */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isSimulating ? 'SIMULATING' : 'PAUSED'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-[#0f172a] p-1 rounded-xl border border-[#1e293b] text-xs font-mono light:bg-slate-100">
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500/30 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSimulatorOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Target Device Selector & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Target Node:</span>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-[#0f172a] border border-cyan-500/30 text-xs text-cyan-300 rounded-xl px-3 py-1.5 font-mono font-bold focus:outline-none focus:border-cyan-400 light:bg-slate-100 light:text-slate-900"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.type}) [{d.status}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
              activeTab === 'controls'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 inline mr-1" />
            Sensor Registers & Injections
          </button>

          <button
            onClick={() => setActiveTab('serial')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
              activeTab === 'serial'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'text-slate-400 border-transparent hover:bg-slate-800'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 inline mr-1" />
            Serial Monitor / MQTT Stream ({mqttStream.length})
          </button>
        </div>
      </div>

      {/* BODY CONTENT: CONTROLS & FAULT INJECTION */}
      {activeTab === 'controls' && selectedDevice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          
          {/* Live Sensor Overwrite Sliders */}
          <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 space-y-3 light:bg-slate-50 light:border-slate-200">
            <h4 className="text-xs font-bold text-white light:text-slate-900 font-mono">
              Live Sensor I2C Registers (Dynamic Adjust)
            </h4>

            {selectedDevice.sensors.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 light:text-slate-700">{s.name}:</span>
                  <span className="text-cyan-400 font-bold">
                    {s.currentValue} {s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.minRange}
                  max={s.maxRange}
                  step={0.1}
                  value={s.currentValue}
                  onChange={(e) =>
                    updateDeviceSensorManual(selectedDevice.id, s.id, parseFloat(e.target.value))
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
            ))}
          </div>

          {/* Fault Injections Matrix */}
          <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 space-y-3 light:bg-slate-50 light:border-slate-200">
            <h4 className="text-xs font-bold text-white light:text-slate-900 font-mono">
              Fault Injection Macros (Trigger Alert & Automation Engines)
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => triggerManualSpike(selectedDevice.id, 'temperature', 34.8)}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-xs">
                  <Flame className="h-3.5 w-3.5" />
                  <span>Thermal Spike</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Force 34.8°C Overheat</span>
              </button>

              <button
                onClick={() => triggerManualSpike(selectedDevice.id, 'airQuality', 185)}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                  <Activity className="h-3.5 w-3.5" />
                  <span>AQI Degradation</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Force 185 Hazardous AQI</span>
              </button>

              <button
                onClick={() => toggleDeviceOnlineStatus(selectedDevice.id)}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 text-slate-200 font-bold text-xs">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Toggle Link Drop</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Currently {selectedDevice.status}
                </span>
              </button>

              <button
                onClick={() => triggerManualSpike(selectedDevice.id, 'humidity', 88.5)}
                className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-left transition-all"
              >
                <div className="flex items-center space-x-1.5 text-indigo-400 font-bold text-xs">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Humidity Surge</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Force 88.5% Condensation</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* BODY CONTENT: SERIAL MONITOR / MQTT EVENT STREAM */}
      {activeTab === 'serial' && (
        <div className="mt-4 rounded-2xl bg-[#030712] border border-[#1e293b] p-3.5 h-64 overflow-y-auto font-mono text-[11px] space-y-1.5">
          {mqttStream.length === 0 ? (
            <span className="text-slate-500">Waiting for MQTT packet stream...</span>
          ) : (
            mqttStream.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2 text-slate-300">
                <span className="text-slate-500 shrink-0">
                  [{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span className="text-cyan-400 shrink-0 font-bold">{msg.topic}</span>
                <span className="text-emerald-300 break-all">{JSON.stringify(msg.payload)}</span>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
