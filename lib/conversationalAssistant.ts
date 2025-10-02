// Conversational Assistant with LLM-powered health queries
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    userData?: any;
    recommendations?: any[];
    sources?: string[];
  };
}

export interface HealthQuery {
  type: 'nutrition' | 'symptom' | 'exercise' | 'remedy' | 'prediction' | 'general';
  intent: string;
  entities: {
    foods?: string[];
    symptoms?: string[];
    remedies?: string[];
    timeframes?: string[];
    conditions?: string[];
  };
  confidence: number;
}

export interface AssistantResponse {
  message: string;
  recommendations: string[];
  data?: any;
  followUpQuestions: string[];
  sources: string[];
  confidence: number;
}

// Natural Language Processing for Health Queries
export class HealthNLP {
  private foodKeywords = [
    'food', 'eat', 'meal', 'breakfast', 'lunch', 'dinner', 'snack',
    'coffee', 'caffeine', 'alcohol', 'spicy', 'acidic', 'dairy',
    'gluten', 'sugar', 'fat', 'protein', 'fiber', 'water'
  ];
  
  private symptomKeywords = [
    'symptom', 'pain', 'ache', 'discomfort', 'flare', 'attack',
    'reflux', 'heartburn', 'headache', 'migraine', 'bloat', 'cramp',
    'stomach', 'digestive', 'skin', 'rash', 'acne', 'fatigue', 'tired'
  ];
  
  private remedyKeywords = [
    'remedy', 'treatment', 'medicine', 'medication', 'supplement',
    'exercise', 'stretch', 'walk', 'yoga', 'meditation', 'breathing',
    'tea', 'herb', 'vitamin', 'probiotic', 'antacid'
  ];
  
  private timeKeywords = [
    'today', 'tomorrow', 'tonight', 'this week', 'next week',
    'morning', 'afternoon', 'evening', 'night', 'now', 'soon'
  ];
  
  parseQuery(query: string): HealthQuery {
    const lowerQuery = query.toLowerCase();
    
    // Determine query type
    let type: HealthQuery['type'] = 'general';
    let intent = '';
    let confidence = 0.5;
    
    // Check for nutrition queries
    if (this.foodKeywords.some(keyword => lowerQuery.includes(keyword))) {
      type = 'nutrition';
      intent = this.extractNutritionIntent(lowerQuery);
      confidence = 0.8;
    }
    
    // Check for symptom queries
    if (this.symptomKeywords.some(keyword => lowerQuery.includes(keyword))) {
      type = 'symptom';
      intent = this.extractSymptomIntent(lowerQuery);
      confidence = 0.8;
    }
    
    // Check for remedy queries
    if (this.remedyKeywords.some(keyword => lowerQuery.includes(keyword))) {
      type = 'remedy';
      intent = this.extractRemedyIntent(lowerQuery);
      confidence = 0.8;
    }
    
    // Check for prediction queries
    if (lowerQuery.includes('predict') || lowerQuery.includes('will i') || lowerQuery.includes('chance')) {
      type = 'prediction';
      intent = this.extractPredictionIntent(lowerQuery);
      confidence = 0.7;
    }
    
    // Extract entities
    const entities = this.extractEntities(lowerQuery);
    
    return {
      type,
      intent,
      entities,
      confidence
    };
  }
  
  private extractNutritionIntent(query: string): string {
    if (query.includes('what should i eat') || query.includes('recommend food')) {
      return 'food_recommendation';
    }
    if (query.includes('avoid') || query.includes('shouldn\'t eat')) {
      return 'food_avoidance';
    }
    if (query.includes('good for') || query.includes('help with')) {
      return 'food_benefits';
    }
    return 'nutrition_advice';
  }
  
  private extractSymptomIntent(query: string): string {
    if (query.includes('why') || query.includes('cause')) {
      return 'symptom_cause';
    }
    if (query.includes('prevent') || query.includes('avoid')) {
      return 'symptom_prevention';
    }
    if (query.includes('when') || query.includes('time')) {
      return 'symptom_timing';
    }
    return 'symptom_advice';
  }
  
  private extractRemedyIntent(query: string): string {
    if (query.includes('what should i do') || query.includes('how to treat')) {
      return 'remedy_recommendation';
    }
    if (query.includes('best') || query.includes('most effective')) {
      return 'remedy_comparison';
    }
    return 'remedy_advice';
  }
  
  private extractPredictionIntent(query: string): string {
    if (query.includes('will i get') || query.includes('chance of')) {
      return 'symptom_prediction';
    }
    if (query.includes('when will') || query.includes('how long')) {
      return 'timing_prediction';
    }
    return 'general_prediction';
  }
  
