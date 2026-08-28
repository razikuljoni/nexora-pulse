'use client';

import React, { useState } from 'react';
import { useIoT } from '@/context/iot-context';
import {
  FileCode,
  Layers,
  Network,
  Cpu,
  Database,
  Server,
  Terminal,
  Copy,
  Check,
  Code2,
  ExternalLink,
  BookOpen,
  Sparkles
} from 'lucide-react';

export function ArchitectureDocs() {
  const { organization, devices } = useIoT();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const sampleDevice = devices[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const dockerComposeYaml = `version: '3.8'

services:
  # 1. EMQX Enterprise MQTT 5.0 Broker
  emqx:
    image: emqx/emqx:5.3.0
    container_name: nexora-mqtt-broker
    ports:
      - "1883:1883"   # Standard MQTT
      - "8883:8883"   # MQTT over TLS / SSL
      - "8083:8083"   # MQTT over WebSocket
      - "18083:18083" # Dashboard Console
    environment:
      - "EMQX_DEFAULT_USER_NAME=admin"
      - "EMQX_DEFAULT_USER_PASSWORD=public"
    volumes:
      - emqx-data:/opt/emqx/data

  # 2. TimescaleDB Time-Series Engine
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    container_name: nexora-timescaledb
    environment:
      POSTGRES_DB: nexora_iot
      POSTGRES_USER: nexora_admin
      POSTGRES_PASSWORD: secure_iot_password
    ports:
      - "5432:5432"
    volumes:
      - pg-data:/var/lib/postgresql/data

  # 3. Redis In-Memory State & Digital Twin Cache
  redis:
    image: redis:7-alpine
    container_name: nexora-redis-cache
    ports:
      - "6379:6379"

  # 4. Nexora Pulse Full-Stack Platform
  nexora-app:
    build: .
    container_name: nexora-pulse-app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://nexora_admin:secure_iot_password@timescaledb:5432/nexora_iot
      - MQTT_BROKER_URL=mqtts://emqx:8883
      - REDIS_URL=redis://redis:6379

volumes:
  emqx-data:
  pg-data:`;

  const esp32PlatformIo = `// platformio.ini configuration
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    knolleary/PubSubClient @ ^2.8
    bblanchon/ArduinoJson @ ^6.21.3
    adafruit/Adafruit BME280 Library @ ^2.2.2

// main.cpp source implementation
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_BME280.h>

const char* ssid = "NEXORA_SECURE_WIFI";
const char* password = "WIFI_PASSWORD";
const char* mqtt_server = "mqtt.nexoralabs.io";
const char* device_token = "${sampleDevice?.authToken || 'nex_token_live'}";

WiFiClientSecure netClient;
PubSubClient client(netClient);
Adafruit_BME280 bme;

void publishTelemetry() {
  StaticJsonDocument<256> payload;
  payload["temperature"] = bme.readTemperature();
  payload["humidity"] = bme.readHumidity();
  payload["pressure"] = bme.readPressure() / 100.0F;
  payload["uptime"] = millis() / 1000;

  char jsonBuffer[256];
  serializeJson(payload, jsonBuffer);
  client.publish("${sampleDevice?.mqttTopicPrefix || 'iot/org-nexora/esp32-01'}/telemetry", jsonBuffer);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  bme.begin(0x76);
  client.setServer(mqtt_server, 8883);
}

void loop() {
  if (!client.connected()) { /* reconnect routine */ }
  client.loop();
  publishTelemetry();
  delay(2500);
}`;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
            System Architecture & Developer Reference
          </h1>
          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-400">
            Open Standards v2.4
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Technical specifications, MQTT topic taxonomies, Docker compose topologies, and embedded firmware guides.
        </p>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl space-y-6 light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center space-x-2">
          <Network className="h-4 w-4 text-cyan-400" />
          <span>Full-Stack Edge-to-Cloud Data Pipeline Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          
          <div className="p-4 rounded-2xl bg-[#090e1c] border border-cyan-500/30 space-y-2 light:bg-slate-50">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Cpu className="h-4 w-4" />
              <span>1. Edge Hardware</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              ESP32 / Raspberry Pi samples analog I2C sensor bus (BME280/DHT22) and executes PWM actuators.
            </p>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded block">
              mTLS / TLS 1.3
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090e1c] border border-indigo-500/30 space-y-2 light:bg-slate-50">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <Server className="h-4 w-4" />
              <span>2. MQTT Broker</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              High-concurrency EMQX / Mosquitto broker routes QoS 1 telemetry streams and actuator commands.
            </p>
            <span className="text-[10px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded block">
              PubSub Topic Hierarchy
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090e1c] border border-emerald-500/30 space-y-2 light:bg-slate-50">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Database className="h-4 w-4" />
              <span>3. Data Storage</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              TimescaleDB hyper-tables for rollups + Redis key-value cache for Desired/Reported Digital Twins.
            </p>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded block">
              Real-time Ingestion
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090e1c] border border-amber-500/30 space-y-2 light:bg-slate-50">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Layers className="h-4 w-4" />
              <span>4. Web Platform</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              React + Next.js App Router streaming live charts, rule automation canvas, and emergency override.
            </p>
            <span className="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded block">
              Aether Grid UI
            </span>
          </div>

        </div>
      </div>

      {/* MQTT Topic Standard */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl space-y-4 light:bg-white light:border-slate-200">
        <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span>MQTT 5.0 Topic Hierarchy Specification</span>
        </h3>

        <div className="space-y-2 text-xs font-mono">
          {[
            {
              topic: 'iot/{tenant_id}/{device_id}/telemetry',
              desc: 'Device publishes periodic JSON sensor telemetry payload (Temp, Humidity, Quality).',
            },
            {
              topic: 'iot/{tenant_id}/{device_id}/command',
              desc: 'Cloud dispatches RPC commands & actuator instructions to physical device.',
            },
            {
              topic: 'iot/{tenant_id}/{device_id}/twin/desired',
              desc: 'Cloud publishes target state configuration changes.',
            },
            {
              topic: 'iot/{tenant_id}/{device_id}/twin/reported',
              desc: 'Device acknowledges and reports actual running register configuration.',
            },
            {
              topic: 'iot/{tenant_id}/{device_id}/status',
              desc: 'LWT (Last Will and Testament) topic for automatic offline link loss detection.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#090e1c] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 light:bg-slate-50"
            >
              <span className="text-cyan-400 font-bold">{item.topic}</span>
              <span className="text-slate-400 text-[11px] font-sans">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Docker Compose Section */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl space-y-3 light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center space-x-2">
            <FileCode className="h-4 w-4 text-emerald-400" />
            <span>Production Self-Host Docker Compose Topology</span>
          </h3>
          <button
            onClick={() => handleCopy(dockerComposeYaml, 'docker')}
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
          >
            {copiedSection === 'docker' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSection === 'docker' ? 'Copied' : 'Copy Compose'}</span>
          </button>
        </div>

        <pre className="h-64 overflow-y-auto rounded-2xl bg-[#090d16] border border-[#1e293b] p-4 text-[11px] font-mono text-slate-300 light:bg-slate-100 light:text-slate-900">
          {dockerComposeYaml}
        </pre>
      </div>

      {/* PlatformIO / Arduino C++ Template */}
      <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl space-y-3 light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center space-x-2">
            <Code2 className="h-4 w-4 text-indigo-400" />
            <span>ESP32 PlatformIO Firmware Starter (C++)</span>
          </h3>
          <button
            onClick={() => handleCopy(esp32PlatformIo, 'firmware')}
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
          >
            {copiedSection === 'firmware' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSection === 'firmware' ? 'Copied' : 'Copy Firmware'}</span>
          </button>
        </div>

        <pre className="h-64 overflow-y-auto rounded-2xl bg-[#090d16] border border-[#1e293b] p-4 text-[11px] font-mono text-cyan-300 light:bg-slate-100 light:text-slate-900">
          {esp32PlatformIo}
        </pre>
      </div>

    </div>
  );
}
