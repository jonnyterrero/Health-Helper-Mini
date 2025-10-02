// Cross-app correlation analysis and insights
import { 
  UnifiedHealthData, 
  CrossAppInsight,
  SkinTrackData,
  GastroGuardData,
  MindTrackData,
  SleepStressLoggerData
} from './types';

export class CrossAppInsightEngine {
  private unifiedData: UnifiedHealthData[] = [];

  constructor() {
    this.loadUnifiedData();
  }

  // Main insight generation
  generateCrossAppInsights(): CrossAppInsight[] {
    const insights: CrossAppInsight[] = [];

    // Add different types of insights
    insights.push(...this.generateCorrelationInsights());
    insights.push(...this.generatePatternInsights());
    insights.push(...this.generatePredictionInsights());
    insights.push(...this.generateRecommendationInsights());

    // Sort by confidence and return top insights
    return insights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Return top 20 insights
  }

  // Correlation insights
  private generateCorrelationInsights(): CrossAppInsight[] {
    const insights: CrossAppInsight[] = [];

    // Skin-Nutrition correlations
    const skinNutritionCorr = this.calculateCorrelation('skin', 'nutrition');
    if (Math.abs(skinNutritionCorr.correlation) > 0.3) {
      insights.push({
        id: 'skin-nutrition-correlation',
        type: 'correlation',
        title: 'Skin Health & Nutrition Connection',
        description: `Your skin condition shows a ${skinNutritionCorr.correlation > 0 ? 'positive' : 'negative'} correlation (${(skinNutritionCorr.correlation * 100).toFixed(0)}%) with your nutrition patterns.`,
        confidence: Math.abs(skinNutritionCorr.correlation),
        sourceApps: ['skintrack-plus', 'nutrition-symptoms-tracker'],
        dataPoints: skinNutritionCorr.dataPoints,
        actionable: true,
        recommendations: this.getSkinNutritionRecommendations(skinNutritionCorr.correlation),
        timeframe: 'Last 30 days',
      });
    }

    // Gastro-Mood correlations
    const gastroMoodCorr = this.calculateCorrelation('gastro', 'mental');
    if (Math.abs(gastroMoodCorr.correlation) > 0.3) {
      insights.push({
        id: 'gastro-mood-correlation',
        type: 'correlation',
        title: 'Gut-Brain Connection',
        description: `Your digestive symptoms show a ${gastroMoodCorr.correlation > 0 ? 'positive' : 'negative'} correlation (${(gastroMoodCorr.correlation * 100).toFixed(0)}%) with your mood and stress levels.`,
        confidence: Math.abs(gastroMoodCorr.correlation),
        sourceApps: ['gastroguard', 'mindtrack'],
        dataPoints: gastroMoodCorr.dataPoints,
        actionable: true,
        recommendations: this.getGastroMoodRecommendations(gastroMoodCorr.correlation),
        timeframe: 'Last 30 days',
      });
    }

    // Sleep-Stress correlations
    const sleepStressCorr = this.calculateCorrelation('sleep', 'stress');
    if (Math.abs(sleepStressCorr.correlation) > 0.3) {
      insights.push({
        id: 'sleep-stress-correlation',
        type: 'correlation',
        title: 'Sleep-Stress Relationship',
        description: `Your sleep quality shows a ${sleepStressCorr.correlation > 0 ? 'positive' : 'negative'} correlation (${(sleepStressCorr.correlation * 100).toFixed(0)}%) with your stress levels.`,
        confidence: Math.abs(sleepStressCorr.correlation),
        sourceApps: ['sleep-stress-logger'],
        dataPoints: sleepStressCorr.dataPoints,
        actionable: true,
        recommendations: this.getSleepStressRecommendations(sleepStressCorr.correlation),
        timeframe: 'Last 30 days',
      });
    }

    // Exercise-Mood correlations
    const exerciseMoodCorr = this.calculateCorrelation('exercise', 'mental');
    if (Math.abs(exerciseMoodCorr.correlation) > 0.3) {
      insights.push({
        id: 'exercise-mood-correlation',
        type: 'correlation',
        title: 'Exercise & Mental Health',
        description: `Your exercise patterns show a ${exerciseMoodCorr.correlation > 0 ? 'positive' : 'negative'} correlation (${(exerciseMoodCorr.correlation * 100).toFixed(0)}%) with your mood and energy levels.`,
        confidence: Math.abs(exerciseMoodCorr.correlation),
        sourceApps: ['nutrition-symptoms-tracker', 'mindtrack'],
        dataPoints: exerciseMoodCorr.dataPoints,
        actionable: true,
        recommendations: this.getExerciseMoodRecommendations(exerciseMoodCorr.correlation),
        timeframe: 'Last 30 days',
      });
    }

    return insights;
  }

