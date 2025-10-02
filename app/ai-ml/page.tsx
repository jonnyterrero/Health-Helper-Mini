'use client';

import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Target, TrendingUp, Users, Zap, BarChart3, Activity } from 'lucide-react';
import { getNutritionEntries, getExerciseEntries, getRemedies } from '@/lib/storage';
import { AdvancedSymptomPredictionEngine } from '@/lib/advancedPredictionEngine';
import { HabitCorrelationAnalyzer } from '@/lib/habitCorrelationAnalyzer';
import { EnhancedRemedyRecommender } from '@/lib/enhancedRemedyRecommender';
import { EarlyWarningSystem } from '@/lib/forecastingEarlyWarning';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  HeatmapGrid
} from 'recharts';

export default function AIMLPage() {
  const [predictionEngine, setPredictionEngine] = useState<AdvancedSymptomPredictionEngine | null>(null);
  const [correlationAnalyzer, setCorrelationAnalyzer] = useState<HabitCorrelationAnalyzer | null>(null);
  const [remedyRecommender, setRemedyRecommender] = useState<EnhancedRemedyRecommender | null>(null);
  const [earlyWarningSystem, setEarlyWarningSystem] = useState<EarlyWarningSystem | null>(null);
  
  const [predictions, setPredictions] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any>({});
  
  const [activeTab, setActiveTab] = useState<'predictions' | 'correlations' | 'recommendations' | 'warnings'>('predictions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAISystems();
  }, []);

  const initializeAISystems = async () => {
    setLoading(true);
    
    try {
      const nutritionEntries = getNutritionEntries();
      const exerciseEntries = getExerciseEntries();
      const remedies = getRemedies();
      
      // Initialize Advanced Prediction Engine
      const predictionEngine = new AdvancedSymptomPredictionEngine();
      predictionEngine.train(nutritionEntries, exerciseEntries);
      setPredictionEngine(predictionEngine);
      
      // Get predictions for today
      const todayInput = {
        meals: ['breakfast', 'lunch'],
        caffeine: true,
        waterIntake: 6,
        sleepHours: 7,
        stress: 6,
        exercise: true,
        exerciseIntensity: 'medium' as const,
        recovery: 7,
        timestamp: new Date().toISOString()
      };
      
      const symptoms = ['Acid Reflux', 'Migraine', 'IBS', 'Skin Issues'];
      const predictions = symptoms.map(symptom => 
        predictionEngine.predict(todayInput, symptom, '24h')
      );
      setPredictions(predictions);
      
      // Get model performance
      setModelPerformance(predictionEngine.getModelPerformance());
      
      // Initialize Correlation Analyzer
      const correlationAnalyzer = new HabitCorrelationAnalyzer();
      const correlationResults = correlationAnalyzer.analyzeHabitCorrelations(nutritionEntries, exerciseEntries);
      setCorrelationAnalyzer(correlationAnalyzer);
      setCorrelations(correlationResults);
      
      // Initialize Enhanced Remedy Recommender
      const remedyRecommender = new EnhancedRemedyRecommender();
      remedyRecommender.setRemedies(remedies);
      setRemedyRecommender(remedyRecommender);
      
      // Generate recommendations
      const recommendations = remedyRecommender.generateRecommendations(
        'current-user',
        'acid_reflux',
        {
          sleepHours: 7,
          stressLevel: 6,
          exerciseDone: true,
          caffeineConsumed: true,
          timeOfDay: 'afternoon',
          withFood: false
        }
      );
      setRecommendations(recommendations);
      
      // Initialize Early Warning System
      const earlyWarningSystem = new EarlyWarningSystem();
      const warnings = earlyWarningSystem.generateEarlyWarnings(nutritionEntries, exerciseEntries);
      setEarlyWarningSystem(earlyWarningSystem);
      setEarlyWarnings(warnings);
      
    } catch (error) {
      console.error('Error initializing AI systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600">Initializing AI/ML systems...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI/ML Intelligence Center</h1>
          </div>
          <p className="text-gray-600">
            Advanced machine learning predictions, correlations, and personalized recommendations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'predictions' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Symptom Predictions</span>
            <span className="sm:hidden">Predictions</span>
          </button>
          <button
            onClick={() => setActiveTab('correlations')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'correlations' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Habit Correlations</span>
            <span className="sm:hidden">Correlations</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'recommendations' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Smart Recommendations</span>
            <span className="sm:hidden">Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'warnings' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Early Warnings</span>
            <span className="sm:hidden">Warnings</span>
          </button>
        </div>

        {/* Symptom Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-8">
            {/* Model Performance */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ML Model Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(modelPerformance).map(([condition, performance]: [string, any]) => (
                  <div key={condition} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{condition}</h3>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {(performance.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Accuracy
                    </div>
                    <div className="text-xs text-gray-500">
                      Trained on {performance.trainedOn} samples
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Predictions */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">24-Hour Symptom Predictions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {predictions.map((prediction, idx) => (
                  <div key={idx} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{prediction.symptom}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence} confidence
                      </div>
                    </div>
                    
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {prediction.probability.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Risk probability for next 24 hours
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {prediction.factors.slice(0, 3).map((factor: any, factorIdx: number) => (
                        <div key={factorIdx} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            factor.direction === 'positive' ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          <span className="text-gray-700">{factor.description}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-600 italic">
                      {prediction.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Habit Correlations Tab */}
        {activeTab === 'correlations' && (
          <div className="space-y-8">
            {/* Correlation Matrix */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Habit-Symptom Correlation Matrix</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={correlations.correlations?.slice(0, 10) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="factor1" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="correlation" fill="#8b5cf6" name="Correlation Strength" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Correlations */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Strongest Correlations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {correlations.correlations?.filter((c: any) => c.strength === 'strong').slice(0, 6).map((correlation: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {correlation.factor1} → {correlation.factor2}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {correlation.correlation.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {correlation.direction} correlation
                    </div>
                    <div className="text-xs text-gray-500">
                      {correlation.confidence} confidence
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Impact Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Habit Impact Analysis</h2>
              <div className="space-y-4">
                {correlations.habitImpacts?.slice(0, 5).map((impact: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{impact.habit}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        impact.overallImpact > 0.3 ? 'bg-red-100 text-red-700' :
                        impact.overallImpact < -0.3 ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {impact.overallImpact > 0.3 ? 'High Risk' :
                         impact.overallImpact < -0.3 ? 'High Protection' : 'Low Impact'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{impact.recommendation}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(impact.symptoms).slice(0, 3).map(([symptom, data]: [string, any]) => (
                        <span key={symptom} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {symptom}: {data.impact}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Smart Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            {/* Personalized Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Recommendations</h2>
              <div className="space-y-4">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={idx} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rec.remedyName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full text-white ${
                            rec.type === 'medication' ? 'bg-red-500' :
                            rec.type === 'supplement' ? 'bg-green-500' :
                            rec.type === 'lifestyle' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            {rec.type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(rec.confidence)}`}>
                            {rec.confidence} confidence
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{rec.score.toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">match score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Expected Effectiveness</div>
                        <div className="text-lg font-semibold text-green-600">
                          {rec.expectedEffectiveness.toFixed(1)}/5
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Time to Relief</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {rec.expectedTimeToRelief.toFixed(0)} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong className="text-gray-800">Personal History:</strong> {rec.reasoning.personalHistory}
                      </div>
                      <div className="text-sm">
                        <strong className="text-gray-800">Similar Users:</strong> {rec.reasoning.similarUsers}
                      </div>
                      <div className="text-sm">
                        <strong className="text-gray-800">Medical Guidelines:</strong> {rec.reasoning.medicalGuidelines}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Early Warnings Tab */}
        {activeTab === 'warnings' && (
          <div className="space-y-8">
            {/* Active Warnings */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Early Warning System</h2>
              <div className="space-y-4">
                {earlyWarnings.slice(0, 5).map((warning, idx) => (
                  <div key={idx} className={`border-l-4 rounded-lg p-4 ${
                    warning.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    warning.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    warning.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          warning.severity === 'critical' ? 'text-red-600' :
                          warning.severity === 'high' ? 'text-orange-600' :
                          warning.severity === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {warning.type.replace('_', ' ').toUpperCase()}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {warning.probability.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">{warning.timeframe}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(warning.severity)}`}>
                        {warning.severity.toUpperCase()} RISK
                      </div>
                      <div className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(warning.confidence)}`}>
                        {warning.confidence} confidence
                      </div>
                    </div>
                    
                    {warning.riskFactors.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-800 mb-1">Risk Factors:</div>
                        <div className="flex flex-wrap gap-2">
                          {warning.riskFactors.slice(0, 3).map((factor: any, factorIdx: number) => (
                            <span key={factorIdx} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                              {factor.factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-1">Recommendations:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {warning.recommendations.slice(0, 3).map((rec: string, recIdx: number) => (
                          <li key={recIdx} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
