'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  Activity,
  Cpu,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  FileJson,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function AnalyticsView() {
  const { devices, telemetryHistory, organization } = useIoT();
  const [selectedRange, setSelectedRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'airQuality' | 'voltage'>('temperature');

  // Build combined multi-device comparison data points
  const refDev = devices[0];
  const refHistory = telemetryHistory[refDev?.id] || [];

  const comparisonData = refHistory.map((point, index) => {
    const entry: Record<string, any> = {
      timestamp: point.timestamp,
      timeFormatted: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    devices.forEach((dev) => {
      const devPoints = telemetryHistory[dev.id] || [];
      const pt = devPoints[index] || devPoints[devPoints.length - 1];
      if (pt) {
        entry[dev.name] = (pt as any)[selectedMetric];
      }
    });

    return entry;
  });

  // Message Volume simulation per device (deterministic derived state)
  const messageVolumeData = devices.map((d, index) => {
    const devPoints = telemetryHistory[d.id] || [];
    const baseMsg = 24000 + (index * 1750) + devPoints.length * 10;
    const baseKb = 4800 + (index * 320) + devPoints.length * 2;
    return {
      name: d.name.split(' ')[0] + '..',
      fullName: d.name,
      type: d.type,
      messages: baseMsg,
      dataKiloBytes: baseKb,
      uptimePct: d.status === 'ONLINE' ? 99.9 : 94.2,
    };
  });

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'DeviceId', 'DeviceName', 'Temperature_C', 'Humidity_Pct', 'Pressure_hPa', 'AQI'];
    const rows: string[] = [headers.join(',')];

    devices.forEach((dev) => {
      const points = telemetryHistory[dev.id] || [];
      points.forEach((p) => {
        rows.push([
          p.timestamp,
          dev.id,
          `"${dev.name}"`,
          p.temperature,
          p.humidity,
          p.pressure,
          p.airQuality,
        ].join(','));
      });
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexora_telemetry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportPayload = {
      organization: organization.name,
      exportedAt: new Date().toISOString(),
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        zone: d.zone,
        telemetry: telemetryHistory[d.id] || [],
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexora_telemetry_dataset_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const devicePalette = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Telemetry Analytics & Downsampling
            </h1>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-mono text-indigo-400">
              TimescaleDB Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated cross-device sensor comparison, ingestion volume, and uptime availability.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl bg-[#0f172a] border border-[#1e293b] px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-400 transition-all light:bg-white light:border-slate-300 light:text-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 rounded-xl bg-[#0f172a] border border-[#1e293b] px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-400 transition-all light:bg-white light:border-slate-300 light:text-slate-700"
          >
            <FileJson className="h-4 w-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0f172a] p-4 rounded-2xl border border-[#1e293b] light:bg-white light:border-slate-200">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700">Metric Channel:</span>
          <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-xl border border-[#1e293b] light:bg-slate-100">
            {(['temperature', 'humidity', 'airQuality', 'voltage'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                  selectedMetric === m
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300 light:text-slate-700">Time Window:</span>
          <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-xl border border-[#1e293b] light:bg-slate-100">
            {(['1h', '6h', '24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedRange === r
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Multi-Device Comparison Line Chart */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white light:text-slate-900 capitalize">
              Cross-Device {selectedMetric} Overlay
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized comparative telemetry curves across active hardware nodes
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30">
            Downsampled: 1 pt / 60s
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeFormatted" stroke="#64748b" fontSize={11} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              {devices.map((dev, idx) => (
                <Line
                  key={dev.id}
                  type="monotone"
                  dataKey={dev.name}
                  stroke={devicePalette[idx % devicePalette.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingestion Throughput & Uptime Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Telemetry Message Volume Chart */}
        <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                MQTT Telemetry Message Throughput
              </h3>
              <p className="text-xs text-slate-400">Total packet volume per node</p>
            </div>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
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
                <Bar dataKey="messages" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Reliability Table */}
        <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 space-y-3 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900">
                Device Availability & Health Index
              </h3>
              <p className="text-xs text-slate-400">Continuous ping heartbeat SLA</p>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="space-y-2">
            {messageVolumeData.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex items-center justify-between text-xs font-mono light:bg-slate-50 light:border-slate-200"
              >
                <div>
                  <h4 className="font-bold text-white light:text-slate-900">{d.fullName}</h4>
                  <span className="text-[10px] text-slate-400">{d.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">{d.dataKiloBytes} KB / day</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    {d.uptimePct}% SLA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
