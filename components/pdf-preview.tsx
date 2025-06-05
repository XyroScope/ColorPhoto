"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Eye, ChevronLeft, ChevronRight, Printer, FileText, Sparkles } from "lucide-react"
import type { PhotoData, LayoutSettings } from "@/types/photo"
import { calculatePhotosPerPage } from "@/lib/utils"

interface PDFPreviewProps {
  photos: PhotoData[]
  layoutSettings: LayoutSettings
}

export default function PDFPreview({ photos, layoutSettings }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: HTMLImageElement }>({})
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0)

  // A4 dimensions in pixels at 300 DPI
  const A4_WIDTH_PX = 2480
  const A4_HEIGHT_PX = 3508
  const MM_TO_PX = 300 / 25.4

  const photosPerPage =
    photos.length > 0 ? calculatePhotosPerPage(photos[0].targetWidth, photos[0].targetHeight, layoutSettings.gap) : 0
  const totalPages = Math.ceil(photos.length / photosPerPage)

  useEffect(() => {
    preloadImages()
  }, [photos])

  useEffect(() => {
    if (Object.keys(loadedImages).length === photos.length && photos.length > 0) {
      drawPreview()
    }
  }, [photos, layoutSettings, loadedImages, currentPreviewPage])

  const preloadImages = async () => {
    if (photos.length === 0) return

    const imagePromises = photos.map((photo) => {
      return new Promise<{ id: string; img: HTMLImageElement }>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve({ id: photo.id, img })
        img.onerror = reject
        img.src = photo.processedUrl || photo.originalUrl
      })
    })

    try {
      const results = await Promise.all(imagePromises)
      const imageMap: { [key: string]: HTMLImageElement } = {}
      results.forEach(({ id, img }) => {
        imageMap[id] = img
      })
      setLoadedImages(imageMap)
    } catch (error) {
      console.error("Error loading images:", error)
    }
  }

  const drawPreview = () => {
    const canvas = canvasRef.current
    if (!canvas || photos.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = 0.3
    canvas.width = A4_WIDTH_PX * scale
    canvas.height = A4_HEIGHT_PX * scale
    ctx.scale(scale, scale)

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX)

    const startIndex = currentPreviewPage * photosPerPage
    const endIndex = startIndex + photosPerPage
    const pagePhotos = photos.slice(startIndex, endIndex)

    const gapPx = layoutSettings.gap * MM_TO_PX
    let currentX = gapPx
    let currentY = gapPx
    let rowHeight = 0

    pagePhotos.forEach((photo, index) => {
      const photoWidthPx = photo.targetWidth * MM_TO_PX
      const photoHeightPx = photo.targetHeight * MM_TO_PX

      if (currentX + photoWidthPx > A4_WIDTH_PX - gapPx) {
        currentX = gapPx
        currentY += rowHeight + gapPx
        rowHeight = 0
      }

      if (currentY + photoHeightPx > A4_HEIGHT_PX - gapPx) {
        return
      }

      ctx.fillStyle = photo.backgroundColor
      ctx.fillRect(currentX, currentY, photoWidthPx, photoHeightPx)

      const img = loadedImages[photo.id]
      if (img) {
        ctx.save()

        const centerX = currentX + photoWidthPx / 2
        const centerY = currentY + photoHeightPx / 2

        ctx.translate(centerX, centerY)

        if (photo.rotation !== 0) {
          ctx.rotate((photo.rotation * Math.PI) / 180)
        }
        if (photo.flipHorizontal || photo.flipVertical) {
          ctx.scale(photo.flipHorizontal ? -1 : 1, photo.flipVertical ? -1 : 1)
        }

        ctx.drawImage(img, -photoWidthPx / 2, -photoHeightPx / 2, photoWidthPx, photoHeightPx)

        ctx.restore()
      }

      if (layoutSettings.outlineWidth > 0) {
        ctx.strokeStyle = layoutSettings.outlineColor
        ctx.lineWidth = layoutSettings.outlineWidth
        ctx.strokeRect(
          currentX + layoutSettings.outlineWidth / 2,
          currentY + layoutSettings.outlineWidth / 2,
          photoWidthPx - layoutSettings.outlineWidth,
          photoHeightPx - layoutSettings.outlineWidth,
        )
      }

      currentX += photoWidthPx + gapPx
      rowHeight = Math.max(rowHeight, photoHeightPx)
    })
  }

  const createImageWithBackground = (imageUrl: string, backgroundColor: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        const finalBackgroundColor = backgroundColor || "#ffffff"

        ctx.fillStyle = finalBackgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.drawImage(img, 0, 0)

        try {
          const dataURL = canvas.toDataURL("image/jpeg", 0.95)
          resolve(dataURL)
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = (error) => {
        console.error("Error loading image for background processing:", error)
        reject(new Error("Failed to load image"))
      }
      img.src = imageUrl
    })
  }

  const generatePDF = async () => {
    if (photos.length === 0) return

    setIsGenerating(true)

    try {
      const { jsPDF } = await import("jspdf")

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true,
      })

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage()
        }

        const startIndex = pageIndex * photosPerPage
        const endIndex = startIndex + photosPerPage
        const pagePhotos = photos.slice(startIndex, endIndex)

        const gapMm = layoutSettings.gap
        let currentX = gapMm
        let currentY = gapMm
        let rowHeight = 0

        for (const photo of pagePhotos) {
          const photoWidth = photo.targetWidth
          const photoHeight = photo.targetHeight

          if (currentX + photoWidth > 210 - gapMm) {
            currentX = gapMm
            currentY += rowHeight + gapMm
            rowHeight = 0
          }

          if (currentY + photoHeight > 297 - gapMm) {
            break
          }

          try {
            const imageUrl = photo.processedUrl || photo.originalUrl
            const imageWithBackground = await createImageWithBackground(imageUrl, photo.backgroundColor)

            pdf.addImage(imageWithBackground, "JPEG", currentX, currentY, photoWidth, photoHeight, undefined, "FAST")
          } catch (error) {
            console.error("Error adding image to PDF:", error)
            const rgb = hexToRgb(photo.backgroundColor || "#ffffff")
            if (rgb) {
              pdf.setFillColor(rgb.r, rgb.g, rgb.b)
            } else {
              pdf.setFillColor(255, 255, 255)
            }
            pdf.rect(currentX, currentY, photoWidth, photoHeight, "F")

            pdf.setFontSize(8)
            pdf.setTextColor(100, 100, 100)
            pdf.text("Image Error", currentX + photoWidth / 2, currentY + photoHeight / 2, { align: "center" })
          }

          if (layoutSettings.outlineWidth > 0) {
            const rgb = hexToRgb(layoutSettings.outlineColor)
            if (rgb) {
              pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
              pdf.setLineWidth(layoutSettings.outlineWidth * 0.1)
              const outlineOffset = (layoutSettings.outlineWidth * 0.1) / 2
              pdf.rect(
                currentX + outlineOffset,
                currentY + outlineOffset,
                photoWidth - layoutSettings.outlineWidth * 0.1,
                photoHeight - layoutSettings.outlineWidth * 0.1,
                "S",
              )
            }
          }

          currentX += photoWidth + gapMm
          rowHeight = Math.max(rowHeight, photoHeight)
        }
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      pdf.save(`Sheba-Studio-${timestamp}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }

    setIsGenerating(false)
  }

  const printPDF = async () => {
    if (photos.length === 0) return

    setIsGenerating(true)

    try {
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true,
      })

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage()
        }

        const startIndex = pageIndex * photosPerPage
        const endIndex = startIndex + photosPerPage
        const pagePhotos = photos.slice(startIndex, endIndex)

        const gapMm = layoutSettings.gap
        let currentX = gapMm
        let currentY = gapMm
        let rowHeight = 0

        for (const photo of pagePhotos) {
          const photoWidth = photo.targetWidth
          const photoHeight = photo.targetHeight

          if (currentX + photoWidth > 210 - gapMm) {
            currentX = gapMm
            currentY += rowHeight + gapMm
            rowHeight = 0
          }

          if (currentY + photoHeight > 297 - gapMm) {
            break
          }

          try {
            const imageUrl = photo.processedUrl || photo.originalUrl
            const imageWithBackground = await createImageWithBackground(imageUrl, photo.backgroundColor)

            pdf.addImage(imageWithBackground, "JPEG", currentX, currentY, photoWidth, photoHeight, undefined, "FAST")
          } catch (error) {
            console.error("Error adding image to PDF:", error)
            const rgb = hexToRgb(photo.backgroundColor || "#ffffff")
            if (rgb) {
              pdf.setFillColor(rgb.r, rgb.g, rgb.b)
            } else {
              pdf.setFillColor(255, 255, 255)
            }
            pdf.rect(currentX, currentY, photoWidth, photoHeight, "F")

            pdf.setFontSize(8)
            pdf.setTextColor(100, 100, 100)
            pdf.text("Image Error", currentX + photoWidth / 2, currentY + photoHeight / 2, { align: "center" })
          }

          if (layoutSettings.outlineWidth > 0) {
            const rgb = hexToRgb(layoutSettings.outlineColor)
            if (rgb) {
              pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
              pdf.setLineWidth(layoutSettings.outlineWidth * 0.1)
              const outlineOffset = (layoutSettings.outlineWidth * 0.1) / 2
              pdf.rect(
                currentX + outlineOffset,
                currentY + outlineOffset,
                photoWidth - layoutSettings.outlineWidth * 0.1,
                photoHeight - layoutSettings.outlineWidth * 0.1,
                "S",
              )
            }
          }

          currentX += photoWidth + gapMm
          rowHeight = Math.max(rowHeight, photoHeight)
        }
      }

      const pdfBlob = pdf.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)

      const printWindow = window.open(pdfUrl)
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (error) {
      console.error("Error printing PDF:", error)
      alert("Error printing PDF. Please try again.")
    }

    setIsGenerating(false)
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
            <FileText className="h-10 w-10 text-gray-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos to preview</h3>
        <p className="text-gray-600 mb-6">Add some photos to see the PDF layout and generate your print-ready file</p>
        <div className="flex justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-6 py-3"
          >
            <Eye className="w-4 h-4 mr-2" />
            Go to Upload
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                PDF Preview
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </h2>
              <p className="text-sm text-gray-600">A4 Layout • 300 DPI • Print Ready</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={printPDF}
              disabled={isGenerating}
              variant="outline"
              className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print PDF
            </Button>
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="glass-effect rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-300 shadow-xl rounded-lg"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="loading-spinner mx-auto mb-3" style={{ width: "32px", height: "32px" }} />
                    <p className="text-sm font-medium text-gray-700">Generating PDF...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-6 text-center space-y-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200/50">
              <p className="text-sm text-blue-800 font-medium">
                📄 Preview shows {photos.length} photos arranged on A4 paper (300 DPI)
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-blue-700">
                <span>Gap: {layoutSettings.gap}mm</span>
                <span>•</span>
                <span>Outline: {layoutSettings.outlineWidth}px</span>
                <span>•</span>
                <span>Pages: {totalPages}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-3 border border-green-200/50">
              <p className="text-xs text-green-700 flex items-center justify-center gap-2">
                <span className="text-green-500">✓</span>
                All transformations and layout will be preserved in the generated PDF
              </p>
            </div>
          </div>

          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1))}
                disabled={currentPreviewPage === 0}
                className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium">
                Page {currentPreviewPage + 1} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPreviewPage(Math.min(totalPages - 1, currentPreviewPage + 1))}
                disabled={currentPreviewPage === totalPages - 1}
                className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
