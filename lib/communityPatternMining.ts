// Community Pattern Mining with privacy-safe data analysis
export interface AnonymizedUserProfile {
  id: string; // Hashed/anonymized
  ageGroup: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  conditions: string[];
  lifestyleFactors: {
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
  symptomPatterns: {
    [symptom: string]: {
      frequency: number;
      averageSeverity: number;
      commonTriggers: string[];
    };
  };
}

export interface CommunityPattern {
  type: 'remedy_effectiveness' | 'lifestyle_correlation' | 'symptom_cluster' | 'demographic_trend';
  title: string;
  description: string;
  confidence: number;
  sampleSize: number;
  data: any;
  insights: string[];
  recommendations: string[];
}

export interface SimilarUserGroup {
  groupId: string;
  description: string;
  size: number;
  similarity: number;
  commonCharacteristics: string[];
  effectiveRemedies: Array<{
    remedyId: string;
    averageEffectiveness: number;
    usageCount: number;
  }>;
  lifestylePatterns: {
    averageSleep: number;
    averageStress: number;
    exerciseFrequency: number;
  };
}

export interface PrivacySafeInsight {
  type: 'demographic' | 'lifestyle' | 'remedy' | 'symptom';
  insight: string;
  confidence: 'low' | 'medium' | 'high';
  sampleSize: number;
  personalRelevance: number; // 0-1
  actionable: boolean;
}

// Privacy-Safe Data Anonymizer
export class DataAnonymizer {
  private static hashUserId(userId: string): string {
    // Simple hash function for demo - in production, use proper cryptographic hashing
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  static anonymizeUserProfile(
    userId: string,
    age: number,
    gender: string,
    conditions: string[],
    lifestyleFactors: any,
    effectiveRemedies: any[],
    symptomPatterns: any
  ): AnonymizedUserProfile {
    
    return {
      id: this.hashUserId(userId),
      ageGroup: this.categorizeAge(age),
      gender: this.categorizeGender(gender),
      conditions: conditions,
      lifestyleFactors: {
        averageSleep: Math.round(lifestyleFactors.averageSleep * 10) / 10, // Round to 1 decimal
        averageStress: Math.round(lifestyleFactors.averageStress * 10) / 10,
        exerciseFrequency: Math.round(lifestyleFactors.exerciseFrequency * 100) / 100, // Round to 2 decimals
        caffeineConsumption: lifestyleFactors.caffeineConsumption
      },
      effectiveRemedies: effectiveRemedies.map(remedy => ({
        remedyId: remedy.id,
        effectiveness: Math.round(remedy.effectiveness * 10) / 10,
        usageCount: remedy.usageCount
      })),
      symptomPatterns: Object.entries(symptomPatterns).reduce((acc, [symptom, pattern]: [string, any]) => {
        acc[symptom] = {
          frequency: Math.round(pattern.frequency * 100) / 100,
          averageSeverity: Math.round(pattern.averageSeverity * 10) / 10,
          commonTriggers: pattern.commonTriggers
        };
        return acc;
      }, {} as any)
    };
  }
  
  private static categorizeAge(age: number): AnonymizedUserProfile['ageGroup'] {
    if (age <= 25) return '18-25';
    if (age <= 35) return '26-35';
    if (age <= 45) return '36-45';
    if (age <= 55) return '46-55';
    if (age <= 65) return '56-65';
    return '65+';
  }
  
  private static categorizeGender(gender: string): AnonymizedUserProfile['gender'] {
    const lowerGender = gender.toLowerCase();
    if (['male', 'm', 'man'].includes(lowerGender)) return 'male';
    if (['female', 'f', 'woman'].includes(lowerGender)) return 'female';
    if (['other', 'non-binary', 'nonbinary'].includes(lowerGender)) return 'other';
    return 'prefer_not_to_say';
  }
}

// Community Pattern Miner
export class CommunityPatternMiner {
  private userProfiles: AnonymizedUserProfile[] = [];
  private minSampleSize = 10; // Minimum users for statistical significance
  
