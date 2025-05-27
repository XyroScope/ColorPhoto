"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Palette, ExternalLink } from "lucide-react"
import type { PhotoData } from "@/types/photo"
import { getCookie, setCookie } from "@/lib/utils"

interface EnhancedBackgroundRemovalProps {
  photo: PhotoData
  onSave: (updates: Partial<PhotoData>) => void
  onClose: () => void
}

export default function EnhancedBackgroundRemoval({ photo, onSave, onClose }: EnhancedBackgroundRemovalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load API key from cookies
    const savedApiKey = getCookie("removebg_api_key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleRemoveBackground = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Remove.bg API key")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Save API key to cookies
      setCookie("removebg_api_key", apiKey, 30)

      // Convert image to blob
      const response = await fetch(photo.originalUrl)
      const blob = await response.blob()

      // Create FormData
      const formData = new FormData()
      formData.append("image_file", blob)
      formData.append("size", "auto")

      // Call Remove.bg API
      const removeResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
        },
        body: formData,
      })

      if (removeResponse.ok) {
        const resultBlob = await removeResponse.blob()
        const resultUrl = URL.createObjectURL(resultBlob)
        setPreviewUrl(resultUrl)
      } else {
        const errorData = await removeResponse.json()
        throw new Error(errorData.errors?.[0]?.title || "Background removal failed")
      }
    } catch (error) {
      console.error("Error removing background:", error)
      setError(error instanceof Error ? error.message : "Failed to remove background")
    }
    setIsProcessing(false)
  }

  const handleApplyBackground = async () => {
    if (!previewUrl) return

    try {
      // Use enhanced image processing to ensure background is properly applied
      const { createImageWithBackground } = await import("@/lib/enhanced-image-processing")
      const finalUrl = await createImageWithBackground(previewUrl, backgroundColor)

      onSave({
        processedUrl: finalUrl,
        backgroundColor: backgroundColor,
      })
    } catch (error) {
      console.error("Error applying background:", error)
      // Fallback to canvas method
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Fill background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw image on top
        ctx.drawImage(img, 0, 0)

        const finalUrl = canvas.toDataURL("image/jpeg", 0.9)
        onSave({
          processedUrl: finalUrl,
          backgroundColor: backgroundColor,
        })
      }
      img.crossOrigin = "anonymous"
      img.src = previewUrl
    }
  }

  const backgroundColors = [
    { name: "White", value: "#ffffff" },
    { name: "Light Gray", value: "#f5f5f5" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#22c55e" },
    { name: "Black", value: "#000000" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Background Removal & Replacement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Remove.bg API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Remove.bg API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your free API key from{" "}
              <a
                href="https://www.remove.bg/r/X9KDjxYjAYzmKBv7tT9EmkBg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                remove.bg
                <ExternalLink className="h-3 w-3" />
              </a>
              {getCookie("removebg_api_key") && " (API key saved in browser)"}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Background Color Selection */}
          <div className="space-y-3">
            <Label>Background Color</Label>
            <div className="flex flex-wrap gap-2">
              {backgroundColors.map((color) => (
                <Button
                  key={color.value}
                  variant={backgroundColor === color.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBackgroundColor(color.value)}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.value }} />
                  {color.name}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 rounded border"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Original</h4>
              <img
                src={photo.originalUrl || "/placeholder.svg"}
                alt="Original"
                className="w-full h-48 object-cover border rounded"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Preview</h4>
              {previewUrl ? (
                <div
                  className="w-full h-48 border rounded flex items-center justify-center"
                  style={{ backgroundColor }}
                >
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-48 border rounded flex items-center justify-center text-gray-500">
                  No preview available
                </div>
              )}
            </div>
          </div>

          {/* Remove Background Button */}
          <Button onClick={handleRemoveBackground} disabled={isProcessing || !apiKey.trim()} className="w-full">
            {isProcessing ? "Removing Background..." : "Remove Background"}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyBackground} disabled={!previewUrl}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
