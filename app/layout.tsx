import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "miniHealthHelper - Nutrition, Symptoms & Remedies",
  description: "Track nutrition, predict symptoms, and discover personalized remedies",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">{children}</main>
      </body>
    </html>
  )
}
