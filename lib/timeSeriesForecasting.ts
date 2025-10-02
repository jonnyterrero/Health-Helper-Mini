// Time-series forecasting for symptom prediction
export interface TimeSeriesData {
  date: string;
  value: number;
  factors: {
    sleep: number;
    stress: number;
    caffeine: boolean;
    exercise: boolean;
  };
}

export interface ForecastResult {
  date: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  period: number; // days
  nextPeak?: string;
  nextTrough?: string;
}

// Simple moving average for trend detection
export function calculateMovingAverage(data: TimeSeriesData[], window: number = 7): number[] {
  if (data.length < window) return data.map(d => d.value);
  
  const movingAverages: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      movingAverages.push(data[i].value);
    } else {
      const windowData = data.slice(i - window + 1, i + 1);
      const average = windowData.reduce((sum, d) => sum + d.value, 0) / window;
      movingAverages.push(average);
    }
  }
  
  return movingAverages;
}

// Simple exponential smoothing for forecasting
export function exponentialSmoothing(
  data: TimeSeriesData[], 
  alpha: number = 0.3
): { smoothed: number[]; forecast: ForecastResult[] } {
  if (data.length === 0) return { smoothed: [], forecast: [] };
  
  const smoothed: number[] = [];
  const forecast: ForecastResult[] = [];
  
  // Initialize with first value
  smoothed[0] = data[0].value;
  
  // Calculate smoothed values
  for (let i = 1; i < data.length; i++) {
    smoothed[i] = alpha * data[i].value + (1 - alpha) * smoothed[i - 1];
  }
  
  // Generate forecast for next 7 days
  const lastValue = smoothed[smoothed.length - 1];
  const lastData = data[data.length - 1];
  
  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date(lastData.date);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    // Simple trend continuation with factor influence
    const trend = smoothed.length > 1 ? 
      smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2] : 0;
    
    let predicted = lastValue + (trend * i);
    
    // Adjust based on historical patterns
    const dayOfWeek = forecastDate.getDay();
    const historicalSameDay = data.filter(d => new Date(d.date).getDay() === dayOfWeek);
    
    if (historicalSameDay.length > 0) {
      const avgSameDay = historicalSameDay.reduce((sum, d) => sum + d.value, 0) / historicalSameDay.length;
      predicted = (predicted + avgSameDay) / 2;
    }
    
    // Confidence decreases over time
    const confidence = Math.max(0.1, 1 - (i * 0.1));
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.max(0, Math.min(100, predicted)),
      confidence,
      factors: getInfluencingFactors(lastData.factors)
    });
  }
  
  return { smoothed, forecast };
}

