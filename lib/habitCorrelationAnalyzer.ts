// Habit Correlation Analyzer with advanced statistical analysis
export interface CorrelationResult {
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  pValue: number; // statistical significance
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  sampleSize: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface HabitImpact {
  habit: string;
  symptoms: {
    [symptom: string]: {
      correlation: number;
      impact: string;
      description: string;
      examples: string[];
    };
  };
  overallImpact: number; // -1 to 1
  recommendation: string;
}

export interface CorrelationMatrix {
  factors: string[];
  matrix: number[][];
  significance: number[][];
  insights: string[];
}

// Statistical correlation functions
export class CorrelationAnalyzer {
  
  // Pearson correlation coefficient
  static pearsonCorrelation(x: number[], y: number[]): { correlation: number; pValue: number } {
    if (x.length !== y.length || x.length < 2) {
      return { correlation: 0, pValue: 1 };
    }
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return { correlation: 0, pValue: 1 };
    
    const correlation = numerator / denominator;
    
    // Simplified p-value calculation (t-test)
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = this.tTestPValue(t, n - 2);
    
    return { correlation, pValue };
  }
  
  // Spearman rank correlation
  static spearmanCorrelation(x: number[], y: number[]): { correlation: number; pValue: number } {
    if (x.length !== y.length || x.length < 2) {
      return { correlation: 0, pValue: 1 };
    }
    
    const rankX = this.getRanks(x);
    const rankY = this.getRanks(y);
    
    return this.pearsonCorrelation(rankX, rankY);
  }
  
  // Mutual information (simplified)
  static mutualInformation(x: number[], y: number[], bins: number = 5): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    // Discretize continuous variables
    const discretizedX = this.discretize(x, bins);
    const discretizedY = this.discretize(y, bins);
    
    // Calculate joint and marginal probabilities
    const jointCounts: { [key: string]: number } = {};
    const xCounts: { [key: number]: number } = {};
    const yCounts: { [key: number]: number } = {};
    
    for (let i = 0; i < x.length; i++) {
      const key = `${discretizedX[i]},${discretizedY[i]}`;
      jointCounts[key] = (jointCounts[key] || 0) + 1;
      xCounts[discretizedX[i]] = (xCounts[discretizedX[i]] || 0) + 1;
      yCounts[discretizedY[i]] = (yCounts[discretizedY[i]] || 0) + 1;
    }
    
    let mi = 0;
    const n = x.length;
    
    Object.entries(jointCounts).forEach(([key, count]) => {
      const [xVal, yVal] = key.split(',').map(Number);
      const pXY = count / n;
      const pX = xCounts[xVal] / n;
      const pY = yCounts[yVal] / n;
      
      if (pXY > 0 && pX > 0 && pY > 0) {
        mi += pXY * Math.log2(pXY / (pX * pY));
      }
    });
    
    return mi;
  }
  
  private static getRanks(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    return values.map(val => sorted.indexOf(val) + 1);
  }
  
  private static discretize(values: number[], bins: number): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    return values.map(val => Math.min(bins - 1, Math.floor((val - min) / binSize)));
  }
  
  private static tTestPValue(t: number, df: number): number {
    // Simplified t-test p-value calculation
    const absT = Math.abs(t);
    if (absT > 3) return 0.001;
    if (absT > 2.5) return 0.01;
    if (absT > 2) return 0.05;
    if (absT > 1.5) return 0.1;
    return 0.2;
  }
}

// Main Habit Correlation Analyzer
export class HabitCorrelationAnalyzer {
  
  analyzeHabitCorrelations(
    nutritionEntries: any[],
    exerciseEntries: any[]
  ): {
    correlations: CorrelationResult[];
    habitImpacts: HabitImpact[];
    correlationMatrix: CorrelationMatrix;
  } {
    
    // Define habits and symptoms to analyze
    const habits = [
      'sleep_hours',
      'stress_level',
      'caffeine_intake',
      'exercise_frequency',
      'water_intake',
      'meal_timing',
      'breakfast_skipped'
    ];
    
    const symptoms = [
      'acid_reflux',
      'migraine',
      'ibs_symptoms',
      'skin_issues',
      'fatigue'
    ];
    
    // Prepare data
    const data = this.prepareAnalysisData(nutritionEntries, exerciseEntries);
    
    // Calculate correlations
    const correlations = this.calculateAllCorrelations(data, habits, symptoms);
    
    // Analyze habit impacts
    const habitImpacts = this.analyzeHabitImpacts(correlations, habits, symptoms);
    
    // Create correlation matrix
    const correlationMatrix = this.createCorrelationMatrix(correlations, habits, symptoms);
    
    return {
      correlations,
      habitImpacts,
      correlationMatrix
    };
  }
  
