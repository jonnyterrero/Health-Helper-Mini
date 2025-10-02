// Symptom Timeline Dashboard with AI-generated insights
export interface TimelineEntry {
  date: string;
  symptoms: Array<{
    name: string;
    severity: number;
    duration: number; // minutes
    triggers: string[];
  }>;
  mood: {
    score: number;
    emotions: string[];
  };
  lifestyle: {
    sleep: number;
    stress: number;
    exercise: boolean;
    caffeine: boolean;
    waterIntake: number;
  };
  remedies: Array<{
    name: string;
    effectiveness: number;
    timeToRelief: number;
  }>;
}

export interface TimelineInsight {
  type: 'improvement' | 'deterioration' | 'pattern' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  data: any;
  confidence: number;
  timeframe: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface TrendAnalysis {
  metric: string;
  direction: 'improving' | 'worsening' | 'stable';
  change: number; // percentage
  timeframe: string;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

export interface MonthlySummary {
  period: string;
  totalSymptoms: number;
  averageSeverity: number;
  topSymptoms: Array<{ name: string; frequency: number; severity: number }>;
  lifestyleFactors: {
    averageSleep: number;
    averageStress: number;
    exerciseFrequency: number;
    caffeineConsumption: number;
  };
  insights: TimelineInsight[];
  trends: TrendAnalysis[];
  recommendations: string[];
}

// AI Insight Generator
export class InsightGenerator {
  generateInsights(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    if (timelineData.length < 7) {
      return [{
        type: 'recommendation',
        title: 'Need More Data',
        description: 'Track your symptoms for at least a week to get meaningful insights.',
        data: null,
        confidence: 1.0,
        timeframe: 'ongoing',
        actionable: true,
        priority: 'high'
      }];
    }
    
    // Analyze symptom frequency trends
    insights.push(...this.analyzeSymptomTrends(timelineData));
    
    // Analyze lifestyle correlations
    insights.push(...this.analyzeLifestyleCorrelations(timelineData));
    
    // Analyze remedy effectiveness
    insights.push(...this.analyzeRemedyEffectiveness(timelineData));
    
    // Analyze mood-symptom relationships
    insights.push(...this.analyzeMoodSymptomRelationships(timelineData));
    
    // Generate improvement insights
    insights.push(...this.generateImprovementInsights(timelineData));
    
    // Generate pattern insights
    insights.push(...this.generatePatternInsights(timelineData));
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  private analyzeSymptomTrends(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    // Group data by week
    const weeklyData = this.groupByWeek(timelineData);
    
    if (weeklyData.length >= 2) {
      const recentWeek = weeklyData[weeklyData.length - 1];
      const previousWeek = weeklyData[weeklyData.length - 2];
      
      // Calculate symptom frequency changes
      const symptomChanges = this.calculateSymptomChanges(recentWeek, previousWeek);
      
      symptomChanges.forEach(change => {
        if (Math.abs(change.percentage) > 20) { // Significant change
          insights.push({
            type: change.percentage > 0 ? 'deterioration' : 'improvement',
            title: `${change.symptom} ${change.percentage > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(change.percentage).toFixed(0)}%`,
            description: `Your ${change.symptom} symptoms ${change.percentage > 0 ? 'increased' : 'decreased'} from ${change.previous} to ${change.current} episodes this week.`,
            data: change,
            confidence: 0.8,
            timeframe: 'past week',
            actionable: true,
            priority: Math.abs(change.percentage) > 50 ? 'high' : 'medium'
          });
        }
      });
    }
    
    return insights;
  }
  
  private analyzeLifestyleCorrelations(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    // Analyze sleep-symptom correlation
    const sleepCorrelation = this.calculateCorrelation(
      timelineData.map(d => d.lifestyle.sleep),
      timelineData.map(d => d.symptoms.reduce((sum, s) => sum + s.severity, 0))
    );
    
    if (Math.abs(sleepCorrelation) > 0.3) {
      insights.push({
        type: 'correlation',
        title: 'Sleep Quality Affects Symptoms',
        description: `Your sleep quality has a ${sleepCorrelation > 0 ? 'positive' : 'negative'} correlation with symptom severity (${Math.abs(sleepCorrelation).toFixed(2)}).`,
        data: { correlation: sleepCorrelation, factor: 'sleep' },
        confidence: 0.7,
        timeframe: 'past month',
        actionable: true,
        priority: 'medium'
      });
    }
    
    // Analyze stress-symptom correlation
    const stressCorrelation = this.calculateCorrelation(
      timelineData.map(d => d.lifestyle.stress),
      timelineData.map(d => d.symptoms.reduce((sum, s) => sum + s.severity, 0))
    );
    
    if (Math.abs(stressCorrelation) > 0.4) {
      insights.push({
        type: 'correlation',
        title: 'Stress Strongly Correlates with Symptoms',
        description: `High stress days show ${Math.abs(stressCorrelation * 100).toFixed(0)}% correlation with increased symptom severity.`,
        data: { correlation: stressCorrelation, factor: 'stress' },
        confidence: 0.8,
        timeframe: 'past month',
        actionable: true,
        priority: 'high'
      });
    }
    
    // Analyze water intake correlation
    const waterCorrelation = this.calculateCorrelation(
      timelineData.map(d => d.lifestyle.waterIntake),
      timelineData.map(d => d.symptoms.length)
    );
    
    if (waterCorrelation < -0.3) {
      insights.push({
        type: 'pattern',
        title: 'Water Intake Reduces Symptoms',
        description: `Your flare-ups decreased by ${Math.abs(waterCorrelation * 40).toFixed(0)}% when water intake exceeded 2L/day.`,
        data: { correlation: waterCorrelation, factor: 'water' },
        confidence: 0.7,
        timeframe: 'past month',
        actionable: true,
        priority: 'medium'
      });
    }
    
    return insights;
  }
  
  private analyzeRemedyEffectiveness(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    // Group remedies by effectiveness
    const remedyStats: { [key: string]: { total: number; effective: number; avgTime: number } } = {};
    
    timelineData.forEach(entry => {
      entry.remedies.forEach(remedy => {
        if (!remedyStats[remedy.name]) {
          remedyStats[remedy.name] = { total: 0, effective: 0, avgTime: 0 };
        }
        remedyStats[remedy.name].total++;
        if (remedy.effectiveness > 3) {
          remedyStats[remedy.name].effective++;
        }
        remedyStats[remedy.name].avgTime += remedy.timeToRelief;
      });
    });
    
    Object.entries(remedyStats).forEach(([remedy, stats]) => {
      if (stats.total >= 3) { // Need at least 3 uses
        const effectiveness = (stats.effective / stats.total) * 100;
        const avgTime = stats.avgTime / stats.total;
        
        if (effectiveness > 70) {
          insights.push({
            type: 'improvement',
            title: `${remedy} is Highly Effective`,
            description: `${remedy} worked ${effectiveness.toFixed(0)}% of the time, with relief in ${avgTime.toFixed(0)} minutes on average.`,
            data: { remedy, effectiveness, avgTime },
            confidence: 0.8,
            timeframe: 'past month',
            actionable: true,
            priority: 'medium'
          });
        }
      }
    });
    
    return insights;
  }
  
  private analyzeMoodSymptomRelationships(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    // Analyze mood-symptom correlation
    const moodCorrelation = this.calculateCorrelation(
      timelineData.map(d => d.mood.score),
      timelineData.map(d => d.symptoms.reduce((sum, s) => sum + s.severity, 0))
    );
    
    if (Math.abs(moodCorrelation) > 0.4) {
      insights.push({
        type: 'correlation',
        title: 'Mood Predicts Symptom Severity',
        description: `Your mood score has a ${Math.abs(moodCorrelation * 100).toFixed(0)}% correlation with symptom severity. Low mood days often precede symptom flare-ups.`,
        data: { correlation: moodCorrelation, factor: 'mood' },
        confidence: 0.8,
        timeframe: 'past month',
        actionable: true,
        priority: 'high'
      });
    }
    
    return insights;
  }
  
  private generateImprovementInsights(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    // Check for overall improvement trends
    const recentData = timelineData.slice(-7); // Last week
    const olderData = timelineData.slice(-14, -7); // Week before
    
    if (recentData.length >= 5 && olderData.length >= 5) {
      const recentAvgSeverity = recentData.reduce((sum, d) => 
        sum + d.symptoms.reduce((s, symptom) => s + symptom.severity, 0), 0
      ) / recentData.length;
      
      const olderAvgSeverity = olderData.reduce((sum, d) => 
        sum + d.symptoms.reduce((s, symptom) => s + symptom.severity, 0), 0
      ) / olderData.length;
      
      const improvement = ((olderAvgSeverity - recentAvgSeverity) / olderAvgSeverity) * 100;
      
      if (improvement > 20) {
        insights.push({
          type: 'improvement',
          title: 'Significant Symptom Improvement',
          description: `Your overall symptom severity has decreased by ${improvement.toFixed(0)}% compared to last week. Keep up the good work!`,
          data: { improvement, recentAvgSeverity, olderAvgSeverity },
          confidence: 0.9,
          timeframe: 'past week',
          actionable: false,
          priority: 'medium'
        });
      }
    }
    
    return insights;
  }
  
  private generatePatternInsights(timelineData: TimelineEntry[]): TimelineInsight[] {
    const insights: TimelineInsight[] = [];
    
    // Analyze day-of-week patterns
    const dayPatterns: { [key: string]: number[] } = {};
    
    timelineData.forEach(entry => {
      const dayOfWeek = new Date(entry.date).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
      if (!dayPatterns[dayName]) {
        dayPatterns[dayName] = [];
      }
      dayPatterns[dayName].push(entry.symptoms.reduce((sum, s) => sum + s.severity, 0));
    });
    
    // Find the worst day
    const dayAverages = Object.entries(dayPatterns).map(([day, severities]) => ({
      day,
      average: severities.reduce((sum, s) => sum + s, 0) / severities.length,
      count: severities.length
    })).filter(d => d.count >= 2);
    
    if (dayAverages.length > 0) {
      const worstDay = dayAverages.reduce((worst, current) => 
        current.average > worst.average ? current : worst
      );
      
      if (worstDay.average > 3) {
        insights.push({
          type: 'pattern',
          title: `${worstDay.day}s Are Your Worst Day`,
          description: `Your symptoms are most severe on ${worstDay.day}s, with an average severity of ${worstDay.average.toFixed(1)}/10. Consider planning lighter activities on these days.`,
          data: { worstDay, dayPatterns },
          confidence: 0.7,
          timeframe: 'past month',
          actionable: true,
          priority: 'medium'
        });
      }
    }
    
    return insights;
  }
  
  private groupByWeek(timelineData: TimelineEntry[]): TimelineEntry[][] {
    const weeks: { [key: string]: TimelineEntry[] } = {};
    
    timelineData.forEach(entry => {
      const date = new Date(entry.date);
      const weekKey = this.getWeekKey(date);
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(entry);
    });
    
    return Object.values(weeks).sort((a, b) => 
      new Date(a[0].date).getTime() - new Date(b[0].date).getTime()
    );
  }
  
  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }
  
  private calculateSymptomChanges(recentWeek: TimelineEntry[], previousWeek: TimelineEntry[]): Array<{
    symptom: string;
    current: number;
    previous: number;
    percentage: number;
  }> {
    const changes: Array<{ symptom: string; current: number; previous: number; percentage: number }> = [];
    
    // Get all unique symptoms
    const allSymptoms = new Set<string>();
    [...recentWeek, ...previousWeek].forEach(entry => {
      entry.symptoms.forEach(symptom => allSymptoms.add(symptom.name));
    });
    
    allSymptoms.forEach(symptom => {
      const recentCount = recentWeek.reduce((sum, entry) => 
        sum + entry.symptoms.filter(s => s.name === symptom).length, 0
      );
      
      const previousCount = previousWeek.reduce((sum, entry) => 
        sum + entry.symptoms.filter(s => s.name === symptom).length, 0
      );
      
      if (previousCount > 0) {
        const percentage = ((recentCount - previousCount) / previousCount) * 100;
        changes.push({
          symptom,
          current: recentCount,
          previous: previousCount,
          percentage
        });
      }
    });
    
    return changes;
  }
  
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Trend Analyzer
export class TrendAnalyzer {
  analyzeTrends(timelineData: TimelineEntry[]): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];
    
    if (timelineData.length < 14) return trends;
    
    // Analyze symptom frequency trend
    const symptomTrend = this.analyzeSymptomFrequencyTrend(timelineData);
    if (symptomTrend) trends.push(symptomTrend);
    
    // Analyze severity trend
    const severityTrend = this.analyzeSeverityTrend(timelineData);
    if (severityTrend) trends.push(severityTrend);
    
    // Analyze sleep quality trend
    const sleepTrend = this.analyzeSleepTrend(timelineData);
    if (sleepTrend) trends.push(sleepTrend);
    
    // Analyze stress trend
    const stressTrend = this.analyzeStressTrend(timelineData);
    if (stressTrend) trends.push(stressTrend);
    
    return trends;
  }
  
  private analyzeSymptomFrequencyTrend(timelineData: TimelineEntry[]): TrendAnalysis | null {
    const recent = timelineData.slice(-7);
    const older = timelineData.slice(-14, -7);
    
    if (recent.length < 5 || older.length < 5) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.symptoms.length, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.symptoms.length, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      metric: 'Symptom Frequency',
      direction: change > 10 ? 'worsening' : change < -10 ? 'improving' : 'stable',
      change: Math.abs(change),
      timeframe: 'past 2 weeks',
      significance: Math.abs(change) > 30 ? 'high' : Math.abs(change) > 15 ? 'medium' : 'low',
      description: `Symptom frequency has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}%`
    };
  }
  
