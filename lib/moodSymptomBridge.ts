// Mood + Symptom Cross-Bridge with sentiment analysis and regression models
export interface MoodEntry {
  id: string;
  date: string;
  moodScore: number; // 1-10 scale
  journalEntry?: string;
  emotions: string[];
  stressLevel: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
  socialActivity: number; // 1-10 scale
  timestamp: string;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  emotions: string[];
  keywords: string[];
  moodScore: number; // 1-10 derived from sentiment
}

export interface MoodSymptomCorrelation {
  moodFactor: string;
  symptom: string;
  correlation: number; // -1 to 1
  lag: number; // hours between mood and symptom
  confidence: 'low' | 'medium' | 'high';
  description: string;
  examples: string[];
}

export interface MoodPrediction {
  timeframe: '24h' | '48h' | '72h';
  predictedMood: number; // 1-10
  confidence: number; // 0-1
  factors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
  recommendations: string[];
}

// Sentiment Analysis Engine
export class SentimentAnalyzer {
  private positiveWords = [
    'happy', 'joyful', 'excited', 'grateful', 'content', 'peaceful', 'energetic',
    'optimistic', 'confident', 'relaxed', 'satisfied', 'proud', 'hopeful',
    'cheerful', 'upbeat', 'motivated', 'inspired', 'calm', 'serene', 'blissful'
  ];
  
  private negativeWords = [
    'sad', 'angry', 'frustrated', 'anxious', 'worried', 'stressed', 'depressed',
    'tired', 'exhausted', 'overwhelmed', 'lonely', 'disappointed', 'fearful',
    'irritated', 'annoyed', 'upset', 'hurt', 'devastated', 'hopeless', 'miserable'
  ];
  
  private emotionKeywords = {
    'anxiety': ['anxious', 'worried', 'nervous', 'panic', 'fear', 'uneasy'],
    'depression': ['sad', 'depressed', 'hopeless', 'empty', 'worthless', 'suicidal'],
    'anger': ['angry', 'mad', 'furious', 'irritated', 'rage', 'annoyed'],
    'joy': ['happy', 'joyful', 'excited', 'elated', 'thrilled', 'ecstatic'],
    'fear': ['scared', 'afraid', 'terrified', 'frightened', 'worried'],
    'sadness': ['sad', 'melancholy', 'grief', 'sorrow', 'down', 'blue']
  };
  
  analyzeSentiment(journalEntry: string): SentimentAnalysis {
    if (!journalEntry || journalEntry.trim().length === 0) {
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: [],
        keywords: [],
        moodScore: 5
      };
    }
    
    const words = journalEntry.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    const detectedEmotions: string[] = [];
    const keywords: string[] = [];
    
    // Analyze each word
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      
      if (this.positiveWords.includes(cleanWord)) {
        positiveScore++;
        keywords.push(cleanWord);
      }
      
      if (this.negativeWords.includes(cleanWord)) {
        negativeScore++;
        keywords.push(cleanWord);
      }
      
      // Check for emotions
      Object.entries(this.emotionKeywords).forEach(([emotion, emotionWords]) => {
        if (emotionWords.includes(cleanWord) && !detectedEmotions.includes(emotion)) {
          detectedEmotions.push(emotion);
        }
      });
    });
    
    // Calculate sentiment
    const totalWords = words.length;
    const positiveRatio = positiveScore / totalWords;
    const negativeRatio = negativeScore / totalWords;
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;
    let moodScore: number;
    
    if (positiveRatio > negativeRatio && positiveRatio > 0.1) {
      sentiment = 'positive';
      confidence = positiveRatio;
      moodScore = 5 + (positiveRatio * 5);
    } else if (negativeRatio > positiveRatio && negativeRatio > 0.1) {
      sentiment = 'negative';
      confidence = negativeRatio;
      moodScore = 5 - (negativeRatio * 5);
    } else {
      sentiment = 'neutral';
      confidence = 0.5;
      moodScore = 5;
    }
    
    return {
      sentiment,
      confidence: Math.min(1, confidence),
      emotions: detectedEmotions,
      keywords,
      moodScore: Math.max(1, Math.min(10, moodScore))
    };
  }
  
  // Advanced sentiment analysis with context
  analyzeSentimentAdvanced(journalEntry: string): SentimentAnalysis {
    const basicAnalysis = this.analyzeSentiment(journalEntry);
    
    // Enhance with context analysis
    const contextModifiers = this.analyzeContext(journalEntry);
    
    // Apply context modifiers
    let adjustedMoodScore = basicAnalysis.moodScore;
    contextModifiers.forEach(modifier => {
      adjustedMoodScore += modifier;
    });
    
    // Adjust confidence based on entry length and complexity
    const lengthModifier = Math.min(1, journalEntry.length / 100);
    const adjustedConfidence = basicAnalysis.confidence * lengthModifier;
    
    return {
      ...basicAnalysis,
      moodScore: Math.max(1, Math.min(10, adjustedMoodScore)),
      confidence: Math.max(0.1, Math.min(1, adjustedConfidence))
    };
  }
  
  private analyzeContext(text: string): number[] {
    const modifiers: number[] = [];
    
    // Check for intensifiers
    const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely'];
    intensifiers.forEach(intensifier => {
      if (text.toLowerCase().includes(intensifier)) {
        modifiers.push(0.5);
      }
    });
    
    // Check for negators
    const negators = ['not', 'never', 'no', 'none', 'nothing'];
    negators.forEach(negator => {
      if (text.toLowerCase().includes(negator)) {
        modifiers.push(-0.5);
      }
    });
    
    // Check for question marks (uncertainty)
    if (text.includes('?')) {
      modifiers.push(-0.2);
    }
    
    // Check for exclamation marks (emphasis)
    if (text.includes('!')) {
      modifiers.push(0.3);
    }
    
    return modifiers;
  }
}

