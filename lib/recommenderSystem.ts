// Personalized recommender system using collaborative filtering
export interface UserProfile {
  userId: string;
  conditions: string[];
  lifestyleFactors: {
    averageSleep: number;
    averageStress: number;
    exerciseFrequency: number;
    caffeineConsumption: boolean;
  };
  remedyPreferences: {
    [remedyId: string]: {
      effectiveness: number;
      usageCount: number;
      lastUsed: string;
      successRate: number;
    };
  };
  symptomPatterns: {
    [condition: string]: {
      frequency: number;
      severity: number;
      triggers: string[];
    };
  };
}

export interface RemedyRecommendation {
  remedyId: string;
  remedyName: string;
  type: string;
  score: number;
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
  similarUsers: number;
}

export interface SimilarUser {
  userId: string;
  similarity: number;
  sharedConditions: string[];
  effectiveRemedies: string[];
}

// Calculate user similarity using cosine similarity
export function calculateUserSimilarity(
  user1: UserProfile, 
  user2: UserProfile
): number {
  // Feature vector: [sleep, stress, exercise, caffeine, condition1, condition2, ...]
  const features1 = [
    user1.lifestyleFactors.averageSleep / 10, // normalize to 0-1
    user1.lifestyleFactors.averageStress / 10,
    user1.lifestyleFactors.exerciseFrequency,
    user1.lifestyleFactors.caffeineConsumption ? 1 : 0,
    ...user1.conditions.map(c => 1), // binary features for conditions
  ];
  
  const features2 = [
    user2.lifestyleFactors.averageSleep / 10,
    user2.lifestyleFactors.averageStress / 10,
    user2.lifestyleFactors.exerciseFrequency,
    user2.lifestyleFactors.caffeineConsumption ? 1 : 0,
    ...user2.conditions.map(c => 1),
  ];
  
  // Pad arrays to same length
  const maxLength = Math.max(features1.length, features2.length);
  while (features1.length < maxLength) features1.push(0);
  while (features2.length < maxLength) features2.push(0);
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < maxLength; i++) {
    dotProduct += features1[i] * features2[i];
    norm1 += features1[i] * features1[i];
    norm2 += features2[i] * features2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Find similar users
export function findSimilarUsers(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  threshold: number = 0.3
): SimilarUser[] {
  const similarities = allUsers
    .filter(user => user.userId !== currentUser.userId)
    .map(user => ({
      userId: user.userId,
      similarity: calculateUserSimilarity(currentUser, user),
      sharedConditions: user.conditions.filter(c => currentUser.conditions.includes(c)),
      effectiveRemedies: Object.entries(user.remedyPreferences)
        .filter(([_, pref]) => pref.effectiveness > 70)
        .map(([remedyId, _]) => remedyId)
    }))
    .filter(sim => sim.similarity > threshold)
    .sort((a, b) => b.similarity - a.similarity);
  
  return similarities;
}

// Generate personalized recommendations
export function generateRecommendations(
  currentUser: UserProfile,
  similarUsers: SimilarUser[],
  allRemedies: any[]
): RemedyRecommendation[] {
  const recommendations: RemedyRecommendation[] = [];
  
  // Get remedies not yet tried by current user
  const untriedRemedies = allRemedies.filter(remedy => 
    !currentUser.remedyPreferences[remedy.id]
  );
  
  untriedRemedies.forEach(remedy => {
    let score = 0;
    const reasons: string[] = [];
    let similarUserCount = 0;
    
    // Calculate score based on similar users' experiences
    similarUsers.forEach(simUser => {
      const userRemedyPref = simUser.effectiveRemedies.includes(remedy.id);
      if (userRemedyPref) {
        score += simUser.similarity * 0.8; // Weight by similarity
        similarUserCount++;
        reasons.push(`Effective for users with similar ${simUser.sharedConditions.join(', ')} patterns`);
      }
    });
    
    // Boost score for remedies targeting user's conditions
    const conditionMatch = remedy.conditions.some(condition => 
      currentUser.conditions.includes(condition)
    );
    if (conditionMatch) {
      score += 0.3;
      reasons.push(`Targets your ${remedy.conditions.join(', ')} conditions`);
    }
    
    // Boost score based on remedy type preferences
    const userTypePreferences = Object.entries(currentUser.remedyPreferences)
      .reduce((acc, [_, pref]) => {
        const remedy = allRemedies.find(r => r.id === pref.remedyId);
        if (remedy) {
          acc[remedy.type] = (acc[remedy.type] || 0) + pref.effectiveness;
        }
        return acc;
      }, {} as { [type: string]: number });
    
    const avgTypeEffectiveness = userTypePreferences[remedy.type] || 0;
    if (avgTypeEffectiveness > 60) {
      score += 0.2;
      reasons.push(`You've had success with ${remedy.type} remedies`);
    }
    
    // Determine confidence
    let confidence: 'low' | 'medium' | 'high';
    if (similarUserCount > 2 && score > 0.5) confidence = 'high';
    else if (similarUserCount > 0 && score > 0.3) confidence = 'medium';
    else confidence = 'low';
    
    if (score > 0.1) { // Only recommend if there's some evidence
      recommendations.push({
        remedyId: remedy.id,
        remedyName: remedy.name,
        type: remedy.type,
        score,
        reasons,
        confidence,
        similarUsers: similarUserCount
      });
    }
  });
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10 recommendations
}

// Create user profile from existing data
export function createUserProfile(
  nutritionEntries: any[],
  exerciseEntries: any[],
  remedies: any[]
): UserProfile {
  const conditions = ['Acid Reflux', 'Migraine', 'IBS Symptoms', 'Skin Flare-ups'];
  
  // Calculate lifestyle factors
  const averageSleep = nutritionEntries.length > 0 
    ? nutritionEntries.reduce((sum, entry) => sum + entry.sleep, 0) / nutritionEntries.length 
    : 7;
  
  const averageStress = nutritionEntries.length > 0 
    ? nutritionEntries.reduce((sum, entry) => sum + entry.stress, 0) / nutritionEntries.length 
    : 5;
  
  const exerciseFrequency = exerciseEntries.length / Math.max(1, nutritionEntries.length);
  const caffeineConsumption = nutritionEntries.some(entry => entry.caffeine);
  
  // Build remedy preferences
  const remedyPreferences: { [remedyId: string]: any } = {};
  remedies.forEach(remedy => {
    remedyPreferences[remedy.id] = {
      effectiveness: remedy.effectiveness,
      usageCount: remedy.usageCount,
      lastUsed: remedy.lastUsed || 'Never',
      successRate: remedy.successRate || 50
    };
  });
  
  // Analyze symptom patterns
  const symptomPatterns: { [condition: string]: any } = {};
  conditions.forEach(condition => {
    const conditionEntries = nutritionEntries.filter(entry => 
      entry.symptoms.some((symptom: string) => 
        symptom.toLowerCase().includes(condition.toLowerCase().split(' ')[0])
      )
    );
    
    symptomPatterns[condition] = {
      frequency: conditionEntries.length / Math.max(1, nutritionEntries.length),
      severity: conditionEntries.length > 0 
        ? conditionEntries.reduce((sum, entry) => sum + entry.severity, 0) / conditionEntries.length 
        : 0,
      triggers: [] // Could be enhanced to identify specific triggers
    };
  });
  
  return {
    userId: 'current-user',
    conditions,
    lifestyleFactors: {
      averageSleep,
      averageStress,
      exerciseFrequency,
      caffeineConsumption
    },
    remedyPreferences,
    symptomPatterns
  };
}

// Generate sample users for demonstration (in real app, this would come from database)
export function generateSampleUsers(): UserProfile[] {
  return [
    {
      userId: 'user-1',
      conditions: ['Acid Reflux', 'IBS Symptoms'],
      lifestyleFactors: {
        averageSleep: 6.5,
        averageStress: 7.2,
        exerciseFrequency: 0.4,
        caffeineConsumption: true
      },
      remedyPreferences: {
        'remedy-1': { effectiveness: 85, usageCount: 15, lastUsed: '2024-01-15', successRate: 80 },
        'remedy-2': { effectiveness: 70, usageCount: 8, lastUsed: '2024-01-10', successRate: 75 }
      },
      symptomPatterns: {
        'Acid Reflux': { frequency: 0.3, severity: 6, triggers: ['caffeine', 'stress'] },
        'IBS Symptoms': { frequency: 0.4, severity: 5, triggers: ['stress', 'poor sleep'] }
      }
    },
    {
      userId: 'user-2',
      conditions: ['Migraine', 'Skin Flare-ups'],
      lifestyleFactors: {
        averageSleep: 7.8,
        averageStress: 5.5,
        exerciseFrequency: 0.6,
        caffeineConsumption: false
      },
      remedyPreferences: {
        'remedy-3': { effectiveness: 90, usageCount: 12, lastUsed: '2024-01-14', successRate: 85 },
        'remedy-4': { effectiveness: 75, usageCount: 6, lastUsed: '2024-01-12', successRate: 70 }
      },
      symptomPatterns: {
        'Migraine': { frequency: 0.2, severity: 7, triggers: ['poor sleep', 'stress'] },
        'Skin Flare-ups': { frequency: 0.25, severity: 4, triggers: ['stress'] }
      }
    }
  ];
}

// Main recommendation function
export function getPersonalizedRecommendations(
  nutritionEntries: any[],
  exerciseEntries: any[],
  remedies: any[]
): {
  recommendations: RemedyRecommendation[];
  similarUsers: SimilarUser[];
  userProfile: UserProfile;
} {
  const currentUser = createUserProfile(nutritionEntries, exerciseEntries, remedies);
  const sampleUsers = generateSampleUsers();
  const allUsers = [currentUser, ...sampleUsers];
  
  const similarUsers = findSimilarUsers(currentUser, allUsers);
  const recommendations = generateRecommendations(currentUser, similarUsers, remedies);
  
  return {
    recommendations,
    similarUsers,
    userProfile: currentUser
  };
}