  private prepareAnalysisData(nutritionEntries: any[], exerciseEntries: any[]) {
    return nutritionEntries.map(entry => {
      const exerciseEntry = exerciseEntries.find(ex => 
        new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
      );
      
      // Calculate meal timing (hours since midnight of first meal)
      const mealTiming = this.calculateMealTiming(entry);
      
      return {
        // Habits
        sleep_hours: entry.sleep,
        stress_level: entry.stress,
        caffeine_intake: entry.caffeine ? 1 : 0,
        exercise_frequency: exerciseEntry ? 1 : 0,
        water_intake: 6, // Default, could be enhanced
        meal_timing: mealTiming,
        breakfast_skipped: this.didSkipBreakfast(entry),
        
        // Symptoms
        acid_reflux: this.hasSymptom(entry, ['reflux', 'heartburn', 'acid']),
        migraine: this.hasSymptom(entry, ['headache', 'migraine', 'head pain']),
        ibs_symptoms: this.hasSymptom(entry, ['bloat', 'cramp', 'stomach', 'digestive', 'ibs']),
        skin_issues: this.hasSymptom(entry, ['skin', 'rash', 'acne', 'flare']),
        fatigue: this.hasSymptom(entry, ['tired', 'fatigue', 'exhausted', 'energy'])
      };
    });
  }
  
  private calculateMealTiming(entry: any): number {
    // Simplified: assume first meal is breakfast around 8am
    return 8; // Could be enhanced with actual meal timing data
  }
  
  private didSkipBreakfast(entry: any): number {
    // Simplified: check if no foods logged or very few
    return entry.foods && entry.foods.length > 0 ? 0 : 1;
  }
  
  private hasSymptom(entry: any, keywords: string[]): number {
    return keywords.some(keyword => 
      entry.symptoms.some((symptom: string) => 
        symptom.toLowerCase().includes(keyword)
      )
    ) ? 1 : 0;
  }
  
