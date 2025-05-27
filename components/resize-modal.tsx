"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Expand, Lock, Unlock } from "lucide-react"
import type { PhotoData } from "@/types/photo"

interface ResizeModalProps {
  photo: PhotoData
  onSave: (updates: Partial<PhotoData>) => void
  onClose: () => void
}

export default function ResizeModal({ photo, onSave, onClose }: ResizeModalProps) {
  const [width, setWidth] = useState(photo.targetWidth)
  const [height, setHeight] = useState(photo.targetHeight)
  const [unit, setUnit] = useState<"mm" | "inch">("mm")
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)

  const originalAspectRatio = photo.targetWidth / photo.targetHeight

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspectRatio) {
      setHeight(Math.round((newWidth / originalAspectRatio) * 100) / 100)
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * originalAspectRatio * 100) / 100)
    }
  }

  const handleSave = () => {
    const finalWidth = unit === "inch" ? width * 25.4 : width
    const finalHeight = unit === "inch" ? height * 25.4 : height

    onSave({
      targetWidth: finalWidth,
      targetHeight: finalHeight,
    })
  }

  const convertToUnit = (value: number, fromMm: boolean) => {
    if (unit === "inch" && fromMm) {
      return Math.round((value / 25.4) * 100) / 100
    } else if (unit === "mm" && !fromMm) {
      return Math.round(value * 25.4 * 100) / 100
    }
    return value
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Expand className="h-5 w-5" />
            Resize Photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Current size: {photo.targetWidth}×{photo.targetHeight}mm
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={(value: "mm" | "inch") => setUnit(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">Millimeters (mm)</SelectItem>
                <SelectItem value="inch">Inches (in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={convertToUnit(width, true)}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                min="1"
                max={unit === "mm" ? "200" : "8"}
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={convertToUnit(height, true)}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                min="1"
                max={unit === "mm" ? "280" : "11"}
                step="0.1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
              className="flex items-center gap-2"
            >
              {maintainAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {maintainAspectRatio ? "Locked" : "Unlocked"}
            </Button>
            <span className="text-sm text-gray-600">Aspect Ratio</span>
          </div>

          <div className="text-sm text-gray-600">
            New size: {Math.round(width * 100) / 100}×{Math.round(height * 100) / 100}mm
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply Resize</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
