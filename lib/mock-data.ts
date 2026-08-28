import { 
  Device, 
  TelemetryRecord, 
  AutomationRule, 
  AlertRule, 
  AlertEvent, 
  Organization, 
  LocationZone, 
  OrganizationMember, 
  AuditLog,
  DeviceCommand
} from '@/types';

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-nexora-alpha',
  name: 'Nexora Industrial Labs',
  slug: 'nexora-industrial',
  tier: 'ENTERPRISE',
  activeDevicesCount: 5,
  totalTelemetryIngested: 1482920,
};

export const INITIAL_MEMBERS: OrganizationMember[] = [
  {
    id: 'usr-1',
    name: 'Alex Vance',
    email: 'alex.vance@nexoralabs.io',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-12T08:30:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'usr-2',
    name: 'Marcus Chen',
    email: 'm.chen@nexoralabs.io',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    joinedAt: '2026-02-01T10:15:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'usr-3',
    name: 'Elena Rostova',
    email: 'elena.r@nexoralabs.io',
    role: 'ENGINEER',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    joinedAt: '2026-02-18T14:40:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'usr-4',
    name: 'Devon Miles',
    email: 'devon.m@nexoralabs.io',
    role: 'OPERATOR',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    joinedAt: '2026-03-05T09:20:00Z',
    status: 'ACTIVE',
  },
];

