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
    if (effective) {
      remedy.effectiveness = Math.min(100, remedy.effectiveness + 5);
    } else {
      remedy.effectiveness = Math.max(0, remedy.effectiveness - 5);
    }
    saveRemedy(remedy);
  }
}