// Mood-Symptom Regression Models
export class MoodSymptomRegression {
  private correlations: MoodSymptomCorrelation[] = [];
  
  analyzeCorrelations(moodEntries: MoodEntry[], nutritionEntries: any[]): MoodSymptomCorrelation[] {
    const correlations: MoodSymptomCorrelation[] = [];
    
    // Define mood factors to analyze
    const moodFactors = [
      { name: 'mood_score', getValue: (entry: MoodEntry) => entry.moodScore },
      { name: 'stress_level', getValue: (entry: MoodEntry) => entry.stressLevel },
      { name: 'energy_level', getValue: (entry: MoodEntry) => entry.energyLevel },
      { name: 'sleep_quality', getValue: (entry: MoodEntry) => entry.sleepQuality },
      { name: 'social_activity', getValue: (entry: MoodEntry) => entry.socialActivity }
    ];
    
    // Define symptoms to analyze
    const symptoms = [
      { name: 'acid_reflux', keywords: ['reflux', 'heartburn', 'acid'] },
      { name: 'migraine', keywords: ['headache', 'migraine', 'head pain'] },
      { name: 'ibs', keywords: ['bloat', 'cramp', 'stomach', 'digestive', 'ibs'] },
      { name: 'skin_issues', keywords: ['skin', 'rash', 'acne', 'flare'] },
      { name: 'fatigue', keywords: ['tired', 'fatigue', 'exhausted', 'energy'] }
    ];
    
    // Analyze correlations with different time lags
    const timeLags = [0, 24, 48, 72]; // hours
    
    moodFactors.forEach(moodFactor => {
      symptoms.forEach(symptom => {
        timeLags.forEach(lag => {
          const correlation = this.calculateMoodSymptomCorrelation(
            moodEntries,
            nutritionEntries,
            moodFactor,
            symptom,
            lag
          );
          
          if (Math.abs(correlation.correlation) > 0.2) { // Only include meaningful correlations
            correlations.push(correlation);
          }
        });
      });
    });
    
    this.correlations = correlations;
    return correlations;
  }
  
  private calculateMoodSymptomCorrelation(
    moodEntries: MoodEntry[],
    nutritionEntries: any[],
    moodFactor: any,
    symptom: any,
    lagHours: number
  ): MoodSymptomCorrelation {
    
    const moodValues: number[] = [];
    const symptomValues: number[] = [];
    
    // Match mood entries with symptom entries considering time lag
    moodEntries.forEach(moodEntry => {
      const moodTime = new Date(moodEntry.date);
      const symptomTime = new Date(moodTime.getTime() + (lagHours * 60 * 60 * 1000));
      
      // Find nutrition entry closest to symptom time
      const closestNutritionEntry = nutritionEntries.reduce((closest, entry) => {
        const entryTime = new Date(entry.date);
        const closestTime = closest ? new Date(closest.date) : null;
        
        if (!closestTime) return entry;
        
        const currentDiff = Math.abs(entryTime.getTime() - symptomTime.getTime());
        const closestDiff = Math.abs(closestTime.getTime() - symptomTime.getTime());
        
        return currentDiff < closestDiff ? entry : closest;
      }, null);
      
      if (closestNutritionEntry) {
        const hasSymptom = symptom.keywords.some((keyword: string) => 
          closestNutritionEntry.symptoms.some((s: string) => 
            s.toLowerCase().includes(keyword)
          )
        );
        
        moodValues.push(moodFactor.getValue(moodEntry));
        symptomValues.push(hasSymptom ? closestNutritionEntry.severity : 0);
      }
    });
    
    // Calculate correlation
    const correlation = this.pearsonCorrelation(moodValues, symptomValues);
    
    // Determine confidence based on sample size
    let confidence: 'low' | 'medium' | 'high';
    if (moodValues.length > 20) confidence = 'high';
    else if (moodValues.length > 10) confidence = 'medium';
    else confidence = 'low';
    
    // Generate description and examples
    const description = this.generateCorrelationDescription(moodFactor.name, symptom.name, correlation, lagHours);
    const examples = this.generateExamples(moodFactor.name, symptom.name, correlation);
    
    return {
      moodFactor: moodFactor.name,
      symptom: symptom.name,
      correlation,
      lag: lagHours,
      confidence,
      description,
      examples
    };
  }
  
