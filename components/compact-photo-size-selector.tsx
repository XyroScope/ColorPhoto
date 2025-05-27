"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Stamp, Ruler, Smartphone, Monitor, Plus } from "lucide-react"
import type { PhotoSize, CustomSize } from "@/types/photo"

const DEFAULT_PHOTO_SIZES: PhotoSize[] = [
  {
    id: "passport",
    name: "Passport",
    width: 40,
    height: 50,
    unit: "mm",
    type: "passport",
    icon: "CreditCard",
  },
  {
    id: "stamp",
    name: "Stamp",
    width: 22,
    height: 27,
    unit: "mm",
    type: "stamp",
    icon: "Stamp",
  },
]

interface CompactPhotoSizeSelectorProps {
  selectedSize: PhotoSize
  onSizeChange: (size: PhotoSize) => void
}

export default function CompactPhotoSizeSelector({ selectedSize, onSizeChange }: CompactPhotoSizeSelectorProps) {
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
      alert("Enter valid dimensions")
      return
    }

    const customPhotoSize: PhotoSize = {
      id: "custom",
      name: `${customSize.width}×${customSize.height}${customSize.unit}`,
      width: customSize.unit === "inch" ? customSize.width * 25.4 : customSize.width,
      height: customSize.unit === "inch" ? customSize.height * 25.4 : customSize.height,
      unit: "mm",
      type: "custom",
      icon: "Ruler",
    }
    onSizeChange(customPhotoSize)
    setShowCustom(false)
  }

  return (
    <div className="glass-effect rounded-xl shadow-lg border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Photo Sizes
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {DEFAULT_PHOTO_SIZES.map((size) => (
          <div key={size.id} className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all duration-200 ${
                selectedSize.type === size.type && selectedSize.id !== "custom-pending"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "border border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
              }`}
              onClick={() => onSizeChange(size)}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    selectedSize.type === size.type && selectedSize.id !== "custom-pending"
                      ? "bg-white/20"
                      : "bg-gray-100"
                  }`}
                >
                  {size.icon && getIcon(size.icon)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{size.name}</div>
                  <div
                    className={`text-xs ${
                      selectedSize.type === size.type && selectedSize.id !== "custom-pending"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {size.width}×{size.height}mm
                  </div>
                </div>
              </div>
            </Button>

            {/* Orientation buttons */}
            {selectedSize.type === size.type && selectedSize.id !== "custom-pending" && (
              <div className="grid grid-cols-2 gap-2 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-lg text-xs ${
                    selectedSize.width < selectedSize.height
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() =>
                    onSizeChange({
                      ...size,
                      id: `${size.type}-portrait`,
                      name: `${size.name}`,
                      width: Math.min(size.width, size.height),
                      height: Math.max(size.width, size.height),
                    })
                  }
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  Portrait
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-lg text-xs ${
                    selectedSize.width > selectedSize.height
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() =>
                    onSizeChange({
                      ...size,
                      id: `${size.type}-landscape`,
                      name: `${size.name}`,
                      width: Math.max(size.width, size.height),
                      height: Math.min(size.width, size.height),
                    })
                  }
                >
                  <Monitor className="w-3 h-3 mr-1" />
                  Landscape
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Custom Size */}
        <div className="border-t border-gray-200 pt-3">
          {!showCustom ? (
            <Button
              variant="ghost"
              className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all duration-200 ${
                selectedSize.id === "custom" || selectedSize.id === "custom-pending"
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
                  : "border border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50 bg-white"
              }`}
              onClick={() => setShowCustom(true)}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    selectedSize.id === "custom" || selectedSize.id === "custom-pending" ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">Custom</div>
                  {selectedSize.id === "custom" && (
                    <div className="text-xs text-purple-100">
                      {selectedSize.width}×{selectedSize.height}mm
                    </div>
                  )}
                  {selectedSize.id !== "custom" && selectedSize.id !== "custom-pending" && (
                    <div className="text-xs text-gray-500">Set dimensions</div>
                  )}
                </div>
              </div>
            </Button>
          ) : (
            <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg border border-purple-200/50">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={customSize.width || ""}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, width: Number(e.target.value) || 0 }))}
                  placeholder="Width"
                  className="text-sm"
                />
                <Input
                  type="number"
                  value={customSize.height || ""}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, height: Number(e.target.value) || 0 }))}
                  placeholder="Height"
                  className="text-sm"
                />
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

              <div className="flex gap-2">
                <Button
                  onClick={handleCustomSizeApply}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg py-2 text-sm"
                  disabled={customSize.width <= 0 || customSize.height <= 0}
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCustom(false)}
                  className="px-4 rounded-lg border border-purple-200 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
