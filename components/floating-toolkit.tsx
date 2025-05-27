"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Scissors,
  Copy,
  Trash2,
  Expand,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Palette,
  Settings,
  Edit3,
  Layers,
  Grid3X3,
} from "lucide-react"
import type { PhotoData, LayoutSettings } from "@/types/photo"

interface FloatingToolkitProps {
  selectedPhotoIds: string[]
  photos: PhotoData[]
  onPhotoUpdate: (photoId: string, updates: Partial<PhotoData>) => void
  onBatchEdit: (updates: Partial<PhotoData>) => void
  onPhotoDelete: (photoId: string) => void
  onDuplicatePhotos: (photoIds: string[], count: number) => void
  onCropPhoto: (photo: PhotoData) => void
  onBackgroundRemoval: (photo: PhotoData) => void
  onResizePhoto: (photo: PhotoData) => void
  onAlignPhotos: (alignment: string) => void
  onDistributePhotos: (distribution: string) => void
  layoutSettings: LayoutSettings
  onLayoutSettingsChange: (settings: Partial<LayoutSettings>) => void
}

export default function FloatingToolkit({
  selectedPhotoIds,
  photos,
  onPhotoUpdate,
  onBatchEdit,
  onPhotoDelete,
  onDuplicatePhotos,
  onCropPhoto,
  onBackgroundRemoval,
  onResizePhoto,
  onAlignPhotos,
  onDistributePhotos,
  layoutSettings,
  onLayoutSettingsChange,
}: FloatingToolkitProps) {
  const [duplicateCount, setDuplicateCount] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const selectedPhotos = photos.filter((photo) => selectedPhotoIds.includes(photo.id))
  const hasSelection = selectedPhotoIds.length > 0

  const handleFlip = async (direction: "horizontal" | "vertical") => {
    if (hasSelection) {
      for (const photoId of selectedPhotoIds) {
        const photo = photos.find((p) => p.id === photoId)
        if (!photo) continue

        const newFlipH = direction === "horizontal" ? !photo.flipHorizontal : photo.flipHorizontal
        const newFlipV = direction === "vertical" ? !photo.flipVertical : photo.flipVertical

        try {
          // Use enhanced image processing with background preservation
          const { flipImageWithBackground } = await import("@/lib/enhanced-image-processing")
          const newProcessedUrl = await flipImageWithBackground(
            photo.processedUrl || photo.originalUrl,
            direction === "horizontal",
            direction === "vertical",
            photo.backgroundColor,
          )

          onPhotoUpdate(photoId, {
            flipHorizontal: false, // Reset transform flags since they're baked into the image
            flipVertical: false,
            processedUrl: newProcessedUrl,
          })
        } catch (error) {
          console.error("Error processing image:", error)
          // Fallback to transform flags
          onPhotoUpdate(photoId, {
            flipHorizontal: newFlipH,
            flipVertical: newFlipV,
          })
        }
      }
    }
  }

  const handleRotate = async () => {
    if (hasSelection) {
      for (const photoId of selectedPhotoIds) {
        const photo = photos.find((p) => p.id === photoId)
        if (!photo) continue

        try {
          // Use enhanced image processing with background preservation
          const { rotateImageWithBackground } = await import("@/lib/enhanced-image-processing")
          const newProcessedUrl = await rotateImageWithBackground(
            photo.processedUrl || photo.originalUrl,
            90,
            photo.backgroundColor,
          )

          onPhotoUpdate(photoId, {
            rotation: 0, // Reset rotation since it's baked into the image
            processedUrl: newProcessedUrl,
          })
        } catch (error) {
          console.error("Error processing image:", error)
          // Fallback to rotation transform
          const newRotation = (photo.rotation + 90) % 360
          onPhotoUpdate(photoId, {
            rotation: newRotation,
          })
        }
      }
    }
  }

  const handleBackgroundColorChange = async (color: string) => {
    if (hasSelection) {
      for (const photoId of selectedPhotoIds) {
        const photo = photos.find((p) => p.id === photoId)
        if (!photo) continue

        try {
          // Use enhanced image processing to force apply background
          const { forceApplyBackground } = await import("@/lib/enhanced-image-processing")
          const newProcessedUrl = await forceApplyBackground(photo.processedUrl || photo.originalUrl, color)

          onPhotoUpdate(photoId, {
            backgroundColor: color,
            processedUrl: newProcessedUrl,
          })
        } catch (error) {
          console.error("Error applying background:", error)
          // Fallback to just updating the background color
          onPhotoUpdate(photoId, {
            backgroundColor: color,
          })
        }
      }
    }
  }

  const handleDuplicate = () => {
    if (hasSelection && duplicateCount > 0) {
      onDuplicatePhotos(selectedPhotoIds, duplicateCount)
    }
  }

  const handleDeleteSelected = () => {
    selectedPhotoIds.forEach((photoId) => {
      onPhotoDelete(photoId)
    })
  }

  const backgroundColors = ["#ffffff", "#f5f5f5", "#3b82f6", "#ef4444", "#22c55e", "#000000"]

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl">
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="hover:bg-blue-50 hover:text-blue-600 rounded-xl"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-h-[80vh]">
      <div className="bg-white/95 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Photo Tools</h3>
              <p className="text-sm text-gray-600">{selectedPhotoIds.length} selected</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:bg-white/50 rounded-lg"
              >
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="hover:bg-white/50 rounded-lg"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isCollapsed && (
            <div className="text-xs text-blue-700 mt-2 bg-blue-100/50 px-3 py-1 rounded-full inline-block">
              Use keyboard arrows to nudge selected photos
            </div>
          )}
        </div>

        <Collapsible open={!isCollapsed}>
          <CollapsibleContent>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger
                    value="basic"
                    className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced"
                    className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    Advanced
                  </TabsTrigger>
                  <TabsTrigger
                    value="batch"
                    className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    Batch
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Layout
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  {/* Basic Editing */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block text-gray-700">Basic Editing</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRotate}
                        disabled={!hasSelection}
                        className="border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        Rotate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlip("horizontal")}
                        disabled={!hasSelection}
                        className="border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <FlipHorizontal className="h-4 w-4 mr-1" />
                        Flip H
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlip("vertical")}
                        disabled={!hasSelection}
                        className="col-span-2 border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <FlipVertical className="h-4 w-4 mr-1" />
                        Flip Vertical
                      </Button>
                    </div>
                  </div>

                  {/* Background Colors */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block text-gray-700 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Background Color
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {backgroundColors.map((color) => (
                        <button
                          key={color}
                          className="w-full h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all hover:scale-105 shadow-sm"
                          style={{ backgroundColor: color }}
                          onClick={() => handleBackgroundColorChange(color)}
                          disabled={!hasSelection}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      disabled={!hasSelection}
                      className="w-full h-10 rounded-lg border-2 border-gray-300 mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  {/* Advanced Tools */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block text-gray-700">Advanced Tools</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedPhotos[0] && onCropPhoto(selectedPhotos[0])}
                        disabled={selectedPhotoIds.length !== 1}
                        className="border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <Crop className="h-4 w-4 mr-2" />
                        Crop Photo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedPhotos[0] && onBackgroundRemoval(selectedPhotos[0])}
                        disabled={selectedPhotoIds.length !== 1}
                        className="border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <Scissors className="h-4 w-4 mr-2" />
                        Remove Background
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedPhotos[0] && onResizePhoto(selectedPhotos[0])}
                        disabled={selectedPhotoIds.length !== 1}
                        className="border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <Expand className="h-4 w-4 mr-2" />
                        Resize Photo
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="batch" className="space-y-4">
                  {/* Batch Operations */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block text-gray-700">Batch Operations</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={duplicateCount}
                          onChange={(e) => setDuplicateCount(Number(e.target.value))}
                          className="flex-1 rounded-lg border-2 border-gray-300"
                          placeholder="Count"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDuplicate}
                        disabled={!hasSelection}
                        className="w-full border-2 hover:border-blue-300 hover:bg-blue-50 rounded-lg"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Selected ({duplicateCount})
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={!hasSelection}
                        className="w-full rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  {/* Layout Settings */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block text-gray-700">Layout Settings</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-gray-600">Gap (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={layoutSettings.gap}
                          onChange={(e) => onLayoutSettingsChange({ gap: Number(e.target.value) })}
                          className="rounded-lg border-2 border-gray-300"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Outline Color</Label>
                        <input
                          type="color"
                          value={layoutSettings.outlineColor}
                          onChange={(e) => onLayoutSettingsChange({ outlineColor: e.target.value })}
                          className="w-full h-10 rounded-lg border-2 border-gray-300"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Outline Width (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          value={layoutSettings.outlineWidth}
                          onChange={(e) => onLayoutSettingsChange({ outlineWidth: Number(e.target.value) })}
                          className="rounded-lg border-2 border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