  // Pattern insights
  private generatePatternInsights(): CrossAppInsight[] {
    const insights: CrossAppInsight[] = [];

    // Weekly patterns
    const weeklyPatterns = this.analyzeWeeklyPatterns();
    if (weeklyPatterns.length > 0) {
      insights.push({
        id: 'weekly-patterns',
        type: 'pattern',
        title: 'Weekly Health Patterns',
        description: `You show consistent patterns in your health data across the week. ${weeklyPatterns[0].description}`,
        confidence: 0.7,
        sourceApps: ['all'],
        dataPoints: this.unifiedData.length,
        actionable: true,
        recommendations: this.getWeeklyPatternRecommendations(weeklyPatterns),
        timeframe: 'Last 4 weeks',
      });
    }

    // Symptom clusters
    const symptomClusters = this.analyzeSymptomClusters();
    if (symptomClusters.length > 0) {
      insights.push({
        id: 'symptom-clusters',
        type: 'pattern',
        title: 'Symptom Clustering Patterns',
        description: `Your symptoms tend to cluster together. ${symptomClusters[0].description}`,
        confidence: 0.6,
        sourceApps: ['skintrack-plus', 'gastroguard', 'mindtrack'],
        dataPoints: this.unifiedData.length,
        actionable: true,
        recommendations: this.getSymptomClusterRecommendations(symptomClusters),
        timeframe: 'Last 30 days',
      });
    }

    return insights;
  }

  // Prediction insights
  private generatePredictionInsights(): CrossAppInsight[] {
    const insights: CrossAppInsight[] = [];

    // Flare-up predictions
    const flareUpRisk = this.predictFlareUpRisk();
    if (flareUpRisk.risk > 0.6) {
      insights.push({
        id: 'flare-up-prediction',
        type: 'prediction',
        title: 'High Flare-Up Risk Detected',
        description: `Based on your recent data patterns, you have a ${(flareUpRisk.risk * 100).toFixed(0)}% risk of experiencing symptom flare-ups in the next 48 hours.`,
        confidence: flareUpRisk.confidence,
        sourceApps: ['all'],
        dataPoints: this.unifiedData.length,
        actionable: true,
        recommendations: this.getFlareUpPreventionRecommendations(flareUpRisk),
        timeframe: 'Next 48 hours',
      });
    }

    // Mood dip predictions
    const moodDipRisk = this.predictMoodDip();
    if (moodDipRisk.risk > 0.5) {
      insights.push({
        id: 'mood-dip-prediction',
        type: 'prediction',
        title: 'Potential Mood Dip Ahead',
        description: `Your data suggests a ${(moodDipRisk.risk * 100).toFixed(0)}% chance of experiencing a mood dip in the next 24-48 hours.`,
        confidence: moodDipRisk.confidence,
        sourceApps: ['mindtrack', 'sleep-stress-logger'],
        dataPoints: this.unifiedData.length,
        actionable: true,
        recommendations: this.getMoodDipPreventionRecommendations(moodDipRisk),
        timeframe: 'Next 24-48 hours',
      });
    }

    return insights;
  }