// Analyze trends in the data
export function analyzeTrends(data: TimeSeriesData[]): TrendAnalysis {
  if (data.length < 7) {
    return { direction: 'stable', strength: 'weak', period: 0 };
  }
  
  const movingAverages = calculateMovingAverage(data, 7);
  const recent = movingAverages.slice(-14);
  const older = movingAverages.slice(-28, -14);
  
  if (recent.length === 0 || older.length === 0) {
    return { direction: 'stable', strength: 'weak', period: 0 };
  }
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  const changePercent = Math.abs(change) / olderAvg;
  
  let direction: 'increasing' | 'decreasing' | 'stable';
  if (change > 0.1) direction = 'increasing';
  else if (change < -0.1) direction = 'decreasing';
  else direction = 'stable';
  
  let strength: 'weak' | 'moderate' | 'strong';
  if (changePercent > 0.2) strength = 'strong';
  else if (changePercent > 0.1) strength = 'moderate';
  else strength = 'weak';
  
  // Simple period detection (look for peaks)
  const peaks = findPeaks(movingAverages);
  const period = peaks.length > 1 ? 
    Math.round((peaks[peaks.length - 1] - peaks[peaks.length - 2]) / 7) : 0;
  
  return {
    direction,
    strength,
    period,
    nextPeak: direction === 'increasing' ? 
      new Date(Date.now() + (period * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : undefined,
    nextTrough: direction === 'decreasing' ? 
      new Date(Date.now() + (period * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : undefined
  };
}

// Find peaks in the data
function findPeaks(data: number[]): number[] {
  const peaks: number[] = [];
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      peaks.push(i);
    }
  }
  
  return peaks;
}

// Get influencing factors for forecast
function getInfluencingFactors(factors: any): string[] {
  const influences: string[] = [];
  
  if (factors.sleep < 6) influences.push('Poor sleep pattern');
  if (factors.stress > 7) influences.push('High stress levels');
  if (factors.caffeine) influences.push('Caffeine consumption');
  if (factors.exercise) influences.push('Exercise (protective)');
  
  return influences;
}

// Prophet-like seasonal decomposition (simplified)
export function seasonalDecomposition(data: TimeSeriesData[]): {
  trend: number[];
  seasonal: number[];
  residual: number[];
} {
  if (data.length < 14) {
    return {
      trend: data.map(d => d.value),
      seasonal: new Array(data.length).fill(0),
      residual: new Array(data.length).fill(0)
    };
  }
  
  // Calculate trend using moving average
  const trend = calculateMovingAverage(data, 7);
  
  // Calculate seasonal component (day of week patterns)
  const seasonal = new Array(data.length).fill(0);
  const dayOfWeekAverages: { [key: number]: number[] } = {};
  
  // Group by day of week
  data.forEach((d, i) => {
    const dayOfWeek = new Date(d.date).getDay();
    if (!dayOfWeekAverages[dayOfWeek]) {
      dayOfWeekAverages[dayOfWeek] = [];
    }
    dayOfWeekAverages[dayOfWeek].push(d.value - trend[i]);
  });
  
  // Calculate seasonal averages
  const seasonalAverages: { [key: number]: number } = {};
  Object.entries(dayOfWeekAverages).forEach(([day, values]) => {
    seasonalAverages[parseInt(day)] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });
  
  // Apply seasonal component
  data.forEach((d, i) => {
    const dayOfWeek = new Date(d.date).getDay();
    seasonal[i] = seasonalAverages[dayOfWeek] || 0;
  });
  
  // Calculate residual
  const residual = data.map((d, i) => d.value - trend[i] - seasonal[i]);
  
  return { trend, seasonal, residual };
}

// Generate comprehensive forecast
export function generateForecast(
  nutritionEntries: any[],
  exerciseEntries: any[]
): {
  acidReflux: { forecast: ForecastResult[]; trend: TrendAnalysis };
  migraine: { forecast: ForecastResult[]; trend: TrendAnalysis };
  ibs: { forecast: ForecastResult[]; trend: TrendAnalysis };
  skin: { forecast: ForecastResult[]; trend: TrendAnalysis };
} {
  const conditions = [
    { name: 'acidReflux', keywords: ['reflux', 'heartburn', 'acid'] },
    { name: 'migraine', keywords: ['headache', 'migraine', 'head pain'] },
    { name: 'ibs', keywords: ['bloat', 'cramp', 'stomach', 'digestive', 'ibs'] },
    { name: 'skin', keywords: ['skin', 'rash', 'acne', 'flare'] },
  ];
  
  const results: any = {};
  
  conditions.forEach(condition => {
    // Prepare time series data
    const timeSeriesData: TimeSeriesData[] = nutritionEntries.map(entry => {
      const hasSymptom = condition.keywords.some(keyword => 
        entry.symptoms.some((symptom: string) => 
          symptom.toLowerCase().includes(keyword)
        )
      );
      
      const exerciseEntry = exerciseEntries.find(ex => 
        new Date(ex.date).toDateString() === new Date(entry.date).toDateString()
      );
      
      return {
        date: entry.date,
        value: hasSymptom ? entry.severity * 20 : 0, // Convert severity to 0-100 scale
        factors: {
          sleep: entry.sleep,
          stress: entry.stress,
          caffeine: entry.caffeine,
          exercise: !!exerciseEntry,
        }
      };
    });
    
    // Generate forecast
    const { forecast } = exponentialSmoothing(timeSeriesData);
    const trend = analyzeTrends(timeSeriesData);
    
    results[condition.name] = { forecast, trend };
  });
  
  return results;
}
