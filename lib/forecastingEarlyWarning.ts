// Forecasting and Early Warning System with time-series models
export interface RiskFactor {
  factor: string;
  value: number;
  threshold: number;
  risk: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export interface EarlyWarning {
  id: string;
  type: 'symptom_flare' | 'mood_dip' | 'energy_crash' | 'sleep_disruption';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100%
  timeframe: string; // "next 24 hours", "tomorrow", "next 3 days"
  riskFactors: RiskFactor[];
  recommendations: string[];
  confidence: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface ForecastData {
  date: string;
  predicted: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface TimeSeriesModel {
  name: string;
  accuracy: number;
  predictions: ForecastData[];
  lastTrained: string;
}

// Prophet-like time series forecasting
export class ProphetForecaster {
  private trend: number[] = [];
  private seasonal: number[] = [];
  private residuals: number[] = [];
  private trained: boolean = false;
  
  train(data: Array<{ date: string; value: number; factors: any }>) {
    if (data.length < 14) return; // Need at least 2 weeks of data
    
    // Decompose time series
    const values = data.map(d => d.value);
    this.trend = this.calculateTrend(values);
    this.seasonal = this.calculateSeasonal(values);
    this.residuals = values.map((val, i) => val - this.trend[i] - this.seasonal[i]);
    
    this.trained = true;
  }
  
  forecast(days: number = 7): ForecastData[] {
    if (!this.trained) return [];
    
    const forecasts: ForecastData[] = [];
    const lastIndex = this.trend.length - 1;
    
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Extend trend (simple linear extrapolation)
      const trendValue = this.trend[lastIndex] + (this.trend[lastIndex] - this.trend[lastIndex - 1]) * i;
      
      // Apply seasonal pattern
      const dayOfWeek = forecastDate.getDay();
      const seasonalValue = this.getSeasonalValue(dayOfWeek);
      
      // Add some noise based on residuals
      const residualValue = this.getResidualValue();
      
      const predicted = Math.max(0, Math.min(100, trendValue + seasonalValue + residualValue));
      
      // Calculate confidence (decreases over time)
      const confidence = Math.max(0.1, 1 - (i * 0.1));
      
      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted,
        confidence,
        riskFactors: this.identifyRiskFactors(forecastDate),
        recommendations: this.generateRecommendations(predicted, forecastDate)
      });
    }
    
    return forecasts;
  }
  
  private calculateTrend(values: number[]): number[] {
    // Simple moving average for trend
    const window = Math.min(7, Math.floor(values.length / 3));
    const trend: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1);
      const end = i + 1;
      const windowValues = values.slice(start, end);
      trend.push(windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length);
    }
    
    return trend;
  }
  
  private calculateSeasonal(values: number[]): number[] {
    // Calculate day-of-week seasonal patterns
    const seasonal: number[] = [];
    const dayOfWeekAverages: { [key: number]: number[] } = {};
    
    // Group by day of week
    values.forEach((value, index) => {
      const dayOfWeek = index % 7;
      if (!dayOfWeekAverages[dayOfWeek]) {
        dayOfWeekAverages[dayOfWeek] = [];
      }
      dayOfWeekAverages[dayOfWeek].push(value);
    });
    
    // Calculate seasonal averages
    const seasonalAverages: { [key: number]: number } = {};
    Object.entries(dayOfWeekAverages).forEach(([day, dayValues]) => {
      seasonalAverages[parseInt(day)] = dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length;
    });
    
    // Apply seasonal pattern
    values.forEach((_, index) => {
      const dayOfWeek = index % 7;
      seasonal.push(seasonalAverages[dayOfWeek] || 0);
    });
    
    return seasonal;
  }
  
  private getSeasonalValue(dayOfWeek: number): number {
    // Return seasonal adjustment for specific day of week
    const seasonalPatterns = {
      0: 0, // Sunday
      1: 5, // Monday (higher stress)
      2: 3, // Tuesday
      3: 2, // Wednesday
      4: 1, // Thursday
      5: -2, // Friday (lower stress)
      6: -1 // Saturday
    };
    
    return seasonalPatterns[dayOfWeek as keyof typeof seasonalPatterns] || 0;
  }
  
  private getResidualValue(): number {
    if (this.residuals.length === 0) return 0;
    
    // Return random residual based on historical variance
    const variance = this.residuals.reduce((sum, val) => sum + val * val, 0) / this.residuals.length;
    const stdDev = Math.sqrt(variance);
    
    // Generate random value from normal distribution (simplified)
    return (Math.random() - 0.5) * stdDev * 2;
  }
  
  private identifyRiskFactors(date: Date): string[] {
    const factors: string[] = [];
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 1) factors.push('Monday stress');
    if (dayOfWeek === 5) factors.push('Weekend anticipation');
    
    return factors;
  }
  
  private generateRecommendations(predicted: number, date: Date): string[] {
    const recommendations: string[] = [];
    
    if (predicted > 70) {
      recommendations.push('High risk day - prioritize stress management');
      recommendations.push('Ensure 7+ hours of sleep tonight');
      recommendations.push('Avoid caffeine after 2pm');
    } else if (predicted > 50) {
      recommendations.push('Moderate risk - maintain healthy habits');
      recommendations.push('Consider light exercise');
    } else {
      recommendations.push('Low risk day - good time for new activities');
    }
    
    return recommendations;
  }
}

