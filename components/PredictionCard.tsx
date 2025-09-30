'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Prediction {
  condition: string;
  probability: number;
  factors: string[];
  severity: 'low' | 'medium' | 'high';
}

export default function PredictionCard({ prediction }: { prediction: Prediction }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Info className="w-5 h-5" />;
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getSeverityColor(prediction.severity)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getSeverityIcon(prediction.severity)}
          <h3 className="font-semibold text-lg">{prediction.condition}</h3>
        </div>
        <span className="text-2xl font-bold">{prediction.probability}%</span>
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium mb-1">Contributing factors:</p>
        <ul className="text-sm space-y-1">
          {prediction.factors.map((factor, idx) => (
            <li key={idx}>• {factor}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