  // Recommendation insights
  private generateRecommendationInsights(): CrossAppInsight[] {
    const insights: CrossAppInsight[] = [];

    // Optimal timing recommendations
    const timingRecs = this.getOptimalTimingRecommendations();
    if (timingRecs.length > 0) {
      insights.push({
        id: 'optimal-timing',
        type: 'recommendation',
        title: 'Optimal Health Timing',
        description: `Based on your patterns, ${timingRecs[0].description}`,
        confidence: 0.8,
        sourceApps: ['all'],
        dataPoints: this.unifiedData.length,
        actionable: true,
        recommendations: timingRecs.map(rec => rec.recommendation),
        timeframe: 'Ongoing',
      });
    }

    // Lifestyle optimization
    const lifestyleRecs = this.getLifestyleOptimizationRecommendations();
    if (lifestyleRecs.length > 0) {
      insights.push({
        id: 'lifestyle-optimization',
        type: 'recommendation',
        title: 'Lifestyle Optimization Opportunities',
        description: `Your data reveals several opportunities to optimize your health routine.`,
        confidence: 0.7,
        sourceApps: ['all'],
        dataPoints: this.unifiedData.length,
        actionable: true,
        recommendations: lifestyleRecs,
        timeframe: 'Next 2 weeks',
      });
    }

    return insights;
  }

  // Correlation calculation methods
  private calculateCorrelation(type1: string, type2: string): { correlation: number; dataPoints: number } {
    const dataPoints = this.unifiedData.filter(item => 
      this.hasDataType(item, type1) && this.hasDataType(item, type2)
    );

    if (dataPoints.length < 3) {
      return { correlation: 0, dataPoints: 0 };
    }

    const values1 = dataPoints.map(item => this.extractNumericValue(item, type1));
    const values2 = dataPoints.map(item => this.extractNumericValue(item, type2));

    const correlation = this.pearsonCorrelation(values1, values2);
    return { correlation, dataPoints: dataPoints.length };
  }

  private hasDataType(item: UnifiedHealthData, type: string): boolean {
    switch (type) {
      case 'skin': return !!item.skin;
      case 'gastro': return !!item.gastro;
      case 'mental': return !!item.mental;
      case 'sleep': return !!item.sleepStress?.sleep;
      case 'stress': return !!item.sleepStress?.stress;
      case 'nutrition': return !!item.nutrition;
      case 'exercise': return !!item.exercise;
      default: return false;
    }
  }

  private extractNumericValue(item: UnifiedHealthData, type: string): number {
    switch (type) {
      case 'skin': return item.skin?.severity || 0;
      case 'gastro': return (item.gastro?.symptoms?.reflux || 0) + (item.gastro?.symptoms?.bloating || 0);
      case 'mental': return item.mental?.mood || 0;
      case 'sleep': return item.sleepStress?.sleep?.quality || 0;
      case 'stress': return item.sleepStress?.stress?.level || 0;
      case 'nutrition': return item.nutrition?.stress || 0;
      case 'exercise': return item.exercise ? 1 : 0;
      default: return 0;
    }
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Pattern analysis methods
  private analyzeWeeklyPatterns(): Array<{ day: string; description: string }> {
    const dayPatterns: { [day: string]: number[] } = {};
    
    this.unifiedData.forEach(item => {
      const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayPatterns[day]) dayPatterns[day] = [];
      
      const stressLevel = item.sleepStress?.stress?.level || item.mental?.stress || 0;
      dayPatterns[day].push(stressLevel);
    });

    const patterns = Object.entries(dayPatterns)
      .map(([day, values]) => ({
        day,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        description: `${day}s tend to have ${values.reduce((a, b) => a + b, 0) / values.length > 5 ? 'higher' : 'lower'} stress levels`,
      }))
      .sort((a, b) => b.average - a.average);

    return patterns.slice(0, 2);
  }

  private analyzeSymptomClusters(): Array<{ symptoms: string[]; description: string }> {
    const clusters = [
      {
        symptoms: ['skin', 'stress'],
        description: 'Skin issues often coincide with high stress levels',
      },
      {
        symptoms: ['gastro', 'mood'],
        description: 'Digestive symptoms frequently occur with mood changes',
      },
      {
        symptoms: ['sleep', 'stress', 'mood'],
        description: 'Sleep, stress, and mood form a interconnected cluster',
      },
    ];

    return clusters.filter(cluster => 
      cluster.symptoms.every(symptom => 
        this.unifiedData.some(item => this.hasDataType(item, symptom))
      )
    );
  }