  addUserProfile(profile: AnonymizedUserProfile) {
    this.userProfiles.push(profile);
  }
  
  minePatterns(currentUserProfile: AnonymizedUserProfile): {
    patterns: CommunityPattern[];
    similarGroups: SimilarUserGroup[];
    insights: PrivacySafeInsight[];
  } {
    
    const patterns: CommunityPattern[] = [];
    const similarGroups: SimilarUserGroup[] = [];
    const insights: PrivacySafeInsight[] = [];
    
    // Mine remedy effectiveness patterns
    patterns.push(...this.mineRemedyEffectivenessPatterns(currentUserProfile));
    
    // Mine lifestyle correlation patterns
    patterns.push(...this.mineLifestyleCorrelationPatterns(currentUserProfile));
    
    // Mine symptom cluster patterns
    patterns.push(...this.mineSymptomClusterPatterns(currentUserProfile));
    
    // Mine demographic trends
    patterns.push(...this.mineDemographicTrends(currentUserProfile));
    
    // Find similar user groups
    similarGroups.push(...this.findSimilarUserGroups(currentUserProfile));
    
    // Generate privacy-safe insights
    insights.push(...this.generatePrivacySafeInsights(currentUserProfile, patterns, similarGroups));
    
    return {
      patterns: patterns.filter(p => p.sampleSize >= this.minSampleSize),
      similarGroups,
      insights
    };
  }
  
  private mineRemedyEffectivenessPatterns(currentUser: AnonymizedUserProfile): CommunityPattern[] {
    const patterns: CommunityPattern[] = [];
    
    // Group users by conditions
    const usersByCondition: { [condition: string]: AnonymizedUserProfile[] } = {};
    this.userProfiles.forEach(user => {
      user.conditions.forEach(condition => {
        if (!usersByCondition[condition]) {
          usersByCondition[condition] = [];
        }
        usersByCondition[condition].push(user);
      });
    });
    
    // Find remedies effective for each condition
    Object.entries(usersByCondition).forEach(([condition, users]) => {
      if (users.length >= this.minSampleSize) {
        const remedyStats: { [remedyId: string]: { total: number; effective: number; avgEffectiveness: number } } = {};
        
        users.forEach(user => {
          user.effectiveRemedies.forEach(remedy => {
            if (!remedyStats[remedy.remedyId]) {
              remedyStats[remedy.remedyId] = { total: 0, effective: 0, avgEffectiveness: 0 };
            }
            remedyStats[remedy.remedyId].total++;
            if (remedy.effectiveness > 3) {
              remedyStats[remedy.remedyId].effective++;
            }
            remedyStats[remedy.remedyId].avgEffectiveness += remedy.effectiveness;
          });
        });
        
        // Find highly effective remedies
        Object.entries(remedyStats).forEach(([remedyId, stats]) => {
          if (stats.total >= 5) { // At least 5 users tried this remedy
            const effectiveness = (stats.effective / stats.total) * 100;
            const avgEffectiveness = stats.avgEffectiveness / stats.total;
            
            if (effectiveness > 70) {
              patterns.push({
                type: 'remedy_effectiveness',
                title: `Highly Effective Remedy for ${condition}`,
                description: `${remedyId} is effective for ${effectiveness.toFixed(0)}% of users with ${condition}`,
                confidence: Math.min(0.9, effectiveness / 100),
                sampleSize: stats.total,
                data: { remedyId, condition, effectiveness, avgEffectiveness },
                insights: [
                  `Users with ${condition} found ${remedyId} effective ${effectiveness.toFixed(0)}% of the time`,
                  `Average effectiveness rating: ${avgEffectiveness.toFixed(1)}/5`
                ],
                recommendations: [
                  `Consider trying ${remedyId} for ${condition} management`,
                  `Users like you found this remedy highly effective`
                ]
              });
            }
          }
        });
      }
    });
    
    return patterns;
  }
  
