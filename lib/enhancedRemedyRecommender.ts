// Enhanced Personalized Remedy Recommender with collaborative filtering
export interface RemedyOutcome {
  remedyId: string;
  userId: string;
  symptom: string;
  effectiveness: number; // 1-5 scale
  timeToRelief: number; // minutes
  sideEffects: string[];
  context: {
    sleepHours: number;
    stressLevel: number;
    exerciseDone: boolean;
    caffeineConsumed: boolean;
    timeOfDay: string;
  };
  timestamp: string;
}

export interface CollaborativeRecommendation {
  remedyId: string;
  remedyName: string;
  type: string;
  score: number; // 0-100
  confidence: 'low' | 'medium' | 'high';
  reasoning: {
    personalHistory: string;
    similarUsers: string;
    medicalGuidelines: string;
    contextualFactors: string;
  };
  expectedEffectiveness: number; // 1-5
  expectedTimeToRelief: number; // minutes
  similarUserCount: number;
  alternativeRemedies: string[];
}

export interface UserSimilarity {
  userId: string;
  similarity: number; // 0-1
  sharedSymptoms: string[];
  sharedLifestyle: {
    averageSleep: number;
    averageStress: number;
    exerciseFrequency: number;
    caffeineConsumption: boolean;
  };
  effectiveRemedies: Array<{
    remedyId: string;
    effectiveness: number;
    usageCount: number;
  }>;
}

export interface RemedyEffectivenessModel {
  remedyId: string;
  baseEffectiveness: number;
  contextualModifiers: {
    [context: string]: number; // multiplier for different contexts
  };
  timeToRelief: {
    average: number;
    variance: number;
  };
  sideEffectProfile: {
    [sideEffect: string]: number; // probability 0-1
  };
}

// Collaborative Filtering Engine
export class CollaborativeFilteringEngine {
  private userOutcomes: RemedyOutcome[] = [];
  private userProfiles: Map<string, any> = new Map();
  
  addOutcome(outcome: RemedyOutcome) {
    this.userOutcomes.push(outcome);
    this.updateUserProfile(outcome.userId, outcome);
  }
  
  private updateUserProfile(userId: string, outcome: RemedyOutcome) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        outcomes: [],
        averageEffectiveness: {},
        lifestyleFactors: {
          averageSleep: 0,
          averageStress: 0,
          exerciseFrequency: 0,
          caffeineConsumption: false
        }
      });
    }
    
    const profile = this.userProfiles.get(userId);
    profile.outcomes.push(outcome);
    
    // Update average effectiveness for this remedy
    const remedyOutcomes = profile.outcomes.filter(o => o.remedyId === outcome.remedyId);
    profile.averageEffectiveness[outcome.remedyId] = 
      remedyOutcomes.reduce((sum, o) => sum + o.effectiveness, 0) / remedyOutcomes.length;
    
    // Update lifestyle factors
    const allOutcomes = profile.outcomes;
    profile.lifestyleFactors.averageSleep = 
      allOutcomes.reduce((sum, o) => sum + o.context.sleepHours, 0) / allOutcomes.length;
    profile.lifestyleFactors.averageStress = 
      allOutcomes.reduce((sum, o) => sum + o.context.stressLevel, 0) / allOutcomes.length;
    profile.lifestyleFactors.exerciseFrequency = 
      allOutcomes.filter(o => o.context.exerciseDone).length / allOutcomes.length;
    profile.lifestyleFactors.caffeineConsumption = 
      allOutcomes.some(o => o.context.caffeineConsumed);
  }
  
  findSimilarUsers(targetUserId: string, symptom: string): UserSimilarity[] {
    const targetProfile = this.userProfiles.get(targetUserId);
    if (!targetProfile) return [];
    
    const similarities: UserSimilarity[] = [];
    
    this.userProfiles.forEach((profile, userId) => {
      if (userId === targetUserId) return;
      
      // Calculate similarity based on lifestyle factors and symptom history
      const lifestyleSimilarity = this.calculateLifestyleSimilarity(
        targetProfile.lifestyleFactors,
        profile.lifestyleFactors
      );
      
      const symptomSimilarity = this.calculateSymptomSimilarity(
        targetProfile.outcomes,
        profile.outcomes,
        symptom
      );
      
      const overallSimilarity = (lifestyleSimilarity + symptomSimilarity) / 2;
      
      if (overallSimilarity > 0.3) { // Threshold for similarity
        const effectiveRemedies = Object.entries(profile.averageEffectiveness)
          .filter(([_, effectiveness]) => effectiveness > 3)
          .map(([remedyId, effectiveness]) => ({
            remedyId,
            effectiveness: effectiveness as number,
            usageCount: profile.outcomes.filter(o => o.remedyId === remedyId).length
          }));
        
        similarities.push({
          userId,
          similarity: overallSimilarity,
          sharedSymptoms: this.getSharedSymptoms(targetProfile.outcomes, profile.outcomes),
          sharedLifestyle: profile.lifestyleFactors,
          effectiveRemedies
        });
      }
    });
    
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }
  
  private calculateLifestyleSimilarity(factors1: any, factors2: any): number {
    const sleepDiff = Math.abs(factors1.averageSleep - factors2.averageSleep) / 10;
    const stressDiff = Math.abs(factors1.averageStress - factors2.averageStress) / 10;
    const exerciseDiff = Math.abs(factors1.exerciseFrequency - factors2.exerciseFrequency);
    const caffeineDiff = factors1.caffeineConsumption === factors2.caffeineConsumption ? 0 : 1;
    
    const totalDiff = (sleepDiff + stressDiff + exerciseDiff + caffeineDiff) / 4;
    return Math.max(0, 1 - totalDiff);
  }
  
  private calculateSymptomSimilarity(outcomes1: RemedyOutcome[], outcomes2: RemedyOutcome[], targetSymptom: string): number {
    const symptoms1 = new Set(outcomes1.map(o => o.symptom));
    const symptoms2 = new Set(outcomes2.map(o => o.symptom));
    
    const intersection = new Set([...symptoms1].filter(s => symptoms2.has(s)));
    const union = new Set([...symptoms1, ...symptoms2]);
    
    return intersection.size / union.size;
  }
  
  private getSharedSymptoms(outcomes1: RemedyOutcome[], outcomes2: RemedyOutcome[]): string[] {
    const symptoms1 = new Set(outcomes1.map(o => o.symptom));
    const symptoms2 = new Set(outcomes2.map(o => o.symptom));
    
    return [...symptoms1].filter(s => symptoms2.has(s));
  }
}

