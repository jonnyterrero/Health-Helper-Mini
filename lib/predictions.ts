export interface DailyData {
  sleep: number;
  stress: number;
  caffeine: boolean;
  exercise: boolean;
  // Enhanced data for better predictions
  exerciseIntensity?: 'low' | 'medium' | 'high';
  exerciseDuration?: number;
  recovery?: number;
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
    // More sophisticated exercise impact based on intensity and recovery
    const exerciseBenefit = data.exerciseIntensity === 'high' ? 15 : 
                           data.exerciseIntensity === 'medium' ? 10 : 5;
    refluxProbability -= exerciseBenefit;
    refluxFactors.push(`Exercise (${data.exerciseIntensity || 'medium'} intensity - protective)`);
    
    // Poor recovery can reduce benefits
    if (data.recovery && data.recovery < 4) {
      refluxProbability += 5;
      refluxFactors.push('Poor recovery may reduce exercise benefits');
    }
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
    // Exercise helps with migraines, but intensity matters
    const exerciseBenefit = data.exerciseIntensity === 'high' ? 20 : 
                           data.exerciseIntensity === 'medium' ? 15 : 10;
    migraineProbability -= exerciseBenefit;
    migraineFactors.push(`Exercise (${data.exerciseIntensity || 'medium'} intensity - protective)`);
    
    // Poor recovery can trigger migraines
    if (data.recovery && data.recovery < 3) {
      migraineProbability += 10;
      migraineFactors.push('Poor recovery may increase migraine risk');
    }
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
    // Exercise is particularly beneficial for IBS
    const exerciseBenefit = data.exerciseIntensity === 'high' ? 20 : 
                           data.exerciseIntensity === 'medium' ? 15 : 10;
    ibsProbability -= exerciseBenefit;
    ibsFactors.push(`Regular exercise (${data.exerciseIntensity || 'medium'} intensity - highly protective for IBS)`);
    
    // Recovery is crucial for IBS management
    if (data.recovery && data.recovery < 4) {
      ibsProbability += 8;
      ibsFactors.push('Poor recovery may worsen IBS symptoms');
    }
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
    // Exercise benefits skin through circulation and stress reduction
    const exerciseBenefit = data.exerciseIntensity === 'high' ? 15 : 
                           data.exerciseIntensity === 'medium' ? 10 : 5;
    skinProbability -= exerciseBenefit;
    skinFactors.push(`Exercise (${data.exerciseIntensity || 'medium'} intensity - improves circulation & reduces stress)`);
    
    // Poor recovery can cause inflammation affecting skin
    if (data.recovery && data.recovery < 4) {
      skinProbability += 5;
      skinFactors.push('Poor recovery may increase inflammation');
    }
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
