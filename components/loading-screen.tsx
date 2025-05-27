"use client"

import { useState, useEffect } from "react"
import { Camera, Sparkles, Zap, Shield } from "lucide-react"

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Camera, text: "Initializing Camera", color: "from-blue-500 to-indigo-600" },
    { icon: Sparkles, text: "Loading AI Engine", color: "from-purple-500 to-violet-600" },
    { icon: Zap, text: "Optimizing Performance", color: "from-green-500 to-emerald-600" },
    { icon: Shield, text: "Securing Your Data", color: "from-orange-500 to-red-600" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 800)

    return () => clearInterval(stepTimer)
  }, [])

  const currentStepData = steps[currentStep]
  const CurrentIcon = currentStepData.icon

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-2xl animate-pulse`}
          >
            <CurrentIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Brand */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">PhotoStudio Pro</h1>
          <p className="text-gray-600">Bangladesh's First Professional Photo Tool</p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="progress-bar">
            <div className="progress-bar-fill transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-center gap-3">
            <CurrentIcon className="w-5 h-5 text-gray-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">{currentStepData.text}</span>
          </div>

          <p className="text-xs text-gray-500">{progress}% Complete</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>300 DPI Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span>Print Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