// Medical Guidelines Engine
export class MedicalGuidelinesEngine {
  private guidelines: { [symptom: string]: Array<{ remedy: string; evidence: string; effectiveness: number }> } = {
    'acid_reflux': [
      { remedy: 'peppermint_tea', evidence: 'A', effectiveness: 4 },
      { remedy: 'ginger_tea', evidence: 'B', effectiveness: 3 },
      { remedy: 'avoid_caffeine', evidence: 'A', effectiveness: 4 },
      { remedy: 'elevate_head', evidence: 'B', effectiveness: 3 },
      { remedy: 'small_meals', evidence: 'A', effectiveness: 4 }
    ],
    'migraine': [
      { remedy: 'dark_room_rest', evidence: 'A', effectiveness: 4 },
      { remedy: 'hydration', evidence: 'B', effectiveness: 3 },
      { remedy: 'caffeine_moderation', evidence: 'B', effectiveness: 3 },
      { remedy: 'stress_management', evidence: 'A', effectiveness: 4 },
      { remedy: 'regular_sleep', evidence: 'A', effectiveness: 4 }
    ],
    'ibs_symptoms': [
      { remedy: 'peppermint_oil', evidence: 'A', effectiveness: 4 },
      { remedy: 'probiotics', evidence: 'B', effectiveness: 3 },
      { remedy: 'fiber_regulation', evidence: 'A', effectiveness: 3 },
      { remedy: 'stress_reduction', evidence: 'A', effectiveness: 4 },
      { remedy: 'regular_exercise', evidence: 'B', effectiveness: 3 }
    ],
    'skin_issues': [
      { remedy: 'gentle_cleansing', evidence: 'A', effectiveness: 4 },
      { remedy: 'moisturizing', evidence: 'A', effectiveness: 4 },
      { remedy: 'stress_management', evidence: 'B', effectiveness: 3 },
      { remedy: 'adequate_sleep', evidence: 'B', effectiveness: 3 },
      { remedy: 'hydration', evidence: 'B', effectiveness: 3 }
    ]
  };
  
  getRecommendations(symptom: string): Array<{ remedy: string; evidence: string; effectiveness: number }> {
    return this.guidelines[symptom] || [];
  }
  
