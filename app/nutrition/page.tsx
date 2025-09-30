'use client';

import { useState, useEffect } from 'react';
import { Coffee, Plus, Calendar } from 'lucide-react';
import { saveNutritionEntry, getNutritionEntries, type NutritionEntry } from '@/lib/storage';
import { format } from 'date-fns';

export default function NutritionPage() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    meal: '',
    foods: '',
    symptoms: '',
    severity: 5,
    sleep: 7,
    stress: 5,
    caffeine: false,
  });

  useEffect(() => {
    setEntries(getNutritionEntries());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: NutritionEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      meal: formData.meal,
      foods: formData.foods.split(',').map(f => f.trim()),
      symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
      severity: formData.severity,
      sleep: formData.sleep,
      stress: formData.stress,
      caffeine: formData.caffeine,
    };

    saveNutritionEntry(entry);
    
    // Update today's data for predictions
    localStorage.setItem('todaySleep', formData.sleep.toString());
    localStorage.setItem('todayStress', formData.stress.toString());
    localStorage.setItem('todayCaffeine', formData.caffeine.toString());
    
    setEntries([...entries, entry]);
    setShowForm(false);
    setFormData({
      meal: '',
      foods: '',
      symptoms: '',
      severity: 5,
      sleep: 7,
      stress: 5,
      caffeine: false,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Nutrition Tracker</h1>
            <p className="text-gray-600 mt-2">Track your meals and identify symptom triggers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Nutrition Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={formData.meal}
                    onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select meal type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foods (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.foods}
                    onChange={(e) => setFormData({ ...formData, foods: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., coffee, toast, eggs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={formData.sleep}
                    onChange={(e) => setFormData({ ...formData, sleep: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stress Level (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.stress}
                    onChange={(e) => setFormData({ ...formData, stress: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="caffeine"
                    checked={formData.caffeine}
                    onChange={(e) => setFormData({ ...formData, caffeine: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="caffeine" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                    <Coffee className="w-4 h-4 mr-1" />
                    Contains Caffeine
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., bloating, reflux, headache"
                />
              </div>

              {formData.symptoms && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptom Severity (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">{formData.severity}/10</div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Entries</h2>
          {entries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No nutrition entries yet. Add your first entry to get started!</p>
            </div>
          ) : (
            entries.slice().reverse().map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">{entry.meal}</h3>
                    <p className="text-sm text-gray-500">{format(new Date(entry.date), 'PPP p')}</p>
                  </div>
                  {entry.caffeine && <Coffee className="w-6 h-6 text-amber-600" />}
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Foods: </span>
                    <span className="text-sm text-gray-600">{entry.foods.join(', ')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Sleep: </span>
                      <span className="text-gray-600">{entry.sleep} hrs</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Stress: </span>
                      <span className="text-gray-600">{entry.stress}/10</span>
                    </div>
                  </div>
                  {entry.symptoms.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-700">Symptoms: </span>
                      <span className="text-sm text-red-600">{entry.symptoms.join(', ')}</span>
                      <span className="text-sm text-red-600 ml-2">(Severity: {entry.severity}/10)</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