  // Prediction methods
  private predictFlareUpRisk(): { risk: number; confidence: number; factors: string[] } {
    const recentData = this.unifiedData.slice(-7); // Last 7 days
    let riskScore = 0;
    const factors: string[] = [];

    // Check for stress accumulation
    const avgStress = recentData.reduce((sum, item) => 
      sum + (item.sleepStress?.stress?.level || item.mental?.stress || 0), 0
    ) / recentData.length;

    if (avgStress > 7) {
      riskScore += 0.3;
      factors.push('High stress levels');
    }

    // Check for poor sleep
    const avgSleepQuality = recentData.reduce((sum, item) => 
      sum + (item.sleepStress?.sleep?.quality || 0), 0
    ) / recentData.length;

    if (avgSleepQuality < 5) {
      riskScore += 0.2;
      factors.push('Poor sleep quality');
    }

    // Check for mood decline
    const recentMood = recentData.slice(-3).reduce((sum, item) => 
      sum + (item.mental?.mood || 0), 0
    ) / 3;
    const earlierMood = recentData.slice(-7, -3).reduce((sum, item) => 
      sum + (item.mental?.mood || 0), 0
    ) / 4;

    if (recentMood < earlierMood - 1) {
      riskScore += 0.2;
      factors.push('Declining mood');
    }

    return {
      risk: Math.min(riskScore, 1),
      confidence: 0.7,
      factors,
    };
  }

  private predictMoodDip(): { risk: number; confidence: number; factors: string[] } {
    const recentData = this.unifiedData.slice(-5); // Last 5 days
    let riskScore = 0;
    const factors: string[] = [];

    // Check for stress accumulation
    const avgStress = recentData.reduce((sum, item) => 
      sum + (item.sleepStress?.stress?.level || item.mental?.stress || 0), 0
    ) / recentData.length;

    if (avgStress > 6) {
      riskScore += 0.4;
      factors.push('Elevated stress');
    }

    // Check for sleep disruption
    const avgSleepQuality = recentData.reduce((sum, item) => 
      sum + (item.sleepStress?.sleep?.quality || 0), 0
    ) / recentData.length;

    if (avgSleepQuality < 6) {
      riskScore += 0.3;
      factors.push('Sleep disruption');
    }

    return {
      risk: Math.min(riskScore, 1),
      confidence: 0.6,
      factors,
    };
  }

  // Recommendation methods
  private getOptimalTimingRecommendations(): Array<{ description: string; recommendation: string }> {
    const recommendations = [
      {
        description: 'Your stress levels are lowest in the morning',
        recommendation: 'Schedule important tasks and exercise in the morning hours',
      },
      {
        description: 'Your sleep quality is best when you go to bed before 11 PM',
        recommendation: 'Maintain a consistent bedtime before 11 PM',
      },
    ];

    return recommendations;
  }

  private getLifestyleOptimizationRecommendations(): string[] {
    return [
      'Increase water intake to 2.5L daily to improve skin and digestive health',
      'Add 10 minutes of meditation to your morning routine',
      'Take a 5-minute walk after meals to aid digestion',
      'Establish a consistent sleep schedule with 7-8 hours nightly',
    ];
  }

  // Specific recommendation generators
  private getSkinNutritionRecommendations(correlation: number): string[] {
    if (correlation > 0.3) {
      return [
        'Consider reducing dairy and processed foods',
        'Increase intake of anti-inflammatory foods like berries and leafy greens',
        'Track specific foods that trigger breakouts',
      ];
    } else if (correlation < -0.3) {
      return [
        'Your current nutrition seems to support skin health',
        'Continue with your current dietary patterns',
        'Consider adding more omega-3 rich foods',
      ];
    }
    return ['Monitor nutrition patterns more closely for skin correlations'];
  }

  private getGastroMoodRecommendations(correlation: number): string[] {
    if (correlation > 0.3) {
      return [
        'Practice stress management techniques before meals',
        'Consider probiotics to support gut-brain connection',
        'Try mindful eating practices',
      ];
    }
    return ['Focus on stress reduction to improve digestive health'];
  }

  private getSleepStressRecommendations(correlation: number): string[] {
    if (correlation < -0.3) {
      return [
        'Implement a relaxing bedtime routine',
        'Avoid screens 1 hour before bed',
        'Try deep breathing exercises before sleep',
      ];
    }
    return ['Work on stress management to improve sleep quality'];
  }

