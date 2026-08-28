# Nexora Pulse — Industrial-Grade IoT Device Intelligence & Automation Platform

**Nexora Pulse** is a real-time IoT fleet intelligence, telemetry streaming, digital twin synchronization, and event-driven automation platform built with modern Next.js App Router, TypeScript, Tailwind CSS, and the *Aether Grid* design system.

---

## Key Capabilities

1. **Executive IoT Command Center & Live Telemetry**
   - Instant KPI aggregation: Total Nodes, Active Online Rate, 24h Sensor Ingestion Volume, Critical Incident Alarms, and Mean Uptime SLA.
   - Atmospheric sensor telemetry stream (Temperature, Relative Humidity, Barometric Pressure, Air Quality AQI, Bus Voltage, and Power Draw).
   - Real-time event bus with high-frequency MQTT packet feeds.

2. **Fleet Management & Hardware Explorer**
   - Multi-architecture device registry: ESP32 (WROOM/S3), Raspberry Pi (CM4/Pi 5), Arduino MKR WiFi 1010, STM32 Nucleo, and Nordic nRF9160.
   - Granular search by name, IP, MAC address, and hardware tags.
   - Multi-device broadcast RPC commands (batch relay toggle, fleet reboot).
   - Provisioning wizard generating secure TLS auth tokens and flashable C++ / PlatformIO firmware sketches.

3. **Device Detail Inspector & Digital Twins**
   - Desired JSON vs. Reported JSON state synchronization engine with real-time delta detector.
   - Sub-second actuator command console with payload validation and execution history.
   - High-resolution Recharts time-series curves with metric selectors and selectable time windows (1h, 6h, 24h, 7d).

4. **Visual Event-Driven Automation Canvas**
   - React Flow-inspired rule pipeline connecting trigger events (`TELEMETRY_THRESHOLD`, `DEVICE_STATUS`), logical condition evaluations (`AND`, `OR`, `>`, `<`, `==`), and synchronous actuator / alert RPC actions.
   - Integrated simulation test runner reporting sub-millisecond execution times and action trace outcomes.

5. **4-Stage Incident Response Center**
   - Complete alarm lifecycle: `NORMAL` ➔ `TRIGGERED` ➔ `ACKNOWLEDGED` ➔ `RESOLVED`.
   - Priority severity triage: `CRITICAL`, `WARNING`, `INFO`.
   - Guard rules with configurable thresholds and grace periods.

6. **Analytics & Historical Downsampling**
   - Multi-device comparative overlay charts.
   - MQTT message ingestion throughput metrics and device SLA health index.
   - Client-side CSV and JSON dataset export utilities.

7. **Embedded ESP32 Hardware Simulator Workbench**
   - Dockable testbed allowing developers to test without physical hardware.
   - Dynamic I2C sensor bus sliders with real-time value injection.
   - One-click fault injectors: Thermal Overheat Spike, Connection Drop, Low Battery Brownout, and AQI Surge.
   - Live serial monitor and raw MQTT packet stream.

8. **Enterprise RBAC Access Control**
   - Granular role hierarchy: `OWNER`, `ADMIN`, `OPERATOR`, and `VIEWER`.
   - Live session role switcher to verify permission gating across controls.

---

## System Architecture

```
[ Edge Nodes: ESP32 / RPi / STM32 ]
                 │
           (mTLS / MQTT 5.0)
                 ▼
       [ EMQX MQTT Broker ]
                 │
        ┌────────┴────────┐
        ▼                 ▼
[ Redis Twin Cache ] [ TimescaleDB Hyper-Tables ]
        │                 │
        └────────┬────────┘
                 ▼
     [ Nexora Pulse Platform ]
  (Next.js + React Context + Aether Grid UI)
```

### MQTT Topic Standard

| Channel | Topic Pattern | Description |
| :--- | :--- | :--- |
| **Telemetry** | `iot/{tenant_id}/{device_id}/telemetry` | JSON sensor reading stream from hardware |
| **RPC Command**| `iot/{tenant_id}/{device_id}/command` | Control dispatch to physical actuators |
| **Twin Desired**| `iot/{tenant_id}/{device_id}/twin/desired` | Cloud configuration target state |
| **Twin Reported**| `iot/{tenant_id}/{device_id}/twin/reported` | Actual hardware acknowledged state |
| **Status (LWT)** | `iot/{tenant_id}/{device_id}/status` | Last Will & Testament connection heartbeat |

---

## Local Development & Setup

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/nexora/nexora-pulse.git
cd nexora-pulse

# 2. Install dependencies
npm install

# 3. Start development server on port 3000
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment (Docker Compose)

To run the complete full-stack environment with EMQX broker, TimescaleDB, and Redis:

```bash
docker-compose up -d
```

---

## Design System: Aether Grid

Nexora Pulse uses the **Aether Grid** design system:
- **Palette**: Deep space slate (`#030712`, `#090e1c`, `#0f172a`), neon cyan telemetry accents (`#06b6d4`), electric indigo logic accents (`#6366f1`), and emerald health accents (`#10b981`).
- **Typography**: Refined tabular monospace font stacks for precise sub-second telemetry readouts.
- **Glassmorphism & Grids**: Subtle grid coordinates with crisp border accents and high contrast.
