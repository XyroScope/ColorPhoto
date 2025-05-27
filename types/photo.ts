export interface PhotoData {
  id: string
  originalUrl: string
  processedUrl: string
  originalWidth: number
  originalHeight: number
  targetWidth: number
  targetHeight: number
  rotation: number
  flipHorizontal: boolean
  flipVertical: boolean
  backgroundColor: string
  cropArea: {
    x: number
    y: number
    width: number
    height: number
  }
  position: {
    x: number
    y: number
    page: number
  }
  duplicateCount: number
}

export interface PhotoSize {
  id: string
  name: string
  width: number
  height: number
  unit: string
  type: "passport" | "stamp" | "custom"
  icon?: string
}

export interface LayoutSettings {
  gap: number
  outlineColor: string
  outlineWidth: number
  alignment: "left" | "center" | "right" | "top"
  distribution: "horizontal-top" | "horizontal-center" | "horizontal-bottom" | "vertical-center"
}

export interface CustomSize {
  width: number
  height: number
  unit: "mm" | "inch"
}