  private pearsonCorrelation(x: number[], y: number[]): number {
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
  
  private generateCorrelationDescription(moodFactor: string, symptom: string, correlation: number, lag: number): string {
    const direction = correlation > 0 ? 'increases' : 'decreases';
    const strength = Math.abs(correlation) > 0.5 ? 'strongly' : 
                    Math.abs(correlation) > 0.3 ? 'moderately' : 'slightly';
    const timeframe = lag === 0 ? 'immediately' : 
                     lag === 24 ? 'within 24 hours' :
                     lag === 48 ? 'within 48 hours' : 'within 72 hours';
    
    return `${moodFactor} ${strength} ${direction} ${symptom} risk ${timeframe}`;
  }
  
  private generateExamples(moodFactor: string, symptom: string, correlation: number): string[] {
    const examples: string[] = [];
    
    if (moodFactor === 'mood_score' && correlation < -0.3) {
      examples.push('Low mood days often precede symptom flare-ups');
      examples.push('Maintaining positive mood may reduce symptom severity');
    }
    
    if (moodFactor === 'stress_level' && correlation > 0.3) {
      examples.push('High stress days correlate with increased symptoms');
      examples.push('Stress management techniques may prevent flare-ups');
    }
    
    if (moodFactor === 'sleep_quality' && correlation < -0.3) {
      examples.push('Poor sleep quality increases symptom risk');
      examples.push('Good sleep hygiene may reduce symptoms');
    }
    
    return examples;
  }
  
  // Predict mood based on current factors
  predictMood(
    currentFactors: {
      stressLevel: number;
      energyLevel: number;
      sleepQuality: number;
      socialActivity: number;
      recentSymptoms: string[];
    },
    timeframe: '24h' | '48h' | '72h' = '24h'
  ): MoodPrediction {
    
    let predictedMood = 5; // Baseline
    const factors: Array<{ factor: string; impact: number; direction: 'positive' | 'negative' }> = [];
    const recommendations: string[] = [];
    
    // Stress impact
    if (currentFactors.stressLevel > 7) {
      predictedMood -= 2;
      factors.push({
        factor: 'High Stress',
        impact: -2,
        direction: 'negative'
      });
      recommendations.push('Consider stress management techniques like meditation or deep breathing');
    } else if (currentFactors.stressLevel < 4) {
      predictedMood += 1;
      factors.push({
        factor: 'Low Stress',
        impact: 1,
        direction: 'positive'
      });
    }
    
    // Energy impact
    if (currentFactors.energyLevel > 7) {
      predictedMood += 1.5;
      factors.push({
        factor: 'High Energy',
        impact: 1.5,
        direction: 'positive'
      });
    } else if (currentFactors.energyLevel < 4) {
      predictedMood -= 1.5;
      factors.push({
        factor: 'Low Energy',
        impact: -1.5,
        direction: 'negative'
      });
      recommendations.push('Consider light exercise or a short walk to boost energy');
    }
    
    // Sleep quality impact
    if (currentFactors.sleepQuality > 7) {
      predictedMood += 1;
      factors.push({
        factor: 'Good Sleep',
        impact: 1,
        direction: 'positive'
      });
    } else if (currentFactors.sleepQuality < 4) {
      predictedMood -= 2;
      factors.push({
        factor: 'Poor Sleep',
        impact: -2,
        direction: 'negative'
      });
      recommendations.push('Prioritize sleep hygiene and aim for 7-9 hours');
    }
    
    // Social activity impact
    if (currentFactors.socialActivity > 6) {
      predictedMood += 1;
      factors.push({
        factor: 'Social Activity',
        impact: 1,
        direction: 'positive'
      });
    } else if (currentFactors.socialActivity < 3) {
      predictedMood -= 0.5;
      factors.push({
        factor: 'Low Social Activity',
        impact: -0.5,
        direction: 'negative'
      });
      recommendations.push('Consider reaching out to friends or family');
    }
    
    // Recent symptoms impact
    if (currentFactors.recentSymptoms.length > 0) {
      predictedMood -= 1;
      factors.push({
        factor: 'Recent Symptoms',
        impact: -1,
        direction: 'negative'
      });
      recommendations.push('Focus on symptom management and self-care');
    }
    
    // Calculate confidence based on data quality
    const confidence = Math.min(0.9, 0.5 + (factors.length * 0.1));
    
    return {
      timeframe,
      predictedMood: Math.max(1, Math.min(10, predictedMood)),
      confidence,
      factors,
      recommendations
    };
  }
  
  getCorrelations(): MoodSymptomCorrelation[] {
    return this.correlations;
  }
}

// Main Mood-Symptom Bridge
export class MoodSymptomBridge {
  private sentimentAnalyzer: SentimentAnalyzer;
  private regressionModel: MoodSymptomRegression;
  private moodEntries: MoodEntry[] = [];
  
  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.regressionModel = new MoodSymptomRegression();
  }
  
