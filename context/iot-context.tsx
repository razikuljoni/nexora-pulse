'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Device,
  TelemetryRecord,
  DeviceCommand,
  AutomationRule,
  AutomationExecutionTrace,
  AlertRule,
  AlertEvent,
  Organization,
  LocationZone,
  OrganizationMember,
  AuditLog,
  MQTTStreamMessage,
  NotificationItem,
  UserRole,
  DeviceStatus,
  DeviceType
} from '@/types';
import {
  INITIAL_ORGANIZATION,
  INITIAL_MEMBERS,
  INITIAL_ZONES,
  INITIAL_DEVICES,
  INITIAL_AUTOMATIONS,
  INITIAL_ALERT_RULES,
  INITIAL_ALERT_EVENTS,
  INITIAL_AUDIT_LOGS,
  generateDeviceHistoricalTelemetry,
} from '@/lib/mock-data';

interface IoTContextType {
  // Organization & User
  organization: Organization;
  members: OrganizationMember[];
  currentMember: OrganizationMember;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  setCurrentMemberRole: (role: UserRole) => void;
  inviteMember: (name: string, email: string, role: UserRole) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (memberId: string, role: UserRole) => void;

  // Devices
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  registerDevice: (deviceData: {
    name: string;
    type: DeviceType;
    location: string;
    zone: string;
    tags: string[];
    firmwareVersion?: string;
  }) => Device;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  toggleDeviceActuator: (deviceId: string, actuatorId: string, value: boolean | number) => void;
  triggerBatchActuator: (actuatorId: string, value: boolean | number) => void;
  rebootAllDevices: () => void;
  updateDeviceSensorManual: (deviceId: string, sensorId: string, value: number) => void;

  // Telemetry
  telemetryHistory: Record<string, TelemetryRecord[]>;
  latestTelemetry: Record<string, TelemetryRecord>;

  // Digital Twin
  updateDesiredTwin: (deviceId: string, patch: Record<string, any>) => void;
  syncTwinReportedState: (deviceId: string, patch: Record<string, any>) => void;

  // Commands
  commands: DeviceCommand[];
  sendCommand: (deviceId: string, payload: Record<string, any>) => Promise<DeviceCommand>;

  // Automations
  automations: AutomationRule[];
  executionTraces: AutomationExecutionTrace[];
  addAutomation: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'executionCount' | 'version'>) => void;
  updateAutomation: (id: string, updates: Partial<AutomationRule>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  testRunAutomation: (ruleId: string, testValues?: Record<string, any>) => AutomationExecutionTrace;

  // Alerts
  alertRules: AlertRule[];
  alertEvents: AlertEvent[];
  addAlertRule: (rule: Omit<AlertRule, 'id'>) => void;
  deleteAlertRule: (id: string) => void;
  toggleAlertRule: (id: string) => void;
  acknowledgeAlert: (eventId: string, note?: string) => void;
  resolveAlert: (eventId: string, note?: string) => void;

  // Locations & Zones
  zones: LocationZone[];
  addZone: (zone: Omit<LocationZone, 'id' | 'devicesCount' | 'ambientTempAvg' | 'ambientHumidityAvg' | 'airQualityAvg' | 'safetyStatus'>) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'actor' | 'actorRole'>) => void;

  // MQTT Stream
  mqttStream: MQTTStreamMessage[];
  clearMqttStream: () => void;
  publishRawMqtt: (topic: string, payload: Record<string, any>) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Hardware Simulator Controls
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
  isSimulating: boolean;
  setIsSimulating: (active: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  triggerManualSpike: (deviceId: string, metric: 'temperature' | 'humidity' | 'airQuality', value: number) => void;
  toggleDeviceOnlineStatus: (deviceId: string) => void;

  // Theme & Navigation
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
}

const IoTContext = createContext<IoTContextType | null>(null);

