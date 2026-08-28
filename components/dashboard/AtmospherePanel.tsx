'use client';

import React from 'react';
import { useIoT } from '@/context/iot-context';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  SunMedium, 
  Gauge, 
  Sparkles, 
  Waves,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export function AtmospherePanel() {
  const { devices, latestTelemetry, simulationActive } = useIoT();

  // Aggregate ambient telemetry across online devices
  const onlineDevs = devices.filter((d) => d.status === 'ONLINE');
  const count = Math.max(1, onlineDevs.length);

  let totalTemp = 0;
  let totalHum = 0;
  let totalPress = 0;
  let totalAqi = 0;
  let totalLux = 0;

  onlineDevs.forEach((dev) => {
    const t = latestTelemetry[dev.id];
    if (t) {
      totalTemp += t.temperature;
      totalHum += t.humidity;
      totalPress += t.pressure;
      totalAqi += t.airQuality;
      totalLux += t.lightLux;
    }
  });

  const avgTemp = Number((totalTemp / count).toFixed(1));
  const avgHum = Number((totalHum / count).toFixed(1));
  const avgPress = Number((totalPress / count).toFixed(1));
  const avgAqi = Math.round(totalAqi / count);
  const avgLux = Math.round(totalLux / count);

  // Comfort Index Calculation
  let comfortLevel = 'Optimal Environmental Balance';
  let comfortBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let aqiCategory = 'Good (0-50 AQI)';
  let aqiColor = 'text-emerald-400';

  if (avgAqi > 100) {
    aqiCategory = 'Unhealthy (>100 AQI)';
    aqiColor = 'text-rose-400';
    comfortLevel = 'Air Filtration Urgently Recommended';
    comfortBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  } else if (avgAqi > 50) {
    aqiCategory = 'Moderate (51-100 AQI)';
    aqiColor = 'text-amber-400';
    comfortLevel = 'Slight VOC / Particulate Load';
    comfortBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#1e293b] bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-[#080d1a] p-6 shadow-2xl light:from-white light:via-slate-50 light:to-indigo-50/30 light:border-slate-200">
      
      {/* Background Atmosphere Wave Grid Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#1e293b]/80 light:border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-base font-bold tracking-tight text-white light:text-slate-900">
              Atmospheric Telemetry Matrix
            </h2>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
              Aether Grid v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated real-time sensor fusion across {onlineDevs.length} active IoT nodes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${comfortBadge}`}>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{comfortLevel}</span>
          </div>
        </div>
      </div>

      {/* Main Gauges Row */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        
        {/* Temperature Tile */}
        <div className="rounded-2xl bg-[#090e1c]/80 border border-[#1e293b] p-4 relative group hover:border-cyan-500/40 transition-all light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Temperature</span>
            <Thermometer className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white light:text-slate-900 font-mono">
              {avgTemp}
            </span>
            <span className="text-sm font-semibold text-cyan-400 font-mono">°C</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target: 21.5°C</span>
            <span className="text-emerald-400 font-mono font-bold">±0.3°</span>
          </div>
        </div>

        {/* Humidity Tile */}
        <div className="rounded-2xl bg-[#090e1c]/80 border border-[#1e293b] p-4 relative group hover:border-indigo-500/40 transition-all light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Relative Humidity</span>
            <Droplets className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white light:text-slate-900 font-mono">
              {avgHum}
            </span>
            <span className="text-sm font-semibold text-indigo-400 font-mono">%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dew Point: 11.2°C</span>
            <span className="text-indigo-300 font-mono">Stable</span>
          </div>
        </div>

        {/* Pressure Tile */}
        <div className="rounded-2xl bg-[#090e1c]/80 border border-[#1e293b] p-4 relative group hover:border-violet-500/40 transition-all light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Barometer</span>
            <Gauge className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white light:text-slate-900 font-mono">
              {avgPress}
            </span>
            <span className="text-xs font-semibold text-violet-400 font-mono">hPa</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>1.00 atm</span>
            <span className="text-violet-300 font-mono">Nominal</span>
          </div>
        </div>

        {/* Air Quality (AQI / VOC) */}
        <div className="rounded-2xl bg-[#090e1c]/80 border border-[#1e293b] p-4 relative group hover:border-emerald-500/40 transition-all light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Air Quality</span>
            <Wind className={`h-4 w-4 ${aqiColor}`} />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white light:text-slate-900 font-mono">
              {avgAqi}
            </span>
            <span className={`text-xs font-semibold font-mono ${aqiColor}`}>AQI</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className={aqiColor}>{aqiCategory.split(' ')[0]}</span>
            <span className="text-slate-400 font-mono">VOC / PM</span>
          </div>
        </div>

        {/* Ambient Illuminance Tile */}
        <div className="rounded-2xl bg-[#090e1c]/80 border border-[#1e293b] p-4 relative col-span-2 sm:col-span-1 group hover:border-amber-500/40 transition-all light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">PAR Light</span>
            <SunMedium className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-white light:text-slate-900 font-mono">
              {avgLux > 999 ? `${(avgLux / 1000).toFixed(1)}k` : avgLux}
            </span>
            <span className="text-xs font-semibold text-amber-400 font-mono">lux</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Daylight cycle</span>
            <span className="text-amber-300 font-mono font-bold">Active</span>
          </div>
        </div>

      </div>

      {/* Realtime Particle / Stream Activity Footer */}
      <div className="relative z-10 mt-5 pt-4 border-t border-[#1e293b]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 light:border-slate-200">
        <div className="flex items-center space-x-2">
          <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-slate-300 light:text-slate-700">
            Heartbeat: <span className="text-emerald-400 font-bold">LIVE (2.5s Sync)</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono">
          <span className="text-slate-400">
            MQTT QOS: <span className="text-indigo-400">Level 1 (At least once)</span>
          </span>
          <span className="text-slate-400">
            Stream: <span className="text-cyan-400">Binary Encoded JSON</span>
          </span>
        </div>
      </div>
    </div>
  );
}
