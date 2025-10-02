"use client"

import { Activity, Brain, Heart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import PredictionCard from "@/components/PredictionCard"
import QuickStart from "@/components/QuickStart"
import { calculatePredictions } from "@/lib/predictions"

export default function Home() {
  const [predictions, setPredictions] = useState<any[]>([])

  useEffect(() => {
    // Get today's data from localStorage
    const todayData = {
      sleep: Number.parseFloat(localStorage.getItem("todaySleep") || "7"),
      stress: Number.parseInt(localStorage.getItem("todayStress") || "5"),
      caffeine: localStorage.getItem("todayCaffeine") === "true",
      exercise: localStorage.getItem("todayExercise") === "true",
    }

    const preds = calculatePredictions(todayData)
    setPredictions(preds)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
            miniHealthHelper
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Track nutrition, predict symptoms, and discover personalized remedies based on your unique patterns
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link href="/nutrition" className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nutrition</h3>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-700">Track meals & symptoms</p>
          </Link>

          <Link href="/exercise" className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Exercise</h3>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-sm text-gray-700">Log workouts & recovery</p>
          </Link>

          <Link
            href="/predictions"
            className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Predictions</h3>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-700">AI-powered insights</p>
          </Link>

          <Link href="/remedies" className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Remedies</h3>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-700">Personalized solutions</p>
          </Link>
        </div>

        {/* Today's Predictions */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((pred, idx) => (
              <PredictionCard key={idx} prediction={pred} />
            ))}
          </div>
          {predictions.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              Start tracking your nutrition and habits to see personalized predictions
            </p>
          )}
        </div>
      </div>
      <QuickStart />
    </div>
  )
}