  private calculateAllCorrelations(data: any[], habits: string[], symptoms: string[]): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];
    
    // Habit-symptom correlations
    habits.forEach(habit => {
      symptoms.forEach(symptom => {
        const habitValues = data.map(d => d[habit]);
        const symptomValues = data.map(d => d[symptom]);
        
        const pearson = CorrelationAnalyzer.pearsonCorrelation(habitValues, symptomValues);
        const spearman = CorrelationAnalyzer.spearmanCorrelation(habitValues, symptomValues);
        const mi = CorrelationAnalyzer.mutualInformation(habitValues, symptomValues);
        
        // Use the strongest correlation
        const correlations_list = [
          { type: 'pearson', value: pearson.correlation, pValue: pearson.pValue },
          { type: 'spearman', value: spearman.correlation, pValue: spearman.pValue },
          { type: 'mutual_info', value: mi, pValue: 0.05 } // Simplified
        ];
        
        const best = correlations_list.reduce((best, current) => 
          Math.abs(current.value) > Math.abs(best.value) ? current : best
        );
        
        const strength = Math.abs(best.value) > 0.5 ? 'strong' : 
                        Math.abs(best.value) > 0.3 ? 'moderate' : 'weak';
        
        const confidence = best.pValue < 0.01 ? 'high' : 
                          best.pValue < 0.05 ? 'medium' : 'low';
        
        correlations.push({
          factor1: habit,
          factor2: symptom,
          correlation: best.value,
          pValue: best.pValue,
          strength,
          direction: best.value > 0 ? 'positive' : 'negative',
          sampleSize: data.length,
          confidence
        });
      });
    });
    
    // Habit-habit correlations
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const habit1Values = data.map(d => d[habits[i]]);
        const habit2Values = data.map(d => d[habits[j]]);
        
        const pearson = CorrelationAnalyzer.pearsonCorrelation(habit1Values, habit2Values);
        
        if (Math.abs(pearson.correlation) > 0.1) { // Only include meaningful correlations
          const strength = Math.abs(pearson.correlation) > 0.5 ? 'strong' : 
                          Math.abs(pearson.correlation) > 0.3 ? 'moderate' : 'weak';
          
          correlations.push({
            factor1: habits[i],
            factor2: habits[j],
            correlation: pearson.correlation,
            pValue: pearson.pValue,
            strength,
            direction: pearson.correlation > 0 ? 'positive' : 'negative',
            sampleSize: data.length,
            confidence: pearson.pValue < 0.05 ? 'medium' : 'low'
          });
        }
      }
    }
    
    return correlations;
  }
  
  private analyzeHabitImpacts(correlations: CorrelationResult[], habits: string[], symptoms: string[]): HabitImpact[] {
    return habits.map(habit => {
      const habitCorrelations = correlations.filter(c => c.factor1 === habit && symptoms.includes(c.factor2));
      
      const symptomImpacts: { [symptom: string]: any } = {};
      let overallImpact = 0;
      
      symptoms.forEach(symptom => {
        const correlation = habitCorrelations.find(c => c.factor2 === symptom);
        if (correlation) {
          const impact = this.getImpactDescription(correlation);
          symptomImpacts[symptom] = {
            correlation: correlation.correlation,
            impact: impact.impact,
            description: impact.description,
            examples: impact.examples
          };
          overallImpact += correlation.correlation;
        }
      });
      
      overallImpact /= symptoms.length; // Average impact
      
      return {
        habit,
        symptoms: symptomImpacts,
        overallImpact,
        recommendation: this.generateHabitRecommendation(habit, overallImpact, symptomImpacts)
      };
    });
  }
  
  private getImpactDescription(correlation: CorrelationResult): { impact: string; description: string; examples: string[] } {
    const absCorr = Math.abs(correlation.correlation);
    const direction = correlation.direction;
    const factor = correlation.factor1;
    const symptom = correlation.factor2;
    
    let impact = '';
    let description = '';
    const examples: string[] = [];
    
    if (absCorr > 0.5) {
      impact = direction === 'positive' ? 'High Risk' : 'High Protection';
      description = `${factor} has a ${direction === 'positive' ? 'strong positive' : 'strong negative'} correlation with ${symptom}`;
    } else if (absCorr > 0.3) {
      impact = direction === 'positive' ? 'Moderate Risk' : 'Moderate Protection';
      description = `${factor} shows a ${direction === 'positive' ? 'moderate positive' : 'moderate negative'} correlation with ${symptom}`;
    } else {
      impact = 'Low Impact';
      description = `${factor} has minimal correlation with ${symptom}`;
    }
    
    // Add specific examples
    if (factor === 'sleep_hours' && direction === 'negative') {
      examples.push('Getting 7+ hours sleep reduces migraine risk');
      examples.push('Poor sleep quality increases acid reflux');
    } else if (factor === 'stress_level' && direction === 'positive') {
      examples.push('High stress days correlate with IBS flare-ups');
      examples.push('Stress management reduces skin issues');
    } else if (factor === 'caffeine_intake' && direction === 'positive') {
      examples.push('Coffee + poor sleep = higher reflux risk');
      examples.push('Afternoon caffeine may disrupt sleep');
    }
    
    return { impact, description, examples };
  }
  
  private generateHabitRecommendation(habit: string, overallImpact: number, symptomImpacts: any): string {
    if (Math.abs(overallImpact) < 0.2) {
      return `Keep monitoring ${habit} - current impact is minimal.`;
    }
    
    const direction = overallImpact > 0 ? 'increases' : 'reduces';
    const strength = Math.abs(overallImpact) > 0.4 ? 'significantly' : 'moderately';
    
    return `${habit} ${strength} ${direction} your symptom risk. Consider ${overallImpact > 0 ? 'reducing' : 'maintaining'} this habit.`;
  }
  
  private createCorrelationMatrix(correlations: CorrelationResult[], habits: string[], symptoms: string[]): CorrelationMatrix {
    const allFactors = [...habits, ...symptoms];
    const matrix: number[][] = [];
    const significance: number[][] = [];
    const insights: string[] = [];
    
    // Initialize matrices
    for (let i = 0; i < allFactors.length; i++) {
      matrix[i] = new Array(allFactors.length).fill(0);
      significance[i] = new Array(allFactors.length).fill(1);
    }
    
    // Fill matrices
    correlations.forEach(corr => {
      const i = allFactors.indexOf(corr.factor1);
      const j = allFactors.indexOf(corr.factor2);
      
      if (i !== -1 && j !== -1) {
        matrix[i][j] = corr.correlation;
        matrix[j][i] = corr.correlation; // Symmetric
        significance[i][j] = corr.pValue;
        significance[j][i] = corr.pValue;
      }
    });
    
    // Generate insights
    const strongCorrelations = correlations.filter(c => c.strength === 'strong' && c.confidence === 'high');
    strongCorrelations.forEach(corr => {
      if (habits.includes(corr.factor1) && symptoms.includes(corr.factor2)) {
        insights.push(`${corr.factor1} strongly ${corr.direction === 'positive' ? 'increases' : 'reduces'} ${corr.factor2} risk`);
      }
    });
    
    return {
      factors: allFactors,
      matrix,
      significance,
      insights
    };
  }
}
