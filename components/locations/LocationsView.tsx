'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { LocationZone } from '@/types';
import { 
  MapPin, 
  Plus, 
  Layers, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  AlertTriangle,
  Building,
  Check
} from 'lucide-react';

export function LocationsView() {
  const { zones, addZone, devices, setSelectedDevice, setActiveView } = useIoT();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Building A - Tech Hub');
  const [description, setDescription] = useState('');

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addZone({
      name: name.trim(),
      location: location.trim(),
      description: description.trim() || 'Facility environmental zone',
    });

    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
              Facility Locations & Environmental Zones
            </h1>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
              Spatial IoT Hierarchy
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Group connected sensor nodes by physical facilities, floors, and environmental zones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Environmental Zone</span>
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((z) => {
          const zoneDevices = devices.filter((d) => d.zone === z.name);

          return (
            <div
              key={z.id}
              className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl space-y-4 light:bg-white light:border-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#090e1c] border border-cyan-500/30 text-cyan-400 light:bg-indigo-50 light:text-indigo-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white light:text-slate-900">{z.name}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                      <Building className="h-3.5 w-3.5" />
                      <span>{z.location}</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {zoneDevices.length} Nodes
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{z.description}</p>

              {/* Environmental Sensor Averages */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b] text-center light:bg-slate-50 light:border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Avg Temp</span>
                  <span className="text-base font-black text-cyan-400 font-mono mt-0.5 block">
                    {z.ambientTempAvg}°C
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b] text-center light:bg-slate-50 light:border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Avg Humidity</span>
                  <span className="text-base font-black text-indigo-400 font-mono mt-0.5 block">
                    {z.ambientHumidityAvg}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#090e1c] border border-[#1e293b] text-center light:bg-slate-50 light:border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">Air Quality</span>
                  <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
                    {z.airQualityAvg} AQI
                  </span>
                </div>
              </div>

              {/* Connected Devices in this Zone */}
              <div className="pt-3 border-t border-[#1e293b]/60 light:border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-2">
                  Assigned Hardware Devices:
                </span>
                <div className="flex flex-wrap gap-2">
                  {zoneDevices.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No devices assigned yet.</span>
                  ) : (
                    zoneDevices.map((dev) => (
                      <button
                        key={dev.id}
                        onClick={() => {
                          setSelectedDevice(dev);
                          setActiveView('devices');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#090e1c] border border-[#1e293b] text-xs font-mono text-cyan-300 hover:border-cyan-500/50 transition-colors flex items-center space-x-1.5 light:bg-slate-100 light:text-slate-900"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{dev.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl space-y-4 light:bg-white light:border-slate-200">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Create Environmental Zone
            </h3>

            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battery Storage Bay 3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Facility Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building C - Energy Wing"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Temperature-sensitive storage for high-density lithium cells."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] p-3 text-xs text-white light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