  private analyzeSeverityTrend(timelineData: TimelineEntry[]): TrendAnalysis | null {
    const recent = timelineData.slice(-7);
    const older = timelineData.slice(-14, -7);
    
    if (recent.length < 5 || older.length < 5) return null;
    
    const recentAvg = recent.reduce((sum, d) => 
      sum + d.symptoms.reduce((s, symptom) => s + symptom.severity, 0), 0
    ) / recent.length;
    
    const olderAvg = older.reduce((sum, d) => 
      sum + d.symptoms.reduce((s, symptom) => s + symptom.severity, 0), 0
    ) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      metric: 'Symptom Severity',
      direction: change > 10 ? 'worsening' : change < -10 ? 'improving' : 'stable',
      change: Math.abs(change),
      timeframe: 'past 2 weeks',
      significance: Math.abs(change) > 25 ? 'high' : Math.abs(change) > 15 ? 'medium' : 'low',
      description: `Average symptom severity has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}%`
    };
  }
  
  private analyzeSleepTrend(timelineData: TimelineEntry[]): TrendAnalysis | null {
    const recent = timelineData.slice(-7);
    const older = timelineData.slice(-14, -7);
    
    if (recent.length < 5 || older.length < 5) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.lifestyle.sleep, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.lifestyle.sleep, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      metric: 'Sleep Quality',
      direction: change > 5 ? 'improving' : change < -5 ? 'worsening' : 'stable',
      change: Math.abs(change),
      timeframe: 'past 2 weeks',
      significance: Math.abs(change) > 15 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low',
      description: `Sleep quality has ${change > 0 ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(0)}%`
    };
  }
  
  private analyzeStressTrend(timelineData: TimelineEntry[]): TrendAnalysis | null {
    const recent = timelineData.slice(-7);
    const older = timelineData.slice(-14, -7);
    
    if (recent.length < 5 || older.length < 5) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.lifestyle.stress, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.lifestyle.stress, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      metric: 'Stress Level',
      direction: change > 5 ? 'worsening' : change < -5 ? 'improving' : 'stable',
      change: Math.abs(change),
      timeframe: 'past 2 weeks',
      significance: Math.abs(change) > 20 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low',
      description: `Stress levels have ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}%`
    };
  }
}