// LSTM-like sequence predictor for early warnings
export class LSTMSequencePredictor {
  private sequences: number[][] = [];
  private weights: number[][] = [];
  private trained: boolean = false;
  
  train(sequenceData: Array<{ sequence: number[]; outcome: number }>) {
    if (sequenceData.length < 10) return;
    
    this.sequences = sequenceData.map(d => d.sequence);
    
    // Initialize LSTM-like weights (simplified)
    this.weights = [
      new Array(8).fill(0).map(() => Math.random() * 0.1 - 0.05), // Input weights
      new Array(8).fill(0).map(() => Math.random() * 0.1 - 0.05), // Hidden weights
      new Array(8).fill(0).map(() => Math.random() * 0.1 - 0.05)  // Output weights
    ];
    
    this.trained = true;
  }
  
  predict(sequence: number[]): { probability: number; confidence: string } {
    if (!this.trained || sequence.length === 0) {
      return { probability: 0.5, confidence: 'low' };
    }
    
    // Simplified LSTM forward pass
    let hidden = new Array(8).fill(0);
    let output = new Array(8).fill(0);
    
    sequence.forEach((input, t) => {
      // Input gate
      const inputGate = this.sigmoid(input * this.weights[0][0] + hidden[0] * this.weights[1][0]);
      
      // Forget gate
      const forgetGate = this.sigmoid(input * this.weights[0][1] + hidden[1] * this.weights[1][1]);
      
      // Cell state
      const cellState = forgetGate * (t > 0 ? output[2] : 0) + inputGate * this.tanh(input * this.weights[0][2]);
      
      // Output gate
      const outputGate = this.sigmoid(input * this.weights[0][3] + hidden[3] * this.weights[1][3]);
      
      // Hidden state
      hidden = hidden.map((h, i) => outputGate * this.tanh(cellState));
      
      // Final output
      output = output.map((o, i) => this.sigmoid(hidden[i] * this.weights[2][i]));
    });
    
    const probability = output[0]; // Use first output as probability
    const confidence = sequence.length > 7 ? 'high' : sequence.length > 3 ? 'medium' : 'low';
    
    return { probability, confidence };
  }
  
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
  
  private tanh(x: number): number {
    return Math.tanh(x);
  }
}

// Risk Factor Analyzer
export class RiskFactorAnalyzer {
  analyzeRiskFactors(
    nutritionEntries: any[],
    exerciseEntries: any[],
    targetDate: Date = new Date()
  ): RiskFactor[] {
    
    const riskFactors: RiskFactor[] = [];
    
    // Analyze recent patterns
    const recentEntries = nutritionEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const daysDiff = (targetDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Last 7 days
    });
    
    if (recentEntries.length === 0) return riskFactors;
    
    // Sleep pattern analysis
    const avgSleep = recentEntries.reduce((sum, entry) => sum + entry.sleep, 0) / recentEntries.length;
    if (avgSleep < 6) {
      riskFactors.push({
        factor: 'Sleep Deprivation',
        value: avgSleep,
        threshold: 7,
        risk: 'high',
        description: `Average sleep of ${avgSleep.toFixed(1)} hours is below recommended 7+ hours`,
        recommendation: 'Prioritize sleep hygiene and aim for 7-9 hours nightly'
      });
    }
    
    // Stress level analysis
    const avgStress = recentEntries.reduce((sum, entry) => sum + entry.stress, 0) / recentEntries.length;
    if (avgStress > 7) {
      riskFactors.push({
        factor: 'High Stress',
        value: avgStress,
        threshold: 5,
        risk: 'high',
        description: `Average stress level of ${avgStress.toFixed(1)}/10 is concerning`,
        recommendation: 'Implement stress management techniques like meditation or deep breathing'
      });
    }
    