  private mineLifestyleCorrelationPatterns(currentUser: AnonymizedUserProfile): CommunityPattern[] {
    const patterns: CommunityPattern[] = [];
    
    // Group users by similar lifestyle factors
    const lifestyleGroups = this.groupUsersByLifestyle();
    
    lifestyleGroups.forEach(group => {
      if (group.users.length >= this.minSampleSize) {
        // Analyze symptom patterns within lifestyle groups
        const symptomStats: { [symptom: string]: { frequency: number; severity: number } } = {};
        
        group.users.forEach(user => {
          Object.entries(user.symptomPatterns).forEach(([symptom, pattern]: [string, any]) => {
            if (!symptomStats[symptom]) {
              symptomStats[symptom] = { frequency: 0, severity: 0 };
            }
            symptomStats[symptom].frequency += pattern.frequency;
            symptomStats[symptom].severity += pattern.averageSeverity;
          });
        });
        
        // Find significant patterns
        Object.entries(symptomStats).forEach(([symptom, stats]) => {
          const avgFrequency = stats.frequency / group.users.length;
          const avgSeverity = stats.severity / group.users.length;
          
          if (avgFrequency > 0.3 || avgSeverity > 4) { // High frequency or severity
            patterns.push({
              type: 'lifestyle_correlation',
              title: `${group.description} and ${symptom}`,
              description: `Users with similar lifestyle patterns show ${(avgFrequency * 100).toFixed(0)}% frequency of ${symptom}`,
              confidence: Math.min(0.8, avgFrequency),
              sampleSize: group.users.length,
              data: { lifestyleGroup: group.description, symptom, avgFrequency, avgSeverity },
              insights: [
                `Users with ${group.description} experience ${symptom} frequently`,
                `Average severity: ${avgSeverity.toFixed(1)}/10`
              ],
              recommendations: [
                `Monitor ${symptom} if you have similar lifestyle patterns`,
                `Consider lifestyle modifications to reduce risk`
              ]
            });
          }
        });
      }
    });
    
    return patterns;
  }
  
  private mineSymptomClusterPatterns(currentUser: AnonymizedUserProfile): CommunityPattern[] {
    const patterns: CommunityPattern[] = [];
    
    // Find users with similar condition profiles
    const conditionGroups: { [key: string]: AnonymizedUserProfile[] } = {};
    
    this.userProfiles.forEach(user => {
      const conditionKey = user.conditions.sort().join(',');
      if (!conditionGroups[conditionKey]) {
        conditionGroups[conditionKey] = [];
      }
      conditionGroups[conditionKey].push(user);
    });
    
    Object.entries(conditionGroups).forEach(([conditionKey, users]) => {
      if (users.length >= this.minSampleSize) {
        // Find common remedies across users with same conditions
        const remedyCounts: { [remedyId: string]: number } = {};
        
        users.forEach(user => {
          user.effectiveRemedies.forEach(remedy => {
            if (remedy.effectiveness > 3) {
              remedyCounts[remedy.remedyId] = (remedyCounts[remedy.remedyId] || 0) + 1;
            }
          });
        });
        
        // Find remedies used by majority of users
        Object.entries(remedyCounts).forEach(([remedyId, count]) => {
          const usageRate = (count / users.length) * 100;
          
          if (usageRate > 60) { // Used by majority
            patterns.push({
              type: 'symptom_cluster',
              title: `Common Remedy for ${conditionKey}`,
              description: `${remedyId} is used by ${usageRate.toFixed(0)}% of users with similar conditions`,
              confidence: Math.min(0.9, usageRate / 100),
              sampleSize: users.length,
              data: { remedyId, conditions: conditionKey, usageRate },
              insights: [
                `Users with ${conditionKey} commonly use ${remedyId}`,
                `${usageRate.toFixed(0)}% of similar users found it effective`
              ],
              recommendations: [
                `Consider ${remedyId} as it's popular among users with similar conditions`,
                `Users like you found this remedy helpful`
              ]
            });
          }
        });
      }
    });
    
    return patterns;
  }
  
