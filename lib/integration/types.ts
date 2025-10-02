// Integration types for connecting multiple health apps
export interface ConnectedApp {
  id: string;
  name: string;
  type: 'skin' | 'gastro' | 'general' | 'mental' | 'sleep' | 'stress';
  version: string;
  lastSync: string;
  status: 'connected' | 'disconnected' | 'error';
  apiEndpoint?: string;
  authToken?: string;
  dataTypes: string[];
}

export interface DataSyncConfig {
  appId: string;
  syncInterval: number; // minutes
  autoSync: boolean;
  dataTypes: string[];
  lastSync: string;
  nextSync: string;
}

export interface CrossAppData {
  timestamp: string;
  sourceApp: string;
  dataType: string;
  data: any;
  metadata?: {
    confidence?: number;
    processed?: boolean;
    tags?: string[];
  };
}

// Specific data types for each app
export interface SkinTrackData {
  date: string;
  skinCondition: 'clear' | 'mild_breakout' | 'moderate_breakout' | 'severe_breakout';
  severity: number; // 1-10
  affectedAreas: string[];
  triggers: string[];
  treatments: string[];
  photos?: string[];
  notes?: string;
}

export interface GastroGuardData {
  date: string;
  symptoms: {
    reflux: number; // 0-10
    bloating: number;
    nausea: number;
    stomachPain: number;
    diarrhea: number;
    constipation: number;
  };
  meals: Array<{
    time: string;
    food: string;
    portion: string;
    symptomsAfter?: number;
  }>;
  medications: string[];
  notes?: string;
}

export interface HealthHelperData {
  date: string;
  vitals: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    weight?: number;
    bloodSugar?: number;
  };
  medications: Array<{
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
  }>;
  appointments: Array<{
    date: string;
    doctor: string;
    type: string;
    notes?: string;
  }>;
}

export interface MindTrackData {
  date: string;
  mood: number; // 1-10
  anxiety: number; // 1-10
  depression: number; // 1-10
  stress: number; // 1-10
  energy: number; // 1-10
  sleepQuality: number; // 1-10
  activities: string[];
  journalEntry?: string;
  medications: string[];
  therapySession?: {
    date: string;
    therapist: string;
    notes: string;
    effectiveness: number; // 1-10
  };
}

export interface SleepStressLoggerData {
  date: string;
  sleep: {
    bedtime: string;
    wakeTime: string;
    duration: number; // hours
    quality: number; // 1-10
    interruptions: number;
    deepSleep: number; // hours
    remSleep: number; // hours
    lightSleep: number; // hours
  };
  stress: {
    level: number; // 1-10
    triggers: string[];
    copingStrategies: string[];
    effectiveness: number; // 1-10
  };
  activities: Array<{
    time: string;
    activity: string;
    stressImpact: number; // -5 to 5
  }>;
}

export interface UnifiedHealthData {
  date: string;
  skin?: SkinTrackData;
  gastro?: GastroGuardData;
  general?: HealthHelperData;
  mental?: MindTrackData;
  sleepStress?: SleepStressLoggerData;
  nutrition?: any; // From current app
  exercise?: any; // From current app
  predictions?: any; // From current app
}

export interface CrossAppInsight {
  id: string;
  type: 'correlation' | 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-1
  sourceApps: string[];
  dataPoints: number;
  actionable: boolean;
  recommendations?: string[];
  timeframe: string;
}

export interface IntegrationSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  dataRetention: number; // days
  privacyMode: 'full' | 'anonymized' | 'local';
  shareInsights: boolean;
  crossAppPredictions: boolean;
}