    // Caffeine pattern analysis
    const caffeineDays = recentEntries.filter(entry => entry.caffeine).length;
    const caffeineRatio = caffeineDays / recentEntries.length;
    if (caffeineRatio > 0.8) {
      riskFactors.push({
        factor: 'High Caffeine Intake',
        value: caffeineRatio * 100,
        threshold: 60,
        risk: 'medium',
        description: `Caffeine consumed on ${(caffeineRatio * 100).toFixed(0)}% of recent days`,
        recommendation: 'Consider reducing caffeine intake, especially after 2pm'
      });
    }
    
    // Exercise pattern analysis
    const exerciseDays = exerciseEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const daysDiff = (targetDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;
    
    const exerciseRatio = exerciseDays / 7;
    if (exerciseRatio < 0.3) {
      riskFactors.push({
        factor: 'Low Exercise Frequency',
        value: exerciseRatio * 100,
        threshold: 50,
        risk: 'medium',
        description: `Only ${(exerciseRatio * 100).toFixed(0)}% of recent days included exercise`,
        recommendation: 'Aim for at least 30 minutes of moderate exercise most days'
      });
    }
    
    // Meal pattern analysis
    const skippedMeals = recentEntries.filter(entry => 
      !entry.foods || entry.foods.length === 0
    ).length;
    
    if (skippedMeals > recentEntries.length * 0.3) {
      riskFactors.push({
        factor: 'Irregular Meal Patterns',
        value: (skippedMeals / recentEntries.length) * 100,
        threshold: 20,
        risk: 'medium',
        description: `Meals skipped on ${((skippedMeals / recentEntries.length) * 100).toFixed(0)}% of recent days`,
        recommendation: 'Maintain regular meal times and avoid skipping meals'
      });
    }
    
    return riskFactors;
  }
}

// Main Early Warning System
export class EarlyWarningSystem {
  private prophetForecaster: ProphetForecaster;
  private lstmPredictor: LSTMSequencePredictor;
  private riskAnalyzer: RiskFactorAnalyzer;
  
  constructor() {
    this.prophetForecaster = new ProphetForecaster();
    this.lstmPredictor = new LSTMSequencePredictor();
    this.riskAnalyzer = new RiskFactorAnalyzer();
  }
  
  generateEarlyWarnings(
    nutritionEntries: any[],
    exerciseEntries: any[],
    symptoms: string[] = ['acid_reflux', 'migraine', 'ibs', 'skin_issues']
  ): EarlyWarning[] {
    
    const warnings: EarlyWarning[] = [];
    
    // Train models
    this.trainModels(nutritionEntries, exerciseEntries);
    
    // Generate forecasts for each symptom
    symptoms.forEach(symptom => {
      const forecast = this.prophetForecaster.forecast(3); // Next 3 days
      const riskFactors = this.riskAnalyzer.analyzeRiskFactors(nutritionEntries, exerciseEntries);
      
      forecast.forEach((dayForecast, index) => {
        if (dayForecast.predicted > 60) { // High risk threshold
          const warning = this.createWarning(
            symptom,
            dayForecast,
            riskFactors,
            index + 1
          );
          warnings.push(warning);
        }
      });
    });
    
    // Generate sequence-based warnings
    const sequenceWarnings = this.generateSequenceWarnings(nutritionEntries, exerciseEntries);
    warnings.push(...sequenceWarnings);
    
    return warnings.sort((a, b) => b.probability - a.probability);
  }
  
  private trainModels(nutritionEntries: any[], exerciseEntries: any[]) {
    // Prepare data for Prophet
    const prophetData = nutritionEntries.map(entry => {
      const hasSymptom = entry.symptoms && entry.symptoms.length > 0;
      return {
        date: entry.date,
        value: hasSymptom ? entry.severity * 20 : 0, // Convert to 0-100 scale
        factors: {
          sleep: entry.sleep,
          stress: entry.stress,
          caffeine: entry.caffeine,
          exercise: !!exerciseEntries.find(ex => 
            new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
          )
        }
      };
    });
    
    this.prophetForecaster.train(prophetData);
    
    // Prepare sequence data for LSTM
    const sequenceData = this.prepareSequenceData(nutritionEntries, exerciseEntries);
    this.lstmPredictor.train(sequenceData);
  }
  
