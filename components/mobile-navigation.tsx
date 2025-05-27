"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TabConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  tabConfig: TabConfig[]
}

export default function MobileNavigation({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  tabConfig,
}: MobileNavigationProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Menu */}
      <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-3">
            {tabConfig.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => {
                  onTabChange(tab.id)
                  onClose()
                }}
                className={`w-full justify-start p-4 h-auto rounded-xl transition-all ${
                  activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${activeTab === tab.id ? "bg-white/20" : "bg-gray-100"}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={`text-sm ${activeTab === tab.id ? "text-white/80" : "text-gray-500"}`}>
                      {tab.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
