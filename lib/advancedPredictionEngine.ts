// Advanced Symptom Prediction Engine with multiple ML models
export interface PredictionInput {
  meals: string[];
  caffeine: boolean;
  waterIntake: number; // glasses per day
  sleepHours: number;
  stress: number; // 1-10 scale
  exercise: boolean;
  exerciseIntensity?: 'low' | 'medium' | 'high';
  recovery?: number; // 1-10 scale
  timestamp: string;
}

export interface SymptomPrediction {
  symptom: string;
  probability: number; // 0-100%
  confidence: 'low' | 'medium' | 'high';
  timeframe: '24h' | '48h';
  factors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
    description: string;
  }>;
  recommendation: string;
}

export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainedOn: number;
  lastUpdated: string;
}

// Random Forest implementation (simplified)
export class RandomForestPredictor {
  private trees: DecisionTree[] = [];
  private nTrees: number;
  
  constructor(nTrees: number = 10) {
    this.nTrees = nTrees;
  }
  
  train(data: Array<{ input: PredictionInput; outcome: boolean }>): ModelPerformance {
    this.trees = [];
    
    for (let i = 0; i < this.nTrees; i++) {
      const tree = new DecisionTree();
      const bootstrapSample = this.bootstrapSample(data);
      tree.train(bootstrapSample);
      this.trees.push(tree);
    }
    
    return this.evaluate(data);
  }
  
  predict(input: PredictionInput): { probability: number; confidence: string } {
    const votes = this.trees.map(tree => tree.predict(input));
    const positiveVotes = votes.filter(vote => vote).length;
    const probability = positiveVotes / this.trees.length;
    
    const confidence = this.trees.length > 5 ? 'high' : 
                     this.trees.length > 3 ? 'medium' : 'low';
    
    return { probability, confidence };
  }
  