  getEvidenceLevel(evidence: string): string {
    switch (evidence) {
      case 'A': return 'Strong evidence';
      case 'B': return 'Moderate evidence';
      case 'C': return 'Limited evidence';
      default: return 'Insufficient evidence';
    }
  }
}

// Contextual Effectiveness Model
export class ContextualEffectivenessModel {
  private models: Map<string, RemedyEffectivenessModel> = new Map();
  
  constructor() {
    this.initializeModels();
  }
  
  private initializeModels() {
    // Peppermint tea model
    this.models.set('peppermint_tea', {
      remedyId: 'peppermint_tea',
      baseEffectiveness: 3.5,
      contextualModifiers: {
        'high_stress': 0.8, // Less effective under high stress
        'poor_sleep': 0.9, // Slightly less effective with poor sleep
        'after_meal': 1.2, // More effective after meals
        'evening': 1.1 // Slightly more effective in evening
      },
      timeToRelief: { average: 30, variance: 15 },
      sideEffectProfile: {
        'heartburn': 0.1,
        'nausea': 0.05
      }
    });
    
    // Ginger tea model
    this.models.set('ginger_tea', {
      remedyId: 'ginger_tea',
      baseEffectiveness: 3.0,
      contextualModifiers: {
        'morning': 1.3, // More effective in morning
        'with_food': 1.2, // Better with food
        'high_stress': 0.7 // Less effective under stress
      },
      timeToRelief: { average: 45, variance: 20 },
      sideEffectProfile: {
        'heartburn': 0.15,
        'upset_stomach': 0.1
      }
    });
    
    // Add more models as needed...
  }
  
  predictEffectiveness(remedyId: string, context: any): { effectiveness: number; timeToRelief: number } {
    const model = this.models.get(remedyId);
    if (!model) {
      return { effectiveness: 3.0, timeToRelief: 60 }; // Default
    }
    
    let effectiveness = model.baseEffectiveness;
    
    // Apply contextual modifiers
    Object.entries(model.contextualModifiers).forEach(([condition, modifier]) => {
      if (this.checkCondition(context, condition)) {
        effectiveness *= modifier;
      }
    });
    
    // Calculate time to relief with some variance
    const timeToRelief = model.timeToRelief.average + 
      (Math.random() - 0.5) * model.timeToRelief.variance;
    
    return {
      effectiveness: Math.min(5, Math.max(1, effectiveness)),
      timeToRelief: Math.max(5, timeToRelief)
    };
  }
  
  private checkCondition(context: any, condition: string): boolean {
    switch (condition) {
      case 'high_stress': return context.stressLevel > 7;
      case 'poor_sleep': return context.sleepHours < 6;
      case 'after_meal': return context.timeOfDay === 'after_meal';
      case 'evening': return context.timeOfDay === 'evening';
      case 'morning': return context.timeOfDay === 'morning';
      case 'with_food': return context.withFood;
      default: return false;
    }
  }
}

// Main Enhanced Remedy Recommender
export class EnhancedRemedyRecommender {
  private collaborativeEngine: CollaborativeFilteringEngine;
  private guidelinesEngine: MedicalGuidelinesEngine;
  private effectivenessModel: ContextualEffectivenessModel;
  private remedies: any[] = [];
  
  constructor() {
    this.collaborativeEngine = new CollaborativeFilteringEngine();
    this.guidelinesEngine = new MedicalGuidelinesEngine();
    this.effectivenessModel = new ContextualEffectivenessModel();
  }
  
  setRemedies(remedies: any[]) {
    this.remedies = remedies;
  }
  
  addOutcome(outcome: RemedyOutcome) {
    this.collaborativeEngine.addOutcome(outcome);
  }
  
