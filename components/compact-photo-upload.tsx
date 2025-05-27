"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link, Clipboard, ImageIcon, Camera, Zap, Shield, Sparkles } from "lucide-react"
import type { PhotoData } from "@/types/photo"
import { generateId } from "@/lib/utils"

interface CompactPhotoUploadProps {
  onPhotosUploaded: (photos: PhotoData[]) => void
}

export default function CompactPhotoUpload({ onPhotosUploaded }: CompactPhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsLoading(true)
      const newPhotos: PhotoData[] = []

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file)
          const img = new Image()

          await new Promise((resolve) => {
            img.onload = () => {
              const photo: PhotoData = {
                id: generateId(),
                originalUrl: url,
                processedUrl: url,
                originalWidth: img.width,
                originalHeight: img.height,
                targetWidth: 40,
                targetHeight: 50,
                rotation: 0,
                flipHorizontal: false,
                flipVertical: false,
                backgroundColor: "#ffffff",
                cropArea: {
                  x: 0,
                  y: 0,
                  width: img.width,
                  height: img.height,
                },
                position: { x: 0, y: 0, page: 0 },
                duplicateCount: 1,
              }
              newPhotos.push(photo)
              resolve(null)
            }
            img.src = url
          })
        }
      }

      onPhotosUploaded(newPhotos)
      setIsLoading(false)
    },
    [onPhotosUploaded],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFiles(e.target.files)
      }
    },
    [processFiles],
  )

  const handleUrlUpload = useCallback(async () => {
    if (!urlInput.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(urlInput)
      const blob = await response.blob()
      const file = new File([blob], "uploaded-image", { type: blob.type })
      await processFiles([file])
      setUrlInput("")
    } catch (error) {
      console.error("Error uploading from URL:", error)
    }
    setIsLoading(false)
  }, [urlInput, processFiles])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        alert("Clipboard not supported")
        return
      }

      const clipboardItems = await navigator.clipboard.read()
      let imageFound = false

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], "pasted-image", { type })
            await processFiles([file])
            imageFound = true
            break
          }
        }
        if (imageFound) break
      }

      if (!imageFound) {
        alert("No image in clipboard")
      }
    } catch (error) {
      console.error("Clipboard error:", error)
      alert("Clipboard access failed")
    }
  }, [processFiles])

  return (
    <div className="space-y-6">
      {/* Hero Section - Compact */}
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Photos</h2>
        <p className="text-sm text-gray-600">JPG, PNG supported</p>
      </div>

      {/* Main Upload Area - Compact */}
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden ${
          dragActive
            ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 scale-[1.02]"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`p-4 rounded-xl transition-all duration-300 ${
                dragActive
                  ? "bg-blue-500 scale-110"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100"
              }`}
            >
              <Upload
                className={`h-8 w-8 transition-colors duration-300 ${dragActive ? "text-white" : "text-gray-600"}`}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">{dragActive ? "Drop here!" : "Drag & drop"}</h3>
              <p className="text-sm text-gray-600">or click to browse</p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Alternative Methods - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* URL Upload */}
        <div className="glass-effect rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Link className="h-4 w-4" />
              From URL
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlUpload()}
                className="rounded-lg border-2 border-gray-200 text-sm"
              />
              <Button
                onClick={handleUrlUpload}
                disabled={!urlInput.trim() || isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg py-2 text-sm"
              >
                <Link className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Clipboard Upload */}
        <div className="glass-effect rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              From Clipboard
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <p className="text-xs text-gray-600">Copy an image and paste it here</p>
              <Button
                onClick={handlePasteFromClipboard}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg py-2 text-sm"
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Paste
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50">
          <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-gray-900">Fast</h4>
        </div>

        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/50">
          <Shield className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-gray-900">Secure</h4>
        </div>

        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200/50">
          <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-gray-900">Pro Quality</h4>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-600">Processing...</p>
        </div>
      )}
    </div>
  )
}
