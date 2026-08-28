'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import { DeviceType } from '@/types';
import { 
  X, 
  Cpu, 
  Layers, 
  MapPin, 
  Code, 
  Check, 
  Copy, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterDeviceModal({ isOpen, onClose }: RegisterDeviceModalProps) {
  const { registerDevice, zones, organization } = useIoT();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<DeviceType>('ESP32');
  const [zone, setZone] = useState(zones[0]?.name || 'Main Server Room 01');
  const [tagsText, setTagsText] = useState('ESP32, BME280, MQTT');
  const [createdDevice, setCreatedDevice] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    const selectedZoneObj = zones.find((z) => z.name === zone);
    const location = selectedZoneObj?.location || 'Building A - Tech Hub';

    const dev = registerDevice({
      name: name.trim(),
      type,
      location,
      zone,
      tags,
    });

    setCreatedDevice(dev);
    setStep(2);
  };

  const getArduinoCode = () => {
    if (!createdDevice) return '';
    return `// ==========================================
// NEXORA PULSE - ESP32 Firmware Quickstart
// Device: ${createdDevice.name} (${createdDevice.type})
// Topic: ${createdDevice.mqttTopicPrefix}/telemetry
// ==========================================

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "mqtt.nexoralabs.io";
const int mqtt_port = 8883;
const char* mqtt_token = "${createdDevice.authToken}";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) { reconnect(); }
  client.loop();

  // Send telemetry every 5 seconds
  StaticJsonDocument<256> doc;
  doc["temperature"] = 22.4;
  doc["humidity"] = 45.1;
  doc["pressure"] = 1013.2;
  doc["airQuality"] = 25;

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish("${createdDevice.mqttTopicPrefix}/telemetry", buffer);
  
  delay(5000);
}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(getArduinoCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl light:bg-white light:border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-[#1e293b] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step 1: Device Configuration Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-black">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white light:text-slate-900">
                  Register New Hardware Node
                </h3>
                <p className="text-xs text-slate-400">
                  Provision device identity and generate TLS MQTT keys
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">
                  Device Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greenhouse Temp Sensor 01"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none light:bg-slate-100 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">
                    Hardware Architecture
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DeviceType)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="ESP32">ESP32 (WROOM / S3)</option>
                    <option value="RASPBERRY_PI">Raspberry Pi (CM4 / Pi 5)</option>
                    <option value="ARDUINO_MKR">Arduino MKR WiFi 1010</option>
                    <option value="STM32_NODE">STM32 Nucleo Sensor Node</option>
                    <option value="NORDIC_NRF">Nordic nRF9160 (Cellular/NB-IoT)</option>
                    <option value="CUSTOM_IOT">Custom Linux/FreeRTOS Node</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700">
                    Target Location Zone
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3 py-2 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none light:bg-slate-100 light:text-slate-900"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.name}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#090d16] border border-[#1e293b] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none light:bg-slate-100 light:text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 transition-all"
              >
                <span>Provision Device</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Credentials & Firmware Code Snippet */}
        {step === 2 && createdDevice && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-base font-bold text-white light:text-slate-900">
                Device Successfully Provisioned!
              </h3>
            </div>

            <div className="rounded-2xl bg-[#090d16] border border-[#1e293b] p-3.5 space-y-2 text-xs font-mono light:bg-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Device ID:</span>
                <span className="text-cyan-300 font-bold">{createdDevice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MQTT Topic Prefix:</span>
                <span className="text-indigo-300">{createdDevice.mqttTopicPrefix}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Auth Token:</span>
                <span className="text-emerald-300 truncate max-w-[200px]">{createdDevice.authToken}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white light:text-slate-900">
                  Ready-to-Flash C++ / Arduino Sketch
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="h-48 overflow-y-auto rounded-2xl bg-[#090d16] border border-[#1e293b] p-3 text-[11px] font-mono text-slate-300 light:bg-slate-100 light:text-slate-900">
                {getArduinoCode()}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-600 text-black font-bold text-xs hover:bg-cyan-500 transition-colors"
              >
                Done & View Fleet
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
