'use client';

import React, { useState } from 'react';
import { Device, TelemetryRecord } from '@/types';
import { useIoT } from '@/context/iot-context';
import {
  Cpu,
  ArrowLeft,
  Wifi,
  Battery,
  Clock,
  Radio,
  Sliders,
  Terminal,
  Layers,
  Activity,
  History,
  Settings,
  Power,
  RotateCcw,
  Copy,
  Check,
  Send,
  AlertTriangle,
  FileCode,
  Shield,
  Trash2,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DeviceDetailViewProps {
  device: Device;
  onBack: () => void;
}

export function DeviceDetailView({ device, onBack }: DeviceDetailViewProps) {
  const {
    telemetryHistory,
    latestTelemetry,
    toggleDeviceActuator,
    sendCommand,
    updateDesiredTwin,
    commands,
    auditLogs,
    deleteDevice,
    updateDevice,
    triggerManualSpike,
    toggleDeviceOnlineStatus,
    organization
  } = useIoT();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'telemetry' | 'controls' | 'twin' | 'console' | 'history' | 'settings'
  >('overview');

  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [selectedSensorMetric, setSelectedSensorMetric] = useState<string>('temperature');

  // Command Console state
  const [consolePayload, setConsolePayload] = useState<string>('{\n  "fan_speed": 75,\n  "boost_mode": true\n}');
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Digital Twin state
  const [desiredJsonText, setDesiredJsonText] = useState<string>(
    JSON.stringify(device.twin.desired, null, 2)
  );
  const [twinSavedFeedback, setTwinSavedFeedback] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  const history = telemetryHistory[device.id] || [];
  const latest = latestTelemetry[device.id];
  const deviceCommands = commands.filter((c) => c.deviceId === device.id);
  const deviceLogs = auditLogs.filter((l) => l.targetId === device.id || l.details.includes(device.name));

  // Compute Twin Delta
  const desiredKeys = Object.keys(device.twin.desired);
  const reportedKeys = Object.keys(device.twin.reported);
  const allKeys = Array.from(new Set([...desiredKeys, ...reportedKeys]));
  const differences = allKeys.filter(
    (k) => JSON.stringify(device.twin.desired[k]) !== JSON.stringify(device.twin.reported[k])
  );

  const handleSendCommand = async () => {
    try {
      setIsSending(true);
      const parsed = JSON.parse(consolePayload);
      const res = await sendCommand(device.id, parsed);
      setCommandFeedback(`Command ${res.id} acknowledged & executed successfully.`);
      setTimeout(() => setCommandFeedback(null), 4000);
    } catch (e: any) {
      setCommandFeedback(`Error: Invalid JSON payload - ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyDesiredTwin = () => {
    try {
      const parsed = JSON.parse(desiredJsonText);
      updateDesiredTwin(device.id, parsed);
      setTwinSavedFeedback(true);
      setTimeout(() => setTwinSavedFeedback(false), 3000);
    } catch (e: any) {
      alert(`Invalid JSON: ${e.message}`);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(device.authToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Breadcrumb & Device Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-5 light:border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            id="back-to-fleet-btn"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all light:bg-white light:border-slate-300 light:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight">
                {device.name}
              </h2>
              <span className="rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono font-bold">
                {device.type}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                device.status === 'ONLINE' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {device.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Topic: <span className="text-cyan-400">{device.mqttTopicPrefix}</span> • Zone: {device.zone}
            </p>
          </div>
        </div>

        {/* Quick Simulator / Status Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleDeviceOnlineStatus(device.id)}
            className="px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs font-semibold text-slate-300 hover:border-slate-600 transition-colors light:bg-white light:border-slate-300 light:text-slate-800"
          >
            Simulate {device.status === 'ONLINE' ? 'Offline' : 'Online'}
          </button>
          <button
            onClick={() => triggerManualSpike(device.id, 'temperature', 34.5)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            Inject Temp Spike (34.5°C)
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 border-b border-[#1e293b] pb-2 overflow-x-auto light:border-slate-200">
        {[
          { id: 'overview', label: 'Device Overview', icon: Cpu },
          { id: 'telemetry', label: 'Telemetry Timeseries', icon: Activity },
          { id: 'controls', label: 'Actuators & Controls', icon: Sliders },
          { id: 'twin', label: 'Digital Twin', icon: Layers },
          { id: 'console', label: 'Command Console', icon: Terminal },
          { id: 'history', label: 'Audit & Commands', icon: History },
          { id: 'settings', label: 'Node Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm light:bg-indigo-50 light:text-indigo-900 light:border-indigo-200'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60 light:text-slate-600'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Specs Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 light:bg-white light:border-slate-200">
              <span className="text-xs text-slate-400">Signal RSSI</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-black text-white light:text-slate-900 font-mono">
                  {device.signalDbm}
                </span>
                <span className="text-xs text-cyan-400 font-mono">dBm</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Excellent Link</span>
            </div>

            <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 light:bg-white light:border-slate-200">
              <span className="text-xs text-slate-400">Battery Level</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-black text-white light:text-slate-900 font-mono">
                  {device.batteryLevel}
                </span>
                <span className="text-xs text-emerald-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Mains Regulated</span>
            </div>

            <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 light:bg-white light:border-slate-200">
              <span className="text-xs text-slate-400">Firmware Build</span>
              <div className="flex items-baseline space-x-1.5 mt-1 truncate">
                <span className="text-lg font-bold text-white light:text-slate-900 font-mono truncate">
                  {device.firmwareVersion}
                </span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono mt-1 block">ESP-IDF / FreeRTOS</span>
            </div>

            <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 light:bg-white light:border-slate-200">
              <span className="text-xs text-slate-400">System Uptime</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-black text-white light:text-slate-900 font-mono">
                  {Math.floor(device.uptimeSeconds / 3600)}h {Math.floor((device.uptimeSeconds % 3600) / 60)}m
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">0 watchdog resets</span>
            </div>
          </div>

          {/* Live Sensor Tiles */}
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900 mb-3">
              Configured Sensor Bus Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {device.sensors.map((sensor) => {
                const curVal = latest && sensor.type === 'temperature'
                  ? latest.temperature
                  : latest && sensor.type === 'humidity'
                  ? latest.humidity
                  : latest && sensor.type === 'pressure'
                  ? latest.pressure
                  : latest && sensor.type === 'air_quality'
                  ? latest.airQuality
                  : sensor.currentValue;

                return (
                  <div
                    key={sensor.id}
                    className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4.5 relative overflow-hidden light:bg-white light:border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">{sensor.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {sensor.quality}
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-white light:text-slate-900 font-mono">
                        {curVal}
                      </span>
                      <span className="text-xs font-semibold text-cyan-400 font-mono">{sensor.unit}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400 font-mono flex justify-between">
                      <span>Range: {sensor.minRange}..{sensor.maxRange}{sensor.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actuator Controls */}
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900 mb-3">
              Physical Actuators & Relays
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {device.actuators.map((act) => {
                const isBool = typeof act.state === 'boolean';
                return (
                  <div
                    key={act.id}
                    className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4.5 flex items-center justify-between light:bg-white light:border-slate-200"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white light:text-slate-900">{act.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Type: {act.type}</p>
                    </div>

                    {isBool ? (
                      <button
                        onClick={() => toggleDeviceActuator(device.id, act.id, !act.state)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                          act.state
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                            : 'bg-[#090e1c] text-slate-400 border-[#1e293b] light:bg-slate-100'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        <span>{act.state ? 'ACTIVE' : 'OFF'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min={act.min || 0}
                          max={act.max || 100}
                          value={Number(act.state)}
                          onChange={(e) => toggleDeviceActuator(device.id, act.id, Number(e.target.value))}
                          className="w-24 accent-cyan-400"
                        />
                        <span className="text-xs font-mono font-bold text-cyan-400 w-10 text-right">
                          {act.state}{act.unit || '%'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. TELEMETRY TIMESERIES */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] light:bg-white light:border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300 light:text-slate-800">Metric Channel:</span>
              <select
                value={selectedSensorMetric}
                onChange={(e) => setSelectedSensorMetric(e.target.value)}
                className="bg-[#090e1c] border border-[#1e293b] text-xs text-cyan-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
              >
                <option value="temperature">Temperature (°C)</option>
                <option value="humidity">Humidity (%)</option>
                <option value="pressure">Pressure (hPa)</option>
                <option value="airQuality">Air Quality (AQI)</option>
                <option value="lightLux">Illuminance (Lux)</option>
                <option value="voltage">Bus Voltage (V)</option>
                <option value="powerWatts">Power Consumption (W)</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              {(['1h', '6h', '24h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all border ${
                    timeRange === r
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'text-slate-400 border-transparent hover:bg-slate-900 light:text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Primary High-Resolution Chart */}
          <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-xl light:bg-white light:border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white light:text-slate-900 capitalize">
                  {selectedSensorMetric} Timeseries Curve
                </h4>
                <p className="text-xs text-slate-400">
                  Continuous sensor data with downsampling & zero packet loss
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Live Data Stream
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    stroke="#64748b"
                    fontSize={11}
                  />
                  <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedSensorMetric}
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#metricGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. ACTUATORS & CONTROLS */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 space-y-6 light:bg-white light:border-slate-200">
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-900">Actuator Command Console</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct MQTT RPC dispatches to physical onboard relays and PWM registers
              </p>
            </div>

            <div className="space-y-4">
              {device.actuators.map((act) => (
                <div
                  key={act.id}
                  className="rounded-2xl bg-[#090e1c] border border-[#1e293b] p-4 flex items-center justify-between light:bg-slate-50 light:border-slate-200"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white light:text-slate-900">{act.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Channel: {act.id}</p>
                  </div>

                  {typeof act.state === 'boolean' ? (
                    <button
                      onClick={() => toggleDeviceActuator(device.id, act.id, !act.state)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                        act.state
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                          : 'bg-[#090e1c] text-slate-400 border-[#1e293b]'
                      }`}
                    >
                      <Power className="h-4 w-4" />
                      <span>{act.state ? 'ENABLED' : 'DISABLED'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min={act.min || 0}
                        max={act.max || 100}
                        value={Number(act.state)}
                        onChange={(e) => toggleDeviceActuator(device.id, act.id, Number(e.target.value))}
                        className="w-32 accent-cyan-400"
                      />
                      <span className="text-xs font-mono font-bold text-cyan-400 w-12 text-right">
                        {act.state}{act.unit || '%'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">Actuator Presets & Macros</h3>
            <p className="text-xs text-slate-400">Run standardized batch hardware states across all channels:</p>

            <div className="space-y-3">
              <button
                onClick={() => sendCommand(device.id, { fan_speed: 100, ac_power: true, backup_blower: true })}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#090e1c] border border-cyan-500/30 hover:border-cyan-500/60 text-left transition-all light:bg-slate-50"
              >
                <div>
                  <h5 className="text-xs font-bold text-cyan-300">Max Ventilation Emergency Boost</h5>
                  <p className="text-[11px] text-slate-400">Sets fan PWM to 100% and opens secondary blowers.</p>
                </div>
                <Send className="h-4 w-4 text-cyan-400" />
              </button>

              <button
                onClick={() => sendCommand(device.id, { fan_speed: 25, ac_power: true, backup_blower: false })}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#090e1c] border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-all light:bg-slate-50"
              >
                <div>
                  <h5 className="text-xs font-bold text-indigo-300">Eco Silent Operation Profile</h5>
                  <p className="text-[11px] text-slate-400">Throttles fan to 25% for acoustic comfort.</p>
                </div>
                <Send className="h-4 w-4 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. DIGITAL TWIN */}
      {activeTab === 'twin' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 light:bg-white light:border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b] light:border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white light:text-slate-900">
                    Server-Side Digital Twin Engine
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Version {device.twin.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronizes <code className="text-cyan-400">desired</code> state configuration with physical <code className="text-emerald-400">reported</code> state.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  device.twin.inSync
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                }`}>
                  {device.twin.inSync ? 'STATE SYNCHRONIZED' : `${differences.length} DELTA DIFFERENCES`}
                </span>

                <button
                  onClick={handleApplyDesiredTwin}
                  className="flex items-center space-x-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply Desired State</span>
                </button>
              </div>
            </div>

            {twinSavedFeedback && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 font-mono flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Desired state dispatched via MQTT; digital twin reconciled.</span>
              </div>
            )}

            {/* Twin Side-by-Side Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* Desired JSON */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    DESIRED STATE (Cloud Target)
                  </span>
                  <span className="text-[10px] text-slate-400">Editable</span>
                </div>
                <textarea
                  rows={10}
                  value={desiredJsonText}
                  onChange={(e) => setDesiredJsonText(e.target.value)}
                  className="w-full rounded-2xl bg-[#090d16] border border-cyan-500/30 p-3.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 transition-all light:bg-slate-100 light:text-slate-900"
                />
              </div>

              {/* Reported JSON */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    REPORTED STATE (Device Hardware)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Last: {new Date(device.twin.lastSyncedAt).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="h-[238px] overflow-y-auto rounded-2xl bg-[#090d16] border border-emerald-500/30 p-3.5 text-xs font-mono text-emerald-300 light:bg-slate-100 light:text-emerald-900">
                  {JSON.stringify(device.twin.reported, null, 2)}
                </pre>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. COMMAND CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 light:bg-white light:border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white light:text-slate-900">
                    Developer MQTT Command Console
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target topic: <code className="text-cyan-400">{device.mqttTopicPrefix}/command</code>
                  </p>
                </div>
                <button
                  onClick={handleSendCommand}
                  disabled={isSending}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/30"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSending ? 'Transmitting...' : 'Dispatch Command'}</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={consolePayload}
                onChange={(e) => setConsolePayload(e.target.value)}
                className="w-full rounded-2xl bg-[#090d16] border border-[#1e293b] p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-all light:bg-slate-100 light:text-slate-900"
                placeholder='{\n  "fan_speed": 50\n}'
              />

              {commandFeedback && (
                <div className="mt-3 p-3 rounded-xl bg-[#090e1c] border border-cyan-500/40 text-xs font-mono text-cyan-300">
                  {commandFeedback}
                </div>
              )}
            </div>

            {/* Command History Table */}
            <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 light:bg-white light:border-slate-200">
              <h4 className="text-xs font-bold text-white light:text-slate-900 mb-3">Command Dispatch History</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {deviceCommands.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No commands sent yet.</p>
                ) : (
                  deviceCommands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex items-center justify-between text-xs font-mono light:bg-slate-50 light:border-slate-200"
                    >
                      <div>
                        <span className="text-slate-400">Payload: </span>
                        <span className="text-cyan-300">{JSON.stringify(cmd.payload)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(cmd.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {cmd.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Payload Presets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white light:text-slate-900">Payload Presets</h4>
            {[
              { label: 'Reboot Device Microcontroller', json: '{\n  "reboot": true,\n  "force": true\n}' },
              { label: 'Set Telemetry Rate (2000ms)', json: '{\n  "telemetry_interval_ms": 2000\n}' },
              { label: 'Toggle Primary Relay 1', json: '{\n  "relay_1": true,\n  "duration_sec": 60\n}' },
              { label: 'Calibrate Temp Sensor Offset', json: '{\n  "sensor_calibration": {\n    "temp_offset": -0.5\n  }\n}' },
            ].map((preset, i) => (
              <button
                key={i}
                onClick={() => setConsolePayload(preset.json)}
                className="w-full p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-cyan-500/50 text-left transition-all light:bg-white light:border-slate-200"
              >
                <div className="text-xs font-bold text-white light:text-slate-900">{preset.label}</div>
                <pre className="text-[10px] text-slate-400 font-mono mt-1 overflow-x-auto">
                  {preset.json.split('\n')[1]}...
                </pre>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. HISTORY & LOGS */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 light:bg-white light:border-slate-200">
          <h3 className="text-base font-bold text-white light:text-slate-900 mb-4">Device Audit & Event Logs</h3>
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {deviceLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit logs for this device.</p>
            ) : (
              deviceLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex items-start justify-between text-xs light:bg-slate-50 light:border-slate-200"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white light:text-slate-900">{log.action}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        {log.actor} ({log.actorRole})
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 font-mono text-[11px]">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 space-y-5 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">MQTT Connection Credentials</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Device Auth Token (API Key)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  readOnly
                  value={device.authToken}
                  className="flex-1 rounded-xl bg-[#090d16] border border-[#1e293b] p-2.5 text-xs font-mono text-slate-300 light:bg-slate-100 light:text-slate-900"
                />
                <button
                  onClick={handleCopyToken}
                  className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-[#090e1c] border border-[#1e293b] text-xs font-semibold text-cyan-400 hover:border-cyan-500/40"
                >
                  {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Assigned Zone</label>
              <input
                type="text"
                value={device.zone}
                onChange={(e) => updateDevice(device.id, { zone: e.target.value })}
                className="w-full rounded-xl bg-[#090d16] border border-[#1e293b] p-2.5 text-xs text-slate-200 light:bg-slate-100 light:text-slate-900"
              />
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-rose-500/20">
              <h4 className="text-xs font-bold text-rose-400 mb-2">Danger Zone</h4>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${device.name}"?`)) {
                    deleteDevice(device.id);
                    onBack();
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Decommission & Delete Device</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
