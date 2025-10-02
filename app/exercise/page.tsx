'use client';

import { useState, useEffect } from 'react';
import { Plus, Activity, Upload } from 'lucide-react';
import { saveExerciseEntry, getExerciseEntries, type ExerciseEntry } from '@/lib/storage';
import { format } from 'date-fns';

export default function ExercisePage() {
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    duration: 30,
    intensity: 'medium' as 'low' | 'medium' | 'high',
    recovery: 5,
    notes: '',
  });

  useEffect(() => {
    setEntries(getExerciseEntries());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: ExerciseEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...formData,
    };

    saveExerciseEntry(entry);
    localStorage.setItem('todayExercise', 'true');
    localStorage.setItem('todayExerciseIntensity', formData.intensity);
    localStorage.setItem('todayExerciseDuration', formData.duration.toString());
    localStorage.setItem('todayRecovery', formData.recovery.toString());
    
    setEntries([...entries, entry]);
    setShowForm(false);
    setFormData({
      type: '',
      duration: 30,
      intensity: 'medium',
      recovery: 5,
      notes: '',
    });
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parsing - in production, use a proper CSV library
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Expecting format: date, type, duration, intensity
      const newEntries: ExerciseEntry[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 4) {
          newEntries.push({
            id: `import-${Date.now()}-${i}`,
            date: values[0].trim(),
            type: values[1].trim(),
            duration: parseInt(values[2].trim()) || 30,
            intensity: (values[3].trim() as 'low' | 'medium' | 'high') || 'medium',
            recovery: 5,
            notes: 'Imported from CSV',
          });
        }
      }

      newEntries.forEach(saveExerciseEntry);
      setEntries([...entries, ...newEntries]);
      alert(`Successfully imported ${newEntries.length} exercise entries!`);
    };

    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Exercise & Recovery</h1>
            <p className="text-gray-600 mt-2">Track workouts and monitor recovery patterns</p>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Workout
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Exercise Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Running, Yoga, Weights"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity
                  </label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recovery Feeling (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.recovery}
                    onChange={(e) => setFormData({ ...formData, recovery: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="How did you feel? Any observations?"
                />
              </div>

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

        {/* CSV Import Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Import Format</h3>
          <p className="text-sm text-blue-700 mb-2">
            Your CSV should have the following columns: date, type, duration, intensity
          </p>
          <code className="text-xs bg-white px-2 py-1 rounded text-blue-800">
            2024-01-01,Running,30,medium
          </code>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Workouts</h2>
          {entries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No exercise entries yet. Add your first workout!</p>
            </div>
          ) : (
            entries.slice().reverse().map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{entry.type}</h3>
                    <p className="text-sm text-gray-500">{format(new Date(entry.date), 'PPP')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    entry.intensity === 'high' ? 'bg-red-100 text-red-700' :
                    entry.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {entry.intensity.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Duration: </span>
                    <span className="text-gray-600">{entry.duration} min</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Recovery: </span>
                    <span className="text-gray-600">{entry.recovery}/10</span>
                  </div>
                </div>
                {entry.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic">{entry.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