export const INITIAL_ZONES: LocationZone[] = [
  {
    id: 'zone-1',
    location: 'Building A - Tech Hub',
    name: 'Main Server Room 01',
    description: 'High-density compute racks with dual-zone climate precision monitoring.',
    devicesCount: 2,
    ambientTempAvg: 20.8,
    ambientHumidityAvg: 44.2,
    airQualityAvg: 22,
    safetyStatus: 'OPTIMAL',
  },
  {
    id: 'zone-2',
    location: 'Building A - Tech Hub',
    name: 'Embedded Robotics Lab',
    description: 'Rapid prototyping workshop, 3D printers and laser cutter exhaust sensing.',
    devicesCount: 1,
    ambientTempAvg: 23.4,
    ambientHumidityAvg: 48.6,
    airQualityAvg: 48,
    safetyStatus: 'OPTIMAL',
  },
  {
    id: 'zone-3',
    location: 'Agricultural Wing',
    name: 'Smart Hydroponics Bay 4',
    description: 'Automated nutrient dosing, atmospheric vapor pressure deficit control.',
    devicesCount: 1,
    ambientTempAvg: 26.2,
    ambientHumidityAvg: 72.5,
    airQualityAvg: 18,
    safetyStatus: 'OPTIMAL',
  },
  {
    id: 'zone-4',
    location: 'Logistics Facility',
    name: 'Cold Storage Vault B',
    description: 'Sub-zero critical storage for biological reagents and thermal logging.',
    devicesCount: 1,
    ambientTempAvg: -4.1,
    ambientHumidityAvg: 85.0,
    airQualityAvg: 12,
    safetyStatus: 'OPTIMAL',
  },
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-esp32-001',
    name: 'Server Room Climate Pod',
    slug: 'srv-climate-pod-01',
    type: 'ESP32',
    status: 'ONLINE',
    firmwareVersion: 'v2.4.1-rc3',
    macAddress: '24:0A:C4:89:12:FE',
    ipAddress: '192.168.10.45',
    location: 'Building A - Tech Hub',
    zone: 'Main Server Room 01',
    lastSeen: new Date().toISOString(),
    uptimeSeconds: 842190,
    batteryLevel: 100, // Mains powered
    signalDbm: -52,
    tags: ['ESP-WROOM-32', 'Dual-BME280', 'Mains-Power', 'Critical'],
    mqttTopicPrefix: 'nexora/org-nexora-alpha/dev-esp32-001',
    authToken: 'nxt_live_89f0a71bc9d4e21a009',
    createdAt: '2026-01-15T10:00:00Z',
    isSimulated: true,
    sensors: [
      { id: 's-temp-1', name: 'Ambient Temperature', type: 'temperature', unit: '°C', minRange: -20, maxRange: 80, currentValue: 21.4, quality: 'GOOD' },
      { id: 's-hum-1', name: 'Relative Humidity', type: 'humidity', unit: '%', minRange: 0, maxRange: 100, currentValue: 42.8, quality: 'GOOD' },
      { id: 's-press-1', name: 'Barometric Pressure', type: 'pressure', unit: 'hPa', minRange: 800, maxRange: 1200, currentValue: 1013.2, quality: 'GOOD' },
      { id: 's-aqi-1', name: 'Air Quality (VOC)', type: 'air_quality', unit: 'AQI', minRange: 0, maxRange: 500, currentValue: 24, quality: 'GOOD' },
      { id: 's-volt-1', name: 'Bus Voltage', type: 'voltage', unit: 'V', minRange: 0, maxRange: 24, currentValue: 12.08, quality: 'GOOD' },
    ],
    actuators: [
      { id: 'act-fan-1', name: 'Exhaust Fan Boost', type: 'pwm_fan', state: 45, unit: '%', min: 0, max: 100 },
      { id: 'act-relay-1', name: 'AC Unit 1 Power', type: 'relay', state: true },
      { id: 'act-relay-2', name: 'Backup Blower Relay', type: 'relay', state: false },
    ],
    twin: {
      desired: {
        fan_speed: 45,
        ac_power: true,
        backup_blower: false,
        telemetry_interval_sec: 5,
      },
      reported: {
        fan_speed: 45,
        ac_power: true,
        backup_blower: false,
        telemetry_interval_sec: 5,
        temp_c: 21.4,
        humidity_pct: 42.8,
        fw: 'v2.4.1-rc3'
      },
      lastSyncedAt: new Date().toISOString(),
      version: 42,
      inSync: true,
    }
  },
  {
    id: 'dev-pi-002',
    name: 'Hydroponics Automation Hub',
    slug: 'hydro-hub-bay4',
    type: 'RASPBERRY_PI',
    status: 'ONLINE',
    firmwareVersion: 'v3.1.0-arm64',
    macAddress: 'DC:A6:32:41:88:B2',
    ipAddress: '192.168.10.88',
    location: 'Agricultural Wing',
    zone: 'Smart Hydroponics Bay 4',
    lastSeen: new Date().toISOString(),
    uptimeSeconds: 1249300,
    batteryLevel: 94,
    signalDbm: -61,
    tags: ['Pi-4B', 'RS485-Sensors', 'Relay-Hat', 'Grow-Cycle'],
    mqttTopicPrefix: 'nexora/org-nexora-alpha/dev-pi-002',
    authToken: 'nxt_live_41b8e90ff331ac72120',
    createdAt: '2026-01-20T14:20:00Z',
    isSimulated: true,
    sensors: [
      { id: 's-temp-2', name: 'Canopy Temperature', type: 'temperature', unit: '°C', minRange: 0, maxRange: 60, currentValue: 26.8, quality: 'GOOD' },
      { id: 's-hum-2', name: 'Canopy Humidity', type: 'humidity', unit: '%', minRange: 0, maxRange: 100, currentValue: 71.4, quality: 'GOOD' },
      { id: 's-co2-2', name: 'CO2 Concentration', type: 'co2', unit: 'ppm', minRange: 300, maxRange: 3000, currentValue: 850, quality: 'GOOD' },
      { id: 's-lux-2', name: 'PAR Light Intensity', type: 'light', unit: 'lx', minRange: 0, maxRange: 100000, currentValue: 42800, quality: 'GOOD' },
      { id: 's-soil-2', name: 'Nutrient Moisture', type: 'soil_moisture', unit: '%', minRange: 0, maxRange: 100, currentValue: 82.5, quality: 'GOOD' },
    ],
    actuators: [
      { id: 'act-valve-1', name: 'Irrigation Valve A', type: 'valve', state: false },
      { id: 'act-light-1', name: 'Quantum LED Dimmer', type: 'led_dimmer', state: 80, unit: '%', min: 0, max: 100 },
      { id: 'act-co2-1', name: 'CO2 Injector Solenoid', type: 'relay', state: true },
    ],
    twin: {
      desired: {
        irrigation_active: false,
        led_brightness: 80,
        co2_injector: true,
        target_humidity: 70
      },
      reported: {
        irrigation_active: false,
        led_brightness: 80,
        co2_injector: true,
        target_humidity: 70,
        canopy_temp: 26.8,
      },
      lastSyncedAt: new Date().toISOString(),
      version: 118,
      inSync: true,
    }
  },
  {
    id: 'dev-stm32-003',
    name: 'Robotics Workshop Air Monitor',
    slug: 'robotics-air-guard',
    type: 'STM32_NODE',
    status: 'ONLINE',
    firmwareVersion: 'v1.9.8',
    macAddress: '00:80:E1:92:44:11',
    ipAddress: '192.168.10.103',
    location: 'Building A - Tech Hub',
    zone: 'Embedded Robotics Lab',
    lastSeen: new Date().toISOString(),
    uptimeSeconds: 432000,
    batteryLevel: 88,
    signalDbm: -68,
    tags: ['STM32F4', 'Particulate-PM2.5', 'Exhaust-Link'],
    mqttTopicPrefix: 'nexora/org-nexora-alpha/dev-stm32-003',
    authToken: 'nxt_live_7719ab44c2010ff7821',
    createdAt: '2026-02-04T09:15:00Z',
    isSimulated: true,
    sensors: [
      { id: 's-temp-3', name: 'Ambient Temp', type: 'temperature', unit: '°C', minRange: -10, maxRange: 70, currentValue: 23.5, quality: 'GOOD' },
      { id: 's-hum-3', name: 'Relative Humidity', type: 'humidity', unit: '%', minRange: 0, maxRange: 100, currentValue: 47.9, quality: 'GOOD' },
      { id: 's-aqi-3', name: 'Particulate PM2.5 / AQI', type: 'air_quality', unit: 'AQI', minRange: 0, maxRange: 500, currentValue: 42, quality: 'GOOD' },
      { id: 's-pwr-3', name: 'Fume Hood Power', type: 'power', unit: 'W', minRange: 0, maxRange: 3500, currentValue: 340, quality: 'GOOD' },
    ],
    actuators: [
      { id: 'act-fume-fan', name: 'Exhaust Scrubber', type: 'pwm_fan', state: 60, unit: '%', min: 0, max: 100 },
      { id: 'act-buzzer', name: 'Warning Strobe Relay', type: 'relay', state: false },
    ],
    twin: {
      desired: {
        exhaust_speed: 60,
        strobe_active: false
      },
      reported: {
        exhaust_speed: 60,
        strobe_active: false,
        pm25_aqi: 42
      },
      lastSyncedAt: new Date().toISOString(),
      version: 65,
      inSync: true,
    }
  },
  {
    id: 'dev-mkr-004',
    name: 'Cold Storage Vault Logger',
    slug: 'cold-vault-node-04',
    type: 'ARDUINO_MKR',
    status: 'ONLINE',
    firmwareVersion: 'v1.4.2',
    macAddress: 'A4:CF:12:77:3A:90',
    ipAddress: '192.168.10.155',
    location: 'Logistics Facility',
    zone: 'Cold Storage Vault B',
    lastSeen: new Date().toISOString(),
    uptimeSeconds: 2190000,
    batteryLevel: 98,
    signalDbm: -74,
    tags: ['MKR-WiFi-1010', 'Cryo-PT100', 'Isolated-Probe'],
    mqttTopicPrefix: 'nexora/org-nexora-alpha/dev-mkr-004',
    authToken: 'nxt_live_99210bc8831eef451a9',
    createdAt: '2026-01-08T11:45:00Z',
    isSimulated: true,
    sensors: [
      { id: 's-temp-4', name: 'Cryo Probe Temp', type: 'temperature', unit: '°C', minRange: -80, maxRange: 40, currentValue: -4.2, quality: 'GOOD' },
      { id: 's-hum-4', name: 'Vault Humidity', type: 'humidity', unit: '%', minRange: 0, maxRange: 100, currentValue: 84.1, quality: 'GOOD' },
      { id: 's-volt-4', name: 'Backup Battery V', type: 'voltage', unit: 'V', minRange: 2.8, maxRange: 4.2, currentValue: 3.95, quality: 'GOOD' },
    ],
    actuators: [
      { id: 'act-defrost', name: 'Defrost Heater Cycle', type: 'relay', state: false },
      { id: 'act-compressor', name: 'Compressor Loop 1', type: 'relay', state: true },
    ],
    twin: {
      desired: {
        compressor: true,
        defrost: false,
        target_temp: -5.0
      },
      reported: {
        compressor: true,
        defrost: false,
        target_temp: -5.0,
        temp_c: -4.2
      },
      lastSyncedAt: new Date().toISOString(),
      version: 91,
      inSync: true,
    }
  },
  {
    id: 'dev-nrf-005',
    name: 'Roof Weather & Solar Node',
    slug: 'rooftop-met-station',
    type: 'NORDIC_NRF',
    status: 'SLEEPING',
    firmwareVersion: 'v2.0.1-zephyr',
    macAddress: 'F0:B5:D1:6C:55:7E',
    ipAddress: '192.168.10.210',
    location: 'Building A - Tech Hub',
    zone: 'Main Server Room 01',
    lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    uptimeSeconds: 512000,
    batteryLevel: 76,
    signalDbm: -82,
    tags: ['nRF9160', 'Low-Power-NB-IoT', 'Solar-Harvesting'],
    mqttTopicPrefix: 'nexora/org-nexora-alpha/dev-nrf-005',
    authToken: 'nxt_live_33177ee92a43b1297d0',
    createdAt: '2026-02-11T16:00:00Z',
    isSimulated: true,
    sensors: [
      { id: 's-temp-5', name: 'Exterior Temp', type: 'temperature', unit: '°C', minRange: -30, maxRange: 60, currentValue: 18.2, quality: 'GOOD' },
      { id: 's-hum-5', name: 'Exterior Humidity', type: 'humidity', unit: '%', minRange: 0, maxRange: 100, currentValue: 55.0, quality: 'GOOD' },
      { id: 's-lux-5', name: 'Solar Irradiance', type: 'light', unit: 'lx', minRange: 0, maxRange: 120000, currentValue: 68400, quality: 'GOOD' },
      { id: 's-press-5', name: 'Barometric Pressure', type: 'pressure', unit: 'hPa', minRange: 800, maxRange: 1200, currentValue: 1014.8, quality: 'GOOD' },
    ],
    actuators: [
      { id: 'act-heater-probe', name: 'Anemometer De-Icer', type: 'relay', state: false },
    ],
    twin: {
      desired: {
        de_icer: false,
        sleep_interval_min: 5
      },
      reported: {
        de_icer: false,
        sleep_interval_min: 5,
        temp_c: 18.2
      },
      lastSyncedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      version: 34,
      inSync: true,
    }
  }
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Server Thermal Protection Blower',
    description: 'Automatically increases exhaust fan speed to 90% and raises alert if server room temperature exceeds 28°C.',
    enabled: true,
    version: 3,
    trigger: {
      type: 'TELEMETRY_THRESHOLD',
      deviceId: 'dev-esp32-001',
      metric: 'temperature',
    },
    conditions: [
      {
        id: 'cond-1',
        metric: 'temperature',
        operator: 'GREATER_THAN',
        value: 28.0,
      }
    ],
    logic: 'AND',
    actions: [
      {
        id: 'act-1',
        type: 'SEND_COMMAND',
        targetDeviceId: 'dev-esp32-001',
        commandPayload: { fan_speed: 90, boost_mode: true },
      },
      {
        id: 'act-2',
        type: 'CREATE_ALERT',
        alertTitle: 'Server Room High Temperature Exceeded',
        alertSeverity: 'CRITICAL',
      },
      {
        id: 'act-3',
        type: 'SEND_NOTIFICATION',
        notificationText: 'Exhaust fan auto-throttled to 90% due to thermal threshold breach (Temp > 28°C).',
      }
    ],
    lastTriggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    executionCount: 14,
    createdAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'auto-2',
    name: 'Hydroponics Canopy Humidity Stabilizer',
    description: 'Engages ventilation boost when canopy relative humidity exceeds 78% to avoid mildew.',
    enabled: true,
    version: 2,
    trigger: {
      type: 'TELEMETRY_THRESHOLD',
      deviceId: 'dev-pi-002',
      metric: 'humidity',
    },
    conditions: [
      {
        id: 'cond-2',
        metric: 'humidity',
        operator: 'GREATER_THAN',
        value: 78.0,
      }
    ],
    logic: 'AND',
    actions: [
      {
        id: 'act-4',
        type: 'TOGGLE_ACTUATOR',
        targetDeviceId: 'dev-pi-002',
        actuatorId: 'act-light-1',
        targetState: 60,
      },
      {
        id: 'act-5',
        type: 'SEND_NOTIFICATION',
        notificationText: 'Hydroponic humidity regulation triggered: Adjusted canopy lights and ventilation.',
      }
    ],
    lastTriggeredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    executionCount: 29,
    createdAt: '2026-02-01T15:30:00Z',
  },
  {
    id: 'auto-3',
    name: 'Robotics Air Quality Particulate Scrubber',
    description: 'Activates workshop fume exhaust when PM2.5 AQI exceeds 55.',
    enabled: true,
    version: 1,
    trigger: {
      type: 'TELEMETRY_THRESHOLD',
      deviceId: 'dev-stm32-003',
      metric: 'airQuality',
    },
    conditions: [
      {
        id: 'cond-3',
        metric: 'airQuality',
        operator: 'GREATER_THAN',
        value: 55,
      }
    ],
    logic: 'AND',
    actions: [
      {
        id: 'act-6',
        type: 'SEND_COMMAND',
        targetDeviceId: 'dev-stm32-003',
        commandPayload: { exhaust_speed: 100, scrubber_high: true },
      },
      {
        id: 'act-7',
        type: 'CREATE_ALERT',
        alertTitle: 'Robotics Lab Particulate Spike Detected',
        alertSeverity: 'WARNING',
      }
    ],
    lastTriggeredAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    executionCount: 8,
    createdAt: '2026-02-10T12:00:00Z',
  }
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-1',
    name: 'Server Room Critical Heat (> 29°C)',
    deviceId: 'dev-esp32-001',
    metric: 'temperature',
    operator: 'GREATER_THAN',
    threshold: 29.0,
    severity: 'CRITICAL',
    gracePeriodSeconds: 30,
    enabled: true,
  },
  {
    id: 'ar-2',
    name: 'Cold Storage Vault Thaw Hazard (> 0°C)',
    deviceId: 'dev-mkr-004',
    metric: 'temperature',
    operator: 'GREATER_THAN',
    threshold: 0.0,
    severity: 'CRITICAL',
    gracePeriodSeconds: 60,
    enabled: true,
  },
  {
    id: 'ar-3',
    name: 'Battery Critical Warning (< 15%)',
    metric: 'battery',
    operator: 'LESS_THAN',
    threshold: 15,
    severity: 'WARNING',
    gracePeriodSeconds: 300,
    enabled: true,
  },
  {
    id: 'ar-4',
    name: 'Robotics VOC Spike (> 120 AQI)',
    deviceId: 'dev-stm32-003',
    metric: 'airQuality',
    operator: 'GREATER_THAN',
    threshold: 120,
    severity: 'WARNING',
    gracePeriodSeconds: 45,
    enabled: true,
  }
];