  private extractEntities(query: string): HealthQuery['entities'] {
    const entities: HealthQuery['entities'] = {};
    
    // Extract foods
    const foods = this.foodKeywords.filter(keyword => query.includes(keyword));
    if (foods.length > 0) entities.foods = foods;
    
    // Extract symptoms
    const symptoms = this.symptomKeywords.filter(keyword => query.includes(keyword));
    if (symptoms.length > 0) entities.symptoms = symptoms;
    
    // Extract remedies
    const remedies = this.remedyKeywords.filter(keyword => query.includes(keyword));
    if (remedies.length > 0) entities.remedies = remedies;
    
    // Extract timeframes
    const timeframes = this.timeKeywords.filter(keyword => query.includes(keyword));
    if (timeframes.length > 0) entities.timeframes = timeframes;
    
    return entities;
  }
}

// Knowledge Base for Health Information
export class HealthKnowledgeBase {
  private nutritionFacts: { [key: string]: any } = {
    'coffee': {
      effects: ['increases_acid_production', 'may_cause_reflux'],
      recommendations: ['avoid_after_2pm', 'limit_to_2_cups'],
      alternatives: ['herbal_tea', 'decaf_coffee']
    },
    'spicy_food': {
      effects: ['irritates_stomach', 'may_trigger_reflux'],
      recommendations: ['avoid_if_sensitive', 'eat_with_milk'],
      alternatives: ['mild_spices', 'herbs']
    },
    'dairy': {
      effects: ['may_cause_bloating', 'lactose_intolerance'],
      recommendations: ['try_lactose_free', 'fermented_dairy_better'],
      alternatives: ['almond_milk', 'coconut_milk']
    }
  };
  
  private symptomCauses: { [key: string]: any } = {
    'reflux': {
      triggers: ['coffee', 'spicy_food', 'large_meals', 'lying_down_after_eating'],
      prevention: ['small_meals', 'avoid_trigger_foods', 'elevate_head'],
      remedies: ['antacids', 'peppermint_tea', 'ginger']
    },
    'migraine': {
      triggers: ['stress', 'poor_sleep', 'caffeine_withdrawal', 'certain_foods'],
      prevention: ['regular_sleep', 'stress_management', 'consistent_caffeine'],
      remedies: ['dark_room', 'hydration', 'caffeine_moderation']
    },
    'ibs': {
      triggers: ['stress', 'certain_foods', 'irregular_meals'],
      prevention: ['fiber_regulation', 'stress_management', 'regular_meals'],
      remedies: ['peppermint_oil', 'probiotics', 'gentle_exercise']
    }
  };
  
  private remedyDatabase: { [key: string]: any } = {
    'peppermint_tea': {
      conditions: ['reflux', 'ibs', 'digestive_issues'],
      effectiveness: 4,
      time_to_relief: 30,
      instructions: 'Drink 1 cup after meals'
    },
    'ginger_tea': {
      conditions: ['nausea', 'digestive_issues'],
      effectiveness: 3,
      time_to_relief: 45,
      instructions: 'Steep fresh ginger for 10 minutes'
    },
    'probiotics': {
      conditions: ['ibs', 'digestive_health'],
      effectiveness: 4,
      time_to_relief: 1440, // 24 hours
      instructions: 'Take daily with food'
    }
  };
  
  getNutritionAdvice(food: string, condition?: string): any {
    return this.nutritionFacts[food] || null;
  }
  
  getSymptomInfo(symptom: string): any {
    return this.symptomCauses[symptom] || null;
  }
  
  getRemedyInfo(remedy: string): any {
    return this.remedyDatabase[remedy] || null;
  }
  
  searchKnowledge(query: string): any[] {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Search nutrition facts
    Object.entries(this.nutritionFacts).forEach(([food, info]) => {
      if (lowerQuery.includes(food)) {
        results.push({ type: 'nutrition', key: food, data: info });
      }
    });
    
    // Search symptom causes
    Object.entries(this.symptomCauses).forEach(([symptom, info]) => {
      if (lowerQuery.includes(symptom)) {
        results.push({ type: 'symptom', key: symptom, data: info });
      }
    });
    
    // Search remedies
    Object.entries(this.remedyDatabase).forEach(([remedy, info]) => {
      if (lowerQuery.includes(remedy)) {
        results.push({ type: 'remedy', key: remedy, data: info });
      }
    });
    
    return results;
  }
}

// Response Generator
export class ResponseGenerator {
  private knowledgeBase: HealthKnowledgeBase;
  
  constructor() {
    this.knowledgeBase = new HealthKnowledgeBase();
  }
  