  private mineDemographicTrends(currentUser: AnonymizedUserProfile): CommunityPattern[] {
    const patterns: CommunityPattern[] = [];
    
    // Group by age and gender
    const demographicGroups: { [key: string]: AnonymizedUserProfile[] } = {};
    
    this.userProfiles.forEach(user => {
      const demoKey = `${user.ageGroup}-${user.gender}`;
      if (!demographicGroups[demoKey]) {
        demographicGroups[demoKey] = [];
      }
      demographicGroups[demoKey].push(user);
    });
    
    Object.entries(demographicGroups).forEach(([demoKey, users]) => {
      if (users.length >= this.minSampleSize) {
        // Find common conditions in demographic group
        const conditionCounts: { [condition: string]: number } = {};
        
        users.forEach(user => {
          user.conditions.forEach(condition => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
          });
        });
        
        // Find conditions common in this demographic
        Object.entries(conditionCounts).forEach(([condition, count]) => {
          const prevalence = (count / users.length) * 100;
          
          if (prevalence > 50) { // Common in this demographic
            patterns.push({
              type: 'demographic_trend',
              title: `${condition} in ${demoKey}`,
              description: `${condition} affects ${prevalence.toFixed(0)}% of users in your demographic group`,
              confidence: Math.min(0.8, prevalence / 100),
              sampleSize: users.length,
              data: { condition, demographic: demoKey, prevalence },
              insights: [
                `${condition} is common among ${demoKey} users`,
                `${prevalence.toFixed(0)}% of similar users experience this condition`
              ],
              recommendations: [
                `Be aware that ${condition} is common in your demographic`,
                `Consider preventive measures if you don't already have this condition`
              ]
            });
          }
        });
      }
    });
    
    return patterns;
  }
  
  private groupUsersByLifestyle(): Array<{ description: string; users: AnonymizedUserProfile[] }> {
    const groups: Array<{ description: string; users: AnonymizedUserProfile[] }> = [];
    
    // High stress, low sleep group
    const highStressLowSleep = this.userProfiles.filter(user => 
      user.lifestyleFactors.averageStress > 7 && user.lifestyleFactors.averageSleep < 6
    );
    if (highStressLowSleep.length > 0) {
      groups.push({
        description: 'high stress, low sleep',
        users: highStressLowSleep
      });
    }
    
    // Active lifestyle group
    const activeLifestyle = this.userProfiles.filter(user => 
      user.lifestyleFactors.exerciseFrequency > 0.5 && user.lifestyleFactors.averageStress < 5
    );
    if (activeLifestyle.length > 0) {
      groups.push({
        description: 'active lifestyle, low stress',
        users: activeLifestyle
      });
    }
    
    // High caffeine consumers
    const highCaffeine = this.userProfiles.filter(user => 
      user.lifestyleFactors.caffeineConsumption && user.lifestyleFactors.averageSleep < 7
    );
    if (highCaffeine.length > 0) {
      groups.push({
        description: 'high caffeine, poor sleep',
        users: highCaffeine
      });
    }
    
    return groups;
  }
  