  addMoodEntry(entry: MoodEntry) {
    // Analyze sentiment if journal entry exists
    if (entry.journalEntry) {
      const sentiment = this.sentimentAnalyzer.analyzeSentimentAdvanced(entry.journalEntry);
      entry.moodScore = sentiment.moodScore;
      entry.emotions = sentiment.emotions;
    }
    
    this.moodEntries.push(entry);
  }
  
  analyzeMoodSymptomRelationships(nutritionEntries: any[]): {
    correlations: MoodSymptomCorrelation[];
    insights: string[];
    predictions: MoodPrediction[];
  } {
    
    // Analyze correlations
    const correlations = this.regressionModel.analyzeCorrelations(this.moodEntries, nutritionEntries);
    
    // Generate insights
    const insights = this.generateInsights(correlations);
    
    // Generate predictions for current mood
    const currentFactors = this.getCurrentFactors();
    const predictions = [
      this.regressionModel.predictMood(currentFactors, '24h'),
      this.regressionModel.predictMood(currentFactors, '48h'),
      this.regressionModel.predictMood(currentFactors, '72h')
    ];
    
    return {
      correlations,
      insights,
      predictions
    };
  }
  
  private generateInsights(correlations: MoodSymptomCorrelation[]): string[] {
    const insights: string[] = [];
    
    // Find strongest correlations
    const strongCorrelations = correlations.filter(c => 
      Math.abs(c.correlation) > 0.4 && c.confidence === 'high'
    );
    
    strongCorrelations.forEach(correlation => {
      if (correlation.moodFactor === 'mood_score' && correlation.correlation < -0.4) {
        insights.push(`Negative mood logs predict ${correlation.symptom} flare-ups within ${correlation.lag} hours, ${Math.abs(correlation.correlation * 100).toFixed(0)}% of the time.`);
      }
      
      if (correlation.moodFactor === 'stress_level' && correlation.correlation > 0.4) {
        insights.push(`High stress levels increase ${correlation.symptom} risk by ${(correlation.correlation * 100).toFixed(0)}% within ${correlation.lag} hours.`);
      }
      
      if (correlation.moodFactor === 'sleep_quality' && correlation.correlation < -0.4) {
        insights.push(`Poor sleep quality is associated with ${Math.abs(correlation.correlation * 100).toFixed(0)}% higher ${correlation.symptom} risk.`);
      }
    });
    
    return insights;
  }
  
  private getCurrentFactors() {
    if (this.moodEntries.length === 0) {
      return {
        stressLevel: 5,
        energyLevel: 5,
        sleepQuality: 5,
        socialActivity: 5,
        recentSymptoms: []
      };
    }
    
    const recentEntry = this.moodEntries[this.moodEntries.length - 1];
    return {
      stressLevel: recentEntry.stressLevel,
      energyLevel: recentEntry.energyLevel,
      sleepQuality: recentEntry.sleepQuality,
      socialActivity: recentEntry.socialActivity,
      recentSymptoms: [] // Could be enhanced to track recent symptoms
    };
  }
  
  getMoodEntries(): MoodEntry[] {
    return this.moodEntries;
  }
}
