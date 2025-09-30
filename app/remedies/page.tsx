'use client';

import { useState, useEffect } from 'react';
import { Plus, ThumbsUp, ThumbsDown, Pill, Leaf, Heart, Apple } from 'lucide-react';
import { saveRemedy, getRemedies, updateRemedyEffectiveness, type Remedy } from '@/lib/storage';

export default function RemediesPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'medication' as 'medication' | 'supplement' | 'lifestyle' | 'food',
    conditions: [] as string[],
    notes: '',
  });
  const [sortBy, setSortBy] = useState<'effectiveness' | 'usage'>('effectiveness');

  useEffect(() => {
    setRemedies(getRemedies());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const remedy: Remedy = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      effectiveness: 50,
      usageCount: 0,
      conditions: formData.conditions,
      notes: formData.notes,
    };

    saveRemedy(remedy);
    setRemedies([...remedies, remedy]);
    setShowForm(false);
    setFormData({
      name: '',
      type: 'medication',
      conditions: [],
      notes: '',
    });
  };

  const handleEffectivenessFeedback = (id: string, effective: boolean) => {
    updateRemedyEffectiveness(id, effective);
    setRemedies(getRemedies());
  };

  const toggleCondition = (condition: string) => {
    if (formData.conditions.includes(condition)) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter(c => c !== condition),
      });
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, condition],
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-5 h-5" />;
      case 'supplement':
        return <Leaf className="w-5 h-5" />;
      case 'lifestyle':
        return <Heart className="w-5 h-5" />;
      case 'food':
        return <Apple className="w-5 h-5" />;
      default:
        return <Pill className="w-5 h-5" />;
    }
  };

  const sortedRemedies = [...remedies].sort((a, b) => {
    if (sortBy === 'effectiveness') {
      return b.effectiveness - a.effectiveness;
    } else {
      return b.usageCount - a.usageCount;
    }
  });

  const conditionOptions = ['Acid Reflux', 'Migraine', 'IBS', 'Skin Issues'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Remedy Tracker</h1>
            <p className="text-gray-600 mt-2">Track what works best for your symptoms</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Remedy
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Remedy</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remedy Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Ginger Tea, Omeprazole"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Conditions Treated
                </label>
                <div className="flex flex-wrap gap-3">
                  {conditionOptions.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.conditions.includes(condition)
                          ? 'bg-primary-100 border-primary-500 text-primary-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
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
                  placeholder="Dosage, timing, observations..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Save Remedy
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

        {/* Sort Controls */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <button
            onClick={() => setSortBy('effectiveness')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'effectiveness'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Effectiveness
          </button>
          <button
            onClick={() => setSortBy('usage')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === 'usage'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Most Used
          </button>
        </div>

        {/* Remedies List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRemedies.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl shadow-lg p-12 text-center">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No remedies tracked yet. Add your first remedy to get started!</p>
            </div>
          ) : (
            sortedRemedies.map((remedy) => (
              <div key={remedy.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      remedy.type === 'medication' ? 'bg-blue-100 text-blue-600' :
                      remedy.type === 'supplement' ? 'bg-green-100 text-green-600' :
                      remedy.type === 'lifestyle' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {getTypeIcon(remedy.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{remedy.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{remedy.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{remedy.effectiveness}%</div>
                    <div className="text-xs text-gray-500">effectiveness</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {remedy.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Used {remedy.usageCount} time{remedy.usageCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {remedy.notes && (
                  <p className="text-sm text-gray-600 mb-4 italic">{remedy.notes}</p>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEffectivenessFeedback(remedy.id, true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helped
                  </button>
                  <button
                    onClick={() => handleEffectivenessFeedback(remedy.id, false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
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
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sortedRemedies.slice(0, 3).map((remedy, idx) => (
                <div key={remedy.id} className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary-600 mb-1">#{idx + 1}</div>
                  <div className="font-semibold text-gray-900 mb-1">{remedy.name}</div>
                  <div className="text-sm text-gray-600">{remedy.effectiveness}% effective</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
