'use client';

import { Activity, Brain, Heart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PredictionCard from '@/components/PredictionCard';
import QuickStart from '@/components/QuickStart';
import { calculatePredictions } from '@/lib/predictions';

export default function Home() {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    // Get today's data from localStorage
    const todayData = {
      sleep: parseFloat(localStorage.getItem('todaySleep') || '7'),
      stress: parseInt(localStorage.getItem('todayStress') || '5'),
      caffeine: localStorage.getItem('todayCaffeine') === 'true',
      exercise: localStorage.getItem('todayExercise') === 'true',
    };

    const preds = calculatePredictions(todayData);
    setPredictions(preds);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Health Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track nutrition, predict symptoms, and discover personalized remedies 
            based on your unique patterns
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link href="/nutrition" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nutrition</h3>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Track meals & symptoms</p>
          </Link>

          <Link href="/exercise" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Exercise</h3>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600">Log workouts & recovery</p>
          </Link>

          <Link href="/predictions" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Predictions</h3>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600">AI-powered insights</p>
          </Link>

          <Link href="/remedies" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Remedies</h3>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600">Personalized solutions</p>
          </Link>
        </div>

        {/* Today's Predictions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((pred, idx) => (
              <PredictionCard key={idx} prediction={pred} />
            ))}
          </div>
          {predictions.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Start tracking your nutrition and habits to see personalized predictions
            </p>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">ML-Based Predictions</h3>
              <p className="text-gray-600">
                Discover patterns like "coffee + &lt;6 hrs sleep = 50% chance of reflux"
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-Condition Tracking</h3>
              <p className="text-gray-600">
                Monitor IBS, migraines, skin issues, and acid reflux all in one place
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Wearable Integration</h3>
              <p className="text-gray-600">
                Import data from Fitbit, Apple Watch, and other devices via CSV
              </p>
            </div>
          </div>
        </div>
      </div>
      <QuickStart />
    </div>
  );
}
