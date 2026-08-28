export type DeviceStatus = 
  | 'ONLINE' 
  | 'OFFLINE' 
  | 'SLEEPING' 
  | 'WARNING' 
  | 'CRITICAL' 
  | 'MAINTENANCE' 
  | 'UNKNOWN';

export type DeviceType = 
  | 'ESP32' 
  | 'RASPBERRY_PI' 
  | 'ARDUINO_MKR' 
  | 'STM32_NODE' 
  | 'NORDIC_NRF' 
  | 'CUSTOM_IOT';

export type TelemetryQuality = 'GOOD' | 'ESTIMATED' | 'INVALID' | 'MISSING';

export interface SensorMetadata {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'pressure' | 'air_quality' | 'light' | 'voltage' | 'power' | 'co2' | 'soil_moisture';
  unit: string;
  minRange: number;
  maxRange: number;
  currentValue: number;
  quality: TelemetryQuality;
}

export interface ActuatorMetadata {
  id: string;
  name: string;
  type: 'relay' | 'pwm_fan' | 'led_dimmer' | 'valve' | 'thermostat' | 'servo';
  state: boolean | number;
  unit?: string;
  min?: number;
  max?: number;
}

export interface DigitalTwinState {
  desired: Record<string, any>;
  reported: Record<string, any>;
  lastSyncedAt: string;
  version: number;
  inSync: boolean;
}

export interface Device {
  id: string;
  name: string;
  slug: string;
  type: DeviceType;
  status: DeviceStatus;
  firmwareVersion: string;
  macAddress: string;
  ipAddress: string;
  location: string;
  zone: string;
  lastSeen: string;
  uptimeSeconds: number;
  batteryLevel: number; // 0 - 100
  signalDbm: number; // e.g. -45 dBm (strong) to -90 dBm (weak)
  sensors: SensorMetadata[];
  actuators: ActuatorMetadata[];
  twin: DigitalTwinState;
  tags: string[];
  mqttTopicPrefix: string;
  authToken: string;
  createdAt: string;
  isSimulated?: boolean;
}

export interface TelemetryRecord {
  id: string;
  deviceId: string;
  timestamp: string;
  temperature: number; // °C
  humidity: number; // %
  pressure: number; // hPa
  airQuality: number; // AQI
  lightLux: number; // lx
  voltage: number; // V
  powerWatts: number; // W
  co2Ppm?: number; // ppm
  battery: number;
  rssi: number;
  quality: TelemetryQuality;
}

export type CommandStatus = 
  | 'PENDING' 
  | 'SENT' 
  | 'ACKNOWLEDGED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'TIMEOUT';

export interface DeviceCommand {
  id: string;
  deviceId: string;
  deviceName: string;
  topic: string;
  payload: Record<string, any>;
  sender: string;
  status: CommandStatus;
  createdAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
  responsePayload?: Record<string, any>;
  error?: string;
}

export type TriggerType = 
  | 'TELEMETRY_THRESHOLD' 
  | 'DEVICE_STATUS' 
  | 'SCHEDULE_CRON' 
  | 'MANUAL';

export type ConditionOperator = 
  | 'GREATER_THAN' 
  | 'LESS_THAN' 
  | 'EQUALS' 
  | 'NOT_EQUALS' 
  | 'BETWEEN' 
  | 'INSIDE_TIME_WINDOW';

export type ActionType = 
  | 'SEND_COMMAND' 
  | 'TOGGLE_ACTUATOR' 
  | 'CREATE_ALERT' 
  | 'SEND_NOTIFICATION' 
  | 'UPDATE_TWIN' 
  | 'WEBHOOK_POST';

export interface AutomationTrigger {
  type: TriggerType;
  deviceId?: string;
  sensorType?: string;
  metric?: string;
  cronExpression?: string;
}

export interface AutomationCondition {
  id: string;
  metric: string;
  operator: ConditionOperator;
  value: number | string | boolean;
  secondValue?: number; // for BETWEEN
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  targetDeviceId?: string;
  actuatorId?: string;
  targetState?: any;
  commandPayload?: Record<string, any>;
  alertTitle?: string;
  alertSeverity?: 'INFO' | 'WARNING' | 'CRITICAL';
  notificationText?: string;
  webhookUrl?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  logic: 'AND' | 'OR';
  actions: AutomationAction[];
  lastTriggeredAt?: string;
  executionCount: number;
  version: number;
  createdAt: string;
}

export interface AutomationExecutionTrace {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  status: 'SUCCESS' | 'FAILED' | 'CONDITION_NOT_MET';
  triggerReason: string;
  evaluatedValues: Record<string, any>;
  executedActions: string[];
  executionTimeMs: number;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertRule {
  id: string;
  name: string;
  deviceId?: string;
  metric: string;
  operator: ConditionOperator;
  threshold: number;
  severity: AlertSeverity;
  gracePeriodSeconds: number;
  enabled: boolean;
}

export interface AlertEvent {
  id: string;
  ruleId?: string;
  deviceId: string;
  deviceName: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  currentValue: number | string;
  thresholdValue: number | string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER';

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  joinedAt: string;
  status: 'ACTIVE' | 'INVITED';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: 'ENTERPRISE' | 'PRO' | 'STARTER';
  activeDevicesCount: number;
  totalTelemetryIngested: number;
}

export interface LocationZone {
  id: string;
  name: string;
  location: string;
  description: string;
  devicesCount: number;
  ambientTempAvg: number;
  ambientHumidityAvg: number;
  airQualityAvg: number;
  safetyStatus: 'OPTIMAL' | 'ATTENTION' | 'HAZARD';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  category: 'DEVICE' | 'COMMAND' | 'AUTOMATION' | 'ALERT' | 'SECURITY' | 'ORGANIZATION';
  details: string;
  targetId?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface MQTTStreamMessage {
  id: string;
  timestamp: string;
  topic: string;
  payload: Record<string, any> | string;
  direction: 'INBOUND' | 'OUTBOUND';
  qos: 0 | 1 | 2;
  deviceId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'DEVICE' | 'ALERT' | 'AUTOMATION' | 'SYSTEM';
  timestamp: string;
  unread: boolean;
  deviceId?: string;
  severity?: AlertSeverity;
}
