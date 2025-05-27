"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalSpaceAround,
  Move,
  Expand,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react"
import type { PhotoData, LayoutSettings } from "@/types/photo"

interface CentralizedToolsProps {
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

export default function CentralizedTools({
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
}: CentralizedToolsProps) {
  const [duplicateCount, setDuplicateCount] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const selectedPhotos = photos.filter((photo) => selectedPhotoIds.includes(photo.id))
  const hasSelection = selectedPhotoIds.length > 0

  const handleRotate = () => {
    if (hasSelection) {
      onBatchEdit({ rotation: 90 })
    }
  }

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (hasSelection) {
      selectedPhotoIds.forEach((photoId) => {
        const photo = photos.find((p) => p.id === photoId)
        if (photo) {
          const update =
            direction === "horizontal"
              ? { flipHorizontal: !photo.flipHorizontal }
              : { flipVertical: !photo.flipVertical }
          onPhotoUpdate(photoId, update)
        }
      })
    }
  }

  const handleBackgroundColorChange = (color: string) => {
    if (hasSelection) {
      onBatchEdit({ backgroundColor: color })
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

  const handleAlign = (alignment: string) => {
    if (selectedPhotoIds.length < 2) return

    const selectedPhotosData = photos.filter((photo) => selectedPhotoIds.includes(photo.id))

    switch (alignment) {
      case "left":
        const leftMost = Math.min(...selectedPhotosData.map((p) => p.position?.x || 0))
        selectedPhotoIds.forEach((photoId) => {
          onPhotoUpdate(photoId, { position: { x: leftMost, y: 0, page: 0 } })
        })
        break
      case "center":
        const avgX = selectedPhotosData.reduce((sum, p) => sum + (p.position?.x || 0), 0) / selectedPhotosData.length
        selectedPhotoIds.forEach((photoId) => {
          onPhotoUpdate(photoId, { position: { x: avgX, y: 0, page: 0 } })
        })
        break
      case "right":
        const rightMost = Math.max(...selectedPhotosData.map((p) => p.position?.x || 0))
        selectedPhotoIds.forEach((photoId) => {
          onPhotoUpdate(photoId, { position: { x: rightMost, y: 0, page: 0 } })
        })
        break
    }
  }

  const handleDistribute = (distribution: string) => {
    if (selectedPhotoIds.length < 3) return

    const selectedPhotosData = photos.filter((photo) => selectedPhotoIds.includes(photo.id))
    selectedPhotosData.sort((a, b) => (a.position?.x || 0) - (b.position?.x || 0))

    if (distribution === "horizontal") {
      const minX = selectedPhotosData[0].position?.x || 0
      const maxX = selectedPhotosData[selectedPhotosData.length - 1].position?.x || 0
      const step = (maxX - minX) / (selectedPhotosData.length - 1)

      selectedPhotosData.forEach((photo, index) => {
        onPhotoUpdate(photo.id, { position: { x: minX + step * index, y: photo.position?.y || 0, page: 0 } })
      })
    }
  }

  const backgroundColors = ["#ffffff", "#f5f5f5", "#3b82f6", "#ef4444", "#22c55e", "#000000"]

  if (isMinimized) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-2 shadow-xl w-16">
        <CardContent className="p-2">
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)} className="w-full h-12">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 shadow-xl max-h-[80vh] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>Photo Tools ({selectedPhotoIds.length})</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <Collapsible open={!isCollapsed}>
        <CollapsibleContent>
          <CardContent className="pt-0 max-h-[60vh] overflow-y-auto">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basic" className="text-xs">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs">
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">
                  Layout
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Basic Editing */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Basic Editing</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={handleRotate} disabled={!hasSelection}>
                      <RotateCw className="h-4 w-4 mr-1" />
                      Rotate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlip("horizontal")}
                      disabled={!hasSelection}
                    >
                      <FlipHorizontal className="h-4 w-4 mr-1" />
                      Flip H
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlip("vertical")}
                      disabled={!hasSelection}
                      className="col-span-2"
                    >
                      <FlipVertical className="h-4 w-4 mr-1" />
                      Flip Vertical
                    </Button>
                  </div>
                </div>

                {/* Background Colors */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Background Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color}
                        className="w-full h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() => handleBackgroundColorChange(color)}
                        disabled={!hasSelection}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    disabled={!hasSelection}
                    className="w-full h-8 rounded border mt-2"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                {/* Advanced Tools */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Advanced Tools</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedPhotos[0] && onCropPhoto(selectedPhotos[0])}
                      disabled={selectedPhotoIds.length !== 1}
                    >
                      <Crop className="h-4 w-4 mr-2" />
                      Crop Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedPhotos[0] && onBackgroundRemoval(selectedPhotos[0])}
                      disabled={selectedPhotoIds.length !== 1}
                    >
                      <Scissors className="h-4 w-4 mr-2" />
                      Remove Background
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedPhotos[0] && onResizePhoto(selectedPhotos[0])}
                      disabled={selectedPhotoIds.length !== 1}
                    >
                      <Expand className="h-4 w-4 mr-2" />
                      Resize Photo
                    </Button>
                  </div>
                </div>

                {/* Batch Operations */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Batch Operations</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={duplicateCount}
                        onChange={(e) => setDuplicateCount(Number(e.target.value))}
                        className="flex-1"
                        placeholder="Count"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDuplicate}
                      disabled={!hasSelection}
                      className="w-full"
                    >
                      Duplicate Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={!hasSelection}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>

                {/* Alignment & Distribution */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Alignment & Distribution</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Alignment</Label>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlign("left")}
                          disabled={selectedPhotoIds.length < 2}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlign("center")}
                          disabled={selectedPhotoIds.length < 2}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlign("right")}
                          disabled={selectedPhotoIds.length < 2}
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Distribution</Label>
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDistribute("horizontal")}
                          disabled={selectedPhotoIds.length < 3}
                        >
                          <AlignVerticalSpaceAround className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDistribute("vertical")}
                          disabled={selectedPhotoIds.length < 3}
                        >
                          <Move className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                {/* Layout Settings */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Layout Settings</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Gap (mm)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={layoutSettings.gap}
                        onChange={(e) => onLayoutSettingsChange({ gap: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Outline Color</Label>
                      <input
                        type="color"
                        value={layoutSettings.outlineColor}
                        onChange={(e) => onLayoutSettingsChange({ outlineColor: e.target.value })}
                        className="w-full h-10 rounded border"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Outline Width (px)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={layoutSettings.outlineWidth}
                        onChange={(e) => onLayoutSettingsChange({ outlineWidth: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
