"use client"

import { useState, useCallback, useEffect, lazy, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import LoadingScreen from "@/components/loading-screen"
import CompactPhotoUpload from "@/components/compact-photo-upload"
import CompactPhotoSizeSelector from "@/components/compact-photo-size-selector"
import Footer from "@/components/footer"
import type { PhotoData, PhotoSize, LayoutSettings } from "@/types/photo"
import { generateId, calculatePhotoPosition } from "@/lib/utils"
import { Upload, Edit3, FileText, Menu, X, Sparkles } from "lucide-react"

// Lazy load heavy components
const EnhancedPhotoEditor = lazy(() => import("@/components/enhanced-photo-editor"))
const PDFPreview = lazy(() => import("@/components/pdf-preview"))
const FloatingToolkit = lazy(() => import("@/components/floating-toolkit"))
const EnhancedCropModal = lazy(() => import("@/components/enhanced-crop-modal"))
const EnhancedBackgroundRemoval = lazy(() => import("@/components/enhanced-background-removal"))
const ResizeModal = lazy(() => import("@/components/resize-modal"))

const DEFAULT_PHOTO_SIZES: PhotoSize[] = [
  {
    id: "passport-v",
    name: "Passport",
    width: 40,
    height: 50,
    unit: "mm",
    type: "passport",
    icon: "CreditCard",
  },
]

export default function PassportPhotoPrinter() {
  const [isLoading, setIsLoading] = useState(true)
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<PhotoSize>(DEFAULT_PHOTO_SIZES[0])
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    gap: 1,
    outlineColor: "#000000",
    outlineWidth: 1,
    alignment: "left",
    distribution: "horizontal-top",
  })
  const [activeTab, setActiveTab] = useState("upload")
  const [cropModalPhoto, setCropModalPhoto] = useState<PhotoData | null>(null)
  const [backgroundModalPhoto, setBackgroundModalPhoto] = useState<PhotoData | null>(null)
  const [resizeModalPhoto, setResizeModalPhoto] = useState<PhotoData | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const pixelsToMm = (pixels: number) => {
    return Math.round(((pixels * 25.4) / 300) * 100) / 100
  }

  const handlePhotosUploaded = useCallback(
    (newPhotos: PhotoData[]) => {
      const photosWithPositions = newPhotos.map((photo, index) => {
        let targetWidth: number
        let targetHeight: number

        if (selectedSize.id === "custom-pending" || (selectedSize.width === 0 && selectedSize.height === 0)) {
          targetWidth = pixelsToMm(photo.originalWidth)
          targetHeight = pixelsToMm(photo.originalHeight)
        } else {
          targetWidth = selectedSize.width
          targetHeight = selectedSize.height
        }

        const position = calculatePhotoPosition(photos.length + index, targetWidth, targetHeight, layoutSettings.gap)

        return {
          ...photo,
          targetWidth,
          targetHeight,
          position,
          duplicateCount: 1,
        }
      })
      setPhotos((prev) => [...prev, ...photosWithPositions])
      setActiveTab("edit")
    },
    [photos.length, layoutSettings.gap, selectedSize],
  )

  const handlePhotoUpdate = useCallback((photoId: string, updates: Partial<PhotoData>) => {
    setPhotos((prev) => prev.map((photo) => (photo.id === photoId ? { ...photo, ...updates } : photo)))
  }, [])

  const handlePhotoDelete = useCallback((photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
    setSelectedPhotoIds((prev) => prev.filter((id) => id !== photoId))
  }, [])

  const handleSizeChange = useCallback(
    (size: PhotoSize) => {
      setSelectedSize(size)
      if (selectedPhotoIds.length > 0) {
        selectedPhotoIds.forEach((photoId) => {
          const photo = photos.find((p) => p.id === photoId)
          if (photo) {
            let targetWidth: number
            let targetHeight: number

            if (size.id === "custom-pending" || (size.width === 0 && size.height === 0)) {
              targetWidth = pixelsToMm(photo.originalWidth)
              targetHeight = pixelsToMm(photo.originalHeight)
            } else {
              targetWidth = size.width
              targetHeight = size.height
            }

            handlePhotoUpdate(photoId, {
              targetWidth,
              targetHeight,
            })
          }
        })
      }
    },
    [selectedPhotoIds, handlePhotoUpdate, photos],
  )

  const handleBatchEdit = useCallback(
    async (updates: Partial<PhotoData>) => {
      for (const photoId of selectedPhotoIds) {
        const photo = photos.find((p) => p.id === photoId)
        if (!photo) continue

        let processedUpdates = { ...updates }

        if (updates.rotation !== undefined) {
          const newRotation = (photo.rotation + updates.rotation) % 360
          try {
            const { combineTransforms } = await import("@/lib/image-processing")
            const newProcessedUrl = await combineTransforms(
              photo.originalUrl,
              newRotation,
              photo.flipHorizontal,
              photo.flipVertical,
            )
            processedUpdates = {
              ...processedUpdates,
              rotation: 0,
              processedUrl: newProcessedUrl,
            }
          } catch (error) {
            console.error("Error processing image:", error)
            processedUpdates.rotation = newRotation
          }
        }

        handlePhotoUpdate(photoId, processedUpdates)
      }
    },
    [selectedPhotoIds, photos, handlePhotoUpdate],
  )

  const handleDuplicatePhotos = useCallback(
    (photoIds: string[], count: number) => {
      const duplicates: PhotoData[] = []
      photoIds.forEach((photoId) => {
        const originalPhoto = photos.find((p) => p.id === photoId)
        if (originalPhoto) {
          for (let i = 0; i < count; i++) {
            const duplicate: PhotoData = {
              ...originalPhoto,
              id: generateId(),
              duplicateCount: originalPhoto.duplicateCount + i + 1,
            }
            duplicates.push(duplicate)
          }
        }
      })
      setPhotos((prev) => [...prev, ...duplicates])
    },
    [photos],
  )

  const handleAlignPhotos = useCallback(
    (alignment: string) => {
      // Implementation for alignment
    },
    [selectedPhotoIds, photos, handlePhotoUpdate],
  )

  const handleDistributePhotos = useCallback(
    (distribution: string) => {
      // Implementation for distribution
    },
    [selectedPhotoIds, photos, handlePhotoUpdate],
  )

  const handleLayoutSettingsChange = useCallback((settings: Partial<LayoutSettings>) => {
    setLayoutSettings((prev) => ({ ...prev, ...settings }))
  }, [])

  const tabConfig = [
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit3,
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "preview",
      label: "Export",
      icon: FileText,
      color: "from-green-500 to-emerald-500",
    },
  ]

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">PhotoStudio Pro</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Professional Photo Tool</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabConfig.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  size="sm"
                  className={`relative px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : "hover:bg-white/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{tab.label}</span>
                </Button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Compact Sidebar */}
          <aside className="xl:col-span-1 space-y-4">
            <CompactPhotoSizeSelector selectedSize={selectedSize} onSizeChange={handleSizeChange} />

            {photos.length > 0 && (
              <div className="glass-effect rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-gray-900 text-sm">Stats</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Photos</span>
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded">{photos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected</span>
                    <span className="font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      {selectedPhotoIds.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {selectedSize.width}×{selectedSize.height}mm
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="glass-effect rounded-xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Mobile Tab Navigation */}
                  {isMobile && (
                    <div className="mb-4">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                        {tabConfig.map((tab) => (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 px-3 text-xs"
                          >
                            <div className="flex flex-col items-center space-y-1">
                              <tab.icon className="w-4 h-4" />
                              <span>{tab.label}</span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  )}

                  <TabsContent value="upload" className="mt-0">
                    <CompactPhotoUpload onPhotosUploaded={handlePhotosUploaded} />
                  </TabsContent>

                  <TabsContent value="edit" className="mt-0">
                    <Suspense fallback={<div className="text-center py-8">Loading editor...</div>}>
                      <EnhancedPhotoEditor
                        photos={photos}
                        selectedPhotoIds={selectedPhotoIds}
                        onSelectedPhotoIdsChange={setSelectedPhotoIds}
                        onPhotoUpdate={handlePhotoUpdate}
                        selectedSize={selectedSize}
                        layoutSettings={layoutSettings}
                      />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    <Suspense fallback={<div className="text-center py-8">Loading preview...</div>}>
                      <PDFPreview photos={photos} layoutSettings={layoutSettings} />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Toolkit - Desktop Only */}
        {photos.length > 0 && !isMobile && (
          <Suspense fallback={null}>
            <FloatingToolkit
              selectedPhotoIds={selectedPhotoIds}
              photos={photos}
              onPhotoUpdate={handlePhotoUpdate}
              onBatchEdit={handleBatchEdit}
              onPhotoDelete={handlePhotoDelete}
              onDuplicatePhotos={handleDuplicatePhotos}
              onCropPhoto={setCropModalPhoto}
              onBackgroundRemoval={setBackgroundModalPhoto}
              onResizePhoto={setResizeModalPhoto}
              onAlignPhotos={handleAlignPhotos}
              onDistributePhotos={handleDistributePhotos}
              layoutSettings={layoutSettings}
              onLayoutSettingsChange={handleLayoutSettingsChange}
            />
          </Suspense>
        )}

        {/* Modals */}
        <Suspense fallback={null}>
          {cropModalPhoto && (
            <EnhancedCropModal
              photo={cropModalPhoto}
              targetSize={selectedSize}
              onSave={(updates) => {
                handlePhotoUpdate(cropModalPhoto.id, updates)
                setCropModalPhoto(null)
              }}
              onClose={() => setCropModalPhoto(null)}
            />
          )}

          {backgroundModalPhoto && (
            <EnhancedBackgroundRemoval
              photo={backgroundModalPhoto}
              onSave={(updates) => {
                handlePhotoUpdate(backgroundModalPhoto.id, updates)
                setBackgroundModalPhoto(null)
              }}
              onClose={() => setBackgroundModalPhoto(null)}
            />
          )}

          {resizeModalPhoto && (
            <ResizeModal
              photo={resizeModalPhoto}
              onSave={(updates) => {
                handlePhotoUpdate(resizeModalPhoto.id, updates)
                setResizeModalPhoto(null)
              }}
              onClose={() => setResizeModalPhoto(null)}
            />
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