  private findSimilarUserGroups(currentUser: AnonymizedUserProfile): SimilarUserGroup[] {
    const similarGroups: SimilarUserGroup[] = [];
    
    // Find users with similar conditions
    const usersWithSimilarConditions = this.userProfiles.filter(user => {
      const commonConditions = user.conditions.filter(condition => 
        currentUser.conditions.includes(condition)
      );
      return commonConditions.length >= 2; // At least 2 common conditions
    });
    
    if (usersWithSimilarConditions.length >= this.minSampleSize) {
      // Calculate average remedy effectiveness for this group
      const remedyStats: { [remedyId: string]: { total: number; effectiveness: number } } = {};
      
      usersWithSimilarConditions.forEach(user => {
        user.effectiveRemedies.forEach(remedy => {
          if (!remedyStats[remedy.remedyId]) {
            remedyStats[remedy.remedyId] = { total: 0, effectiveness: 0 };
          }
          remedyStats[remedy.remedyId].total++;
          remedyStats[remedy.remedyId].effectiveness += remedy.effectiveness;
        });
      });
      
      const effectiveRemedies = Object.entries(remedyStats)
        .filter(([_, stats]) => stats.total >= 3)
        .map(([remedyId, stats]) => ({
          remedyId,
          averageEffectiveness: stats.effectiveness / stats.total,
          usageCount: stats.total
        }))
        .sort((a, b) => b.averageEffectiveness - a.averageEffectiveness)
        .slice(0, 5);
      
      // Calculate average lifestyle factors
      const avgSleep = usersWithSimilarConditions.reduce((sum, user) => 
        sum + user.lifestyleFactors.averageSleep, 0) / usersWithSimilarConditions.length;
      const avgStress = usersWithSimilarConditions.reduce((sum, user) => 
        sum + user.lifestyleFactors.averageStress, 0) / usersWithSimilarConditions.length;
      const avgExercise = usersWithSimilarConditions.reduce((sum, user) => 
        sum + user.lifestyleFactors.exerciseFrequency, 0) / usersWithSimilarConditions.length;
      
      similarGroups.push({
        groupId: 'similar_conditions',
        description: 'Users with similar health conditions',
        size: usersWithSimilarConditions.length,
        similarity: 0.8,
        commonCharacteristics: currentUser.conditions,
        effectiveRemedies,
        lifestylePatterns: {
          averageSleep: avgSleep,
          averageStress: avgStress,
          exerciseFrequency: avgExercise
        }
      });
    }
    
    return similarGroups;
  }
  
  private generatePrivacySafeInsights(
    currentUser: AnonymizedUserProfile,
    patterns: CommunityPattern[],
    similarGroups: SimilarUserGroup[]
  ): PrivacySafeInsight[] {
    
    const insights: PrivacySafeInsight[] = [];
    
    // Generate insights from patterns
    patterns.forEach(pattern => {
      if (pattern.sampleSize >= this.minSampleSize) {
        let personalRelevance = 0.5;
        let actionable = false;
        
        // Calculate personal relevance
        if (pattern.type === 'remedy_effectiveness') {
          personalRelevance = currentUser.conditions.includes(pattern.data.condition) ? 0.9 : 0.3;
          actionable = true;
        } else if (pattern.type === 'lifestyle_correlation') {
          personalRelevance = this.calculateLifestyleRelevance(currentUser, pattern.data.lifestyleGroup);
          actionable = true;
        } else if (pattern.type === 'demographic_trend') {
          personalRelevance = currentUser.ageGroup === pattern.data.demographic.split('-')[0] + '-' + pattern.data.demographic.split('-')[1] ? 0.8 : 0.4;
          actionable = false;
        }
        
        insights.push({
          type: pattern.type.split('_')[0] as any,
          insight: pattern.description,
          confidence: pattern.confidence > 0.7 ? 'high' : pattern.confidence > 0.5 ? 'medium' : 'low',
          sampleSize: pattern.sampleSize,
          personalRelevance,
          actionable
        });
      }
    });
    
    // Generate insights from similar groups
    similarGroups.forEach(group => {
      if (group.effectiveRemedies.length > 0) {
        const topRemedy = group.effectiveRemedies[0];
        insights.push({
          type: 'remedy',
          insight: `Users like you found ${topRemedy.remedyId} effective (${topRemedy.averageEffectiveness.toFixed(1)}/5 average)`,
          confidence: 'high',
          sampleSize: group.size,
          personalRelevance: 0.9,
          actionable: true
        });
      }
    });
    
    return insights.sort((a, b) => b.personalRelevance - a.personalRelevance);
  }
  
