"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Stamp, Ruler, Smartphone, Monitor, Sparkles } from "lucide-react"
import type { PhotoSize, CustomSize } from "@/types/photo"

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

interface PhotoSizeSelectorProps {
  selectedSize: PhotoSize
  onSizeChange: (size: PhotoSize) => void
}

export default function PhotoSizeSelector({ selectedSize, onSizeChange }: PhotoSizeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customSize, setCustomSize] = useState<CustomSize>({ width: 0, height: 0, unit: "mm" })

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

  const handleCustomSizeApply = () => {
    if (customSize.width <= 0 || customSize.height <= 0) {
      alert("Please enter valid width and height values greater than 0")
      return
    }

    const customPhotoSize: PhotoSize = {
      id: "custom",
      name: `Custom ${customSize.width}×${customSize.height}${customSize.unit}`,
      width: customSize.unit === "inch" ? customSize.width * 25.4 : customSize.width,
      height: customSize.unit === "inch" ? customSize.height * 25.4 : customSize.height,
      unit: "mm",
      type: "custom",
      icon: "Ruler",
    }
    onSizeChange(customPhotoSize)
    setShowCustom(false)
  }

  const handleCustomSizeSelect = () => {
    const noSizeApplied: PhotoSize = {
      id: "custom-pending",
      name: "Custom Size (Not Applied)",
      width: 0,
      height: 0,
      unit: "mm",
      type: "custom",
      icon: "Ruler",
    }
    onSizeChange(noSizeApplied)
    setShowCustom(true)
  }

  const isCustomSizeValid = customSize.width > 0 && customSize.height > 0

  return (
    <div className="glass-effect rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <h3 className="font-semibold text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Ruler className="h-4 w-4 text-white" />
          </div>
          Photo Sizes
        </h3>
        <p className="text-blue-100 text-sm mt-1">Choose your preferred photo dimensions</p>
      </div>

      <div className="p-6 space-y-4">
        {DEFAULT_PHOTO_SIZES.map((size) => (
          <div key={size.id} className="space-y-3">
            <Button
              variant="ghost"
              className={`w-full justify-start h-auto py-4 px-4 rounded-xl transition-all duration-200 ${
                selectedSize.type === size.type && selectedSize.id !== "custom-pending"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-700"
                  : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
              }`}
              onClick={() => onSizeChange(size)}
            >
              <div className="flex items-center gap-4 w-full">
                <div
                  className={`p-3 rounded-xl transition-colors ${
                    selectedSize.type === size.type && selectedSize.id !== "custom-pending"
                      ? "bg-white/20"
                      : "bg-gray-100"
                  }`}
                >
                  {size.icon && getIcon(size.icon)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base">{size.name}</div>
                  <div
                    className={`text-sm ${
                      selectedSize.type === size.type && selectedSize.id !== "custom-pending"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {size.width} × {size.height} mm
                  </div>
                </div>
                {selectedSize.type === size.type && selectedSize.id !== "custom-pending" && (
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </Button>

            {/* Orientation buttons for selected type */}
            {selectedSize.type === size.type && selectedSize.id !== "custom-pending" && (
              <div className="grid grid-cols-2 gap-3 ml-4 animate-fade-in">
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl transition-all ${
                    selectedSize.width < selectedSize.height
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() =>
                    onSizeChange({
                      ...size,
                      id: `${size.type}-portrait`,
                      name: `${size.name} Portrait`,
                      width: Math.min(size.width, size.height),
                      height: Math.max(size.width, size.height),
                    })
                  }
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Portrait
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl transition-all ${
                    selectedSize.width > selectedSize.height
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() =>
                    onSizeChange({
                      ...size,
                      id: `${size.type}-landscape`,
                      name: `${size.name} Landscape`,
                      width: Math.max(size.width, size.height),
                      height: Math.min(size.width, size.height),
                    })
                  }
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Landscape
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Custom Size Option */}
        <div className="border-t border-gray-200 pt-6">
          {!showCustom ? (
            <Button
              variant="ghost"
              className={`w-full justify-start h-auto py-4 px-4 rounded-xl transition-all duration-200 ${
                selectedSize.id === "custom" || selectedSize.id === "custom-pending"
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:from-purple-600 hover:to-violet-700"
                  : "border-2 border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50 bg-white"
              }`}
              onClick={handleCustomSizeSelect}
            >
              <div className="flex items-center gap-4 w-full">
                <div
                  className={`p-3 rounded-xl transition-colors ${
                    selectedSize.id === "custom" || selectedSize.id === "custom-pending" ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  <Ruler className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base flex items-center gap-2">
                    Custom Size
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {selectedSize.id === "custom" && (
                    <div className="text-sm text-purple-100">
                      {selectedSize.width} × {selectedSize.height} {selectedSize.unit}
                    </div>
                  )}
                  {selectedSize.id === "custom-pending" && (
                    <div className="text-sm text-purple-100">Not Applied - Original sizes will be used</div>
                  )}
                  {selectedSize.id !== "custom" && selectedSize.id !== "custom-pending" && (
                    <div className="text-sm text-gray-500">Set your own dimensions</div>
                  )}
                </div>
                {(selectedSize.id === "custom" || selectedSize.id === "custom-pending") && (
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </Button>
          ) : (
            <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border-2 border-purple-200/50 animate-fade-in">
              <div className="text-center">
                <h4 className="font-semibold text-purple-900 text-lg mb-2">Custom Size Configuration</h4>
                <p className="text-sm text-purple-700">
                  Leave fields empty to use original photo dimensions, or enter custom values to resize photos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm font-medium text-purple-800 mb-2 block">
                    Width
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={customSize.width || ""}
                    onChange={(e) => setCustomSize((prev) => ({ ...prev, width: Number(e.target.value) || 0 }))}
                    min="1"
                    max="200"
                    step="0.1"
                    className="rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white"
                    placeholder="Enter width"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm font-medium text-purple-800 mb-2 block">
                    Height
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={customSize.height || ""}
                    onChange={(e) => setCustomSize((prev) => ({ ...prev, height: Number(e.target.value) || 0 }))}
                    min="1"
                    max="280"
                    step="0.1"
                    className="rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white"
                    placeholder="Enter height"
                  />
                </div>
              </div>

              <Select
                value={customSize.unit}
                onValueChange={(value: "mm" | "inch") => setCustomSize((prev) => ({ ...prev, unit: value }))}
              >
                <SelectTrigger className="rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">Millimeters (mm)</SelectItem>
                  <SelectItem value="inch">Inches (in)</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-3">
                <Button
                  onClick={handleCustomSizeApply}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl py-3 font-medium shadow-lg"
                  disabled={!isCustomSizeValid}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply Custom Size
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCustom(false)}
                  className="px-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                >
                  Cancel
                </Button>
              </div>

              {!isCustomSizeValid && customSize.width === 0 && customSize.height === 0 && (
                <div className="text-sm text-blue-700 bg-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">💡</span>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Pro Tip</p>
                      <p className="text-xs">
                        Leave fields empty to use original photo dimensions when uploading. You can always change sizes
                        later!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