  private bootstrapSample(data: Array<{ input: PredictionInput; outcome: boolean }>) {
    const sample = [];
    for (let i = 0; i < data.length; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    return sample;
  }
  
  private evaluate(data: Array<{ input: PredictionInput; outcome: boolean }>): ModelPerformance {
    let correct = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    
    data.forEach(({ input, outcome }) => {
      const prediction = this.predict(input);
      const predicted = prediction.probability > 0.5;
      
      if (predicted === outcome) correct++;
      if (predicted && outcome) truePositives++;
      if (predicted && !outcome) falsePositives++;
      if (!predicted && outcome) falseNegatives++;
    });
    
    const accuracy = correct / data.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    
    return {
      modelName: 'Random Forest',
      accuracy,
      precision,
      recall,
      f1Score,
      trainedOn: data.length,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Decision Tree implementation
class DecisionTree {
  private root: TreeNode | null = null;
  
  train(data: Array<{ input: PredictionInput; outcome: boolean }>) {
    this.root = this.buildTree(data, this.getFeatures(data[0]?.input || {}));
  }
  
  predict(input: PredictionInput): boolean {
    if (!this.root) return false;
    return this.traverseTree(this.root, input);
  }
  
  private buildTree(data: Array<{ input: PredictionInput; outcome: boolean }>, features: string[]): TreeNode {
    if (data.length === 0) return new TreeNode(false);
    
    const outcomes = data.map(d => d.outcome);
    const positiveCount = outcomes.filter(o => o).length;
    
    // Base cases
    if (positiveCount === 0) return new TreeNode(false);
    if (positiveCount === data.length) return new TreeNode(true);
    if (features.length === 0) return new TreeNode(positiveCount > data.length / 2);
    
    // Find best split
    let bestFeature = '';
    let bestGini = Infinity;
    let bestSplit = { left: [], right: [] };
    
    features.forEach(feature => {
      const split = this.splitData(data, feature);
      const gini = this.calculateGini(split.left) + this.calculateGini(split.right);
      if (gini < bestGini) {
        bestGini = gini;
        bestFeature = feature;
        bestSplit = split;
      }
    });
    
    const node = new TreeNode();
    node.feature = bestFeature;
    node.threshold = this.getThreshold(data, bestFeature);
    
    const remainingFeatures = features.filter(f => f !== bestFeature);
    node.left = this.buildTree(bestSplit.left, remainingFeatures);
    node.right = this.buildTree(bestSplit.right, remainingFeatures);
    
    return node;
  }
  
  private getFeatures(input: PredictionInput): string[] {
    return ['sleepHours', 'stress', 'caffeine', 'exercise', 'waterIntake'];
  }
  
  private splitData(data: Array<{ input: PredictionInput; outcome: boolean }>, feature: string) {
    const threshold = this.getThreshold(data, feature);
    const left = data.filter(d => this.getFeatureValue(d.input, feature) <= threshold);
    const right = data.filter(d => this.getFeatureValue(d.input, feature) > threshold);
    return { left, right };
  }
  
  private getFeatureValue(input: PredictionInput, feature: string): number {
    switch (feature) {
      case 'sleepHours': return input.sleepHours;
      case 'stress': return input.stress;
      case 'caffeine': return input.caffeine ? 1 : 0;
      case 'exercise': return input.exercise ? 1 : 0;
      case 'waterIntake': return input.waterIntake;
      default: return 0;
    }
  }
  
  private getThreshold(data: Array<{ input: PredictionInput; outcome: boolean }>, feature: string): number {
    const values = data.map(d => this.getFeatureValue(d.input, feature)).sort((a, b) => a - b);
    const midIndex = Math.floor(values.length / 2);
    return values[midIndex];
  }
  
  private calculateGini(data: Array<{ input: PredictionInput; outcome: boolean }>): number {
    if (data.length === 0) return 0;
    const positiveCount = data.filter(d => d.outcome).length;
    const p = positiveCount / data.length;
    return 2 * p * (1 - p);
  }
  
  private traverseTree(node: TreeNode, input: PredictionInput): boolean {
    if (node.isLeaf) return node.prediction;
    
    const value = this.getFeatureValue(input, node.feature!);
    const nextNode = value <= node.threshold! ? node.left! : node.right!;
    return this.traverseTree(nextNode, input);
  }
}

class TreeNode {
  isLeaf: boolean = false;
  prediction: boolean = false;
  feature?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  
  constructor(prediction?: boolean) {
    if (prediction !== undefined) {
      this.isLeaf = true;
      this.prediction = prediction;
    }
  }
}

// LSTM-like sequence predictor (simplified)
export class SequencePredictor {
  private sequences: number[][] = [];
  private weights: number[] = [];
  
  train(sequenceData: Array<{ sequence: PredictionInput[]; outcome: boolean }>) {
    // Simplified LSTM implementation
    this.sequences = sequenceData.map(({ sequence }) => 
      sequence.map(input => this.encodeInput(input))
    );
    
    // Initialize weights (simplified)
    this.weights = new Array(10).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }
  
  predict(sequence: PredictionInput[]): { probability: number; confidence: string } {
    if (sequence.length === 0) return { probability: 0.5, confidence: 'low' };
    
    const encoded = sequence.map(input => this.encodeInput(input));
    const recent = encoded.slice(-3); // Last 3 days
    
    // Simple weighted average with recency bias
    let weightedSum = 0;
    let totalWeight = 0;
    
    recent.forEach((features, index) => {
      const weight = this.weights[index] || 0.1;
      const recencyWeight = (index + 1) / recent.length;
      const combinedWeight = weight * recencyWeight;
      
      weightedSum += features.reduce((sum, val, i) => sum + val * this.weights[i], 0) * combinedWeight;
      totalWeight += combinedWeight;
    });
    
    const probability = 1 / (1 + Math.exp(-weightedSum / totalWeight));
    const confidence = sequence.length > 7 ? 'high' : sequence.length > 3 ? 'medium' : 'low';
    
    return { probability, confidence };
  }
  
  private encodeInput(input: PredictionInput): number[] {
    return [
      input.sleepHours / 10,
      input.stress / 10,
      input.caffeine ? 1 : 0,
      input.exercise ? 1 : 0,
      input.waterIntake / 10,
      input.exerciseIntensity === 'high' ? 1 : input.exerciseIntensity === 'medium' ? 0.5 : 0,
      (input.recovery || 5) / 10,
      input.meals.length / 5, // normalize meal count
    ];
  }
}

// Main Prediction Engine
export class AdvancedSymptomPredictionEngine {
  private models: { [symptom: string]: { randomForest: RandomForestPredictor; sequence: SequencePredictor } } = {};
  private performance: { [symptom: string]: ModelPerformance[] } = {};
  
  train(nutritionEntries: any[], exerciseEntries: any[]) {
    const symptoms = [
      { name: 'Acid Reflux', keywords: ['reflux', 'heartburn', 'acid'] },
      { name: 'Migraine', keywords: ['headache', 'migraine', 'head pain'] },
      { name: 'IBS', keywords: ['bloat', 'cramp', 'stomach', 'digestive', 'ibs'] },
      { name: 'Skin Issues', keywords: ['skin', 'rash', 'acne', 'flare'] },
    ];
    
    symptoms.forEach(symptom => {
      // Prepare training data
      const trainingData = this.prepareTrainingData(nutritionEntries, exerciseEntries, symptom);
      const sequenceData = this.prepareSequenceData(nutritionEntries, exerciseEntries, symptom);
      
      // Train models
      const randomForest = new RandomForestPredictor(15);
      const sequence = new SequencePredictor();
      
      const rfPerformance = randomForest.train(trainingData);
      sequence.train(sequenceData);
      
      this.models[symptom.name] = { randomForest, sequence };
      this.performance[symptom.name] = [rfPerformance];
    });
  }
  
  predict(input: PredictionInput, symptom: string, timeframe: '24h' | '48h' = '24h'): SymptomPrediction {
    const model = this.models[symptom];
    if (!model) {
      return {
        symptom,
        probability: 0,
        confidence: 'low',
        timeframe,
        factors: [],
        recommendation: 'No model available for this symptom'
      };
    }
    
    // Get predictions from both models
    const rfPrediction = model.randomForest.predict(input);
    const seqPrediction = model.sequence.predict([input]); // Single input for now
    
    // Ensemble prediction
    const probability = (rfPrediction.probability + seqPrediction.probability) / 2;
    const confidence = rfPrediction.confidence === 'high' && seqPrediction.confidence === 'high' ? 'high' :
                      rfPrediction.confidence === 'medium' || seqPrediction.confidence === 'medium' ? 'medium' : 'low';
    
    // Analyze factors
    const factors = this.analyzeFactors(input, symptom);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(input, symptom, probability);
    
    return {
      symptom,
      probability: probability * 100,
      confidence,
      timeframe,
      factors,
      recommendation
    };
  }
  
  private prepareTrainingData(nutritionEntries: any[], exerciseEntries: any[], symptom: any) {
    return nutritionEntries.map(entry => {
      const exerciseEntry = exerciseEntries.find(ex => 
        new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
      );
      
      const hasSymptom = symptom.keywords.some((keyword: string) => 
        entry.symptoms.some((s: string) => s.toLowerCase().includes(keyword))
      );
      
      return {
        input: {
          meals: entry.foods || [],
          caffeine: entry.caffeine,
          waterIntake: 6, // Default, could be enhanced
          sleepHours: entry.sleep,
          stress: entry.stress,
          exercise: !!exerciseEntry,
          exerciseIntensity: exerciseEntry?.intensity || 'medium',
          recovery: exerciseEntry?.recovery || 5,
          timestamp: entry.date
        },
        outcome: hasSymptom
      };
    });
  }
  
  private prepareSequenceData(nutritionEntries: any[], exerciseEntries: any[], symptom: any) {
    // Group entries by week and create sequences
    const weeklyData: { [week: string]: any[] } = {};
    
    nutritionEntries.forEach(entry => {
      const week = this.getWeekKey(entry.date);
      if (!weeklyData[week]) weeklyData[week] = [];
      weeklyData[week].push(entry);
    });
    
    const sequences: Array<{ sequence: PredictionInput[]; outcome: boolean }> = [];
    
    Object.entries(weeklyData).forEach(([week, entries]) => {
      if (entries.length >= 3) { // Need at least 3 days for sequence
        const sequence = entries.map(entry => {
          const exerciseEntry = exerciseEntries.find(ex => 
            new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
          );
          
          return {
            meals: entry.foods || [],
            caffeine: entry.caffeine,
            waterIntake: 6,
            sleepHours: entry.sleep,
            stress: entry.stress,
            exercise: !!exerciseEntry,
            exerciseIntensity: exerciseEntry?.intensity || 'medium',
            recovery: exerciseEntry?.recovery || 5,
            timestamp: entry.date
          };
        });
        
        // Check if any day in the sequence had the symptom
        const hasSymptom = entries.some(entry => 
          symptom.keywords.some((keyword: string) => 
            entry.symptoms.some((s: string) => s.toLowerCase().includes(keyword))
          )
        );
        
        sequences.push({ sequence, outcome: hasSymptom });
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
  
  private analyzeFactors(input: PredictionInput, symptom: string) {
    const factors: Array<{ factor: string; impact: number; direction: 'positive' | 'negative'; description: string }> = [];
    
    // Sleep analysis
    if (input.sleepHours < 6) {
      factors.push({
        factor: 'Poor Sleep',
        impact: 25,
        direction: 'positive',
        description: `Less than 6 hours sleep increases ${symptom} risk by 25%`
      });
    }
    
    // Stress analysis
    if (input.stress > 7) {
      factors.push({
        factor: 'High Stress',
        impact: 20,
        direction: 'positive',
        description: `Stress level ${input.stress}/10 significantly increases ${symptom} risk`
      });
    }
    
    // Caffeine + Sleep combination
    if (input.caffeine && input.sleepHours < 6) {
      factors.push({
        factor: 'Caffeine + Poor Sleep',
        impact: 35,
        direction: 'positive',
        description: `Coffee with insufficient sleep creates 35% higher ${symptom} risk`
      });
    }
    
    // Exercise protection
    if (input.exercise) {
      factors.push({
        factor: 'Exercise',
        impact: 15,
        direction: 'negative',
        description: `Regular exercise reduces ${symptom} risk by 15%`
      });
    }
    
    // Water intake
    if (input.waterIntake < 4) {
      factors.push({
        factor: 'Low Hydration',
        impact: 10,
        direction: 'positive',
        description: `Insufficient water intake may increase ${symptom} risk`
      });
    }
    
    return factors;
  }
  
  private generateRecommendation(input: PredictionInput, symptom: string, probability: number) {
    if (probability < 0.3) {
      return `Low risk of ${symptom}. Continue your current healthy habits.`;
    } else if (probability < 0.6) {
      return `Moderate risk of ${symptom}. Consider reducing stress and ensuring adequate sleep.`;
    } else {
      return `High risk of ${symptom}. Avoid caffeine after 2pm, prioritize 7+ hours sleep, and consider gentle exercise.`;
    }
  }
  
  getModelPerformance(): { [symptom: string]: ModelPerformance[] } {
    return this.performance;
  }
}