  private calculateLifestyleRelevance(currentUser: AnonymizedUserProfile, lifestyleGroup: string): number {
    // Simple relevance calculation based on lifestyle factors
    let relevance = 0.5;
    
    if (lifestyleGroup.includes('high stress') && currentUser.lifestyleFactors.averageStress > 7) {
      relevance += 0.3;
    }
    if (lifestyleGroup.includes('low sleep') && currentUser.lifestyleFactors.averageSleep < 6) {
      relevance += 0.3;
    }
    if (lifestyleGroup.includes('active') && currentUser.lifestyleFactors.exerciseFrequency > 0.5) {
      relevance += 0.2;
    }
    if (lifestyleGroup.includes('caffeine') && currentUser.lifestyleFactors.caffeineConsumption) {
      relevance += 0.2;
    }
    
    return Math.min(1, relevance);
  }
}

// Main Community Pattern Mining System
export class CommunityPatternMiningSystem {
  private patternMiner: CommunityPatternMiner;
  
  constructor() {
    this.patternMiner = new CommunityPatternMiner();
  }
  
  // Add sample community data (in production, this would come from a database)
  initializeWithSampleData() {
    // Generate sample anonymized profiles
    const sampleProfiles = this.generateSampleProfiles();
    sampleProfiles.forEach(profile => {
      this.patternMiner.addUserProfile(profile);
    });
  }
  
  analyzeUserPatterns(
    userId: string,
    age: number,
    gender: string,
    conditions: string[],
    lifestyleFactors: any,
    effectiveRemedies: any[],
    symptomPatterns: any
  ): {
    patterns: CommunityPattern[];
    similarGroups: SimilarUserGroup[];
    insights: PrivacySafeInsight[];
  } {
    
    // Anonymize current user data
    const anonymizedProfile = DataAnonymizer.anonymizeUserProfile(
      userId,
      age,
      gender,
      conditions,
      lifestyleFactors,
      effectiveRemedies,
      symptomPatterns
    );
    
    // Mine patterns
    return this.patternMiner.minePatterns(anonymizedProfile);
  }
  
  private generateSampleProfiles(): AnonymizedUserProfile[] {
    // Generate diverse sample profiles for demonstration
    const profiles: AnonymizedUserProfile[] = [];
    
    const conditions = ['acid_reflux', 'migraine', 'ibs', 'skin_issues'];
    const remedies = ['peppermint_tea', 'ginger_tea', 'probiotics', 'meditation', 'exercise'];
    
    for (let i = 0; i < 50; i++) {
      const userConditions = conditions.filter(() => Math.random() > 0.5);
      const userRemedies = remedies.map(remedy => ({
        remedyId: remedy,
        effectiveness: Math.random() * 5,
        usageCount: Math.floor(Math.random() * 20)
      })).filter(remedy => remedy.effectiveness > 2);
      
      profiles.push({
        id: `user_${i}`,
        ageGroup: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'][Math.floor(Math.random() * 6)],
        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
        conditions: userConditions,
        lifestyleFactors: {
          averageSleep: 5 + Math.random() * 4,
          averageStress: 3 + Math.random() * 5,
          exerciseFrequency: Math.random(),
          caffeineConsumption: Math.random() > 0.5
        },
        effectiveRemedies: userRemedies,
        symptomPatterns: userConditions.reduce((acc, condition) => {
          acc[condition] = {
            frequency: Math.random(),
            averageSeverity: 3 + Math.random() * 4,
            commonTriggers: ['stress', 'poor_sleep', 'certain_foods']
          };
          return acc;
        }, {} as any)
      });
    }
    
    return profiles;
  }
}