export function IoTProvider({ children }: { children: React.ReactNode }) {
  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Organization & User
  const [organization, setOrganization] = useState<Organization>(INITIAL_ORGANIZATION);
  const [members, setMembers] = useState<OrganizationMember[]>(INITIAL_MEMBERS);
  const [currentMember, setCurrentMember] = useState<OrganizationMember>(INITIAL_MEMBERS[0]);

  // Devices & Zones
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [zones, setZones] = useState<LocationZone[]>(INITIAL_ZONES);

  // Telemetry buffer: deviceId -> array of points
  const [telemetryHistory, setTelemetryHistory] = useState<Record<string, TelemetryRecord[]>>(() => {
    const initial: Record<string, TelemetryRecord[]> = {};
    INITIAL_DEVICES.forEach((dev) => {
      initial[dev.id] = generateDeviceHistoricalTelemetry(dev.id, 24);
    });
    return initial;
  });

  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, TelemetryRecord>>(() => {
    const initial: Record<string, TelemetryRecord> = {};
    INITIAL_DEVICES.forEach((dev) => {
      const hist = generateDeviceHistoricalTelemetry(dev.id, 24);
      initial[dev.id] = hist[hist.length - 1];
    });
    return initial;
  });

  // Commands
  const [commands, setCommands] = useState<DeviceCommand[]>(() => [
    {
      id: 'cmd-initial-1',
      deviceId: 'dev-esp32-001',
      deviceName: 'Server Room Climate Pod',
      topic: 'nexora/org-nexora-alpha/dev-esp32-001/command',
      payload: { fan_speed: 45 },
      sender: 'Alex Vance',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 9.9 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 9.8 * 60 * 1000).toISOString(),
      responsePayload: { status: 'OK', applied_speed: 45, rpm: 2240 },
    }
  ]);

  // Automations & Traces
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [executionTraces, setExecutionTraces] = useState<AutomationExecutionTrace[]>(() => [
    {
      id: 'trace-init-1',
      ruleId: 'auto-1',
      ruleName: 'Server Thermal Protection Blower',
      triggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'SUCCESS',
      triggerReason: 'Telemetry temp (28.4°C) > threshold (28.0°C)',
      evaluatedValues: { temperature: 28.4, threshold: 28.0 },
      executedActions: ['SEND_COMMAND: {"fan_speed": 90}', 'CREATE_ALERT: CRITICAL', 'SEND_NOTIFICATION'],
      executionTimeMs: 14.2,
    }
  ]);

  // Alerts
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>(INITIAL_ALERT_EVENTS);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // MQTT Stream
  const [mqttStream, setMqttStream] = useState<MQTTStreamMessage[]>(() => [
    {
      id: 'mqtt-init-1',
      timestamp: new Date().toISOString(),
      topic: 'nexora/org-nexora-alpha/dev-esp32-001/telemetry',
      payload: { temp: 21.4, hum: 42.8, press: 1013.2, aqi: 24, v_bus: 12.08 },
      direction: 'INBOUND',
      qos: 0,
      deviceId: 'dev-esp32-001'
    }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    {
      id: 'notif-1',
      title: 'Alert: Robotics VOC Spike',
      message: 'Particulate AQI reached 128 (Threshold: 120 AQI).',
      category: 'ALERT',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      unread: true,
      deviceId: 'dev-stm32-003',
      severity: 'WARNING',
    },
    {
      id: 'notif-2',
      title: 'Automation Triggered',
      message: 'Rule "Server Thermal Protection Blower" executed automatically.',
      category: 'AUTOMATION',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      unread: false,
      deviceId: 'dev-esp32-001',
    }
  ]);

  // Simulator controls
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Keep refs for callbacks in interval
  const devicesRef = useRef(devices);
  const automationsRef = useRef(automations);
  const alertRulesRef = useRef(alertRules);
  const alertEventsRef = useRef(alertEvents);

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  useEffect(() => {
    automationsRef.current = automations;
  }, [automations]);

  useEffect(() => {
    alertRulesRef.current = alertRules;
  }, [alertRules]);

  useEffect(() => {
    alertEventsRef.current = alertEvents;
  }, [alertEvents]);

  // Toggle theme class on HTML element
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (next === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      }
      return next;
    });
  }, []);

  // Add audit log helper
  const addAuditLog = useCallback((entry: Omit<AuditLog, 'id' | 'timestamp' | 'actor' | 'actorRole'>) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor: currentMember.name,
      actorRole: currentMember.role,
      ...entry,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  }, [currentMember]);

  // Member role switcher
  const setCurrentMemberRole = useCallback((role: UserRole) => {
    setCurrentMember((prev) => ({ ...prev, role }));
    addAuditLog({
      action: 'USER_ROLE_SWITCHED',
      category: 'SECURITY',
      details: `Switched active preview role to ${role}`,
      severity: 'INFO',
    });
  }, [addAuditLog]);

  const updateMemberRole = useCallback((memberId: string, role: UserRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
    addAuditLog({
      action: 'MEMBER_ROLE_UPDATED',
      category: 'SECURITY',
      details: `Updated role for member ${memberId} to ${role}`,
      severity: 'INFO',
    });
  }, [addAuditLog]);

  const inviteMember = useCallback((name: string, email: string, role: UserRole) => {
    const newM: OrganizationMember = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
      joinedAt: new Date().toISOString(),
      status: 'INVITED',
    };
    setMembers((prev) => [...prev, newM]);
    addAuditLog({
      action: 'MEMBER_INVITED',
      category: 'ORGANIZATION',
      details: `Invited ${name} (${email}) with role ${role}.`,
      severity: 'INFO',
    });
  }, [addAuditLog]);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    addAuditLog({
      action: 'MEMBER_REMOVED',
      category: 'ORGANIZATION',
      details: `Removed member ID: ${id}`,
      severity: 'WARNING',
    });
  }, [addAuditLog]);

  // Register device
  const registerDevice = useCallback((deviceData: {
    name: string;
    type: DeviceType;
    location: string;
    zone: string;
    tags: string[];
    firmwareVersion?: string;
  }): Device => {
    const devId = `dev-${deviceData.type.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const slug = deviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const token = `nxt_live_${Math.random().toString(36).substr(2, 16)}`;
    const mac = `24:0A:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`;

    const newDev: Device = {
      id: devId,
      name: deviceData.name,
      slug,
      type: deviceData.type,
      status: 'ONLINE',
      firmwareVersion: deviceData.firmwareVersion || 'v1.0.0-release',
      macAddress: mac,
      ipAddress: `192.168.10.${Math.floor(Math.random() * 150 + 50)}`,
      location: deviceData.location,
      zone: deviceData.zone,
      lastSeen: new Date().toISOString(),
      uptimeSeconds: 120,
      batteryLevel: 100,
      signalDbm: -55,
      tags: deviceData.tags.length ? deviceData.tags : ['MQTT', 'Sensors'],
      mqttTopicPrefix: `nexora/${organization.id}/${devId}`,
      authToken: token,
      createdAt: new Date().toISOString(),
      isSimulated: true,
      sensors: [
        { id: `s-temp-${devId}`, name: 'Temperature', type: 'temperature', unit: '°C', minRange: -20, maxRange: 80, currentValue: 22.5, quality: 'GOOD' },
        { id: `s-hum-${devId}`, name: 'Humidity', type: 'humidity', unit: '%', minRange: 0, maxRange: 100, currentValue: 45.0, quality: 'GOOD' },
        { id: `s-press-${devId}`, name: 'Barometer', type: 'pressure', unit: 'hPa', minRange: 800, maxRange: 1200, currentValue: 1013.25, quality: 'GOOD' },
        { id: `s-aqi-${devId}`, name: 'Air Quality', type: 'air_quality', unit: 'AQI', minRange: 0, maxRange: 500, currentValue: 25, quality: 'GOOD' },
      ],
      actuators: [
        { id: `act-r1-${devId}`, name: 'Relay Switch 1', type: 'relay', state: false },
        { id: `act-fan-${devId}`, name: 'PWM Fan Speed', type: 'pwm_fan', state: 0, unit: '%', min: 0, max: 100 },
      ],
      twin: {
        desired: {
          relay_1: false,
          fan_speed: 0,
          interval_sec: 5
        },
        reported: {
          relay_1: false,
          fan_speed: 0,
          interval_sec: 5,
          temp: 22.5
        },
        lastSyncedAt: new Date().toISOString(),
        version: 1,
        inSync: true,
      }
    };

    setDevices((prev) => [newDev, ...prev]);
    setTelemetryHistory((prev) => ({
      ...prev,
      [newDev.id]: generateDeviceHistoricalTelemetry(newDev.id, 24),
    }));
    setLatestTelemetry((prev) => ({
      ...prev,
      [newDev.id]: {
        id: `tel-${newDev.id}-0`,
        deviceId: newDev.id,
        timestamp: new Date().toISOString(),
        temperature: 22.5,
        humidity: 45.0,
        pressure: 1013.2,
        airQuality: 25,
        lightLux: 400,
        voltage: 12.0,
        powerWatts: 85,
        battery: 100,
        rssi: -55,
        quality: 'GOOD',
      }
    }));

    setOrganization((prev) => ({
      ...prev,
      activeDevicesCount: prev.activeDevicesCount + 1,
    }));

    addAuditLog({
      action: 'DEVICE_REGISTERED',
      category: 'DEVICE',
      details: `Registered new IoT node "${deviceData.name}" (${deviceData.type}) in ${deviceData.zone}.`,
      targetId: devId,
      severity: 'INFO',
    });

    return newDev;
  }, [organization.id, addAuditLog]);

  const updateDevice = useCallback((id: string, updates: Partial<Device>) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    if (selectedDevice?.id === id) {
      setSelectedDevice((prev) => (prev ? { ...prev, ...updates } : null));
    }
    addAuditLog({
      action: 'DEVICE_UPDATED',
      category: 'DEVICE',
      details: `Updated metadata for device ID ${id}.`,
      targetId: id,
      severity: 'INFO',
    });
  }, [selectedDevice, addAuditLog]);

  const deleteDevice = useCallback((id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    if (selectedDevice?.id === id) setSelectedDevice(null);
    setOrganization((prev) => ({
      ...prev,
      activeDevicesCount: Math.max(0, prev.activeDevicesCount - 1),
    }));
    addAuditLog({
      action: 'DEVICE_DELETED',
      category: 'DEVICE',
      details: `Deleted device ID ${id} from workspace.`,
      targetId: id,
      severity: 'WARNING',
    });
  }, [selectedDevice, addAuditLog]);

  // Toggle Actuator directly
  const toggleDeviceActuator = useCallback((deviceId: string, actuatorId: string, value: boolean | number) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const updatedActuators = d.actuators.map((act) =>
          act.id === actuatorId ? { ...act, state: value } : act
        );
        // Also update twin reported state
        const updatedReported = {
          ...d.twin.reported,
          [actuatorId]: value,
        };
        const updatedDesired = {
          ...d.twin.desired,
          [actuatorId]: value,
        };
        return {
          ...d,
          actuators: updatedActuators,
          twin: {
            ...d.twin,
            desired: updatedDesired,
            reported: updatedReported,
            lastSyncedAt: new Date().toISOString(),
            version: d.twin.version + 1,
            inSync: true,
          }
        };
      })
    );

    // Emit MQTT state message
    const msgId = `mqtt-${Date.now()}`;
    const topic = `nexora/${organization.id}/${deviceId}/state`;
    const payload = { actuator: actuatorId, state: value, timestamp: new Date().toISOString() };
    setMqttStream((prev) => [
      { id: msgId, timestamp: new Date().toISOString(), topic, payload, direction: 'OUTBOUND', qos: 1, deviceId },
      ...prev.slice(0, 99)
    ]);

    addAuditLog({
      action: 'ACTUATOR_TOGGLE',
      category: 'COMMAND',
      details: `Set actuator "${actuatorId}" on device ${deviceId} to ${String(value)}.`,
      targetId: deviceId,
      severity: 'INFO',
    });
  }, [organization.id, addAuditLog]);

  // Batch actuator trigger
  const triggerBatchActuator = useCallback((actuatorId: string, value: boolean | number) => {
    devicesRef.current.forEach((dev) => {
      const hasActuator = dev.actuators.some((a) => a.id === actuatorId || a.type === 'relay');
      if (hasActuator && dev.status !== 'OFFLINE') {
        toggleDeviceActuator(dev.id, actuatorId, value);
      }
    });
    addAuditLog({
      action: 'BATCH_ACTUATOR_TOGGLE',
      category: 'COMMAND',
      details: `Dispatched batch actuator ${actuatorId} = ${String(value)} across fleet.`,
      severity: 'INFO',
    });
  }, [toggleDeviceActuator, addAuditLog]);

  // Manual sensor update from simulator workbench
  const updateDeviceSensorManual = useCallback((deviceId: string, sensorId: string, value: number) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        return {
          ...d,
          sensors: d.sensors.map((s) => (s.id === sensorId ? { ...s, lastValue: value } : s)),
        };
      })
    );
  }, []);

  // Send Command Pipeline
  const sendCommand = useCallback(async (deviceId: string, payload: Record<string, any>): Promise<DeviceCommand> => {
    const dev = devicesRef.current.find((d) => d.id === deviceId);
    const cmdId = `cmd-${Date.now()}`;
    const topic = `nexora/${organization.id}/${deviceId}/command`;

    const newCmd: DeviceCommand = {
      id: cmdId,
      deviceId,
      deviceName: dev?.name || deviceId,
      topic,
      payload,
      sender: currentMember.name,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };

    setCommands((prev) => [newCmd, ...prev.slice(0, 99)]);

    // Emit MQTT Outbound
    setMqttStream((prev) => [
      {
        id: `mqtt-${Date.now()}-out`,
        timestamp: new Date().toISOString(),
        topic,
        payload,
        direction: 'OUTBOUND',
        qos: 1,
        deviceId
      },
      ...prev.slice(0, 99)
    ]);

    addAuditLog({
      action: 'COMMAND_PUBLISHED',
      category: 'COMMAND',
      details: `Dispatched command to ${dev?.name || deviceId}: ${JSON.stringify(payload)}`,
      targetId: deviceId,
      severity: 'INFO',
    });

    // Simulate Device ACK & Execution after 350ms
    return new Promise((resolve) => {
      setTimeout(() => {
        const completedAt = new Date().toISOString();
        const ackedCmd: DeviceCommand = {
          ...newCmd,
          status: 'COMPLETED',
          acknowledgedAt: new Date(Date.now() - 100).toISOString(),
          completedAt,
          responsePayload: {
            status: 'OK',
            code: 200,
            executedAt: completedAt,
            applied: payload,
          }
        };

        setCommands((prev) => prev.map((c) => (c.id === cmdId ? ackedCmd : c)));

        // Update device twin reported state with the command payload keys
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id !== deviceId) return d;
            const updatedReported = { ...d.twin.reported, ...payload };
            const updatedDesired = { ...d.twin.desired, ...payload };
            return {
              ...d,
              twin: {
                ...d.twin,
                desired: updatedDesired,
                reported: updatedReported,
                lastSyncedAt: completedAt,
                version: d.twin.version + 1,
                inSync: true,
              }
            };
          })
        );

        // Emit MQTT Inbound ACK
        setMqttStream((prev) => [
          {
            id: `mqtt-${Date.now()}-ack`,
            timestamp: completedAt,
            topic: `nexora/${organization.id}/${deviceId}/status`,
            payload: { commandId: cmdId, execution: 'SUCCESS', response: ackedCmd.responsePayload },
            direction: 'INBOUND',
            qos: 1,
            deviceId
          },
          ...prev.slice(0, 99)
        ]);

        resolve(ackedCmd);
      }, 350);
    });
  }, [organization.id, currentMember, addAuditLog]);

  // Reboot all devices
  const rebootAllDevices = useCallback(() => {
    devicesRef.current.forEach((dev) => {
      if (dev.status !== 'OFFLINE') {
        sendCommand(dev.id, { action: 'REBOOT_MCU', force: true });
      }
    });
    addAuditLog({
      action: 'FLEET_REBOOT_TRIGGERED',
      category: 'COMMAND',
      details: 'Dispatched hardware restart sequence to all active nodes.',
      severity: 'WARNING',
    });
  }, [sendCommand, addAuditLog]);

  // Digital twin desired state update
  const updateDesiredTwin = useCallback((deviceId: string, patch: Record<string, any>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const newDesired = { ...d.twin.desired, ...patch };
        const inSync = JSON.stringify(newDesired) === JSON.stringify(d.twin.reported);
        return {
          ...d,
          twin: {
            ...d.twin,
            desired: newDesired,
            version: d.twin.version + 1,
            inSync,
          }
        };
      })
    );

    addAuditLog({
      action: 'DIGITAL_TWIN_DESIRED_UPDATED',
      category: 'DEVICE',
      details: `Updated desired twin delta for device ${deviceId}: ${JSON.stringify(patch)}`,
      targetId: deviceId,
      severity: 'INFO',
    });

    // Also auto-dispatch command to reconcile
    sendCommand(deviceId, patch);
  }, [addAuditLog, sendCommand]);

  const syncTwinReportedState = useCallback((deviceId: string, patch: Record<string, any>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const newReported = { ...d.twin.reported, ...patch };
        const inSync = JSON.stringify(d.twin.desired) === JSON.stringify(newReported);
        return {
          ...d,
          twin: {
            ...d.twin,
            reported: newReported,
            lastSyncedAt: new Date().toISOString(),
            version: d.twin.version + 1,
            inSync,
          }
        };
      })
    );
  }, []);

  // Automations CRUD
  const addAutomation = useCallback((ruleData: Omit<AutomationRule, 'id' | 'createdAt' | 'executionCount' | 'version'>) => {
    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      createdAt: new Date().toISOString(),
      executionCount: 0,
      version: 1,
      ...ruleData,
    };
    setAutomations((prev) => [newRule, ...prev]);
    addAuditLog({
      action: 'AUTOMATION_CREATED',
      category: 'AUTOMATION',
      details: `Created automation rule "${newRule.name}".`,
      targetId: newRule.id,
      severity: 'INFO',
    });
  }, [addAuditLog]);

  const updateAutomation = useCallback((id: string, updates: Partial<AutomationRule>) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, version: a.version + 1 } : a))
    );
    addAuditLog({
      action: 'AUTOMATION_UPDATED',
      category: 'AUTOMATION',
      details: `Updated automation rule ID: ${id}.`,
      targetId: id,
      severity: 'INFO',
    });
  }, [addAuditLog]);

  const deleteAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    addAuditLog({
      action: 'AUTOMATION_DELETED',
      category: 'AUTOMATION',
      details: `Deleted automation rule ID: ${id}.`,
      targetId: id,
      severity: 'WARNING',
    });
  }, [addAuditLog]);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  // Test run an automation rule
  const testRunAutomation = useCallback((ruleId: string, testValues?: Record<string, any>): AutomationExecutionTrace => {
    const rule = automationsRef.current.find((r) => r.id === ruleId);
    const startMs = performance.now();
    const evaluated: Record<string, any> = testValues || { temperature: 31.5, humidity: 82.0, airQuality: 95 };

    let passed = true;
    if (rule?.conditions && rule.conditions.length > 0) {
      if (rule.logic === 'AND') {
        passed = rule.conditions.every((cond) => {
          const val = evaluated[cond.metric] ?? 30.0;
          if (cond.operator === 'GREATER_THAN') return val > Number(cond.value);
          if (cond.operator === 'LESS_THAN') return val < Number(cond.value);
          if (cond.operator === 'EQUALS') return val === cond.value;
          return true;
        });
      } else {
        passed = rule.conditions.some((cond) => {
          const val = evaluated[cond.metric] ?? 30.0;
          if (cond.operator === 'GREATER_THAN') return val > Number(cond.value);
          if (cond.operator === 'LESS_THAN') return val < Number(cond.value);
          if (cond.operator === 'EQUALS') return val === cond.value;
          return true;
        });
      }
    }

    const executedActions: string[] = [];
    if (passed && rule) {
      rule.actions.forEach((act) => {
        if (act.type === 'SEND_COMMAND' && act.targetDeviceId) {
          executedActions.push(`SEND_COMMAND (${act.targetDeviceId}): ${JSON.stringify(act.commandPayload)}`);
          if (act.commandPayload) sendCommand(act.targetDeviceId, act.commandPayload);
        } else if (act.type === 'TOGGLE_ACTUATOR' && act.targetDeviceId && act.actuatorId) {
          executedActions.push(`TOGGLE_ACTUATOR (${act.actuatorId} -> ${String(act.targetState)})`);
          toggleDeviceActuator(act.targetDeviceId, act.actuatorId, act.targetState);
        } else if (act.type === 'CREATE_ALERT') {
          executedActions.push(`CREATE_ALERT: ${act.alertTitle || 'Threshold Warning'}`);
          const newAlert: AlertEvent = {
            id: `ale-${Date.now()}`,
            deviceId: rule.trigger.deviceId || 'dev-esp32-001',
            deviceName: 'Server Room Climate Pod',
            title: act.alertTitle || `Automated Alert: ${rule.name}`,
            message: `Automation "${rule.name}" triggered alert condition.`,
            severity: act.alertSeverity || 'WARNING',
            status: 'TRIGGERED',
            currentValue: evaluated['temperature'] || 31.5,
            thresholdValue: typeof rule.conditions[0]?.value === 'boolean' ? String(rule.conditions[0]?.value) : (rule.conditions[0]?.value ?? 28.0),
            triggeredAt: new Date().toISOString(),
          };
          setAlertEvents((prev) => [newAlert, ...prev]);
        } else if (act.type === 'SEND_NOTIFICATION') {
          executedActions.push(`SEND_NOTIFICATION: ${act.notificationText || 'Rule fired'}`);
          setNotifications((prev) => [
            {
              id: `notif-${Date.now()}`,
              title: `Automation: ${rule.name}`,
              message: act.notificationText || 'Executed automated action sequence.',
              category: 'AUTOMATION',
              timestamp: new Date().toISOString(),
              unread: true,
              deviceId: rule.trigger.deviceId,
            },
            ...prev
          ]);
        }
      });

      // Update execution count on rule
      setAutomations((prev) =>
        prev.map((r) =>
          r.id === ruleId
            ? { ...r, executionCount: r.executionCount + 1, lastTriggeredAt: new Date().toISOString() }
            : r
        )
      );
    }

    const duration = Number((performance.now() - startMs).toFixed(1));
    const trace: AutomationExecutionTrace = {
      id: `trace-${Date.now()}`,
      ruleId,
      ruleName: rule?.name || 'Unknown Rule',
      triggeredAt: new Date().toISOString(),
      status: passed ? 'SUCCESS' : 'CONDITION_NOT_MET',
      triggerReason: passed ? 'Rule conditions validated true' : 'Condition criteria not met',
      evaluatedValues: evaluated,
      executedActions: passed ? executedActions : [],
      executionTimeMs: Math.max(1.2, duration),
    };

    setExecutionTraces((prev) => [trace, ...prev.slice(0, 49)]);
    return trace;
  }, [sendCommand, toggleDeviceActuator]);

  // Alerts Management
  const addAlertRule = useCallback((ruleData: Omit<AlertRule, 'id'>) => {
    const newR: AlertRule = { id: `ar-${Date.now()}`, ...ruleData };
    setAlertRules((prev) => [...prev, newR]);
  }, []);

  const deleteAlertRule = useCallback((id: string) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleAlertRule = useCallback((id: string) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const acknowledgeAlert = useCallback((eventId: string, note?: string) => {
    setAlertEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              status: 'ACKNOWLEDGED',
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: currentMember.name,
              notes: note || ev.notes || 'Acknowledged by operator in Incident Center.',
            }
          : ev
      )
    );
    addAuditLog({
      action: 'ALERT_ACKNOWLEDGED',
      category: 'ALERT',
      details: `Acknowledged incident event ID ${eventId}.`,
      targetId: eventId,
      severity: 'INFO',
    });
  }, [currentMember, addAuditLog]);

  const resolveAlert = useCallback((eventId: string, note?: string) => {
    setAlertEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              status: 'RESOLVED',
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentMember.name,
              notes: note ? `${ev.notes ? ev.notes + ' | ' : ''}${note}` : ev.notes || 'Resolved issue.',
            }
          : ev
      )
    );
    addAuditLog({
      action: 'ALERT_RESOLVED',
      category: 'ALERT',
      details: `Resolved alert incident event ID ${eventId}.`,
      targetId: eventId,
      severity: 'INFO',
    });
  }, [currentMember, addAuditLog]);

  // Zones
  const addZone = useCallback((zoneData: Omit<LocationZone, 'id' | 'devicesCount' | 'ambientTempAvg' | 'ambientHumidityAvg' | 'airQualityAvg' | 'safetyStatus'>) => {
    const newZ: LocationZone = {
      id: `zone-${Date.now()}`,
      ...zoneData,
      devicesCount: 0,
      ambientTempAvg: 22.0,
      ambientHumidityAvg: 50.0,
      airQualityAvg: 25,
      safetyStatus: 'OPTIMAL',
    };
    setZones((prev) => [...prev, newZ]);
  }, []);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  // MQTT
  const clearMqttStream = useCallback(() => {
    setMqttStream([]);
  }, []);

  const publishRawMqtt = useCallback((topic: string, payload: Record<string, any>) => {
    const msgId = `mqtt-${Date.now()}`;
    setMqttStream((prev) => [
      { id: msgId, timestamp: new Date().toISOString(), topic, payload, direction: 'OUTBOUND', qos: 1 },
      ...prev.slice(0, 99)
    ]);
  }, []);

  // Simulator controls
  const triggerManualSpike = useCallback((deviceId: string, metric: 'temperature' | 'humidity' | 'airQuality', value: number) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const updatedSensors = d.sensors.map((s) => {
          if (s.type === metric) {
            return { ...s, currentValue: value };
          }
          return s;
        });
        return { ...d, sensors: updatedSensors };
      })
    );

    // Update telemetry
    const nowIso = new Date().toISOString();
    setLatestTelemetry((prev) => {
      const current = prev[deviceId] || {
        id: `tel-${deviceId}-${Date.now()}`,
        deviceId,
        timestamp: nowIso,
        temperature: 22.0,
        humidity: 50.0,
        pressure: 1013.2,
        airQuality: 25,
        lightLux: 350,
        voltage: 12.0,
        powerWatts: 80,
        battery: 100,
        rssi: -55,
        quality: 'GOOD',
      };
      const updated: TelemetryRecord = {
        ...current,
        timestamp: nowIso,
        [metric === 'airQuality' ? 'airQuality' : metric]: value,
      };
      return { ...prev, [deviceId]: updated };
    });

    // Check automations for this device
    automationsRef.current.forEach((rule) => {
      if (rule.enabled && (rule.trigger.deviceId === deviceId || !rule.trigger.deviceId)) {
        if (rule.trigger.metric === metric || !rule.trigger.metric) {
          testRunAutomation(rule.id, { [metric]: value });
        }
      }
    });

    // Check alert rules
    alertRulesRef.current.forEach((rule) => {
      if (rule.enabled && (rule.deviceId === deviceId || !rule.deviceId) && rule.metric === metric) {
        let breached = false;
        if (rule.operator === 'GREATER_THAN' && value > rule.threshold) breached = true;
        if (rule.operator === 'LESS_THAN' && value < rule.threshold) breached = true;

        if (breached) {
          const newAlert: AlertEvent = {
            id: `ale-${Date.now()}`,
            ruleId: rule.id,
            deviceId,
            deviceName: devicesRef.current.find((d) => d.id === deviceId)?.name || deviceId,
            title: `Threshold Breach: ${rule.name}`,
            message: `${metric} spiked to ${value} (Threshold: ${rule.threshold}).`,
            severity: rule.severity,
            status: 'TRIGGERED',
            currentValue: value,
            thresholdValue: rule.threshold,
            triggeredAt: nowIso,
          };
          setAlertEvents((prev) => [newAlert, ...prev]);
        }
      }
    });

    // Emit MQTT packet
    const topic = `nexora/${organization.id}/${deviceId}/telemetry`;
    setMqttStream((prev) => [
      {
        id: `mqtt-${Date.now()}-spike`,
        timestamp: nowIso,
        topic,
        payload: { [metric]: value, simulatedSpike: true },
        direction: 'INBOUND',
        qos: 0,
        deviceId
      },
      ...prev.slice(0, 99)
    ]);
  }, [organization.id, testRunAutomation]);

  const toggleDeviceOnlineStatus = useCallback((deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const newStatus: DeviceStatus = d.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        return {
          ...d,
          status: newStatus,
          lastSeen: new Date().toISOString(),
        };
      })
    );

    const dev = devicesRef.current.find((d) => d.id === deviceId);
    const newStatus = dev?.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    const topic = `nexora/${organization.id}/${deviceId}/status`;
    setMqttStream((prev) => [
      {
        id: `mqtt-${Date.now()}-status`,
        timestamp: new Date().toISOString(),
        topic,
        payload: { status: newStatus, deviceId },
        direction: 'INBOUND',
        qos: 1,
        deviceId
      },
      ...prev.slice(0, 99)
    ]);

    addAuditLog({
      action: newStatus === 'ONLINE' ? 'DEVICE_ONLINE' : 'DEVICE_OFFLINE',
      category: 'DEVICE',
      details: `Device ${dev?.name || deviceId} transition to ${newStatus}.`,
      targetId: deviceId,
      severity: newStatus === 'ONLINE' ? 'INFO' : 'WARNING',
    });
  }, [organization.id, addAuditLog]);

  // MAIN CONTINUOUS REALTIME TELEMETRY ENGINE LOOP
  useEffect(() => {
    if (!simulationActive) return;

    const intervalMs = Math.max(500, Math.floor(2500 / simulationSpeed));
    const interval = setInterval(() => {
      const onlineDevices = devicesRef.current.filter((d) => d.status === 'ONLINE' && d.isSimulated);
      if (onlineDevices.length === 0) return;

      const now = new Date();
      const nowIso = now.toISOString();

      // Pick 1-2 random devices to tick every interval
      const sampledDevs = onlineDevices.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, onlineDevices.length));

      sampledDevs.forEach((dev) => {
        // Compute subtle random walk
        const deltaTemp = (Math.random() * 0.4 - 0.2);
        const deltaHum = (Math.random() * 0.8 - 0.4);
        const deltaPress = (Math.random() * 0.2 - 0.1);

        let curTemp = 22.0;
        let curHum = 45.0;
        let curPress = 1013.2;
        let curAqi = 25;
        let curVolt = 12.0;
        let curPwr = 100;

        // Update sensors in device state
        const updatedSensors = dev.sensors.map((s) => {
          let nv = s.currentValue;
          if (s.type === 'temperature') {
            nv = Number(Math.max(s.minRange, Math.min(s.maxRange, s.currentValue + deltaTemp)).toFixed(2));
            curTemp = nv;
          } else if (s.type === 'humidity') {
            nv = Number(Math.max(s.minRange, Math.min(s.maxRange, s.currentValue + deltaHum)).toFixed(1));
            curHum = nv;
          } else if (s.type === 'pressure') {
            nv = Number(Math.max(s.minRange, Math.min(s.maxRange, s.currentValue + deltaPress)).toFixed(1));
            curPress = nv;
          } else if (s.type === 'air_quality') {
            const deltaAqi = Math.random() > 0.8 ? (Math.random() * 4 - 2) : 0;
            nv = Math.max(5, Math.min(500, Math.floor(s.currentValue + deltaAqi)));
            curAqi = nv;
          } else if (s.type === 'voltage') {
            curVolt = s.currentValue;
          } else if (s.type === 'power') {
            curPwr = s.currentValue;
          }
          return { ...s, currentValue: nv };
        });

        // Update device in state
        setDevices((prev) =>
          prev.map((d) =>
            d.id === dev.id
              ? {
                  ...d,
                  lastSeen: nowIso,
                  uptimeSeconds: d.uptimeSeconds + Math.floor(intervalMs / 1000),
                  sensors: updatedSensors,
                  twin: {
                    ...d.twin,
                    reported: {
                      ...d.twin.reported,
                      temp_c: curTemp,
                      humidity_pct: curHum,
                      aqi: curAqi,
                    },
                    lastSyncedAt: nowIso,
                  }
                }
              : d
          )
        );

        // Create new Telemetry Record
        const record: TelemetryRecord = {
          id: `tel-${dev.id}-${Date.now()}`,
          deviceId: dev.id,
          timestamp: nowIso,
          temperature: curTemp,
          humidity: curHum,
          pressure: curPress,
          airQuality: curAqi,
          lightLux: Math.max(50, Math.floor(400 + Math.sin(Date.now() / 10000) * 150)),
          voltage: curVolt,
          powerWatts: curPwr,
          battery: dev.batteryLevel,
          rssi: dev.signalDbm + Math.floor(Math.random() * 4 - 2),
          quality: 'GOOD',
        };

        // Append to history buffer (cap at 60 points)
        setTelemetryHistory((prev) => {
          const current = prev[dev.id] || [];
          return {
            ...prev,
            [dev.id]: [...current.slice(-59), record],
          };
        });

        // Update latest
        setLatestTelemetry((prev) => ({
          ...prev,
          [dev.id]: record,
        }));

        // Emit MQTT Telemetry packet
        const topic = `nexora/${organization.id}/${dev.id}/telemetry`;
        setMqttStream((prev) => [
          {
            id: `mqtt-${Date.now()}-${dev.id}`,
            timestamp: nowIso,
            topic,
            payload: {
              t: curTemp,
              h: curHum,
              p: curPress,
              aqi: curAqi,
              v: curVolt,
              uptime: dev.uptimeSeconds,
            },
            direction: 'INBOUND',
            qos: 0,
            deviceId: dev.id,
          },
          ...prev.slice(0, 99)
        ]);

        // Increment ingested counter
        setOrganization((prev) => ({
          ...prev,
          totalTelemetryIngested: prev.totalTelemetryIngested + 1,
        }));
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simulationActive, simulationSpeed, organization.id]);

  return (
    <IoTContext.Provider
      value={{
        organization,
        members,
        currentMember,
        currentRole: currentMember.role,
        setCurrentRole: setCurrentMemberRole,
        setCurrentMemberRole,
        inviteMember,
        removeMember,
        updateMemberRole,
        devices,
        selectedDevice,
        setSelectedDevice,
        registerDevice,
        updateDevice,
        deleteDevice,
        toggleDeviceActuator,
        triggerBatchActuator,
        rebootAllDevices,
        updateDeviceSensorManual,
        telemetryHistory,
        latestTelemetry,
        updateDesiredTwin,
        syncTwinReportedState,
        commands,
        sendCommand,
        automations,
        executionTraces,
        addAutomation,
        updateAutomation,
        deleteAutomation,
        toggleAutomation,
        testRunAutomation,
        alertRules,
        alertEvents,
        addAlertRule,
        deleteAlertRule,
        toggleAlertRule,
        acknowledgeAlert,
        resolveAlert,
        zones,
        addZone,
        auditLogs,
        addAuditLog,
        mqttStream,
        clearMqttStream,
        publishRawMqtt,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        isSimulatorOpen,
        setIsSimulatorOpen,
        simulationActive,
        setSimulationActive,
        isSimulating: simulationActive,
        setIsSimulating: setSimulationActive,
        simulationSpeed,
        setSimulationSpeed,
        triggerManualSpike,
        toggleDeviceOnlineStatus,
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
}

export function useIoT() {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
}
