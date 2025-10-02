export interface NutritionEntry {
  id: string;
  date: string;
  meal: string;
  foods: string[];
  symptoms: string[];
  severity: number;
  sleep: number;
  stress: number;
  caffeine: boolean;
}

export interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  recovery: number;
  notes: string;
}

export interface Remedy {
  id: string;
  name: string;
  type: 'medication' | 'supplement' | 'lifestyle' | 'food';
  effectiveness: number;
  usageCount: number;
  conditions: string[];
  notes: string;
  // Enhanced tracking for better recommendations
  lastUsed?: string;
  successRate?: number;
  averageEffectiveness?: number;
  totalPositiveFeedback?: number;
  totalNegativeFeedback?: number;
}

export const storageKeys = {
  nutrition: 'nutrition-entries',
  exercise: 'exercise-entries',
  remedies: 'remedies',
};

export function saveNutritionEntry(entry: NutritionEntry) {
  const entries = getNutritionEntries();
  entries.push(entry);
  localStorage.setItem(storageKeys.nutrition, JSON.stringify(entries));
}

export function getNutritionEntries(): NutritionEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(storageKeys.nutrition);
  return data ? JSON.parse(data) : [];
}

export function saveExerciseEntry(entry: ExerciseEntry) {
  const entries = getExerciseEntries();
  entries.push(entry);
  localStorage.setItem(storageKeys.exercise, JSON.stringify(entries));
}

export function getExerciseEntries(): ExerciseEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(storageKeys.exercise);
  return data ? JSON.parse(data) : [];
}

export function saveRemedy(remedy: Remedy) {
  const remedies = getRemedies();
  const index = remedies.findIndex(r => r.id === remedy.id);
  if (index >= 0) {
    remedies[index] = remedy;
  } else {
    remedies.push(remedy);
  }
  localStorage.setItem(storageKeys.remedies, JSON.stringify(remedies));
}

export function getRemedies(): Remedy[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(storageKeys.remedies);
  return data ? JSON.parse(data) : [];
}

export function updateRemedyEffectiveness(id: string, effective: boolean) {
  const remedies = getRemedies();
  const remedy = remedies.find(r => r.id === id);
  if (remedy) {
    remedy.usageCount++;
    remedy.lastUsed = new Date().toISOString();
    
    // Track positive/negative feedback separately
    if (effective) {
      remedy.totalPositiveFeedback = (remedy.totalPositiveFeedback || 0) + 1;
    } else {
      remedy.totalNegativeFeedback = (remedy.totalNegativeFeedback || 0) + 1;
    }
    
    // Calculate success rate
    const totalFeedback = (remedy.totalPositiveFeedback || 0) + (remedy.totalNegativeFeedback || 0);
    remedy.successRate = totalFeedback > 0 ? ((remedy.totalPositiveFeedback || 0) / totalFeedback) * 100 : 50;
    
    // Update effectiveness with more sophisticated calculation
    if (effective) {
      remedy.effectiveness = Math.min(100, remedy.effectiveness + 3);
    } else {
      remedy.effectiveness = Math.max(0, remedy.effectiveness - 3);
    }
    
    // Calculate average effectiveness over time
    remedy.averageEffectiveness = remedy.effectiveness;
    
    saveRemedy(remedy);
  }
}

// Enhanced data structures for future ML/collaborative filtering
export interface UserPattern {
  userId: string;
  conditions: string[];
  commonTriggers: string[];
  effectiveRemedies: string[];
  lifestyleFactors: {
    averageSleep: number;
    averageStress: number;
    exerciseFrequency: number;
    caffeineConsumption: boolean;
  };
}

export interface RemedyEffectivenessData {
  remedyId: string;
  condition: string;
  userFeedback: {
    positive: number;
    negative: number;
    total: number;
  };
  contextualFactors: {
    sleepQuality: number;
    stressLevel: number;
    exerciseDone: boolean;
  };
}

// Function to prepare data for future collaborative filtering
export function prepareCollaborativeFilteringData(): {
  userPatterns: UserPattern[];
  remedyEffectiveness: RemedyEffectivenessData[];
} {
  const nutritionEntries = getNutritionEntries();
  const exerciseEntries = getExerciseEntries();
  const remedies = getRemedies();
  
  // Create user pattern from current data
  const userPattern: UserPattern = {
    userId: 'current-user',
    conditions: ['Acid Reflux', 'Migraine', 'IBS Symptoms', 'Skin Flare-ups'],
    commonTriggers: [],
    effectiveRemedies: remedies
      .filter(r => r.effectiveness > 70)
      .map(r => r.name),
    lifestyleFactors: {
      averageSleep: nutritionEntries.length > 0 
        ? nutritionEntries.reduce((sum, entry) => sum + entry.sleep, 0) / nutritionEntries.length 
        : 7,
      averageStress: nutritionEntries.length > 0 
        ? nutritionEntries.reduce((sum, entry) => sum + entry.stress, 0) / nutritionEntries.length 
        : 5,
      exerciseFrequency: exerciseEntries.length / Math.max(1, nutritionEntries.length),
      caffeineConsumption: nutritionEntries.some(entry => entry.caffeine),
    },
  };
  
  // Create remedy effectiveness data
  const remedyEffectiveness: RemedyEffectivenessData[] = remedies.map(remedy => ({
    remedyId: remedy.id,
    condition: remedy.conditions[0] || 'General',
    userFeedback: {
      positive: remedy.totalPositiveFeedback || 0,
      negative: remedy.totalNegativeFeedback || 0,
      total: remedy.usageCount || 0,
    },
    contextualFactors: {
      sleepQuality: userPattern.lifestyleFactors.averageSleep,
      stressLevel: userPattern.lifestyleFactors.averageStress,
      exerciseDone: userPattern.lifestyleFactors.exerciseFrequency > 0.3,
    },
  }));
  
  return {
    userPatterns: [userPattern],
    remedyEffectiveness,
  };
}