// Main Timeline Dashboard
export class SymptomTimelineDashboard {
  private insightGenerator: InsightGenerator;
  private trendAnalyzer: TrendAnalyzer;
  
  constructor() {
    this.insightGenerator = new InsightGenerator();
    this.trendAnalyzer = new TrendAnalyzer();
  }
  
  generateMonthlySummary(timelineData: TimelineEntry[]): MonthlySummary {
    const period = this.getCurrentMonth();
    
    // Calculate basic statistics
    const totalSymptoms = timelineData.reduce((sum, d) => sum + d.symptoms.length, 0);
    const averageSeverity = timelineData.length > 0 ? 
      timelineData.reduce((sum, d) => 
        sum + d.symptoms.reduce((s, symptom) => s + symptom.severity, 0), 0
      ) / timelineData.reduce((sum, d) => sum + d.symptoms.length, 0) : 0;
    
    // Get top symptoms
    const symptomCounts: { [key: string]: { frequency: number; severity: number } } = {};
    timelineData.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        if (!symptomCounts[symptom.name]) {
          symptomCounts[symptom.name] = { frequency: 0, severity: 0 };
        }
        symptomCounts[symptom.name].frequency++;
        symptomCounts[symptom.name].severity += symptom.severity;
      });
    });
    
    const topSymptoms = Object.entries(symptomCounts)
      .map(([name, stats]) => ({
        name,
        frequency: stats.frequency,
        severity: stats.severity / stats.frequency
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
    
    // Calculate lifestyle factors
    const lifestyleFactors = {
      averageSleep: timelineData.length > 0 ? 
        timelineData.reduce((sum, d) => sum + d.lifestyle.sleep, 0) / timelineData.length : 0,
      averageStress: timelineData.length > 0 ? 
        timelineData.reduce((sum, d) => sum + d.lifestyle.stress, 0) / timelineData.length : 0,
      exerciseFrequency: timelineData.length > 0 ? 
        timelineData.filter(d => d.lifestyle.exercise).length / timelineData.length : 0,
      caffeineConsumption: timelineData.length > 0 ? 
        timelineData.filter(d => d.lifestyle.caffeine).length / timelineData.length : 0
    };
    
    // Generate insights and trends
    const insights = this.insightGenerator.generateInsights(timelineData);
    const trends = this.trendAnalyzer.analyzeTrends(timelineData);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(insights, trends, lifestyleFactors);
    
    return {
      period,
      totalSymptoms,
      averageSeverity,
      topSymptoms,
      lifestyleFactors,
      insights,
      trends,
      recommendations
    };
  }
  
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  private generateRecommendations(insights: TimelineInsight[], trends: TrendAnalysis[], lifestyleFactors: any): string[] {
    const recommendations: string[] = [];
    
    // Based on insights
    insights.forEach(insight => {
      if (insight.actionable && insight.priority === 'high') {
        if (insight.type === 'correlation' && insight.data.factor === 'stress') {
          recommendations.push('Implement daily stress management techniques like meditation or deep breathing');
        }
        if (insight.type === 'correlation' && insight.data.factor === 'sleep') {
          recommendations.push('Prioritize sleep hygiene and aim for 7-9 hours nightly');
        }
        if (insight.type === 'pattern' && insight.data.factor === 'water') {
          recommendations.push('Increase water intake to at least 2L per day');
        }
      }
    });
    
    // Based on trends
    trends.forEach(trend => {
      if (trend.significance === 'high') {
        if (trend.metric === 'Symptom Frequency' && trend.direction === 'worsening') {
          recommendations.push('Consider reviewing recent lifestyle changes that may be affecting symptoms');
        }
        if (trend.metric === 'Sleep Quality' && trend.direction === 'worsening') {
          recommendations.push('Focus on improving sleep quality through better sleep hygiene');
        }
        if (trend.metric === 'Stress Level' && trend.direction === 'worsening') {
          recommendations.push('Implement stress reduction strategies immediately');
        }
      }
    });
    
    // Based on lifestyle factors
    if (lifestyleFactors.averageSleep < 6) {
      recommendations.push('Your average sleep is below 6 hours - prioritize getting more rest');
    }
    if (lifestyleFactors.averageStress > 7) {
      recommendations.push('Your stress levels are consistently high - consider stress management');
    }
    if (lifestyleFactors.exerciseFrequency < 0.3) {
      recommendations.push('Increase exercise frequency to at least 3 times per week');
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }
}
