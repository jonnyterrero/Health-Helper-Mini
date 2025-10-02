'use client';

import { useState, useEffect } from 'react';
import { Brain, MessageCircle, BarChart3, Users, Heart, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { getNutritionEntries, getExerciseEntries, getRemedies } from '@/lib/storage';
import { MoodSymptomBridge } from '@/lib/moodSymptomBridge';
import { ConversationalAssistant } from '@/lib/conversationalAssistant';
import { SymptomTimelineDashboard } from '@/lib/symptomTimelineDashboard';
import { CommunityPatternMiningSystem } from '@/lib/communityPatternMining';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdvancedFeaturesPage() {
  const [moodBridge, setMoodBridge] = useState<MoodSymptomBridge | null>(null);
  const [conversationalAssistant, setConversationalAssistant] = useState<ConversationalAssistant | null>(null);
  const [timelineDashboard, setTimelineDashboard] = useState<SymptomTimelineDashboard | null>(null);
  const [communityMining, setCommunityMining] = useState<CommunityPatternMiningSystem | null>(null);
  
  const [moodData, setMoodData] = useState<any>({});
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [timelineInsights, setTimelineInsights] = useState<any>({});
  const [communityInsights, setCommunityInsights] = useState<any>({});
  
  const [activeTab, setActiveTab] = useState<'mood' | 'chat' | 'timeline' | 'community'>('mood');
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAdvancedFeatures();
  }, []);

  const initializeAdvancedFeatures = async () => {
    setLoading(true);
    
    try {
      const nutritionEntries = getNutritionEntries();
      const exerciseEntries = getExerciseEntries();
      const remedies = getRemedies();
      
      // Initialize Mood-Symptom Bridge
      const moodBridge = new MoodSymptomBridge();
      
      // Add sample mood entries
      const sampleMoodEntries = [
        {
          id: '1',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          moodScore: 6,
          journalEntry: 'Feeling stressed about work, but had a good workout this morning.',
          emotions: ['stressed', 'accomplished'],
          stressLevel: 7,
          energyLevel: 6,
          sleepQuality: 5,
          socialActivity: 4,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          moodScore: 8,
          journalEntry: 'Great day! Had coffee with friends and felt really happy.',
          emotions: ['happy', 'social'],
          stressLevel: 3,
          energyLevel: 8,
          sleepQuality: 7,
          socialActivity: 8,
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      sampleMoodEntries.forEach(entry => moodBridge.addMoodEntry(entry));
      
      const moodAnalysis = moodBridge.analyzeMoodSymptomRelationships(nutritionEntries);
      setMoodBridge(moodBridge);
      setMoodData(moodAnalysis);
      
      // Initialize Conversational Assistant
      const assistant = new ConversationalAssistant();
      setConversationalAssistant(assistant);
      
      // Initialize Timeline Dashboard
      const timelineDashboard = new SymptomTimelineDashboard();
      setTimelineDashboard(timelineDashboard);
      
      // Generate sample timeline data
      const sampleTimelineData = nutritionEntries.map(entry => ({
        date: entry.date,
        symptoms: entry.symptoms.map((symptom: string) => ({
          name: symptom,
          severity: entry.severity,
          duration: 60,
          triggers: ['stress', 'poor_sleep']
        })),
        mood: {
          score: 5 + Math.random() * 4,
          emotions: ['neutral']
        },
        lifestyle: {
          sleep: entry.sleep,
          stress: entry.stress,
          exercise: !!exerciseEntries.find(ex => 
            new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
          ),
          caffeine: entry.caffeine,
          waterIntake: 6
        },
        remedies: []
      }));
      
      const monthlySummary = timelineDashboard.generateMonthlySummary(sampleTimelineData);
      setTimelineInsights(monthlySummary);
      
      // Initialize Community Pattern Mining
      const communityMining = new CommunityPatternMiningSystem();
      communityMining.initializeWithSampleData();
      setCommunityMining(communityMining);
      
      // Analyze user patterns
      const userAnalysis = communityMining.analyzeUserPatterns(
        'current-user',
        30,
        'female',
        ['acid_reflux', 'migraine'],
        {
          averageSleep: 6.5,
          averageStress: 6,
          exerciseFrequency: 0.4,
          caffeineConsumption: true
        },
        remedies.map(r => ({ id: r.id, effectiveness: r.effectiveness, usageCount: r.usageCount })),
        {
          'acid_reflux': { frequency: 0.3, averageSeverity: 6, commonTriggers: ['caffeine', 'stress'] },
          'migraine': { frequency: 0.2, averageSeverity: 7, commonTriggers: ['poor_sleep', 'stress'] }
        }
      );
      setCommunityInsights(userAnalysis);
      
    } catch (error) {
      console.error('Error initializing advanced features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !conversationalAssistant) return;
    
    const response = conversationalAssistant.processMessage(
      chatInput,
      {
        recentStress: 6,
        recentSleep: 6.5,
        recentExercise: true
      },
      [],
      moodData.correlations || []
    );
    
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: chatInput, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response.message, timestamp: new Date().toISOString() }
    ]);
    
    setChatInput('');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return '📈';
      case 'deterioration': return '📉';
      case 'pattern': return '🔍';
      case 'correlation': return '🔗';
      case 'recommendation': return '💡';
      default: return '📊';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'text-green-600 bg-green-50';
      case 'deterioration': return 'text-red-600 bg-red-50';
      case 'pattern': return 'text-blue-600 bg-blue-50';
      case 'correlation': return 'text-purple-600 bg-purple-50';
      case 'recommendation': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600">Initializing advanced AI features...</p>
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
            <h1 className="text-4xl font-bold text-gray-900">Advanced AI Features</h1>
          </div>
          <p className="text-gray-600">
            Cutting-edge AI features: mood-symptom analysis, conversational assistant, timeline insights, and community patterns
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('mood')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'mood' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Mood Bridge</span>
            <span className="sm:hidden">Mood</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'chat' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'timeline' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
            <span className="sm:hidden">Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === 'community' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Community</span>
            <span className="sm:hidden">Community</span>
          </button>
        </div>

        {/* Mood-Symptom Bridge Tab */}
        {activeTab === 'mood' && (
          <div className="space-y-8">
            {/* Mood Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mood-Symptom Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moodData.insights?.slice(0, 4).map((insight: string, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🧠</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Mood Pattern</h3>
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Correlations */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mood-Symptom Correlations</h2>
              <div className="space-y-4">
                {moodData.correlations?.slice(0, 5).map((correlation: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {correlation.moodFactor} → {correlation.symptom}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        correlation.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        correlation.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {correlation.confidence} confidence
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{correlation.description}</p>
                    <div className="text-xs text-gray-500">
                      Correlation: {correlation.correlation.toFixed(3)} | Lag: {correlation.lag}h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversational Assistant Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-8">
            {/* Chat Interface */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Health Assistant</h2>
              
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Ask me anything about your health!</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm">Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          "What should I eat for dinner to avoid reflux tonight?"
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          "Will I get a migraine tomorrow?"
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          "Best remedy for IBS?"
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message, idx) => (
                      <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-900 border'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your health..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Health Queries</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "What should I eat for dinner to avoid reflux tonight?",
                  "Will I get a migraine tomorrow?",
                  "Best remedy for IBS symptoms?",
                  "How can I prevent skin flare-ups?",
                  "What's my stress risk today?",
                  "Should I exercise with my current symptoms?"
                ].map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChatInput(query)}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-700">{query}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Dashboard Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-8">
            {/* Monthly Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Health Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Total Symptoms</h3>
                  <div className="text-2xl font-bold text-blue-600">{timelineInsights.totalSymptoms}</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Avg Severity</h3>
                  <div className="text-2xl font-bold text-green-600">{timelineInsights.averageSeverity?.toFixed(1)}/10</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Avg Sleep</h3>
                  <div className="text-2xl font-bold text-purple-600">{timelineInsights.lifestyleFactors?.averageSleep?.toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Avg Stress</h3>
                  <div className="text-2xl font-bold text-orange-600">{timelineInsights.lifestyleFactors?.averageStress?.toFixed(1)}/10</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Generated Insights</h2>
              <div className="space-y-4">
                {timelineInsights.insights?.slice(0, 6).map((insight: any, idx: number) => (
                  <div key={idx} className={`border-l-4 rounded-lg p-4 ${
                    insight.type === 'improvement' ? 'border-green-500 bg-green-50' :
                    insight.type === 'deterioration' ? 'border-red-500 bg-red-50' :
                    insight.type === 'pattern' ? 'border-blue-500 bg-blue-50' :
                    insight.type === 'correlation' ? 'border-purple-500 bg-purple-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInsightColor(insight.priority)}`}>
                            {insight.priority} priority
                          </span>
                          <span className="text-xs text-gray-500">{insight.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trends */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {timelineInsights.trends?.slice(0, 4).map((trend: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{trend.metric}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trend.direction === 'improving' ? 'bg-green-100 text-green-700' :
                        trend.direction === 'worsening' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trend.direction}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                    <div className="text-xs text-gray-500">
                      {trend.change.toFixed(0)}% change | {trend.timeframe}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Community Patterns Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            {/* Community Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Insights</h2>
              <div className="space-y-4">
                {communityInsights.insights?.slice(0, 5).map((insight: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">👥</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Community Pattern</h3>
                        <p className="text-sm text-gray-700 mb-2">{insight.insight}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.confidence === 'high' ? 'bg-green-100 text-green-700' :
                            insight.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {insight.confidence} confidence
                          </span>
                          <span className="text-xs text-gray-500">
                            Based on {insight.sampleSize} users
                          </span>
                          {insight.actionable && (
                            <span className="text-xs text-blue-600 font-medium">Actionable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar User Groups */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Users Like You</h2>
              <div className="space-y-4">
                {communityInsights.similarGroups?.slice(0, 3).map((group: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{group.description}</h3>
                      <div className="text-sm text-blue-600 font-medium">
                        {(group.similarity * 100).toFixed(0)}% similar
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {group.size} users with similar patterns
                    </p>
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-800 mb-1">Common characteristics:</div>
                      <div className="flex flex-wrap gap-2">
                        {group.commonCharacteristics?.slice(0, 3).map((char: string, charIdx: number) => (
                          <span key={charIdx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                    {group.effectiveRemedies?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-800 mb-1">Effective remedies:</div>
                        <div className="space-y-1">
                          {group.effectiveRemedies.slice(0, 2).map((remedy: any, remedyIdx: number) => (
                            <div key={remedyIdx} className="text-sm text-gray-600">
                              {remedy.remedyId}: {remedy.averageEffectiveness.toFixed(1)}/5 effectiveness
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Community Patterns */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communityInsights.patterns?.slice(0, 4).map((pattern: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pattern.confidence > 0.7 ? 'bg-green-100 text-green-700' :
                        pattern.confidence > 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {(pattern.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      Based on {pattern.sampleSize} users
                    </div>
                    {pattern.recommendations?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-800 mb-1">Recommendations:</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {pattern.recommendations.slice(0, 2).map((rec: string, recIdx: number) => (
                            <li key={recIdx} className="flex items-start gap-1">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
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
      </div>
    </div>
  );
}