  private getExerciseMoodRecommendations(correlation: number): string[] {
    if (correlation > 0.3) {
      return [
        'Maintain your current exercise routine',
        'Consider adding yoga or meditation',
        'Try exercising outdoors for additional mood benefits',
      ];
    }
    return ['Start with light exercise to boost mood and energy'];
  }

  private getWeeklyPatternRecommendations(patterns: Array<{ day: string; description: string }>): string[] {
    return [
      `Plan lighter activities on ${patterns[0].day}s`,
      'Schedule self-care activities on high-stress days',
      'Use pattern awareness to plan your week more effectively',
    ];
  }

  private getSymptomClusterRecommendations(clusters: Array<{ symptoms: string[]; description: string }>): string[] {
    return [
      'Address root causes that affect multiple symptoms',
      'Consider holistic treatment approaches',
      'Track symptom clusters to identify common triggers',
    ];
  }

  private getFlareUpPreventionRecommendations(prediction: { risk: number; factors: string[] }): string[] {
    return [
      'Implement stress reduction techniques immediately',
      'Ensure adequate sleep (7-8 hours)',
      'Avoid known triggers for the next 48 hours',
      'Have your usual remedies readily available',
    ];
  }

  private getMoodDipPreventionRecommendations(prediction: { risk: number; factors: string[] }): string[] {
    return [
      'Engage in mood-boosting activities',
      'Connect with supportive friends or family',
      'Practice gratitude journaling',
      'Consider light exercise or outdoor time',
    ];
  }

  // Data loading
  private loadUnifiedData(): void {
    // This would integrate with the data sync system
    // For now, we'll use mock data
    this.unifiedData = this.generateMockUnifiedData();
  }

  private generateMockUnifiedData(): UnifiedHealthData[] {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates.map(date => ({
      date,
      skin: Math.random() > 0.7 ? {
        date,
        skinCondition: Math.random() > 0.5 ? 'mild_breakout' : 'clear',
        severity: Math.floor(Math.random() * 5) + 1,
        affectedAreas: Math.random() > 0.5 ? ['forehead'] : [],
        triggers: Math.random() > 0.5 ? ['stress'] : [],
        treatments: Math.random() > 0.5 ? ['salicylic_acid'] : [],
      } : undefined,
      gastro: Math.random() > 0.6 ? {
        date,
        symptoms: {
          reflux: Math.floor(Math.random() * 8),
          bloating: Math.floor(Math.random() * 6),
          nausea: Math.floor(Math.random() * 4),
          stomachPain: Math.floor(Math.random() * 5),
          diarrhea: Math.floor(Math.random() * 3),
          constipation: Math.floor(Math.random() * 3),
        },
        meals: [],
        medications: [],
      } : undefined,
      mental: Math.random() > 0.5 ? {
        date,
        mood: Math.floor(Math.random() * 10) + 1,
        anxiety: Math.floor(Math.random() * 10) + 1,
        depression: Math.floor(Math.random() * 10) + 1,
        stress: Math.floor(Math.random() * 10) + 1,
        energy: Math.floor(Math.random() * 10) + 1,
        sleepQuality: Math.floor(Math.random() * 10) + 1,
        activities: [],
        medications: [],
      } : undefined,
      sleepStress: Math.random() > 0.3 ? {
        date,
        sleep: {
          bedtime: '23:00',
          wakeTime: '07:00',
          duration: 7 + Math.random() * 2,
          quality: Math.floor(Math.random() * 10) + 1,
          interruptions: Math.floor(Math.random() * 3),
          deepSleep: 1 + Math.random() * 2,
          remSleep: 1 + Math.random() * 2,
          lightSleep: 3 + Math.random() * 3,
        },
        stress: {
          level: Math.floor(Math.random() * 10) + 1,
          triggers: Math.random() > 0.5 ? ['work'] : [],
          copingStrategies: Math.random() > 0.5 ? ['deep_breathing'] : [],
          effectiveness: Math.floor(Math.random() * 10) + 1,
        },
        activities: [],
      } : undefined,
    }));
  }
}
