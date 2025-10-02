"use client"

import { useState, useEffect } from "react"
import { Brain, TrendingUp, AlertCircle } from "lucide-react"
import PredictionCard from "@/components/PredictionCard"
import { calculatePredictions } from "@/lib/predictions"
import { getNutritionEntries } from "@/lib/storage"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [correlationData, setCorrelationData] = useState<any[]>([])

  useEffect(() => {
    const todayData = {
      sleep: Number.parseFloat(localStorage.getItem("todaySleep") || "7"),
      stress: Number.parseInt(localStorage.getItem("todayStress") || "5"),
      caffeine: localStorage.getItem("todayCaffeine") === "true",
      exercise: localStorage.getItem("todayExercise") === "true",
    }

    const preds = calculatePredictions(todayData)
    setPredictions(preds)

    const entries = getNutritionEntries()
    if (entries.length > 0) {
      const last7Days = entries.slice(-7)
      const trends = last7Days.map((entry, idx) => {
        const data = {
          sleep: entry.sleep,
          stress: entry.stress,
          caffeine: entry.caffeine,
          exercise: false,
        }
        const dayPreds = calculatePredictions(data)
        return {
          day: `Day ${idx + 1}`,
          reflux: dayPreds.find((p) => p.condition === "Acid Reflux")?.probability || 0,
          migraine: dayPreds.find((p) => p.condition === "Migraine")?.probability || 0,
          ibs: dayPreds.find((p) => p.condition === "IBS Symptoms")?.probability || 0,
        }
      })
      setTrendData(trends)

      const correlations = [
        {
          factor: "Low Sleep (<6h)",
          reflux: entries.filter((e) => e.sleep < 6 && e.symptoms.some((s) => s.toLowerCase().includes("reflux")))
            .length,
          migraine: entries.filter((e) => e.sleep < 6 && e.symptoms.some((s) => s.toLowerCase().includes("headache")))
            .length,
          ibs: entries.filter((e) => e.sleep < 6 && e.symptoms.some((s) => s.toLowerCase().includes("bloat"))).length,
        },
        {
          factor: "High Stress (>7)",
          reflux: entries.filter((e) => e.stress > 7 && e.symptoms.some((s) => s.toLowerCase().includes("reflux")))
            .length,
          migraine: entries.filter((e) => e.stress > 7 && e.symptoms.some((s) => s.toLowerCase().includes("headache")))
            .length,
          ibs: entries.filter((e) => e.stress > 7 && e.symptoms.some((s) => s.toLowerCase().includes("bloat"))).length,
        },
        {
          factor: "Caffeine",
          reflux: entries.filter((e) => e.caffeine && e.symptoms.some((s) => s.toLowerCase().includes("reflux")))
            .length,
          migraine: entries.filter((e) => e.caffeine && e.symptoms.some((s) => s.toLowerCase().includes("headache")))
            .length,
          ibs: entries.filter((e) => e.caffeine && e.symptoms.some((s) => s.toLowerCase().includes("bloat"))).length,
        },
      ]
      setCorrelationData(correlations)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              AI Predictions
            </h1>
          </div>
          <p className="text-gray-700">ML-based predictions to help you understand symptom patterns and triggers</p>
        </div>

        {/* Today's Predictions */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Risk Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((pred, idx) => (
              <PredictionCard key={idx} prediction={pred} />
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-card rounded-2xl p-8 mb-8 bg-gradient-to-r from-purple-100/60 via-pink-100/60 to-blue-100/60 backdrop-blur-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">How Predictions Work</h3>
              <p className="text-gray-700 mb-3">
                Our ML model analyzes patterns between your lifestyle factors and symptoms:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • <strong>Sleep patterns:</strong> Poor sleep (&lt;6 hrs) increases reflux & migraine risk by 25-30%
                </li>
                <li>
                  • <strong>Caffeine + Sleep:</strong> Coffee with insufficient sleep = 50%+ reflux probability
                </li>
                <li>
                  • <strong>Stress levels:</strong> High stress (7+) significantly impacts IBS symptoms
                </li>
                <li>
                  • <strong>Exercise:</strong> Regular activity provides 10-15% protective effect
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        {trendData.length > 0 && (
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">7-Day Trend Analysis</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: "Probability (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reflux" stroke="#ef4444" strokeWidth={2} name="Acid Reflux" />
                <Line type="monotone" dataKey="migraine" stroke="#a855f7" strokeWidth={2} name="Migraine" />
                <Line type="monotone" dataKey="ibs" stroke="#f59e0b" strokeWidth={2} name="IBS" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Correlation Analysis */}
        {correlationData.length > 0 && (
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Factor-Symptom Correlations</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" />
                <YAxis label={{ value: "Occurrences", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reflux" fill="#ef4444" name="Acid Reflux" />
                <Bar dataKey="migraine" fill="#a855f7" name="Migraine" />
                <Bar dataKey="ibs" fill="#f59e0b" name="IBS" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Showing how often each factor coincided with symptoms in your history
            </p>
          </div>
        )}

        {predictions.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Start tracking your nutrition and symptoms to see AI-powered predictions</p>
          </div>
        )}
      </div>
    </div>
  )
}