  private prepareSequenceData(nutritionEntries: any[], exerciseEntries: any[]) {
    // Group entries by week and create sequences
    const weeklyData: { [week: string]: any[] } = {};
    
    nutritionEntries.forEach(entry => {
      const week = this.getWeekKey(entry.date);
      if (!weeklyData[week]) weeklyData[week] = [];
      weeklyData[week].push(entry);
    });
    
    const sequences: Array<{ sequence: number[]; outcome: number }> = [];
    
    Object.entries(weeklyData).forEach(([week, entries]) => {
      if (entries.length >= 5) { // Need at least 5 days for sequence
        const sequence = entries.map(entry => {
          const exerciseEntry = exerciseEntries.find(ex => 
            new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
          );
          
          return [
            entry.sleep / 10,
            entry.stress / 10,
            entry.caffeine ? 1 : 0,
            exerciseEntry ? 1 : 0,
            entry.severity / 10
          ];
        }).flat();
        
        // Check if any day in the sequence had symptoms
        const hasSymptom = entries.some(entry => 
          entry.symptoms && entry.symptoms.length > 0
        );
        
        sequences.push({ 
          sequence, 
          outcome: hasSymptom ? 1 : 0 
        });
      }
    });
    
    return sequences;
  }
  
  private getWeekKey(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const week = Math.ceil((d.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }
  
  private createWarning(
    symptom: string,
    forecast: ForecastData,
    riskFactors: RiskFactor[],
    daysAhead: number
  ): EarlyWarning {
    
    const severity = forecast.predicted > 80 ? 'critical' :
                    forecast.predicted > 70 ? 'high' :
                    forecast.predicted > 60 ? 'medium' : 'low';
    
    const timeframe = daysAhead === 1 ? 'tomorrow' : 
                     daysAhead === 2 ? 'in 2 days' : 'in 3 days';
    
    const highRiskFactors = riskFactors.filter(rf => rf.risk === 'high');
    const mediumRiskFactors = riskFactors.filter(rf => rf.risk === 'medium');
    
    const recommendations = [
      ...forecast.recommendations,
      ...highRiskFactors.map(rf => rf.recommendation),
      ...mediumRiskFactors.map(rf => rf.recommendation)
    ];
    
    return {
      id: `warning-${symptom}-${forecast.date}`,
      type: this.mapSymptomToWarningType(symptom),
      severity,
      probability: forecast.predicted,
      timeframe,
      riskFactors: [...highRiskFactors, ...mediumRiskFactors],
      recommendations: [...new Set(recommendations)], // Remove duplicates
      confidence: forecast.confidence > 0.7 ? 'high' : 
                 forecast.confidence > 0.4 ? 'medium' : 'low',
      timestamp: new Date().toISOString()
    };
  }
  
  private mapSymptomToWarningType(symptom: string): 'symptom_flare' | 'mood_dip' | 'energy_crash' | 'sleep_disruption' {
    switch (symptom) {
      case 'acid_reflux': return 'symptom_flare';
      case 'migraine': return 'symptom_flare';
      case 'ibs': return 'symptom_flare';
      case 'skin_issues': return 'symptom_flare';
      default: return 'symptom_flare';
    }
  }
  
  private generateSequenceWarnings(nutritionEntries: any[], exerciseEntries: any[]): EarlyWarning[] {
    const warnings: EarlyWarning[] = [];
    
    // Get recent sequence (last 5 days)
    const recentEntries = nutritionEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    if (recentEntries.length < 3) return warnings;
    
    // Create sequence for prediction
    const sequence = recentEntries.map(entry => {
      const exerciseEntry = exerciseEntries.find(ex => 
        new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
      );
      
      return [
        entry.sleep / 10,
        entry.stress / 10,
        entry.caffeine ? 1 : 0,
        exerciseEntry ? 1 : 0,
        entry.severity / 10
      ];
    }).flat();
    
    const prediction = this.lstmPredictor.predict(sequence);
    
    if (prediction.probability > 0.7) {
      warnings.push({
        id: `sequence-warning-${Date.now()}`,
        type: 'symptom_flare',
        severity: 'high',
        probability: prediction.probability * 100,
        timeframe: 'next 24 hours',
        riskFactors: [],
        recommendations: [
          'Recent patterns suggest high risk of symptom flare',
          'Consider preventive measures like stress reduction',
          'Ensure adequate sleep and hydration'
        ],
        confidence: prediction.confidence,
        timestamp: new Date().toISOString()
      });
    }
    
    return warnings;
  }
}
