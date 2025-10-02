'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Brain, Heart, TrendingUp, BarChart3, LineChart, Zap, Sparkles, Plug } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/nutrition', label: 'Nutrition', icon: Activity },
    { href: '/exercise', label: 'Exercise', icon: Heart },
    { href: '/predictions', label: 'Predictions', icon: Brain },
    { href: '/remedies', label: 'Remedies', icon: TrendingUp },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/ai-ml', label: 'AI/ML', icon: Zap },
    { href: '/advanced-features', label: 'Advanced', icon: Sparkles },
    { href: '/integration', label: 'Integration', icon: Plug },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            HealthTracker
          </Link>
          <div className="flex space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
