'use client';

import { useState, useEffect } from 'react';
import { 
  Plug, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  Eye,
  Download,
  Upload,
  Activity,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { ConnectedApp, CrossAppInsight, UnifiedHealthData } from '../../lib/integration/types';
import { HealthDataSync } from '../../lib/integration/dataSync';
import { CrossAppInsightEngine } from '../../lib/integration/crossAppInsights';

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = useState<'apps' | 'insights' | 'data' | 'settings'>('apps');
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [crossAppInsights, setCrossAppInsights] = useState<CrossAppInsight[]>([]);
  const [unifiedData, setUnifiedData] = useState<UnifiedHealthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ [appId: string]: { success: boolean; dataCount: number; error?: string } }>({});

  const dataSync = new HealthDataSync();
  const insightEngine = new CrossAppInsightEngine();

  useEffect(() => {
    loadIntegrationData();
  }, []);

  const loadIntegrationData = () => {
    setConnectedApps(dataSync.getConnectedApps());
    setCrossAppInsights(insightEngine.generateCrossAppInsights());
    setUnifiedData(dataSync.getUnifiedHealthData());
  };

  const handleConnectApp = async (appType: string) => {
    setIsLoading(true);
    try {
      // Mock app connection - in real implementation, this would handle OAuth or API keys
      const mockApp: ConnectedApp = {
        id: appType,
        name: getAppDisplayName(appType),
        type: getAppType(appType),
        version: '1.0.0',
        lastSync: new Date().toISOString(),
        status: 'connected',
        apiEndpoint: `https://api.${appType}.com`,
        authToken: 'mock-token',
        dataTypes: getAppDataTypes(appType),
      };

      dataSync.addConnectedApp(mockApp);
      setConnectedApps(dataSync.getConnectedApps());
    } catch (error) {
      console.error('Failed to connect app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectApp = (appId: string) => {
    dataSync.removeConnectedApp(appId);
    setConnectedApps(dataSync.getConnectedApps());
  };

  const handleSyncAllApps = async () => {
    setIsLoading(true);
    try {
      const results = await dataSync.syncAllApps();
      setSyncStatus(results);
      loadIntegrationData(); // Reload data after sync
    } catch (error) {
      console.error('Failed to sync apps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAppDisplayName = (appType: string): string => {
    const names: { [key: string]: string } = {
      'skintrack-plus': 'SkinTrack+',
      'gastroguard': 'GastroGuard',
      'healthhelper': 'HealthHelper',
      'mindtrack': 'MindTrack',
      'sleep-stress-logger': 'Sleep & Stress Logger',
    };
    return names[appType] || appType;
  };

  const getAppType = (appType: string): ConnectedApp['type'] => {
    const types: { [key: string]: ConnectedApp['type'] } = {
      'skintrack-plus': 'skin',
      'gastroguard': 'gastro',
      'healthhelper': 'general',
      'mindtrack': 'mental',
      'sleep-stress-logger': 'sleep',
    };
    return types[appType] || 'general';
  };

  const getAppDataTypes = (appType: string): string[] => {
    const dataTypes: { [key: string]: string[] } = {
      'skintrack-plus': ['skin_condition', 'breakouts', 'treatments', 'triggers'],
      'gastroguard': ['symptoms', 'meals', 'medications', 'triggers'],
      'healthhelper': ['vitals', 'medications', 'appointments', 'conditions'],
      'mindtrack': ['mood', 'anxiety', 'depression', 'stress', 'journal', 'therapy'],
      'sleep-stress-logger': ['sleep', 'stress', 'activities', 'coping_strategies'],
    };
    return dataTypes[appType] || [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getAppIcon = (appType: string) => {
    switch (appType) {
      case 'skintrack-plus': return <Activity className="w-6 h-6 text-pink-500" />;
      case 'gastroguard': return <Heart className="w-6 h-6 text-red-500" />;
      case 'healthhelper': return <Activity className="w-6 h-6 text-blue-500" />;
      case 'mindtrack': return <Brain className="w-6 h-6 text-purple-500" />;
      case 'sleep-stress-logger': return <Zap className="w-6 h-6 text-indigo-500" />;
      default: return <Plug className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Plug className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Health App Integration</h1>
          </div>
          <p className="text-gray-600">
            Connect and sync data from all your health tracking apps for comprehensive insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'apps'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plug className="w-4 h-4" />
            <span className="hidden sm:inline">Connected Apps</span>
            <span className="sm:hidden">Apps</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'insights'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Cross-App Insights</span>
            <span className="sm:hidden">Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'data'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Unified Data</span>
            <span className="sm:hidden">Data</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'settings'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'apps' && (
          <div className="space-y-8">
            {/* Connected Apps */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Connected Apps</h2>
                <button
                  onClick={handleSyncAllApps}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync All Apps
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedApps.map((app) => (
                  <div key={app.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getAppIcon(app.id)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.name}</h3>
                          <p className="text-sm text-gray-500">v{app.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <button
                          onClick={() => handleDisconnectApp(app.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600">
                        <strong>Last Sync:</strong> {new Date(app.lastSync).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Data Types:</strong> {app.dataTypes.join(', ')}
                      </div>
                      {syncStatus[app.id] && (
                        <div className="text-sm">
                          {syncStatus[app.id].success ? (
                            <span className="text-green-600">
                              ✓ Synced {syncStatus[app.id].dataCount} records
                            </span>
                          ) : (
                            <span className="text-red-600">
                              ✗ Sync failed: {syncStatus[app.id].error}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Available Apps to Connect */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Apps to Connect</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['skintrack-plus', 'gastroguard', 'healthhelper', 'mindtrack', 'sleep-stress-logger'].map((appType) => {
                    const isConnected = connectedApps.some(app => app.id === appType);
                    return (
                      <button
                        key={appType}
                        onClick={() => handleConnectApp(appType)}
                        disabled={isConnected || isLoading}
                        className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-colors ${
                          isConnected
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        {getAppIcon(appType)}
                        <div>
                          <div className="font-medium">{getAppDisplayName(appType)}</div>
                          <div className="text-sm text-gray-500">
                            {isConnected ? 'Connected' : 'Click to connect'}
                          </div>
                        </div>
                        {!isConnected && <Plus className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            {/* Cross-App Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cross-App Insights</h2>
              <div className="space-y-6">
                {crossAppInsights.map((insight, idx) => (
                  <div key={insight.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                          <span>Data Points: {insight.dataPoints}</span>
                          <span>Timeframe: {insight.timeframe}</span>
                          <div className="flex items-center gap-1">
                            {insight.sourceApps.map((app, appIdx) => (
                              <span key={appIdx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {getAppDisplayName(app)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        insight.type === 'correlation' ? 'bg-blue-100 text-blue-700' :
                        insight.type === 'pattern' ? 'bg-green-100 text-green-700' :
                        insight.type === 'prediction' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {insight.type}
                      </span>
                    </div>

                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {insight.recommendations.map((rec, recIdx) => (
                            <li key={recIdx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8">
            {/* Unified Data View */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Unified Health Data</h2>
              <div className="space-y-4">
                {unifiedData.slice(-10).map((data, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{data.date}</h3>
                      <div className="flex items-center gap-2">
                        {data.skin && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">Skin</span>}
                        {data.gastro && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Gastro</span>}
                        {data.mental && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Mental</span>}
                        {data.sleepStress && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">Sleep/Stress</span>}
                        {data.nutrition && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Nutrition</span>}
                        {data.exercise && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Exercise</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {data.skin && (
                        <div className="bg-pink-50 p-3 rounded">
                          <strong>Skin:</strong> {data.skin.skinCondition} (severity: {data.skin.severity}/10)
                        </div>
                      )}
                      {data.gastro && (
                        <div className="bg-red-50 p-3 rounded">
                          <strong>Gastro:</strong> Reflux: {data.gastro.symptoms.reflux}/10, Bloating: {data.gastro.symptoms.bloating}/10
                        </div>
                      )}
                      {data.mental && (
                        <div className="bg-purple-50 p-3 rounded">
                          <strong>Mental:</strong> Mood: {data.mental.mood}/10, Stress: {data.mental.stress}/10
                        </div>
                      )}
                      {data.sleepStress && (
                        <div className="bg-indigo-50 p-3 rounded">
                          <strong>Sleep:</strong> Quality: {data.sleepStress.sleep?.quality}/10, Duration: {data.sleepStress.sleep?.duration?.toFixed(1)}h
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Integration Settings */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Auto Sync</h3>
                    <p className="text-sm text-gray-500">Automatically sync data from connected apps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Sync Interval</h3>
                    <p className="text-sm text-gray-500">How often to sync data (in minutes)</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60" selected>1 hour</option>
                    <option value="240">4 hours</option>
                    <option value="1440">24 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Data Retention</h3>
                    <p className="text-sm text-gray-500">How long to keep synced data (in days)</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365" selected>1 year</option>
                    <option value="0">Forever</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Privacy Mode</h3>
                    <p className="text-sm text-gray-500">How to handle data sharing and anonymization</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="local" selected>Local Only</option>
                    <option value="anonymized">Anonymized Sharing</option>
                    <option value="full">Full Sharing</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Cross-App Predictions</h3>
                    <p className="text-sm text-gray-500">Enable AI predictions using data from all connected apps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Import Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
