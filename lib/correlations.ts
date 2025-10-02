// Simple correlations analysis for nutrition-symptom relationships
export interface CorrelationData {
  factor: string;
  condition: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  sampleSize: number;
}

export interface SimpleCorrelation {
  factor: string;
  symptoms: {
    [condition: string]: {
      correlation: number;
      strength: string;
      direction: string;
      occurrences: number;
    };
  };
}

// Calculate simple correlations between factors and symptoms
export function calculateSimpleCorrelations(
  nutritionEntries: any[],
  exerciseEntries: any[]
): SimpleCorrelation[] {
  const correlations: SimpleCorrelation[] = [];
  
  if (nutritionEntries.length === 0) return correlations;
  
  // Define factors to analyze
  const factors = [
    { name: 'Low Sleep (<6h)', check: (entry: any) => entry.sleep < 6 },
    { name: 'High Stress (>7)', check: (entry: any) => entry.stress > 7 },
    { name: 'Caffeine Consumption', check: (entry: any) => entry.caffeine },
    { name: 'Poor Sleep Quality (<7h)', check: (entry: any) => entry.sleep < 7 },
    { name: 'Very High Stress (>8)', check: (entry: any) => entry.stress > 8 },
  ];
  
  // Define symptom conditions
  const conditions = [
    { name: 'Acid Reflux', keywords: ['reflux', 'heartburn', 'acid'] },
    { name: 'Migraine', keywords: ['headache', 'migraine', 'head pain'] },
    { name: 'IBS', keywords: ['bloat', 'cramp', 'stomach', 'digestive', 'ibs'] },
    { name: 'Skin Issues', keywords: ['skin', 'rash', 'acne', 'flare'] },
  ];
  
  factors.forEach(factor => {
    const correlation: SimpleCorrelation = {
      factor: factor.name,
      symptoms: {}
    };
    
    conditions.forEach(condition => {
      const totalEntries = nutritionEntries.length;
      const factorPresent = nutritionEntries.filter(factor.check).length;
      const factorAbsent = totalEntries - factorPresent;
      
      // Count symptom occurrences with and without factor
      const symptomWithFactor = nutritionEntries.filter(entry => 
        factor.check(entry) && 
        condition.keywords.some(keyword => 
          entry.symptoms.some((symptom: string) => 
            symptom.toLowerCase().includes(keyword)
          )
        )
      ).length;
      
      const symptomWithoutFactor = nutritionEntries.filter(entry => 
        !factor.check(entry) && 
        condition.keywords.some(keyword => 
          entry.symptoms.some((symptom: string) => 
            symptom.toLowerCase().includes(keyword)
          )
        )
      ).length;
      
      // Calculate correlation coefficient (simplified)
      const totalSymptomOccurrences = symptomWithFactor + symptomWithoutFactor;
      const correlationValue = totalSymptomOccurrences > 0 
        ? (symptomWithFactor / factorPresent) - (symptomWithoutFactor / factorAbsent)
        : 0;
      
      // Determine strength and direction
      const absCorrelation = Math.abs(correlationValue);
      let strength: string;
      if (absCorrelation > 0.3) strength = 'strong';
      else if (absCorrelation > 0.15) strength = 'moderate';
      else strength = 'weak';
      
      const direction = correlationValue > 0 ? 'positive' : 'negative';
      
      correlation.symptoms[condition.name] = {
        correlation: correlationValue,
        strength,
        direction,
        occurrences: totalSymptomOccurrences
      };
    });
    
    correlations.push(correlation);
  });
  
  return correlations;
}

// Get top correlations for insights
export function getTopCorrelations(correlations: SimpleCorrelation[]): {
  strongest: SimpleCorrelation[];
  mostFrequent: SimpleCorrelation[];
} {
  const allCorrelations: Array<{
    factor: string;
    condition: string;
    correlation: number;
    strength: string;
    occurrences: number;
  }> = [];
  
  correlations.forEach(corr => {
    Object.entries(corr.symptoms).forEach(([condition, data]) => {
      allCorrelations.push({
        factor: corr.factor,
        condition,
        correlation: data.correlation,
        strength: data.strength,
        occurrences: data.occurrences
      });
    });
  });
  
  return {
    strongest: correlations.filter(corr => 
      Object.values(corr.symptoms).some(s => s.strength === 'strong')
    ),
    mostFrequent: correlations.filter(corr => 
      Object.values(corr.symptoms).some(s => s.occurrences > 2)
    )
  };
}
