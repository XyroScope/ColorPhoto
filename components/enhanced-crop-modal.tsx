"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  MousePointer,
  CreditCard,
  Stamp,
  Ruler,
  Smartphone,
  Monitor,
} from "lucide-react"
import type { PhotoData, PhotoSize } from "@/types/photo"

interface EnhancedCropModalProps {
  photo: PhotoData
  targetSize: PhotoSize
  onSave: (updates: Partial<PhotoData>) => void
  onClose: () => void
}

interface CropHandle {
  type: "corner" | "edge"
  position: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | "move"
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_PHOTO_SIZES: PhotoSize[] = [
  {
    id: "passport",
    name: "Passport Size",
    width: 40,
    height: 50,
    unit: "mm",
    type: "passport",
    icon: "CreditCard",
  },
  {
    id: "stamp",
    name: "Stamp Size",
    width: 22,
    height: 27,
    unit: "mm",
    type: "stamp",
    icon: "Stamp",
  },
]

export default function EnhancedCropModal({ photo, targetSize, onSave, onClose }: EnhancedCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [cropArea, setCropArea] = useState(photo.cropArea)
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [selectedSize, setSelectedSize] = useState<PhotoSize>(targetSize)
  const [showCustomSize, setShowCustomSize] = useState(false)
  const [customSize, setCustomSize] = useState({ width: 40, height: 50, unit: "mm" as "mm" | "inch" })

  const targetAspectRatio = selectedSize.width / selectedSize.height
  const handleSize = 12

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "CreditCard":
        return <CreditCard className="h-4 w-4" />
      case "Stamp":
        return <Stamp className="h-4 w-4" />
      default:
        return <Ruler className="h-4 w-4" />
    }
  }

  const handleSizeChange = (size: PhotoSize) => {
    setSelectedSize(size)
    setShowCustomSize(false)
  }

  const handleCustomSizeApply = () => {
    const customPhotoSize: PhotoSize = {
      id: "custom",
      name: `Custom ${customSize.width}×${customSize.height}${customSize.unit}`,
      width: customSize.unit === "inch" ? customSize.width * 25.4 : customSize.width,
      height: customSize.unit === "inch" ? customSize.height * 25.4 : customSize.height,
      unit: "mm",
      type: "custom",
      icon: "Ruler",
    }
    setSelectedSize(customPhotoSize)
    setShowCustomSize(false)
  }

  useEffect(() => {
    drawCanvas()
  }, [zoom, rotation, cropArea, imageLoaded, hoveredHandle, selectedSize])

  useEffect(() => {
    const updateCanvasOffset = () => {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        setCanvasOffset({ x: rect.left, y: rect.top })
      }
    }

    updateCanvasOffset()
    window.addEventListener("resize", updateCanvasOffset)
    window.addEventListener("scroll", updateCanvasOffset)

    return () => {
      window.removeEventListener("resize", updateCanvasOffset)
      window.removeEventListener("scroll", updateCanvasOffset)
    }
  }, [])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size
      canvas.width = 600
      canvas.height = 400

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate image display size and position
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (canvas.width - scaledWidth) / 2
      const offsetY = (canvas.height - scaledHeight) / 2

      // Save context for rotation
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-scaledWidth / 2, -scaledHeight / 2)

      // Draw image
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
      ctx.restore()

      // Calculate crop area with aspect ratio constraint
      const cropWidth = Math.min(cropArea.width, cropArea.height * targetAspectRatio)
      const cropHeight = cropWidth / targetAspectRatio

      const cropX = offsetX + (cropArea.x / img.width) * scaledWidth
      const cropY = offsetY + (cropArea.y / img.height) * scaledHeight
      const cropDisplayWidth = (cropWidth / img.width) * scaledWidth
      const cropDisplayHeight = (cropHeight / img.height) * scaledHeight

      // Draw semi-transparent overlay on the entire canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the crop area with reduced opacity to show the image underneath
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillRect(cropX, cropY, cropDisplayWidth, cropDisplayHeight)
      ctx.globalCompositeOperation = "source-over"

      // Draw a lighter overlay on the crop area to make it visible but not completely clear
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(cropX, cropY, cropDisplayWidth, cropDisplayHeight)

      // Draw crop border
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.strokeRect(cropX, cropY, cropDisplayWidth, cropDisplayHeight)

      // Draw interactive handles
      drawCropHandles(ctx, cropX, cropY, cropDisplayWidth, cropDisplayHeight)

      // Draw aspect ratio info
      ctx.fillStyle = "#ffffff"
      ctx.font = "14px Arial"
      ctx.fillText(`Target: ${selectedSize.width}×${selectedSize.height}mm (${targetAspectRatio.toFixed(2)}:1)`, 10, 20)

      // Draw instructions
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px Arial"
      ctx.fillText("Drag corners to resize • Drag center to move • Mouse wheel to zoom", 10, canvas.height - 10)
    }
    img.src = photo.originalUrl
  }

  const drawCropHandles = (
    ctx: CanvasRenderingContext2D,
    cropX: number,
    cropY: number,
    cropWidth: number,
    cropHeight: number,
  ) => {
    const handles = getCropHandles(cropX, cropY, cropWidth, cropHeight)

    handles.forEach((handle) => {
      const isHovered = hoveredHandle === handle.position
      const isDraggingThis = dragHandle === handle.position

      // Handle styling
      ctx.fillStyle = isHovered || isDraggingThis ? "#1d4ed8" : "#3b82f6"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2

      if (handle.type === "corner") {
        // Draw corner handles as squares
        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
        ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
      } else if (handle.type === "edge") {
        // Draw edge handles as rectangles
        ctx.fillRect(handle.x - handle.width / 2, handle.y - handle.height / 2, handle.width, handle.height)
        ctx.strokeRect(handle.x - handle.width / 2, handle.y - handle.height / 2, handle.width, handle.height)
      }
    })

    // Draw move handle in center
    const centerX = cropX + cropWidth / 2
    const centerY = cropY + cropHeight / 2
    const isCenterHovered = hoveredHandle === "move"
    const isCenterDragging = dragHandle === "move"

    ctx.fillStyle = isCenterHovered || isCenterDragging ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.5)"
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.arc(centerX, centerY, handleSize, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // Draw move icon
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX - 4, centerY)
    ctx.lineTo(centerX + 4, centerY)
    ctx.moveTo(centerX, centerY - 4)
    ctx.lineTo(centerX, centerY + 4)
    ctx.stroke()
  }

  const getCropHandles = (cropX: number, cropY: number, cropWidth: number, cropHeight: number): CropHandle[] => {
    return [
      // Corner handles
      { type: "corner", position: "nw", x: cropX, y: cropY, width: handleSize, height: handleSize },
      { type: "corner", position: "ne", x: cropX + cropWidth, y: cropY, width: handleSize, height: handleSize },
      { type: "corner", position: "sw", x: cropX, y: cropY + cropHeight, width: handleSize, height: handleSize },
      {
        type: "corner",
        position: "se",
        x: cropX + cropWidth,
        y: cropY + cropHeight,
        width: handleSize,
        height: handleSize,
      },

      // Edge handles
      { type: "edge", position: "n", x: cropX + cropWidth / 2, y: cropY, width: handleSize, height: handleSize / 2 },
      {
        type: "edge",
        position: "s",
        x: cropX + cropWidth / 2,
        y: cropY + cropHeight,
        width: handleSize,
        height: handleSize / 2,
      },
      {
        type: "edge",
        position: "e",
        x: cropX + cropWidth,
        y: cropY + cropHeight / 2,
        width: handleSize / 2,
        height: handleSize,
      },
      { type: "edge", position: "w", x: cropX, y: cropY + cropHeight / 2, width: handleSize / 2, height: handleSize },

      // Move handle
      {
        type: "corner",
        position: "move",
        x: cropX + cropWidth / 2,
        y: cropY + cropHeight / 2,
        width: handleSize * 2,
        height: handleSize * 2,
      },
    ]
  }

  const getHandleAtPosition = (
    x: number,
    y: number,
    cropX: number,
    cropY: number,
    cropWidth: number,
    cropHeight: number,
  ): string | null => {
    const handles = getCropHandles(cropX, cropY, cropWidth, cropHeight)

    for (const handle of handles) {
      const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2))
      if (distance <= handleSize) {
        return handle.position
      }
    }

    return null
  }

  const getCursorForHandle = (handle: string | null): string => {
    switch (handle) {
      case "nw":
      case "se":
        return "nw-resize"
      case "ne":
      case "sw":
        return "ne-resize"
      case "n":
      case "s":
        return "ns-resize"
      case "e":
      case "w":
        return "ew-resize"
      case "move":
        return "move"
      default:
        return "default"
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate crop display coordinates
      const img = new Image()
      img.src = photo.originalUrl

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (canvas.width - scaledWidth) / 2
      const offsetY = (canvas.height - scaledHeight) / 2

      const cropWidth = Math.min(cropArea.width, cropArea.height * targetAspectRatio)
      const cropHeight = cropWidth / targetAspectRatio
      const cropX = offsetX + (cropArea.x / img.width) * scaledWidth
      const cropY = offsetY + (cropArea.y / img.height) * scaledHeight
      const cropDisplayWidth = (cropWidth / img.width) * scaledWidth
      const cropDisplayHeight = (cropHeight / img.height) * scaledHeight

      const handle = getHandleAtPosition(x, y, cropX, cropY, cropDisplayWidth, cropDisplayHeight)

      if (handle) {
        setIsDragging(true)
        setDragHandle(handle)
        setDragStart({ x, y })
        e.preventDefault()
      }
    },
    [cropArea, zoom, targetAspectRatio, photo.originalUrl],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (!isDragging) {
        // Update hover state
        const img = new Image()
        img.src = photo.originalUrl

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const offsetX = (canvas.width - scaledWidth) / 2
        const offsetY = (canvas.height - scaledHeight) / 2

        const cropWidth = Math.min(cropArea.width, cropArea.height * targetAspectRatio)
        const cropHeight = cropWidth / targetAspectRatio
        const cropX = offsetX + (cropArea.x / img.width) * scaledWidth
        const cropY = offsetY + (cropArea.y / img.height) * scaledHeight
        const cropDisplayWidth = (cropWidth / img.width) * scaledWidth
        const cropDisplayHeight = (cropHeight / img.height) * scaledHeight

        const handle = getHandleAtPosition(x, y, cropX, cropY, cropDisplayWidth, cropDisplayHeight)
        setHoveredHandle(handle)
        canvas.style.cursor = getCursorForHandle(handle)
        return
      }

      if (!dragHandle) return

      const deltaX = x - dragStart.x
      const deltaY = y - dragStart.y

      // Convert deltas to image coordinates
      const img = new Image()
      img.src = photo.originalUrl

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale

      const imageDeltaX = (deltaX / scaledWidth) * img.width
      const imageDeltaY = (deltaY / scaledHeight) * img.height

      setCropArea((prev) => {
        const newCropArea = { ...prev }

        switch (dragHandle) {
          case "move":
            newCropArea.x = Math.max(0, Math.min(prev.x + imageDeltaX, img.width - prev.width))
            newCropArea.y = Math.max(0, Math.min(prev.y + imageDeltaY, img.height - prev.height))
            break
          case "nw":
            newCropArea.x = Math.max(0, prev.x + imageDeltaX)
            newCropArea.y = Math.max(0, prev.y + imageDeltaY)
            newCropArea.width = Math.max(50, prev.width - imageDeltaX)
            newCropArea.height = Math.max(50, prev.height - imageDeltaY)
            break
          case "ne":
            newCropArea.y = Math.max(0, prev.y + imageDeltaY)
            newCropArea.width = Math.max(50, prev.width + imageDeltaX)
            newCropArea.height = Math.max(50, prev.height - imageDeltaY)
            break
          case "sw":
            newCropArea.x = Math.max(0, prev.x + imageDeltaX)
            newCropArea.width = Math.max(50, prev.width - imageDeltaX)
            newCropArea.height = Math.max(50, prev.height + imageDeltaY)
            break
          case "se":
            newCropArea.width = Math.max(50, prev.width + imageDeltaX)
            newCropArea.height = Math.max(50, prev.height + imageDeltaY)
            break
          case "n":
            newCropArea.y = Math.max(0, prev.y + imageDeltaY)
            newCropArea.height = Math.max(50, prev.height - imageDeltaY)
            break
          case "s":
            newCropArea.height = Math.max(50, prev.height + imageDeltaY)
            break
          case "e":
            newCropArea.width = Math.max(50, prev.width + imageDeltaX)
            break
          case "w":
            newCropArea.x = Math.max(0, prev.x + imageDeltaX)
            newCropArea.width = Math.max(50, prev.width - imageDeltaX)
            break
        }

        // Maintain aspect ratio for corner and edge handles
        if (dragHandle !== "move") {
          const currentAspectRatio = newCropArea.width / newCropArea.height
          if (currentAspectRatio !== targetAspectRatio) {
            if (dragHandle.includes("w") || dragHandle.includes("e") || dragHandle === "w" || dragHandle === "e") {
              newCropArea.height = newCropArea.width / targetAspectRatio
            } else {
              newCropArea.width = newCropArea.height * targetAspectRatio
            }
          }
        }

        // Ensure crop area stays within image bounds
        newCropArea.x = Math.max(0, Math.min(newCropArea.x, img.width - newCropArea.width))
        newCropArea.y = Math.max(0, Math.min(newCropArea.y, img.height - newCropArea.height))
        newCropArea.width = Math.min(newCropArea.width, img.width - newCropArea.x)
        newCropArea.height = Math.min(newCropArea.height, img.height - newCropArea.y)

        return newCropArea
      })

      setDragStart({ x, y })
    },
    [isDragging, dragHandle, dragStart, zoom, targetAspectRatio, photo.originalUrl],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredHandle(null)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.cursor = "default"
    }
  }, [])

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      handleMouseDown(mouseEvent as any)
    },
    [handleMouseDown],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      handleMouseMove(mouseEvent as any)
    },
    [handleMouseMove],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      handleMouseUp()
    },
    [handleMouseUp],
  )

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  const handleRotationChange = (value: number[]) => {
    setRotation(value[0])
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)))
  }, [])

  const handleSave = () => {
    // Generate cropped image with proper aspect ratio
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Calculate final crop dimensions with aspect ratio
      const cropWidth = Math.min(cropArea.width, cropArea.height * targetAspectRatio)
      const cropHeight = cropWidth / targetAspectRatio

      canvas.width = cropWidth
      canvas.height = cropHeight

      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }

      ctx.drawImage(img, cropArea.x, cropArea.y, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)

      const croppedUrl = canvas.toDataURL("image/jpeg", 0.9)
      onSave({
        processedUrl: croppedUrl,
        cropArea: { ...cropArea, width: cropWidth, height: cropHeight },
        rotation: rotation,
        targetWidth: selectedSize.width,
        targetHeight: selectedSize.height,
      })
    }
    img.src = photo.originalUrl
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Enhanced Crop Tool - Target: {selectedSize.width}×{selectedSize.height}mm
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Photo Size Selector */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Photo Sizes
              </h4>

              {DEFAULT_PHOTO_SIZES.map((size) => (
                <div key={size.id} className="space-y-2">
                  <Button
                    variant={selectedSize.type === size.type ? "default" : "outline"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleSizeChange(size)}
                  >
                    <div className="flex items-center gap-2">
                      {getIcon(size.icon)}
                      <span>{size.name}</span>
                    </div>
                  </Button>

                  {selectedSize.type === size.type && (
                    <div className="grid grid-cols-2 gap-1 ml-2">
                      <Button
                        variant={selectedSize.width < selectedSize.height ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          handleSizeChange({
                            ...size,
                            id: `${size.type}-portrait`,
                            name: `${size.name} Portrait`,
                            width: Math.min(size.width, size.height),
                            height: Math.max(size.width, size.height),
                          })
                        }
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={selectedSize.width > selectedSize.height ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          handleSizeChange({
                            ...size,
                            id: `${size.type}-landscape`,
                            name: `${size.name} Landscape`,
                            width: Math.max(size.width, size.height),
                            height: Math.min(size.width, size.height),
                          })
                        }
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Custom Size */}
              <div className="border-t pt-4">
                {!showCustomSize ? (
                  <Button
                    variant={selectedSize.id === "custom" ? "default" : "outline"}
                    className="w-full justify-start text-sm"
                    onClick={() => setShowCustomSize(true)}
                  >
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      <span>Custom Size</span>
                    </div>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Width</Label>
                        <Input
                          type="number"
                          value={customSize.width}
                          onChange={(e) => setCustomSize((prev) => ({ ...prev, width: Number(e.target.value) }))}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Height</Label>
                        <Input
                          type="number"
                          value={customSize.height}
                          onChange={(e) => setCustomSize((prev) => ({ ...prev, height: Number(e.target.value) }))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Select
                      value={customSize.unit}
                      onValueChange={(value: "mm" | "inch") => setCustomSize((prev) => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="inch">inch</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleCustomSizeApply} className="flex-1 text-xs">
                        Apply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowCustomSize(false)} className="text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Crop Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                <Slider value={[zoom]} onValueChange={handleZoomChange} min={0.1} max={3} step={0.1} className="w-32" />
                <ZoomIn className="h-4 w-4" />
                <span className="text-sm">{(zoom * 100).toFixed(0)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                <Slider
                  value={[rotation]}
                  onValueChange={handleRotationChange}
                  min={0}
                  max={360}
                  step={1}
                  className="w-32"
                />
                <span className="text-sm">{rotation}°</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                style={{ touchAction: "none" }}
              />
            </div>

            <div className="text-center text-sm text-gray-600">
              <Move className="h-4 w-4 inline mr-1" />
              Interactive cropping: Drag corners/edges to resize • Drag center to move • Mouse wheel to zoom
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply Crop</Button>
        </DialogFooter>

        {/* Hidden image for loading */}
        <img
          src={photo.originalUrl || "/placeholder.svg"}
          onLoad={handleImageLoad}
          style={{ display: "none" }}
          alt="Loading"
        />
      </DialogContent>
    </Dialog>
  )
}