export const INITIAL_ALERT_EVENTS: AlertEvent[] = [
  {
    id: 'ale-001',
    ruleId: 'ar-4',
    deviceId: 'dev-stm32-003',
    deviceName: 'Robotics Workshop Air Monitor',
    title: 'Robotics VOC Spike Detected',
    message: 'Particulate AQI reached 128 (Threshold: 120 AQI) during laser cutting cycle.',
    severity: 'WARNING',
    status: 'ACKNOWLEDGED',
    currentValue: 128,
    thresholdValue: 120,
    triggeredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    acknowledgedBy: 'Elena Rostova',
    notes: 'Exhaust fan kicked on automatically. Verified ventilation flow is clear.',
  },
  {
    id: 'ale-002',
    ruleId: 'ar-2',
    deviceId: 'dev-mkr-004',
    deviceName: 'Cold Storage Vault Logger',
    title: 'Cold Storage Vault Door Left Ajar',
    message: 'Vault temperature drifted up to -1.2°C briefly during inventory restock.',
    severity: 'WARNING',
    status: 'RESOLVED',
    currentValue: -1.2,
    thresholdValue: 0.0,
    triggeredAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    acknowledgedBy: 'Marcus Chen',
    resolvedAt: new Date(Date.now() - 3.2 * 3600 * 1000).toISOString(),
    resolvedBy: 'Marcus Chen',
    notes: 'Access hatch secured; temperature re-stabilized to -4.2°C within 15 minutes.',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    actor: 'Alex Vance',
    actorRole: 'OWNER',
    action: 'DEVICE_COMMAND_DISPATCH',
    category: 'COMMAND',
    details: 'Dispatched {"fan_speed": 45} to Server Room Climate Pod via MQTT.',
    targetId: 'dev-esp32-001',
    severity: 'INFO',
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    actor: 'Elena Rostova',
    actorRole: 'ENGINEER',
    action: 'ALERT_ACKNOWLEDGE',
    category: 'ALERT',
    details: 'Acknowledged alert ale-001 (Robotics VOC Spike).',
    targetId: 'ale-001',
    severity: 'INFO',
  },
  {
    id: 'aud-003',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actor: 'SYSTEM_AUTOMATION',
    actorRole: 'ENGINEER',
    action: 'AUTOMATION_EXECUTION',
    category: 'AUTOMATION',
    details: 'Rule "Server Thermal Protection Blower" executed actions [SEND_COMMAND, CREATE_ALERT].',
    targetId: 'auto-1',
    severity: 'WARNING',
  },
  {
    id: 'aud-004',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    actor: 'Marcus Chen',
    actorRole: 'ADMIN',
    action: 'DIGITAL_TWIN_UPDATE',
    category: 'DEVICE',
    details: 'Updated desired state for Hydroponics Automation Hub (led_brightness: 80).',
    targetId: 'dev-pi-002',
    severity: 'INFO',
  },
  {
    id: 'aud-005',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    actor: 'Alex Vance',
    actorRole: 'OWNER',
    action: 'DEVICE_REGISTERED',
    category: 'DEVICE',
    details: 'Registered new device "Roof Weather & Solar Node" (nRF9160).',
    targetId: 'dev-nrf-005',
    severity: 'INFO',
  },
];

