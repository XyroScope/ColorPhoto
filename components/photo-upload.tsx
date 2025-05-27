"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link, Clipboard, ImageIcon, Sparkles, Zap, Shield, Camera } from "lucide-react"
import type { PhotoData } from "@/types/photo"
import { generateId } from "@/lib/utils"

interface PhotoUploadProps {
  onPhotosUploaded: (photos: PhotoData[]) => void
}

export default function PhotoUpload({ onPhotosUploaded }: PhotoUploadProps) {
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
        alert("Clipboard API is not supported in this browser or context. Please use file upload instead.")
        return
      }

      const permission = await navigator.permissions.query({ name: "clipboard-read" as PermissionName })
      if (permission.state === "denied") {
        alert("Clipboard access is denied. Please allow clipboard permissions or use file upload instead.")
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
        alert("No image found in clipboard. Please copy an image first.")
      }
    } catch (error) {
      console.error("Error pasting from clipboard:", error)
      if (error instanceof Error) {
        if (error.message.includes("permissions policy") || error.message.includes("blocked")) {
          alert("Clipboard access is blocked by browser security policy. Please use the file upload option instead.")
        } else if (error.message.includes("not allowed")) {
          alert("Clipboard access not allowed. Please use the file upload option instead.")
        } else {
          alert("Unable to access clipboard. Please try using the file upload option instead.")
        }
      } else {
        alert("Clipboard paste failed. Please use the file upload option instead.")
      }
    }
  }, [processFiles])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upload Your Photos</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Start by uploading your photos. We support JPG, PNG, and other common image formats.
        </p>
      </div>

      {/* Main Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden ${
          dragActive
            ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 scale-[1.02] shadow-xl"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div
              className={`p-6 rounded-2xl transition-all duration-300 ${
                dragActive
                  ? "bg-blue-500 scale-110 shadow-lg"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100"
              }`}
            >
              <Upload
                className={`h-12 w-12 transition-colors duration-300 ${dragActive ? "text-white" : "text-gray-600"}`}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {dragActive ? "Drop your photos here!" : "Drag & drop your photos"}
              </h3>
              <p className="text-gray-600 text-base sm:text-lg">or click the button below to browse files</p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <ImageIcon className="h-5 w-5 mr-3" />
              Choose Files
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl" />
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Alternative Upload Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* URL Upload */}
        <div className="glass-effect rounded-2xl shadow-lg border border-white/20 overflow-hidden card-hover">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Link className="h-4 w-4 text-white" />
              </div>
              Upload from URL
            </h3>
            <p className="text-emerald-100 text-sm mt-1">Paste an image URL to upload directly</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlUpload()}
                className="rounded-xl border-2 border-gray-200 focus:border-emerald-400 transition-colors"
              />
              <Button
                onClick={handleUrlUpload}
                disabled={!urlInput.trim() || isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl py-3 font-medium"
              >
                <Link className="w-4 h-4 mr-2" />
                Upload from URL
              </Button>
            </div>
          </div>
        </div>

        {/* Clipboard Upload */}
        <div className="glass-effect rounded-2xl shadow-lg border border-white/20 overflow-hidden card-hover">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Clipboard className="h-4 w-4 text-white" />
              </div>
              Paste from Clipboard
            </h3>
            <p className="text-purple-100 text-sm mt-1">Copy an image and paste it here</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Copy an image from anywhere and click the button below to paste it directly into the editor.
              </p>
              <Button
                onClick={handlePasteFromClipboard}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl py-3 font-medium"
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Paste Image
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
          <p className="text-sm text-gray-600">Process multiple photos instantly with our optimized engine</p>
        </div>

        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/50">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
          <p className="text-sm text-gray-600">Your photos are processed locally and never stored on our servers</p>
        </div>

        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200/50">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Professional Quality</h4>
          <p className="text-sm text-gray-600">Generate high-resolution PDFs perfect for printing</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Processing your images...</p>
          <p className="text-gray-500 text-sm mt-1">This may take a few moments</p>
        </div>
      )}
    </div>
  )
}
