"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { PhotoData, PhotoSize } from "@/types/photo"

interface PhotoCropModalProps {
  photo: PhotoData
  targetSize: PhotoSize
  onSave: (updates: Partial<PhotoData>) => void
  onClose: () => void
}

export default function PhotoCropModal({ photo, targetSize, onSave, onClose }: PhotoCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cropArea, setCropArea] = useState(photo.cropArea)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    drawCanvas()
  }, [cropArea, photo])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size
      canvas.width = 600
      canvas.height = 400

      // Calculate scale to fit image in canvas
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (canvas.width - scaledWidth) / 2
      const offsetY = (canvas.height - scaledHeight) / 2

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw image
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

      // Draw crop area
      const cropX = offsetX + (cropArea.x / img.width) * scaledWidth
      const cropY = offsetY + (cropArea.y / img.height) * scaledHeight
      const cropWidth = (cropArea.width / img.width) * scaledWidth
      const cropHeight = (cropArea.height / img.height) * scaledHeight

      // Draw overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Clear crop area
      ctx.clearRect(cropX, cropY, cropWidth, cropHeight)

      // Draw crop border
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)

      // Draw corner handles
      const handleSize = 8
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize)
      ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize)
      ctx.fillRect(cropX - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize)
      ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize)
    }
    img.src = photo.originalUrl
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    const deltaX = currentX - dragStart.x
    const deltaY = currentY - dragStart.y

    // Update crop area (simplified - in real implementation you'd handle different drag modes)
    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, prev.x + deltaX),
      y: Math.max(0, prev.y + deltaY),
    }))

    setDragStart({ x: currentX, y: currentY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    // Generate cropped image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height)

      const croppedUrl = canvas.toDataURL()
      onSave({
        processedUrl: croppedUrl,
        cropArea: cropArea,
      })
    }
    img.src = photo.originalUrl
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Crop Photo - Target: {targetSize.width}×{targetSize.height}mm
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
