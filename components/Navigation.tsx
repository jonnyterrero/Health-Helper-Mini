"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Brain, Heart, TrendingUp, BarChart3 } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/nutrition", label: "Nutrition", icon: Activity },
    { href: "/exercise", label: "Exercise", icon: Heart },
    { href: "/predictions", label: "Predictions", icon: Brain },
    { href: "/remedies", label: "Remedies", icon: TrendingUp },
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
          >
            HealthTracker
          </Link>
          <div className="flex space-x-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-200/60 via-purple-200/60 to-blue-200/60 text-purple-700 backdrop-blur-sm"
                      : "text-gray-700 hover:bg-white/40 hover:backdrop-blur-sm"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
