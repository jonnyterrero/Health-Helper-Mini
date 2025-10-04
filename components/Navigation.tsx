"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Brain, Heart, TrendingUp, BarChart3, LineChart, Zap, Sparkles, Plug } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/nutrition", label: "Nutrition", icon: Activity },
    { href: "/exercise", label: "Exercise", icon: Heart },
    { href: "/predictions", label: "Predictions", icon: Brain },
    { href: "/remedies", label: "Remedies", icon: TrendingUp },
    { href: "/analytics", label: "Analytics", icon: LineChart },
    { href: "/ai-ml", label: "AI/ML", icon: Zap },
    { href: "/advanced-features", label: "Advanced", icon: Sparkles },
    { href: "/integration", label: "Integration", icon: Plug },
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent whitespace-nowrap flex-shrink-0"
          >
            Health Helper mini
          </Link>
          <div className="flex flex-wrap gap-1 md:gap-2 justify-end">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-2 md:px-4 py-2 rounded-lg transition-all ${
                    isActive ? "glass-button shadow-md" : "hover:glass-button"
                  }`}
                >
                  <Icon className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