  generateResponse(
    query: HealthQuery,
    userData: any,
    predictions: any[] = [],
    correlations: any[] = []
  ): AssistantResponse {
    
    let message = '';
    let recommendations: string[] = [];
    let data: any = null;
    let followUpQuestions: string[] = [];
    let sources: string[] = [];
    let confidence = query.confidence;
    
    switch (query.type) {
      case 'nutrition':
        const nutritionResponse = this.handleNutritionQuery(query, userData);
        message = nutritionResponse.message;
        recommendations = nutritionResponse.recommendations;
        data = nutritionResponse.data;
        followUpQuestions = nutritionResponse.followUpQuestions;
        sources = nutritionResponse.sources;
        break;
        
      case 'symptom':
        const symptomResponse = this.handleSymptomQuery(query, userData, correlations);
        message = symptomResponse.message;
        recommendations = symptomResponse.recommendations;
        data = symptomResponse.data;
        followUpQuestions = symptomResponse.followUpQuestions;
        sources = symptomResponse.sources;
        break;
        
      case 'remedy':
        const remedyResponse = this.handleRemedyQuery(query, userData);
        message = remedyResponse.message;
        recommendations = remedyResponse.recommendations;
        data = remedyResponse.data;
        followUpQuestions = remedyResponse.followUpQuestions;
        sources = remedyResponse.sources;
        break;
        
      case 'prediction':
        const predictionResponse = this.handlePredictionQuery(query, userData, predictions);
        message = predictionResponse.message;
        recommendations = predictionResponse.recommendations;
        data = predictionResponse.data;
        followUpQuestions = predictionResponse.followUpQuestions;
        sources = predictionResponse.sources;
        break;
        
      default:
        message = "I'd be happy to help with your health questions! Could you be more specific about what you'd like to know?";
        followUpQuestions = [
          "What should I eat to avoid reflux?",
          "How can I prevent migraines?",
          "What remedies work best for IBS?"
        ];
    }
    
    return {
      message,
      recommendations,
      data,
      followUpQuestions,
      sources,
      confidence
    };
  }
  
  private handleNutritionQuery(query: HealthQuery, userData: any): any {
    const { intent, entities } = query;
    
    if (intent === 'food_recommendation') {
      const condition = entities.conditions?.[0] || 'general';
      const recommendations = this.getFoodRecommendations(condition, userData);
      
      return {
        message: `Based on your health profile, here are some food recommendations for ${condition}:`,
        recommendations: recommendations.foods,
        data: recommendations,
        followUpQuestions: [
          "What foods should I avoid?",
          "When is the best time to eat these foods?",
          "How much should I eat?"
        ],
        sources: ['Medical guidelines', 'Your health data']
      };
    }
    
    if (intent === 'food_avoidance') {
      const foods = entities.foods || [];
      const avoidanceAdvice = foods.map(food => this.knowledgeBase.getNutritionAdvice(food));
      
      return {
        message: `Here's what you should know about avoiding ${foods.join(', ')}:`,
        recommendations: avoidanceAdvice.flatMap(advice => advice?.recommendations || []),
        data: avoidanceAdvice,
        followUpQuestions: [
          "What are good alternatives?",
          "How long should I avoid these foods?",
          "Can I have them in small amounts?"
        ],
        sources: ['Nutrition research', 'Your symptom patterns']
      };
    }
    
    return {
      message: "I can help with nutrition advice. What specific foods or conditions are you asking about?",
      recommendations: [],
      data: null,
      followUpQuestions: [
        "What should I eat for dinner to avoid reflux tonight?",
        "Are there foods that help with migraines?",
        "What's the best diet for IBS?"
      ],
      sources: []
    };
  }
  
  private handleSymptomQuery(query: HealthQuery, userData: any, correlations: any[]): any {
    const { intent, entities } = query;
    const symptoms = entities.symptoms || [];
    
    if (intent === 'symptom_cause') {
      const symptomInfo = symptoms.map(symptom => this.knowledgeBase.getSymptomInfo(symptom));
      const userCorrelations = correlations.filter(c => 
        symptoms.some(s => c.symptom.includes(s))
      );
      
      return {
        message: `Here's what might be causing your ${symptoms.join(', ')}:`,
        recommendations: [
          ...symptomInfo.flatMap(info => info?.prevention || []),
          ...userCorrelations.map(c => c.description)
        ],
        data: { symptomInfo, correlations: userCorrelations },
        followUpQuestions: [
          "How can I prevent these symptoms?",
          "What remedies work best?",
          "When should I see a doctor?"
        ],
        sources: ['Medical research', 'Your personal patterns']
      };
    }
    
    return {
      message: "I can help explain your symptoms and their causes. What specific symptoms are you experiencing?",
      recommendations: [],
      data: null,
      followUpQuestions: [
        "Why do I get reflux after eating?",
        "What causes my migraines?",
        "Why do I feel bloated?"
      ],
      sources: []
    };
  }
  
