"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  Grid,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize,
  EyeOff,
  X,
  Layers,
  Camera,
} from "lucide-react"
import type { PhotoData, PhotoSize, LayoutSettings } from "@/types/photo"
import { calculatePhotosPerPage, A4_WIDTH_MM } from "@/lib/utils"

interface EnhancedPhotoEditorProps {
  photos: PhotoData[]
  selectedPhotoIds: string[]
  onSelectedPhotoIdsChange: (ids: string[]) => void
  onPhotoUpdate: (photoId: string, updates: Partial<PhotoData>) => void
  selectedSize: PhotoSize
  layoutSettings: LayoutSettings
}

export default function EnhancedPhotoEditor({
  photos,
  selectedPhotoIds,
  onSelectedPhotoIdsChange,
  onPhotoUpdate,
  selectedSize,
  layoutSettings,
}: EnhancedPhotoEditorProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "preview">("preview")
  const [zoomLevel, setZoomLevel] = useState(0.7)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hideTools, setHideTools] = useState(false)

  const photosPerPage = calculatePhotosPerPage(selectedSize.width, selectedSize.height, layoutSettings.gap)
  const totalPages = Math.ceil(photos.length / photosPerPage)

  const startIndex = currentPage * photosPerPage
  const endIndex = startIndex + photosPerPage
  const currentPagePhotos = photos.slice(startIndex, endIndex)

  const handlePhotoSelect = useCallback(
    (photoId: string, selected: boolean) => {
      if (selected) {
        onSelectedPhotoIdsChange([...selectedPhotoIds, photoId])
      } else {
        onSelectedPhotoIdsChange(selectedPhotoIds.filter((id) => id !== photoId))
      }
    },
    [selectedPhotoIds, onSelectedPhotoIdsChange],
  )

  const handleSelectAll = useCallback(() => {
    const currentPagePhotoIds = currentPagePhotos.map((p) => p.id)
    const allCurrentSelected = currentPagePhotoIds.every((id) => selectedPhotoIds.includes(id))

    if (allCurrentSelected) {
      onSelectedPhotoIdsChange(selectedPhotoIds.filter((id) => !currentPagePhotoIds.includes(id)))
    } else {
      const newSelection = [...new Set([...selectedPhotoIds, ...currentPagePhotoIds])]
      onSelectedPhotoIdsChange(newSelection)
    }
  }, [currentPagePhotos, selectedPhotoIds, onSelectedPhotoIdsChange])

  const handleDeselectAll = useCallback(() => {
    onSelectedPhotoIdsChange([])
  }, [onSelectedPhotoIdsChange])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.3))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleHideTools = () => {
    setHideTools(!hideTools)
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
            <Camera className="h-10 w-10 text-gray-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos uploaded yet</h3>
        <p className="text-gray-600 mb-6">Upload some photos to start editing and organizing them</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3"
        >
          <Camera className="w-4 h-4 mr-2" />
          Go to Upload
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="glass-effect rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Photo Editor</h2>
                <p className="text-sm text-gray-600">Organize and customize your photos</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "preview" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("preview")}
                className={`rounded-xl transition-all ${
                  viewMode === "preview"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            >
              Select All Page
            </Button>
            {selectedPhotoIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                Deselect All
              </Button>
            )}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl border border-blue-200">
              <span className="text-sm font-medium text-blue-800">{selectedPhotoIds.length} selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Display */}
      <div className="glass-effect rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6">
          {viewMode === "preview" ? (
            <PhotoPreviewLayout
              photos={currentPagePhotos}
              selectedPhotoIds={selectedPhotoIds}
              onPhotoSelect={handlePhotoSelect}
              layoutSettings={layoutSettings}
              selectedSize={selectedSize}
              zoomLevel={zoomLevel}
              hideTools={hideTools}
              isFullscreen={isFullscreen}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onToggleFullscreen={toggleFullscreen}
              onToggleHideTools={toggleHideTools}
            />
          ) : (
            <PhotoGridLayout
              photos={currentPagePhotos}
              selectedPhotoIds={selectedPhotoIds}
              onPhotoSelect={handlePhotoSelect}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="glass-effect rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="mx-2">•</span>
              <span>{currentPagePhotos.length} photos on this page</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium">
                {currentPage + 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Photo Preview Layout Component (A4 simulation) - FIXED: Removed border-radius from images
function PhotoPreviewLayout({
  photos,
  selectedPhotoIds,
  onPhotoSelect,
  layoutSettings,
  selectedSize,
  zoomLevel = 0.7,
  hideTools = false,
  isFullscreen = false,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleHideTools,
}: {
  photos: PhotoData[]
  selectedPhotoIds: string[]
  onPhotoSelect: (photoId: string, selected: boolean) => void
  layoutSettings: LayoutSettings
  selectedSize: PhotoSize
  zoomLevel?: number
  hideTools?: boolean
  isFullscreen?: boolean
  onZoomIn?: () => void
  onZoomOut?: () => void
  onToggleFullscreen?: () => void
  onToggleHideTools?: () => void
}) {
  const A4_ASPECT_RATIO = 210 / 297
  const maxWidth = isFullscreen ? window.innerWidth * 0.9 : 700
  const maxHeight = isFullscreen ? window.innerHeight * 0.9 : 900

  let a4Width, a4Height

  if (maxWidth / maxHeight > A4_ASPECT_RATIO) {
    a4Height = maxHeight * zoomLevel
    a4Width = a4Height * A4_ASPECT_RATIO
  } else {
    a4Width = maxWidth * zoomLevel
    a4Height = a4Width / A4_ASPECT_RATIO
  }

  const scale = a4Width / A4_WIDTH_MM

  let currentX = layoutSettings.gap
  let currentY = layoutSettings.gap
  let rowHeight = 0

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
          : "flex flex-col items-center"
      }`}
    >
      <div className="flex justify-center flex-1 items-center">
        <div
          className="relative bg-white border-2 border-gray-300 shadow-2xl rounded-lg overflow-hidden"
          style={{
            width: `${a4Width}px`,
            height: `${a4Height}px`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-30 pointer-events-none" />

          {photos.map((photo, index) => {
            if (currentX + photo.targetWidth > A4_WIDTH_MM - layoutSettings.gap) {
              currentX = layoutSettings.gap
              currentY += rowHeight + layoutSettings.gap
              rowHeight = 0
            }

            if (currentY + photo.targetHeight > 297 - layoutSettings.gap) {
              return null
            }

            const x = currentX * scale
            const y = currentY * scale
            const width = photo.targetWidth * scale
            const height = photo.targetHeight * scale

            currentX += photo.targetWidth + layoutSettings.gap
            rowHeight = Math.max(rowHeight, photo.targetHeight)

            return (
              <div
                key={photo.id}
                className={`absolute border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                  selectedPhotoIds.includes(photo.id)
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-200 scale-105"
                    : "border-gray-300 hover:border-gray-400 hover:shadow-md"
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: photo.backgroundColor,
                }}
                onClick={() => !hideTools && onPhotoSelect(photo.id, !selectedPhotoIds.includes(photo.id))}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={photo.processedUrl || "/placeholder.svg"}
                    alt="Photo"
                    className="max-w-full max-h-full object-cover"
                    style={{
                      // FIXED: Removed border-radius to show exact print representation
                      borderRadius: "0px",
                    }}
                  />
                </div>

                {!hideTools && (
                  <>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded-md z-10 font-medium">
                      #{index + 1}
                    </div>
                    <div className="absolute top-1 right-1 z-10">
                      <Checkbox
                        checked={selectedPhotoIds.includes(photo.id)}
                        onCheckedChange={(checked) => onPhotoSelect(photo.id, checked as boolean)}
                        className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {layoutSettings.outlineWidth > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 ${layoutSettings.outlineWidth}px ${layoutSettings.outlineColor}`,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`flex items-center gap-3 mt-6 p-4 glass-effect rounded-2xl shadow-lg border border-white/20 ${
          isFullscreen ? "fixed bottom-6 right-6" : ""
        }`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.3}
          className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center bg-gray-100 px-3 py-1 rounded-lg">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={zoomLevel >= 2.0}
          className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleHideTools}
          className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        >
          {hideTools ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {isFullscreen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          className="fixed top-6 right-6 glass-effect rounded-xl border-2 border-white/20"
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  )
}

// Photo Grid Layout Component
function PhotoGridLayout({
  photos,
  selectedPhotoIds,
  onPhotoSelect,
}: {
  photos: PhotoData[]
  selectedPhotoIds: string[]
  onPhotoSelect: (photoId: string, selected: boolean) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 aspect-square card-hover ${
            selectedPhotoIds.includes(photo.id)
              ? "border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-200"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
          onClick={() => onPhotoSelect(photo.id, !selectedPhotoIds.includes(photo.id))}
        >
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={selectedPhotoIds.includes(photo.id)}
              onCheckedChange={(checked) => onPhotoSelect(photo.id, checked as boolean)}
              className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
          </div>
          <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
            #{index + 1}
          </div>
          <img
            src={photo.processedUrl || "/placeholder.svg"}
            alt="Photo"
            className="w-full h-full object-cover"
            style={{
              transform: `rotate(${photo.rotation}deg) scaleX(${photo.flipHorizontal ? -1 : 1}) scaleY(${
                photo.flipVertical ? -1 : 1
              })`,
              backgroundColor: photo.backgroundColor,
            }}
          />
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded-md text-center font-medium">
            {photo.targetWidth}×{photo.targetHeight}mm
          </div>
        </div>
      ))}
    </div>
  )
}
