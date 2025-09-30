import { NutritionEntry, ExerciseEntry, Remedy } from './storage';

export const sampleNutritionEntries: NutritionEntry[] = [
  {
    id: 'sample-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    meal: 'breakfast',
    foods: ['coffee', 'toast', 'eggs'],
    symptoms: ['reflux'],
    severity: 6,
    sleep: 5.5,
    stress: 7,
    caffeine: true,
  },
  {
    id: 'sample-2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    meal: 'lunch',
    foods: ['salad', 'chicken', 'water'],
    symptoms: [],
    severity: 0,
    sleep: 7.5,
    stress: 4,
    caffeine: false,
  },
  {
    id: 'sample-3',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    meal: 'dinner',
    foods: ['pasta', 'wine', 'garlic bread'],
    symptoms: ['bloating', 'reflux'],
    severity: 7,
    sleep: 6,
    stress: 8,
    caffeine: false,
  },
];

export const sampleExerciseEntries: ExerciseEntry[] = [
  {
    id: 'ex-sample-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Running',
    duration: 30,
    intensity: 'medium',
    recovery: 7,
    notes: 'Morning run, felt good',
  },
  {
    id: 'ex-sample-2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Yoga',
    duration: 45,
    intensity: 'low',
    recovery: 9,
    notes: 'Very relaxing session',
  },
];

export const sampleRemedies: Remedy[] = [
  {
    id: 'remedy-1',
    name: 'Ginger Tea',
    type: 'food',
    effectiveness: 75,
    usageCount: 12,
    conditions: ['Acid Reflux', 'IBS'],
    notes: 'Works best in the morning',
  },
  {
    id: 'remedy-2',
    name: 'Omeprazole',
    type: 'medication',
    effectiveness: 85,
    usageCount: 30,
    conditions: ['Acid Reflux'],
    notes: 'Take 30 minutes before meals',
  },
  {
    id: 'remedy-3',
    name: 'Meditation',
    type: 'lifestyle',
    effectiveness: 70,
    usageCount: 20,
    conditions: ['Migraine', 'IBS'],
    notes: '10 minutes daily helps significantly',
  },
];