  private handleRemedyQuery(query: HealthQuery, userData: any): any {
    const { intent, entities } = query;
    const remedies = entities.remedies || [];
    
    if (intent === 'remedy_recommendation') {
      const remedyInfo = remedies.map(remedy => this.knowledgeBase.getRemedyInfo(remedy));
      
      return {
        message: `Here are some effective remedies for your condition:`,
        recommendations: remedyInfo.flatMap(info => info ? [info.instructions] : []),
        data: remedyInfo,
        followUpQuestions: [
          "How long does it take to work?",
          "Are there any side effects?",
          "Can I combine these remedies?"
        ],
        sources: ['Clinical studies', 'User effectiveness data']
      };
    }
    
    return {
      message: "I can recommend remedies based on your symptoms and health data. What are you looking to treat?",
      recommendations: [],
      data: null,
      followUpQuestions: [
        "What's the best remedy for reflux?",
        "How can I treat a migraine?",
        "What helps with IBS symptoms?"
      ],
      sources: []
    };
  }
  
  private handlePredictionQuery(query: HealthQuery, userData: any, predictions: any[]): any {
    const { intent, entities } = query;
    
    if (intent === 'symptom_prediction') {
      const relevantPredictions = predictions.filter(p => 
        entities.symptoms?.some(s => p.symptom.toLowerCase().includes(s))
      );
      
      if (relevantPredictions.length > 0) {
        const prediction = relevantPredictions[0];
        return {
          message: `Based on your current patterns, there's a ${prediction.probability.toFixed(0)}% chance of ${prediction.symptom} in the next 24 hours.`,
          recommendations: [prediction.recommendation],
          data: prediction,
          followUpQuestions: [
            "How can I reduce this risk?",
            "What should I do if symptoms occur?",
            "How accurate are these predictions?"
          ],
          sources: ['Your health data', 'ML prediction models']
        };
      }
    }
    
    return {
      message: "I can help predict your health patterns based on your data. What would you like to know about?",
      recommendations: [],
      data: null,
      followUpQuestions: [
        "Will I get reflux tomorrow?",
        "What's my migraine risk this week?",
        "How likely am I to have IBS symptoms?"
      ],
      sources: []
    };
  }
  
  private getFoodRecommendations(condition: string, userData: any): any {
    const recommendations: { [key: string]: string[] } = {
      'reflux': [
        'Oatmeal with banana',
        'Ginger tea',
        'Non-citrus fruits',
        'Lean proteins',
        'Vegetables (non-spicy)'
      ],
      'migraine': [
        'Magnesium-rich foods',
        'Adequate hydration',
        'Regular meals',
        'Avoid processed foods',
        'Dark leafy greens'
      ],
      'ibs': [
        'Low-FODMAP foods',
        'Probiotic-rich foods',
        'Soluble fiber',
        'Peppermint tea',
        'Small, frequent meals'
      ]
    };
    
    return {
      foods: recommendations[condition] || recommendations['general'] || [],
      condition,
      reasoning: `Based on your ${condition} patterns and medical guidelines`
    };
  }
}

// Main Conversational Assistant
export class ConversationalAssistant {
  private nlp: HealthNLP;
  private responseGenerator: ResponseGenerator;
  private chatHistory: ChatMessage[] = [];
  
  constructor() {
    this.nlp = new HealthNLP();
    this.responseGenerator = new ResponseGenerator();
  }
  
  processMessage(
    userMessage: string,
    userData: any,
    predictions: any[] = [],
    correlations: any[] = []
  ): AssistantResponse {
    
    // Parse the user's query
    const query = this.nlp.parseQuery(userMessage);
    
    // Generate response
    const response = this.responseGenerator.generateResponse(
      query,
      userData,
      predictions,
      correlations
    );
    
    // Add to chat history
    this.chatHistory.push({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    this.chatHistory.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
      context: {
        userData,
        recommendations: response.recommendations,
        sources: response.sources
      }
    });
    
    return response;
  }
  
  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }
  
  clearHistory() {
    this.chatHistory = [];
  }
  
  // Quick response for common queries
  getQuickResponse(query: string, userData: any): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('what should i eat for dinner to avoid reflux tonight')) {
      return "For dinner tonight to avoid reflux, I recommend: oatmeal with banana, grilled chicken with steamed vegetables, or ginger tea. Avoid spicy foods, caffeine, and large portions. Eat at least 3 hours before bedtime.";
    }
    
    if (lowerQuery.includes('will i get reflux tomorrow')) {
      const risk = userData?.recentStress > 7 ? 'high' : 'moderate';
      return `Based on your recent patterns, you have a ${risk} risk of reflux tomorrow. Consider avoiding caffeine after 2pm and ensuring 7+ hours of sleep tonight.`;
    }
    
    if (lowerQuery.includes('best remedy for migraine')) {
      return "The most effective migraine remedies based on your data are: dark room rest (4/5 effectiveness), hydration (3/5), and stress management (4/5). Try these in combination for best results.";
    }
    
    return "I'd be happy to help! Could you be more specific about your health question?";
  }
}
