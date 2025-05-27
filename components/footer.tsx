"use client"

import { Heart, ExternalLink } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <h3 className="text-lg font-bold">PhotoStudio Pro</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Bangladesh's first professional passport photo printing tool. Create perfect photos with advanced
              AI-powered editing.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• 300 DPI Print Quality</li>
              <li>• AI Background Removal</li>
              <li>• Multiple Photo Formats</li>
              <li>• Instant PDF Generation</li>
              <li>• Secure & Private</li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">About</h4>
            <p className="text-sm text-gray-400">
              Developed with <Heart className="w-4 h-4 inline text-red-500" /> for Bangladesh's photography needs.
            </p>
            <div className="space-y-2">
              <a
                href="https://sheba.pages.dev/?PhotoStudio_Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <span>Powered by Sheba Enterprise</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© {currentYear} PhotoStudio Pro. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Made in Bangladesh 🇧🇩</span>
            <span>•</span>
            <span>Professional Quality</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
