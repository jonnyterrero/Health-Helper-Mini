// API client for connecting to other health apps
import { ConnectedApp, CrossAppData, DataSyncConfig } from './types';

export class HealthAppAPIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Generic API methods
  async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Health-App': 'nutrition-symptoms-tracker',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // App-specific connectors
  async connectToSkinTrack(apiEndpoint: string, authToken: string): Promise<ConnectedApp> {
    const app: ConnectedApp = {
      id: 'skintrack-plus',
      name: 'SkinTrack+',
      type: 'skin',
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      status: 'connected',
      apiEndpoint,
      authToken,
      dataTypes: ['skin_condition', 'breakouts', 'treatments', 'triggers'],
    };

    // Test connection
    try {
      await this.makeRequest('/api/skintrack/health', 'GET');
      return app;
    } catch (error) {
      app.status = 'error';
      throw new Error(`Failed to connect to SkinTrack+: ${error}`);
    }
  }

  async connectToGastroGuard(apiEndpoint: string, authToken: string): Promise<ConnectedApp> {
    const app: ConnectedApp = {
      id: 'gastroguard',
      name: 'GastroGuard',
      type: 'gastro',
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      status: 'connected',
      apiEndpoint,
      authToken,
      dataTypes: ['symptoms', 'meals', 'medications', 'triggers'],
    };

    try {
      await this.makeRequest('/api/gastroguard/health', 'GET');
      return app;
    } catch (error) {
      app.status = 'error';
      throw new Error(`Failed to connect to GastroGuard: ${error}`);
    }
  }

  async connectToHealthHelper(apiEndpoint: string, authToken: string): Promise<ConnectedApp> {
    const app: ConnectedApp = {
      id: 'healthhelper',
      name: 'HealthHelper',
      type: 'general',
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      status: 'connected',
      apiEndpoint,
      authToken,
      dataTypes: ['vitals', 'medications', 'appointments', 'conditions'],
    };

    try {
      await this.makeRequest('/api/healthhelper/health', 'GET');
      return app;
    } catch (error) {
      app.status = 'error';
      throw new Error(`Failed to connect to HealthHelper: ${error}`);
    }
  }

  async connectToMindTrack(apiEndpoint: string, authToken: string): Promise<ConnectedApp> {
    const app: ConnectedApp = {
      id: 'mindtrack',
      name: 'MindTrack',
      type: 'mental',
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      status: 'connected',
      apiEndpoint,
      authToken,
      dataTypes: ['mood', 'anxiety', 'depression', 'stress', 'journal', 'therapy'],
    };

    try {
      await this.makeRequest('/api/mindtrack/health', 'GET');
      return app;
    } catch (error) {
      app.status = 'error';
      throw new Error(`Failed to connect to MindTrack: ${error}`);
    }
  }

  async connectToSleepStressLogger(apiEndpoint: string, authToken: string): Promise<ConnectedApp> {
    const app: ConnectedApp = {
      id: 'sleep-stress-logger',
      name: 'Sleep & Stress Logger',
      type: 'sleep',
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      status: 'connected',
      apiEndpoint,
      authToken,
      dataTypes: ['sleep', 'stress', 'activities', 'coping_strategies'],
    };

    try {
      await this.makeRequest('/api/sleep-stress/health', 'GET');
      return app;
    } catch (error) {
      app.status = 'error';
      throw new Error(`Failed to connect to Sleep & Stress Logger: ${error}`);
    }
  }

  // Data synchronization methods
  async syncDataFromApp(appId: string, dataType: string, dateRange?: { start: string; end: string }): Promise<CrossAppData[]> {
    const endpoint = `/api/${appId}/data/${dataType}`;
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    
    const response = await this.makeRequest(`${endpoint}${params}`, 'GET');
    return response.data.map((item: any) => ({
      timestamp: item.timestamp || new Date().toISOString(),
      sourceApp: appId,
      dataType,
      data: item,
      metadata: {
        confidence: item.confidence || 1.0,
        processed: false,
        tags: item.tags || [],
      },
    }));
  }

  async sendDataToApp(appId: string, dataType: string, data: any): Promise<boolean> {
    try {
      await this.makeRequest(`/api/${appId}/data/${dataType}`, 'POST', data);
      return true;
    } catch (error) {
      console.error(`Failed to send data to ${appId}:`, error);
      return false;
    }
  }

  // Health check for connected apps
  async checkAppHealth(appId: string): Promise<{ status: string; lastSync: string; error?: string }> {
    try {
      const response = await this.makeRequest(`/api/${appId}/health`, 'GET');
      return {
        status: 'healthy',
        lastSync: response.lastSync || new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        lastSync: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Batch operations
  async syncAllConnectedApps(apps: ConnectedApp[]): Promise<{ [appId: string]: { success: boolean; dataCount: number; error?: string } }> {
    const results: { [appId: string]: { success: boolean; dataCount: number; error?: string } } = {};

    for (const app of apps) {
      if (app.status !== 'connected') continue;

      try {
        let totalDataCount = 0;
        for (const dataType of app.dataTypes) {
          const data = await this.syncDataFromApp(app.id, dataType);
          totalDataCount += data.length;
        }

        results[app.id] = {
          success: true,
          dataCount: totalDataCount,
        };
      } catch (error) {
        results[app.id] = {
          success: false,
          dataCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return results;
  }
}

// Mock API client for development/testing
export class MockHealthAppAPIClient extends HealthAppAPIClient {
  constructor() {
    super('http://localhost:3001', 'mock-api-key');
  }

  async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock responses based on endpoint
    if (endpoint.includes('/health')) {
      return { status: 'healthy', lastSync: new Date().toISOString() };
    }

    if (endpoint.includes('/data/')) {
      return this.generateMockData(endpoint);
    }

    return { success: true };
  }

  private generateMockData(endpoint: string): any {
    const appId = endpoint.split('/')[2];
    const dataType = endpoint.split('/')[4];

    // Generate mock data based on app and data type
    const mockData = {
      'skintrack-plus': {
        skin_condition: [
          { date: '2023-10-20', condition: 'mild_breakout', severity: 4, affectedAreas: ['forehead'], triggers: ['stress'], treatments: ['salicylic_acid'] },
          { date: '2023-10-21', condition: 'clear', severity: 1, affectedAreas: [], triggers: [], treatments: [] },
        ],
        breakouts: [
          { date: '2023-10-20', type: 'inflammatory', count: 3, severity: 4 },
        ],
      },
      'gastroguard': {
        symptoms: [
          { date: '2023-10-20', reflux: 6, bloating: 4, nausea: 2, stomachPain: 3 },
          { date: '2023-10-21', reflux: 3, bloating: 2, nausea: 1, stomachPain: 1 },
        ],
        meals: [
          { date: '2023-10-20', time: '08:00', food: 'coffee', portion: '1 cup', symptomsAfter: 5 },
        ],
      },
      'mindtrack': {
        mood: [
          { date: '2023-10-20', mood: 6, anxiety: 7, depression: 4, stress: 8, energy: 5 },
          { date: '2023-10-21', mood: 7, anxiety: 5, depression: 3, stress: 6, energy: 6 },
        ],
        journal: [
          { date: '2023-10-20', entry: 'Feeling stressed about work, stomach hurts.' },
        ],
      },
      'sleep-stress-logger': {
        sleep: [
          { date: '2023-10-20', bedtime: '23:00', wakeTime: '07:00', duration: 8, quality: 6, interruptions: 1 },
        ],
        stress: [
          { date: '2023-10-20', level: 7, triggers: ['work', 'deadline'], copingStrategies: ['deep_breathing'] },
        ],
      },
    };

    return {
      data: mockData[appId as keyof typeof mockData]?.[dataType as keyof any] || [],
      count: 2,
      lastSync: new Date().toISOString(),
    };
  }
}