  generateRecommendations(
    userId: string,
    symptom: string,
    context: any,
    limit: number = 5
  ): CollaborativeRecommendation[] {
    
    // Get similar users
    const similarUsers = this.collaborativeEngine.findSimilarUsers(userId, symptom);
    
    // Get medical guidelines
    const guidelines = this.guidelinesEngine.getRecommendations(symptom);
    
    // Get user's personal history
    const personalHistory = this.getPersonalHistory(userId, symptom);
    
    // Generate recommendations
    const recommendations: CollaborativeRecommendation[] = [];
    
    // Combine all sources
    const allRemedies = new Set<string>();
    
    // Add from guidelines
    guidelines.forEach(guideline => allRemedies.add(guideline.remedy));
    
    // Add from similar users
    similarUsers.forEach(user => {
      user.effectiveRemedies.forEach(remedy => allRemedies.add(remedy.remedyId));
    });
    
    // Add from personal history
    personalHistory.forEach(history => allRemedies.add(history.remedyId));
    
    // Score each remedy
    allRemedies.forEach(remedyId => {
      const remedy = this.remedies.find(r => r.id === remedyId);
      if (!remedy) return;
      
      const score = this.calculateRemedyScore(
        remedyId,
        userId,
        symptom,
        context,
        similarUsers,
        guidelines,
        personalHistory
      );
      
      if (score.score > 0.3) { // Threshold for recommendation
        recommendations.push({
          remedyId,
          remedyName: remedy.name,
          type: remedy.type,
          score: score.score * 100,
          confidence: score.confidence,
          reasoning: score.reasoning,
          expectedEffectiveness: score.expectedEffectiveness,
          expectedTimeToRelief: score.expectedTimeToRelief,
          similarUserCount: score.similarUserCount,
          alternativeRemedies: score.alternatives
        });
      }
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  private getPersonalHistory(userId: string, symptom: string): Array<{ remedyId: string; effectiveness: number; usageCount: number }> {
    // This would typically query a database
    // For now, return empty array
    return [];
  }
  
  private calculateRemedyScore(
    remedyId: string,
    userId: string,
    symptom: string,
    context: any,
    similarUsers: UserSimilarity[],
    guidelines: any[],
    personalHistory: any[]
  ): {
    score: number;
    confidence: 'low' | 'medium' | 'high';
    reasoning: any;
    expectedEffectiveness: number;
    expectedTimeToRelief: number;
    similarUserCount: number;
    alternatives: string[];
  } {
    
    let score = 0;
    let confidence: 'low' | 'medium' | 'high' = 'low';
    const reasoning = {
      personalHistory: '',
      similarUsers: '',
      medicalGuidelines: '',
      contextualFactors: ''
    };
    
    // Personal history score (40% weight)
    const personalMatch = personalHistory.find(h => h.remedyId === remedyId);
    if (personalMatch) {
      score += (personalMatch.effectiveness / 5) * 0.4;
      reasoning.personalHistory = `You've used this remedy ${personalMatch.usageCount} times with ${personalMatch.effectiveness}/5 effectiveness`;
    }
    
    // Similar users score (30% weight)
    const similarUserMatches = similarUsers.filter(user => 
      user.effectiveRemedies.some(r => r.remedyId === remedyId)
    );
    
    if (similarUserMatches.length > 0) {
      const avgEffectiveness = similarUserMatches.reduce((sum, user) => {
        const remedy = user.effectiveRemedies.find(r => r.remedyId === remedyId);
        return sum + (remedy?.effectiveness || 0);
      }, 0) / similarUserMatches.length;
      
      score += (avgEffectiveness / 5) * 0.3;
      reasoning.similarUsers = `${similarUserMatches.length} similar users found this effective (avg ${avgEffectiveness.toFixed(1)}/5)`;
    }
    
    // Medical guidelines score (20% weight)
    const guidelineMatch = guidelines.find(g => g.remedy === remedyId);
    if (guidelineMatch) {
      score += (guidelineMatch.effectiveness / 5) * 0.2;
      reasoning.medicalGuidelines = `${this.guidelinesEngine.getEvidenceLevel(guidelineMatch.evidence)} supports this remedy`;
    }
    
    // Contextual factors score (10% weight)
    const contextualPrediction = this.effectivenessModel.predictEffectiveness(remedyId, context);
    score += (contextualPrediction.effectiveness / 5) * 0.1;
    reasoning.contextualFactors = `Current context suggests ${contextualPrediction.effectiveness.toFixed(1)}/5 effectiveness`;
    
    // Determine confidence
    const dataPoints = (personalMatch ? 1 : 0) + similarUserMatches.length + (guidelineMatch ? 1 : 0);
    if (dataPoints >= 3) confidence = 'high';
    else if (dataPoints >= 2) confidence = 'medium';
    
    // Get alternatives (other remedies for same symptom)
    const alternatives = guidelines
      .filter(g => g.remedy !== remedyId)
      .slice(0, 3)
      .map(g => g.remedy);
    
    return {
      score,
      confidence,
      reasoning,
      expectedEffectiveness: contextualPrediction.effectiveness,
      expectedTimeToRelief: contextualPrediction.timeToRelief,
      similarUserCount: similarUserMatches.length,
      alternatives
    };
  }
}
