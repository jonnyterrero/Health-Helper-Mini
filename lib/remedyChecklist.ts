// Remedy checklist for daily tracking
export interface ChecklistItem {
  id: string;
  remedyId: string;
  remedyName: string;
  type: 'medication' | 'supplement' | 'lifestyle' | 'food';
  conditions: string[];
  completed: boolean;
  timeCompleted?: string;
  notes?: string;
  effectiveness?: number; // 1-5 scale
}

export interface DailyChecklist {
  id: string;
  date: string;
  items: ChecklistItem[];
  completionRate: number;
  totalItems: number;
  completedItems: number;
}

export interface ChecklistInsight {
  remedyName: string;
  completionRate: number;
  averageEffectiveness: number;
  streak: number;
  lastUsed: string;
  recommendation: string;
}

// Create daily checklist from remedies
export function createDailyChecklist(
  remedies: any[],
  date: string = new Date().toISOString().split('T')[0]
): DailyChecklist {
  const items: ChecklistItem[] = remedies.map(remedy => ({
    id: `checklist-${remedy.id}-${date}`,
    remedyId: remedy.id,
    remedyName: remedy.name,
    type: remedy.type,
    conditions: remedy.conditions,
    completed: false,
  }));
  
  return {
    id: `checklist-${date}`,
    date,
    items,
    completionRate: 0,
    totalItems: items.length,
    completedItems: 0,
  };
}

// Update checklist item
export function updateChecklistItem(
  checklist: DailyChecklist,
  itemId: string,
  updates: Partial<ChecklistItem>
): DailyChecklist {
  const updatedItems = checklist.items.map(item => 
    item.id === itemId ? { ...item, ...updates } : item
  );
  
  const completedItems = updatedItems.filter(item => item.completed).length;
  
  return {
    ...checklist,
    items: updatedItems,
    completedItems,
    completionRate: checklist.totalItems > 0 ? (completedItems / checklist.totalItems) * 100 : 0,
  };
}

// Get checklist insights
export function getChecklistInsights(
  checklists: DailyChecklist[],
  remedies: any[]
): ChecklistInsight[] {
  const insights: ChecklistInsight[] = [];
  
  remedies.forEach(remedy => {
    const remedyChecklists = checklists.flatMap(checklist => 
      checklist.items.filter(item => item.remedyId === remedy.id)
    );
    
    if (remedyChecklists.length === 0) return;
    
    const completedItems = remedyChecklists.filter(item => item.completed);
    const completionRate = (completedItems.length / remedyChecklists.length) * 100;
    
    const effectivenessRatings = completedItems
      .filter(item => item.effectiveness)
      .map(item => item.effectiveness!);
    
    const averageEffectiveness = effectivenessRatings.length > 0
      ? effectivenessRatings.reduce((sum, rating) => sum + rating, 0) / effectivenessRatings.length
      : 0;
    
    // Calculate streak (consecutive days used)
    const sortedDates = remedyChecklists
      .filter(item => item.completed)
      .map(item => item.timeCompleted || checklist.id.split('-')[1])
      .sort()
      .reverse();
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const itemDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    const lastUsed = sortedDates[0] || 'Never';
    
    // Generate recommendation
    let recommendation = '';
    if (completionRate < 50) {
      recommendation = 'Consider setting reminders for this remedy';
    } else if (completionRate > 80 && averageEffectiveness > 3) {
      recommendation = 'Great consistency! This remedy is working well for you';
    } else if (averageEffectiveness < 2) {
      recommendation = 'Consider discussing effectiveness with your healthcare provider';
    } else {
      recommendation = 'Keep up the good work with this remedy';
    }
    
    insights.push({
      remedyName: remedy.name,
      completionRate,
      averageEffectiveness,
      streak,
      lastUsed,
      recommendation,
    });
  });
  
  return insights.sort((a, b) => b.completionRate - a.completionRate);
}

// Get today's checklist from localStorage
export function getTodaysChecklist(): DailyChecklist | null {
  if (typeof window === 'undefined') return null;
  
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(`checklist-${today}`);
  
  return stored ? JSON.parse(stored) : null;
}

// Save checklist to localStorage
export function saveChecklist(checklist: DailyChecklist): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(`checklist-${checklist.date}`, JSON.stringify(checklist));
}

// Get checklist history
export function getChecklistHistory(days: number = 7): DailyChecklist[] {
  if (typeof window === 'undefined') return [];
  
  const checklists: DailyChecklist[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const stored = localStorage.getItem(`checklist-${dateString}`);
    if (stored) {
      checklists.push(JSON.parse(stored));
    }
  }
  
  return checklists;
}

// Generate smart recommendations for today's checklist
export function generateSmartRecommendations(
  remedies: any[],
  recentChecklists: DailyChecklist[]
): string[] {
  const recommendations: string[] = [];
  
  // Analyze recent patterns
  const recentInsights = getChecklistInsights(recentChecklists, remedies);
  
  // High effectiveness, low completion rate
  const underusedEffective = recentInsights.filter(insight => 
    insight.averageEffectiveness > 3 && insight.completionRate < 60
  );
  
  if (underusedEffective.length > 0) {
    recommendations.push(
      `Consider prioritizing ${underusedEffective[0].remedyName} - it's been effective when used`
    );
  }
  
  // Long streak recommendations
  const longStreaks = recentInsights.filter(insight => insight.streak > 3);
  if (longStreaks.length > 0) {
    recommendations.push(
      `Great job maintaining your ${longStreaks[0].remedyName} routine!`
    );
  }
  
  // Missing high-priority remedies
  const highPriority = remedies.filter(remedy => 
    remedy.conditions.length > 2 && remedy.effectiveness > 70
  );
  
  const missingHighPriority = highPriority.filter(remedy => {
    const recentUsage = recentChecklists.some(checklist => 
      checklist.items.some(item => 
        item.remedyId === remedy.id && item.completed
      )
    );
    return !recentUsage;
  });
  
  if (missingHighPriority.length > 0) {
    recommendations.push(
      `Don't forget ${missingHighPriority[0].name} - it's highly effective for multiple conditions`
    );
  }
  
  return recommendations;
}
