"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCw, FlipHorizontal, FlipVertical, Trash2, Crop, Palette, Scissors } from "lucide-react"
import type { PhotoData, PhotoSize } from "@/types/photo"
import PhotoCropModal from "@/components/photo-crop-modal"
import BackgroundRemovalModal from "@/components/background-removal-modal"

interface PhotoEditorProps {
  photos: PhotoData[]
  selectedPhotoIds: string[]
  onSelectedPhotoIdsChange: (ids: string[]) => void
  onPhotoUpdate: (photoId: string, updates: Partial<PhotoData>) => void
  onPhotoDelete: (photoId: string) => void
  onBatchEdit: (updates: Partial<PhotoData>) => void
  selectedSize: PhotoSize
}

export default function PhotoEditor({
  photos,
  selectedPhotoIds,
  onSelectedPhotoIdsChange,
  onPhotoUpdate,
  onPhotoDelete,
  onBatchEdit,
  selectedSize,
}: PhotoEditorProps) {
  const [cropModalPhoto, setCropModalPhoto] = useState<PhotoData | null>(null)
  const [backgroundModalPhoto, setBackgroundModalPhoto] = useState<PhotoData | null>(null)

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
    if (selectedPhotoIds.length === photos.length) {
      onSelectedPhotoIdsChange([])
    } else {
      onSelectedPhotoIdsChange(photos.map((p) => p.id))
    }
  }, [photos, selectedPhotoIds, onSelectedPhotoIdsChange])

  const handleRotate = useCallback(
    (photoId?: string) => {
      if (photoId) {
        const photo = photos.find((p) => p.id === photoId)
        if (photo) {
          onPhotoUpdate(photoId, { rotation: (photo.rotation + 90) % 360 })
        }
      } else {
        onBatchEdit({ rotation: 90 })
      }
    },
    [photos, onPhotoUpdate, onBatchEdit],
  )

  const handleFlip = useCallback(
    (direction: "horizontal" | "vertical", photoId?: string) => {
      if (photoId) {
        const photo = photos.find((p) => p.id === photoId)
        if (photo) {
          const update =
            direction === "horizontal"
              ? { flipHorizontal: !photo.flipHorizontal }
              : { flipVertical: !photo.flipVertical }
          onPhotoUpdate(photoId, update)
        }
      } else {
        const update = direction === "horizontal" ? { flipHorizontal: true } : { flipVertical: true }
        onBatchEdit(update)
      }
    },
    [photos, onPhotoUpdate, onBatchEdit],
  )

  const handleBackgroundColorChange = useCallback(
    (color: string, photoId?: string) => {
      if (photoId) {
        onPhotoUpdate(photoId, { backgroundColor: color })
      } else {
        onBatchEdit({ backgroundColor: color })
      }
    },
    [onPhotoUpdate, onBatchEdit],
  )

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-gray-500">
            <p className="text-lg">No photos uploaded yet</p>
            <p>Upload some photos to start editing</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Batch Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Batch Edit ({selectedPhotoIds.length} selected)</span>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedPhotoIds.length === photos.length ? "Deselect All" : "Select All"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleRotate()} disabled={selectedPhotoIds.length === 0}>
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate 90°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlip("horizontal")}
              disabled={selectedPhotoIds.length === 0}
            >
              <FlipHorizontal className="h-4 w-4 mr-2" />
              Flip H
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlip("vertical")}
              disabled={selectedPhotoIds.length === 0}
            >
              <FlipVertical className="h-4 w-4 mr-2" />
              Flip V
            </Button>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <input
                type="color"
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                disabled={selectedPhotoIds.length === 0}
                className="w-8 h-8 rounded border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedPhotoIds.includes(photo.id)}
                    onCheckedChange={(checked) => handlePhotoSelect(photo.id, checked as boolean)}
                  />
                </div>
                <img
                  src={photo.processedUrl || "/placeholder.svg"}
                  alt="Photo"
                  className="w-full h-48 object-cover"
                  style={{
                    transform: `rotate(${photo.rotation}deg) scaleX(${photo.flipHorizontal ? -1 : 1}) scaleY(${photo.flipVertical ? -1 : 1})`,
                    backgroundColor: photo.backgroundColor,
                  }}
                />
              </div>
              <div className="p-3 space-y-2">
                <div className="text-xs text-gray-500">
                  Target: {photo.targetWidth}×{photo.targetHeight}mm
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCropModalPhoto(photo)}>
                    <Crop className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRotate(photo.id)}>
                    <RotateCw className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleFlip("horizontal", photo.id)}>
                    <FlipHorizontal className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setBackgroundModalPhoto(photo)}>
                    <Scissors className="h-3 w-3" />
                  </Button>
                  <input
                    type="color"
                    value={photo.backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value, photo.id)}
                    className="w-6 h-6 rounded border"
                  />
                  <Button variant="destructive" size="sm" onClick={() => onPhotoDelete(photo.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      {cropModalPhoto && (
        <PhotoCropModal
          photo={cropModalPhoto}
          targetSize={selectedSize}
          onSave={(updates) => {
            onPhotoUpdate(cropModalPhoto.id, updates)
            setCropModalPhoto(null)
          }}
          onClose={() => setCropModalPhoto(null)}
        />
      )}

      {backgroundModalPhoto && (
        <BackgroundRemovalModal
          photo={backgroundModalPhoto}
          onSave={(updates) => {
            onPhotoUpdate(backgroundModalPhoto.id, updates)
            setBackgroundModalPhoto(null)
          }}
          onClose={() => setBackgroundModalPhoto(null)}
        />
      )}
    </div>
  )
}
