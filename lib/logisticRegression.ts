// Basic logistic regression for symptom prediction
export interface LogisticRegressionModel {
  coefficients: { [factor: string]: number };
  intercept: number;
  accuracy: number;
  trainedOn: number;
}

export interface PredictionInput {
  sleep: number;
  stress: number;
  caffeine: boolean;
  exercise: boolean;
  exerciseIntensity?: 'low' | 'medium' | 'high';
  recovery?: number;
}

export interface PredictionResult {
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  factors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
  }>;
}

// Simple logistic regression implementation
export class SimpleLogisticRegression {
  private coefficients: { [factor: string]: number } = {};
  private intercept: number = 0;
  private trained: boolean = false;
  
  // Train the model on historical data
  train(data: Array<{ input: PredictionInput; outcome: boolean }>): LogisticRegressionModel {
    if (data.length < 10) {
      // Not enough data for reliable training
      return {
        coefficients: {},
        intercept: 0,
        accuracy: 0,
        trainedOn: data.length
      };
    }
    
    // Feature engineering
    const features = this.extractFeatures(data);
    
    // Simple gradient descent for logistic regression
    const learningRate = 0.01;
    const iterations = 1000;
    
    // Initialize coefficients
    const featureNames = Object.keys(features[0]);
    featureNames.forEach(feature => {
      this.coefficients[feature] = Math.random() * 0.1 - 0.05;
    });
    
    // Training loop
    for (let i = 0; i < iterations; i++) {
      let totalError = 0;
      
      data.forEach(({ input, outcome }, index) => {
        const features = this.extractFeatures([{ input, outcome }])[0];
        const prediction = this.predictProbability(features);
        const error = outcome ? (1 - prediction) : (0 - prediction);
        
        // Update coefficients
        featureNames.forEach(feature => {
          this.coefficients[feature] += learningRate * error * features[feature];
        });
        
        totalError += Math.abs(error);
      });
      
      // Early stopping if error is low
      if (totalError / data.length < 0.1) break;
    }
    
    // Calculate accuracy
    let correct = 0;
    data.forEach(({ input, outcome }) => {
      const features = this.extractFeatures([{ input, outcome }])[0];
      const prediction = this.predictProbability(features);
      if ((prediction > 0.5 && outcome) || (prediction <= 0.5 && !outcome)) {
        correct++;
      }
    });
    
    this.trained = true;
    
    return {
      coefficients: { ...this.coefficients },
      intercept: this.intercept,
      accuracy: correct / data.length,
      trainedOn: data.length
    };
  }
  
  // Extract features from input data
  private extractFeatures(data: Array<{ input: PredictionInput; outcome: boolean }>): Array<{ [key: string]: number }> {
    return data.map(({ input }) => ({
      sleep: input.sleep,
      stress: input.stress,
      caffeine: input.caffeine ? 1 : 0,
      exercise: input.exercise ? 1 : 0,
      exerciseIntensity: input.exerciseIntensity === 'high' ? 1 : input.exerciseIntensity === 'medium' ? 0.5 : 0,
      recovery: input.recovery || 5,
      sleepStress: input.sleep * input.stress,
      caffeineSleep: input.caffeine ? (input.sleep < 6 ? 1 : 0) : 0,
      exerciseRecovery: input.exercise ? (input.recovery || 5) : 0,
    }));
  }
  
  // Predict probability using sigmoid function
  private predictProbability(features: { [key: string]: number }): number {
    let z = this.intercept;
    Object.entries(features).forEach(([feature, value]) => {
      z += (this.coefficients[feature] || 0) * value;
    });
    
    // Sigmoid function
    return 1 / (1 + Math.exp(-z));
  }
  
  // Make prediction with confidence
  predict(input: PredictionInput): PredictionResult {
    if (!this.trained) {
      return {
        probability: 0.5,
        confidence: 'low',
        factors: []
      };
    }
    
    const features = this.extractFeatures([{ input, outcome: false }])[0];
    const probability = this.predictProbability(features);
    
    // Determine confidence based on probability distance from 0.5
    const distance = Math.abs(probability - 0.5);
    let confidence: 'low' | 'medium' | 'high';
    if (distance > 0.3) confidence = 'high';
    else if (distance > 0.15) confidence = 'medium';
    else confidence = 'low';
    
    // Identify contributing factors
    const factors = Object.entries(features)
      .map(([feature, value]) => ({
        factor: this.getFactorName(feature),
        impact: (this.coefficients[feature] || 0) * value,
        direction: (this.coefficients[feature] || 0) > 0 ? 'positive' : 'negative'
      }))
      .filter(f => Math.abs(f.impact) > 0.1)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
    
    return {
      probability,
      confidence,
      factors
    };
  }
  
  private getFactorName(feature: string): string {
    const names: { [key: string]: string } = {
      sleep: 'Sleep Hours',
      stress: 'Stress Level',
      caffeine: 'Caffeine',
      exercise: 'Exercise',
      exerciseIntensity: 'Exercise Intensity',
      recovery: 'Recovery Quality',
      sleepStress: 'Sleep × Stress Interaction',
      caffeineSleep: 'Caffeine + Poor Sleep',
      exerciseRecovery: 'Exercise × Recovery'
    };
    return names[feature] || feature;
  }
}

// Factory function to create and train models for different conditions
export function createConditionModels(
  nutritionEntries: any[],
  exerciseEntries: any[]
): { [condition: string]: LogisticRegressionModel } {
  const models: { [condition: string]: LogisticRegressionModel } = {};
  
  const conditions = [
    { name: 'Acid Reflux', keywords: ['reflux', 'heartburn', 'acid'] },
    { name: 'Migraine', keywords: ['headache', 'migraine', 'head pain'] },
    { name: 'IBS', keywords: ['bloat', 'cramp', 'stomach', 'digestive', 'ibs'] },
    { name: 'Skin Issues', keywords: ['skin', 'rash', 'acne', 'flare'] },
  ];
  
  conditions.forEach(condition => {
    // Prepare training data
    const trainingData = nutritionEntries.map(entry => {
      const hasSymptom = condition.keywords.some(keyword => 
        entry.symptoms.some((symptom: string) => 
          symptom.toLowerCase().includes(keyword)
        )
      );
      
      // Get exercise data for the same day
      const exerciseEntry = exerciseEntries.find(ex => 
        new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
      );
      
      return {
        input: {
          sleep: entry.sleep,
          stress: entry.stress,
          caffeine: entry.caffeine,
          exercise: !!exerciseEntry,
          exerciseIntensity: exerciseEntry?.intensity || 'medium',
          recovery: exerciseEntry?.recovery || 5,
        },
        outcome: hasSymptom
      };
    });
    
    // Train model
    const model = new SimpleLogisticRegression();
    models[condition.name] = model.train(trainingData);
  });
  
  return models;
}
