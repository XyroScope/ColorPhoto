"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PhotoData } from "@/types/photo"

interface BackgroundRemovalModalProps {
  photo: PhotoData
  onSave: (updates: Partial<PhotoData>) => void
  onClose: () => void
}

export default function BackgroundRemovalModal({ photo, onSave, onClose }: BackgroundRemovalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleRemoveBackground = async () => {
    if (!apiKey.trim()) {
      alert("Please enter your Remove.bg API key")
      return
    }

    setIsProcessing(true)
    try {
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
        throw new Error("Background removal failed")
      }
    } catch (error) {
      console.error("Error removing background:", error)
      alert("Failed to remove background. Please check your API key and try again.")
    }
    setIsProcessing(false)
  }

  const handleApplyBackground = () => {
    if (!previewUrl) return

    // Create canvas to apply background color
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

      const finalUrl = canvas.toDataURL()
      onSave({
        processedUrl: finalUrl,
        backgroundColor: backgroundColor,
      })
    }
    img.src = previewUrl
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Background Removal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Remove.bg API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Remove.bg API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your free API key from{" "}
              <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                remove.bg
              </a>
            </p>
          </div>

          <div>
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2 items-center">
              <input
                id="bgColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 rounded border"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

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