// Helper to generate 24 historical telemetry points for a device
export function generateDeviceHistoricalTelemetry(deviceId: string, hours = 24): TelemetryRecord[] {
  const points: TelemetryRecord[] = [];
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / 24;

  let baseTemp = 21.0;
  let baseHum = 45.0;
  let basePress = 1013.0;
  let baseAqi = 25;

  if (deviceId === 'dev-pi-002') {
    baseTemp = 26.5;
    baseHum = 70.0;
    baseAqi = 18;
  } else if (deviceId === 'dev-stm32-003') {
    baseTemp = 23.2;
    baseHum = 48.0;
    baseAqi = 40;
  } else if (deviceId === 'dev-mkr-004') {
    baseTemp = -4.5;
    baseHum = 84.0;
    baseAqi = 10;
  } else if (deviceId === 'dev-nrf-005') {
    baseTemp = 18.0;
    baseHum = 56.0;
    baseAqi = 15;
  }

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now - i * stepMs);
    const noiseT = Math.sin((24 - i) / 3) * 1.5 + (Math.random() * 0.4 - 0.2);
    const noiseH = Math.cos((24 - i) / 4) * 3.2 + (Math.random() * 0.8 - 0.4);
    const noiseP = Math.sin((24 - i) / 6) * 2.0;
    const noiseA = Math.max(5, Math.floor(baseAqi + Math.sin(i / 2) * 8 + (Math.random() * 4 - 2)));

    points.push({
      id: `tel-${deviceId}-${i}`,
      deviceId,
      timestamp: time.toISOString(),
      temperature: Number((baseTemp + noiseT).toFixed(2)),
      humidity: Number(Math.min(100, Math.max(10, baseHum + noiseH)).toFixed(1)),
      pressure: Number((basePress + noiseP).toFixed(1)),
      airQuality: noiseA,
      lightLux: Math.max(0, Math.floor(350 + Math.sin((24 - i) / 3.8) * 300)),
      voltage: 12.0 + Number((Math.random() * 0.15 - 0.05).toFixed(2)),
      powerWatts: Math.max(10, Math.floor(180 + Math.random() * 40)),
      battery: 100 - Math.floor(i * 0.1),
      rssi: -50 - Math.floor(Math.random() * 12),
      quality: 'GOOD',
    });
  }

  return points;
}
