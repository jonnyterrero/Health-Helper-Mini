'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Brain, CheckSquare, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { getNutritionEntries, getExerciseEntries, getRemedies } from '@/lib/storage';
import { calculateSimpleCorrelations, getTopCorrelations } from '@/lib/correlations';
import { createConditionModels } from '@/lib/logisticRegression';
import { 
  createDailyChecklist, 
  getTodaysChecklist, 
  saveChecklist, 
  getChecklistInsights,
  generateSmartRecommendations,
  getChecklistHistory
} from '@/lib/remedyChecklist';
import { generateForecast } from '@/lib/timeSeriesForecasting';
import { getPersonalizedRecommendations } from '@/lib/recommenderSystem';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [topCorrelations, setTopCorrelations] = useState<any>({});
  const [mlModels, setMlModels] = useState<any>({});
  const [todaysChecklist, setTodaysChecklist] = useState<any>(null);
  const [checklistInsights, setChecklistInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<any>({});
  const [personalizedRecs, setPersonalizedRecs] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'correlations' | 'ml' | 'checklist' | 'forecast' | 'recommender'>('correlations');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    const nutritionEntries = getNutritionEntries();
    const exerciseEntries = getExerciseEntries();
    const remedies = getRemedies();

    // Simple Correlations
    const correlationData = calculateSimpleCorrelations(nutritionEntries, exerciseEntries);
    setCorrelations(correlationData);
    setTopCorrelations(getTopCorrelations(correlationData));

    // ML Models
    const models = createConditionModels(nutritionEntries, exerciseEntries);
    setMlModels(models);

    // Remedy Checklist
    let checklist = getTodaysChecklist();
    if (!checklist) {
      checklist = createDailyChecklist(remedies);
      saveChecklist(checklist);
    }
    setTodaysChecklist(checklist);

    // Checklist Insights
    const history = getChecklistHistory(7);
    setChecklistInsights(getChecklistInsights(history, remedies));

    // Smart Recommendations
    setRecommendations(generateSmartRecommendations(remedies, history));

    // Time Series Forecasting
    const forecast = generateForecast(nutritionEntries, exerciseEntries);
    setForecastData(forecast);

    // Personalized Recommender System
    const personalizedData = getPersonalizedRecommendations(nutritionEntries, exerciseEntries, remedies);
    setPersonalizedRecs(personalizedData);
  };

  const updateChecklistItem = (itemId: string, completed: boolean, effectiveness?: number) => {
    if (!todaysChecklist) return;

    const updatedChecklist = {
      ...todaysChecklist,
      items: todaysChecklist.items.map((item: any) => 
        item.id === itemId 
          ? { 
              ...item, 
              completed, 
              timeCompleted: completed ? new Date().toISOString() : undefined,
              effectiveness 
            } 
          : item
      )
    };

    const completedItems = updatedChecklist.items.filter((item: any) => item.completed).length;
    updatedChecklist.completedItems = completedItems;
    updatedChecklist.completionRate = (completedItems / updatedChecklist.totalItems) * 100;

    setTodaysChecklist(updatedChecklist);
    saveChecklist(updatedChecklist);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'supplement': return '🌿';
      case 'lifestyle': return '🏃‍♂️';
      case 'food': return '🍎';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication': return '#ef4444';
      case 'supplement': return '#10b981';
      case 'lifestyle': return '#3b82f6';
      case 'food': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Analytics & Insights</h1>
          </div>
          <p className="text-gray-600">
            Advanced analysis of your health patterns, ML predictions, and remedy tracking
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('correlations')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'correlations' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Simple Correlations</span>
            <span className="sm:hidden">Correlations</span>
          </button>
          <button
            onClick={() => setActiveTab('ml')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'ml' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">ML Predictions</span>
            <span className="sm:hidden">ML</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'checklist' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Remedy Checklist</span>
            <span className="sm:hidden">Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'forecast' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Time Series</span>
            <span className="sm:hidden">Forecast</span>
          </button>
          <button
            onClick={() => setActiveTab('recommender')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'recommender' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Recommender</span>
            <span className="sm:hidden">Recs</span>
          </button>
        </div>

        {/* Simple Correlations Tab */}
        {activeTab === 'correlations' && (
          <div className="space-y-8">
            {/* Top Correlations */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Strongest Correlations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topCorrelations.strongest?.slice(0, 4).map((correlation: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{correlation.factor}</h3>
                    <div className="space-y-1">
                      {Object.entries(correlation.symptoms).map(([condition, data]: [string, any]) => (
                        <div key={condition} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{condition}</span>
                          <span className={`font-medium ${
                            data.strength === 'strong' ? 'text-red-600' :
                            data.strength === 'moderate' ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {data.strength} {data.direction}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation Chart */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Correlation Matrix</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={correlations.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="factor" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="symptoms.Acid Reflux.correlation" fill="#ef4444" name="Acid Reflux" />
                  <Bar dataKey="symptoms.Migraine.correlation" fill="#8b5cf6" name="Migraine" />
                  <Bar dataKey="symptoms.IBS.correlation" fill="#f59e0b" name="IBS" />
                  <Bar dataKey="symptoms.Skin Issues.correlation" fill="#10b981" name="Skin Issues" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ML Predictions Tab */}
        {activeTab === 'ml' && (
          <div className="space-y-8">
            {/* Model Performance */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ML Model Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(mlModels).map(([condition, model]: [string, any]) => (
                  <div key={condition} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{condition}</h3>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {(model.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Trained on {model.trainedOn} samples
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {model.trainedOn > 20 ? 'High confidence' : 'Low confidence - need more data'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Importance */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Importance</h2>
              <div className="space-y-4">
                {Object.entries(mlModels).map(([condition, model]: [string, any]) => (
                  <div key={condition} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{condition}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(model.coefficients).map(([feature, coefficient]: [string, any]) => (
                        <div key={feature} className="text-sm">
                          <div className="text-gray-700">{feature}</div>
                          <div className={`font-medium ${
                            coefficient > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {coefficient > 0 ? '+' : ''}{coefficient.toFixed(3)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Remedy Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-8">
            {/* Today's Checklist */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Remedy Checklist</h2>
                <div className="text-sm text-gray-600">
                  {todaysChecklist?.completionRate.toFixed(0)}% Complete
                </div>
              </div>
              
              <div className="space-y-3">
                {todaysChecklist?.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <button
                      onClick={() => updateChecklistItem(item.id, !item.completed)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300'
                      }`}
                    >
                      {item.completed && '✓'}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <span className="font-medium text-gray-900">{item.remedyName}</span>
                        <span 
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: getTypeColor(item.type) }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.conditions.join(', ')}
                      </div>
                    </div>
                    
                    {item.completed && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => updateChecklistItem(item.id, true, rating)}
                            className={`w-6 h-6 rounded text-xs ${
                              item.effectiveness >= rating 
                                ? 'bg-yellow-400 text-yellow-900' 
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Smart Recommendations</h2>
                </div>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">💡</span>
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Remedy Performance Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {checklistInsights.slice(0, 6).map((insight, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{insight.remedyName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Rate:</span>
                        <span className="font-medium">{insight.completionRate.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effectiveness:</span>
                        <span className="font-medium">{insight.averageEffectiveness.toFixed(1)}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Streak:</span>
                        <span className="font-medium">{insight.streak} days</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600 italic">
                      {insight.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Time Series Forecasting Tab */}
        {activeTab === 'forecast' && (
          <div className="space-y-8">
            {/* Forecast Overview */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7-Day Symptom Forecast</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(forecastData).map(([condition, data]: [string, any]) => (
                  <div key={condition} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                      {condition.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {data.forecast[0]?.predicted.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Next 7 days average
                    </div>
                    <div className="text-xs text-gray-500">
                      Trend: {data.trend.direction} ({data.trend.strength})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Charts */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Forecast Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={Object.entries(forecastData).flatMap(([condition, data]: [string, any]) => 
                  data.forecast.map((forecast: any) => ({
                    date: forecast.date,
                    [condition]: forecast.predicted,
                    confidence: forecast.confidence
                  }))
                )}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="acidReflux" stroke="#ef4444" strokeWidth={2} name="Acid Reflux" />
                  <Line type="monotone" dataKey="migraine" stroke="#8b5cf6" strokeWidth={2} name="Migraine" />
                  <Line type="monotone" dataKey="ibs" stroke="#f59e0b" strokeWidth={2} name="IBS" />
                  <Line type="monotone" dataKey="skin" stroke="#10b981" strokeWidth={2} name="Skin Issues" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Trend Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(forecastData).map(([condition, data]: [string, any]) => (
                  <div key={condition} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                      {condition.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Direction:</span>
                        <span className={`font-medium ${
                          data.trend.direction === 'increasing' ? 'text-red-600' :
                          data.trend.direction === 'decreasing' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {data.trend.direction}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Strength:</span>
                        <span className="font-medium">{data.trend.strength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="font-medium">{data.trend.period} days</span>
                      </div>
                      {data.trend.nextPeak && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Peak:</span>
                          <span className="font-medium text-red-600">{data.trend.nextPeak}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Personalized Recommender Tab */}
        {activeTab === 'recommender' && (
          <div className="space-y-8">
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Lifestyle Factors</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Sleep:</span>
                      <span className="font-medium">{personalizedRecs.userProfile?.lifestyleFactors?.averageSleep?.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Stress:</span>
                      <span className="font-medium">{personalizedRecs.userProfile?.lifestyleFactors?.averageStress?.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exercise Frequency:</span>
                      <span className="font-medium">{(personalizedRecs.userProfile?.lifestyleFactors?.exerciseFrequency * 100)?.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Caffeine:</span>
                      <span className="font-medium">{personalizedRecs.userProfile?.lifestyleFactors?.caffeineConsumption ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {personalizedRecs.userProfile?.conditions?.map((condition: string) => (
                      <span key={condition} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Recommendations</h2>
              <div className="space-y-4">
                {personalizedRecs.recommendations?.slice(0, 5).map((rec: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{rec.remedyName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full text-white ${
                            rec.type === 'medication' ? 'bg-red-500' :
                            rec.type === 'supplement' ? 'bg-green-500' :
                            rec.type === 'lifestyle' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            {rec.type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rec.confidence === 'high' ? 'bg-green-100 text-green-700' :
                            rec.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {rec.confidence} confidence
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{(rec.score * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">match score</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Why recommended:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {rec.reasons.map((reason: string, reasonIdx: number) => (
                          <li key={reasonIdx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    {rec.similarUsers > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        Based on {rec.similarUsers} similar user{rec.similarUsers !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Users */}
            {personalizedRecs.similarUsers?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalizedRecs.similarUsers.slice(0, 4).map((user: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">User {user.userId.split('-')[1]}</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {(user.similarity * 100).toFixed(0)}% similar
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="mb-1">
                          <strong>Shared conditions:</strong> {user.sharedConditions.join(', ')}
                        </div>
                        <div>
                          <strong>Effective remedies:</strong> {user.effectiveRemedies.length} found
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
