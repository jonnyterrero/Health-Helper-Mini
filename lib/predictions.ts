export interface DailyData {
  sleep: number;
  stress: number;
  caffeine: boolean;
  exercise: boolean;
}

export interface Prediction {
  condition: string;
  probability: number;
  factors: string[];
  severity: 'low' | 'medium' | 'high';
}

export function calculatePredictions(data: DailyData): Prediction[] {
  const predictions: Prediction[] = [];

  // Acid Reflux Prediction
  let refluxProbability = 20; // baseline
  const refluxFactors: string[] = [];

  if (data.caffeine && data.sleep < 6) {
    refluxProbability += 30;
    refluxFactors.push('Coffee + less than 6 hours sleep');
  } else if (data.caffeine) {
    refluxProbability += 15;
    refluxFactors.push('Caffeine consumption');
  }

  if (data.sleep < 6) {
    refluxProbability += 15;
    refluxFactors.push('Poor sleep (<6 hours)');
  }

  if (data.stress > 7) {
    refluxProbability += 20;
    refluxFactors.push('High stress levels');
  }

  if (data.exercise) {
    refluxProbability -= 10;
    refluxFactors.push('Exercise (protective)');
  }

  refluxProbability = Math.max(0, Math.min(100, refluxProbability));

  predictions.push({
    condition: 'Acid Reflux',
    probability: refluxProbability,
    factors: refluxFactors.length > 0 ? refluxFactors : ['No significant risk factors'],
    severity: refluxProbability > 60 ? 'high' : refluxProbability > 35 ? 'medium' : 'low',
  });

  // Migraine Prediction
  let migraineProbability = 15; // baseline
  const migraineFactors: string[] = [];

  if (data.sleep < 7 || data.sleep > 9) {
    migraineProbability += 25;
    migraineFactors.push('Irregular sleep pattern');
  }

  if (data.stress > 6) {
    migraineProbability += 20;
    migraineFactors.push('Elevated stress');
  }

  if (data.caffeine && data.sleep < 7) {
    migraineProbability += 15;
    migraineFactors.push('Caffeine + sleep deprivation');
  }

  if (data.exercise) {
    migraineProbability -= 15;
    migraineFactors.push('Exercise (protective)');
  }

  migraineProbability = Math.max(0, Math.min(100, migraineProbability));

  predictions.push({
    condition: 'Migraine',
    probability: migraineProbability,
    factors: migraineFactors.length > 0 ? migraineFactors : ['No significant risk factors'],
    severity: migraineProbability > 55 ? 'high' : migraineProbability > 30 ? 'medium' : 'low',
  });

  // IBS Symptoms Prediction
  let ibsProbability = 25; // baseline
  const ibsFactors: string[] = [];

  if (data.stress > 7) {
    ibsProbability += 30;
    ibsFactors.push('High stress (major trigger)');
  }

  if (data.sleep < 6) {
    ibsProbability += 15;
    ibsFactors.push('Sleep deprivation');
  }

  if (!data.exercise) {
    ibsProbability += 10;
    ibsFactors.push('Lack of physical activity');
  } else {
    ibsFactors.push('Regular exercise (protective)');
  }

  ibsProbability = Math.max(0, Math.min(100, ibsProbability));

  predictions.push({
    condition: 'IBS Symptoms',
    probability: ibsProbability,
    factors: ibsFactors.length > 0 ? ibsFactors : ['No significant risk factors'],
    severity: ibsProbability > 60 ? 'high' : ibsProbability > 40 ? 'medium' : 'low',
  });

  // Skin Issues Prediction
  let skinProbability = 20; // baseline
  const skinFactors: string[] = [];

  if (data.stress > 7) {
    skinProbability += 25;
    skinFactors.push('High stress levels');
  }

  if (data.sleep < 7) {
    skinProbability += 20;
    skinFactors.push('Insufficient sleep');
  }

  if (data.exercise) {
    skinProbability -= 10;
    skinFactors.push('Exercise improves circulation');
  }

  skinProbability = Math.max(0, Math.min(100, skinProbability));

  predictions.push({
    condition: 'Skin Flare-ups',
    probability: skinProbability,
    factors: skinFactors.length > 0 ? skinFactors : ['No significant risk factors'],
    severity: skinProbability > 55 ? 'high' : skinProbability > 35 ? 'medium' : 'low',
  });

  return predictions;
}
