"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, ThumbsUp, ThumbsDown, Pill, Leaf, Heart, Apple } from "lucide-react"
import { saveRemedy, getRemedies, updateRemedyEffectiveness, type Remedy } from "@/lib/storage"

export default function RemediesPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "medication" as "medication" | "supplement" | "lifestyle" | "food",
    conditions: [] as string[],
    notes: "",
  })
  const [sortBy, setSortBy] = useState<"effectiveness" | "usage">("effectiveness")

  useEffect(() => {
    setRemedies(getRemedies())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const remedy: Remedy = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      effectiveness: 50,
      usageCount: 0,
      conditions: formData.conditions,
      notes: formData.notes,
    }

    saveRemedy(remedy)
    setRemedies([...remedies, remedy])
    setShowForm(false)
    setFormData({
      name: "",
      type: "medication",
      conditions: [],
      notes: "",
    })
  }

  const handleEffectivenessFeedback = (id: string, effective: boolean) => {
    updateRemedyEffectiveness(id, effective)
    setRemedies(getRemedies())
  }

  const toggleCondition = (condition: string) => {
    if (formData.conditions.includes(condition)) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter((c) => c !== condition),
      })
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, condition],
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="w-5 h-5" />
      case "supplement":
        return <Leaf className="w-5 h-5" />
      case "lifestyle":
        return <Heart className="w-5 h-5" />
      case "food":
        return <Apple className="w-5 h-5" />
      default:
        return <Pill className="w-5 h-5" />
    }
  }

  const sortedRemedies = [...remedies].sort((a, b) => {
    if (sortBy === "effectiveness") {
      return b.effectiveness - a.effectiveness
    } else {
      return b.usageCount - a.usageCount
    }
  })

  const conditionOptions = ["Acid Reflux", "Migraine", "IBS", "Skin Issues"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Remedy Tracker
            </h1>
            <p className="text-gray-700 mt-2">Track what works best for your symptoms</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Remedy
          </button>
        </div>

        {showForm && (
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Remedy</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remedy Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    placeholder="e.g., Ginger Tea, Omeprazole"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    required
                  >
                    <option value="medication">Medication</option>
                    <option value="supplement">Supplement</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="food">Food/Drink</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Conditions Treated</label>
                <div className="flex flex-wrap gap-3">
                  {conditionOptions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        formData.conditions.includes(condition)
                          ? "bg-gradient-to-r from-purple-200/60 to-pink-200/60 border-purple-400 text-purple-700 backdrop-blur-sm"
                          : "bg-white/50 border-gray-300 text-gray-700 hover:border-purple-300 backdrop-blur-sm"
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  rows={3}
                  placeholder="Dosage, timing, observations..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-400 text-white py-3 rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Save Remedy
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/60 backdrop-blur-sm text-gray-700 py-3 rounded-xl hover:bg-white/80 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <button
            onClick={() => setSortBy("effectiveness")}
            className={`px-4 py-2 rounded-xl transition-all ${
              sortBy === "effectiveness"
                ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white"
                : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
            }`}
          >
            Effectiveness
          </button>
          <button
            onClick={() => setSortBy("usage")}
            className={`px-4 py-2 rounded-xl transition-all ${
              sortBy === "usage"
                ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white"
                : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
            }`}
          >
            Most Used
          </button>
        </div>

        {/* Remedies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRemedies.length === 0 ? (
            <div className="col-span-2 glass-card rounded-2xl p-12 text-center">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No remedies tracked yet. Add your first remedy to get started!</p>
            </div>
          ) : (
            sortedRemedies.map((remedy) => (
              <div key={remedy.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl backdrop-blur-sm ${
                        remedy.type === "medication"
                          ? "bg-blue-100/70 text-blue-600"
                          : remedy.type === "supplement"
                            ? "bg-green-100/70 text-green-600"
                            : remedy.type === "lifestyle"
                              ? "bg-purple-100/70 text-purple-600"
                              : "bg-orange-100/70 text-orange-600"
                      }`}
                    >
                      {getTypeIcon(remedy.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{remedy.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{remedy.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {remedy.effectiveness}%
                    </div>
                    <div className="text-xs text-gray-600">effectiveness</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {remedy.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="px-2 py-1 bg-gray-100/70 backdrop-blur-sm text-gray-700 text-xs rounded-full"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Used {remedy.usageCount} time{remedy.usageCount !== 1 ? "s" : ""}
                  </div>
                </div>

                {remedy.notes && <p className="text-sm text-gray-600 mb-4 italic">{remedy.notes}</p>}

                <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                  <button
                    onClick={() => handleEffectivenessFeedback(remedy.id, true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50/70 text-green-700 rounded-xl hover:bg-green-100/70 transition-all backdrop-blur-sm"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helped
                  </button>
                  <button
                    onClick={() => handleEffectivenessFeedback(remedy.id, false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50/70 text-red-700 rounded-xl hover:bg-red-100/70 transition-all backdrop-blur-sm"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Didn't Help
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Insights */}
        {sortedRemedies.length > 0 && (
          <div className="mt-8 glass-card rounded-2xl p-8 bg-gradient-to-r from-green-100/60 via-blue-100/60 to-purple-100/60 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedRemedies.slice(0, 3).map((remedy, idx) => (
                <div key={remedy.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    #{idx + 1}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{remedy.name}</div>
                  <div className="text-sm text-gray-600">{remedy.effectiveness}% effective</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
