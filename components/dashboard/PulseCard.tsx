'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PulseCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon: LucideIcon;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  subtitle?: string;
  sparklineData?: number[];
  onClick?: () => void;
}

export function PulseCard({
  id,
  title,
  value,
  unit,
  trend,
  icon: Icon,
  status = 'normal',
  subtitle,
  sparklineData,
  onClick,
}: PulseCardProps) {
  const statusColors = {
    normal: 'border-[#1e293b] text-slate-100 hover:border-slate-600',
    success: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10 hover:border-emerald-500/50',
    warning: 'border-amber-500/30 text-amber-400 bg-amber-950/10 hover:border-amber-500/50',
    critical: 'border-rose-500/40 text-rose-400 bg-rose-950/20 hover:border-rose-500/60 shadow-lg shadow-rose-950/20',
  };

  const iconColors = {
    normal: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
    success: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    critical: 'text-rose-400 bg-rose-950/50 border-rose-500/40 animate-pulse',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative rounded-2xl bg-[#0f172a] border p-4.5 transition-all cursor-default light:bg-white light:border-slate-200 ${
        statusColors[status]
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 light:text-slate-500">
            {title}
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black tracking-tight text-white light:text-slate-900 font-mono">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-400 font-mono">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border p-2 ${iconColors[status]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Sparkline & Trend */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1e293b]/60 light:border-slate-100">
        {trend ? (
          <div className="flex items-center space-x-1 text-xs">
            {trend.direction === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
            {trend.direction === 'down' && <TrendingDown className="h-3.5 w-3.5 text-cyan-400" />}
            {trend.direction === 'neutral' && <Minus className="h-3.5 w-3.5 text-slate-400" />}
            <span
              className={`font-semibold font-mono text-[11px] ${
                trend.direction === 'up'
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-[10px] text-slate-400">
                {trend.label}
              </span>
            )}
          </div>
        ) : subtitle ? (
          <span className="text-[11px] text-slate-400 truncate">{subtitle}</span>
        ) : (
          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span>Live Stream</span>
          </div>
        )}

        {/* Mini Sparkline Visualization */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end space-x-0.5 h-4">
            {sparklineData.slice(-10).map((pt, i) => {
              const max = Math.max(...sparklineData, 1);
              const min = Math.min(...sparklineData, 0);
              const heightPct = Math.max(15, Math.min(100, ((pt - min) / (max - min || 1)) * 100));
              return (
                <div
                  key={i}
                  style={{ height: `${heightPct}%` }}
                  className="w-1 rounded-sm bg-cyan-400/60 hover:bg-cyan-400 transition-colors"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
