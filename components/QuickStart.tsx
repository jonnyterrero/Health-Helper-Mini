"use client"

import { useState } from "react"
import { Rocket, X } from "lucide-react"
import { sampleNutritionEntries, sampleExerciseEntries, sampleRemedies } from "@/lib/sampleData"
import { saveNutritionEntry, saveExerciseEntry, saveRemedy } from "@/lib/storage"

export default function QuickStart() {
  const [showModal, setShowModal] = useState(false)

  const loadSampleData = () => {
    sampleNutritionEntries.forEach(saveNutritionEntry)
    sampleExerciseEntries.forEach(saveExerciseEntry)
    sampleRemedies.forEach(saveRemedy)

    localStorage.setItem("todaySleep", "7")
    localStorage.setItem("todayStress", "5")
    localStorage.setItem("todayCaffeine", "true")
    localStorage.setItem("todayExercise", "true")

    setShowModal(false)
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 z-50 hover:scale-105"
      >
        <Rocket className="w-5 h-5" />
        Quick Start with Sample Data
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Load Sample Data</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              Want to see the app in action? Load sample data to explore all features:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li>• 3 nutrition entries with symptoms</li>
              <li>• 2 exercise sessions</li>
              <li>• 3 remedies with effectiveness data</li>
              <li>• Today's health metrics for predictions</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={loadSampleData}
                className="flex-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Load Sample Data
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white/60 backdrop-blur-sm text-gray-700 py-3 rounded-xl hover:bg-white/80 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
