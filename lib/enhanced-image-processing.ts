// Enhanced image processing with proper background handling
export function createImageWithBackground(imageUrl: string, backgroundColor: string): Promise<string> {
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

      // Always fill background first (this ensures no transparency)
      ctx.fillStyle = backgroundColor || "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw image on top of background
      ctx.drawImage(img, 0, 0)

      try {
        const dataURL = canvas.toDataURL("image/jpeg", 0.95) // Use JPEG to eliminate transparency
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

export function rotateImageWithBackground(imageUrl: string, degrees: number, backgroundColor: string): Promise<string> {
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

      const radians = (degrees * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))

      // Calculate new canvas size to fit rotated image
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos

      // Fill background first
      ctx.fillStyle = backgroundColor || "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Move to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      try {
        const dataURL = canvas.toDataURL("image/jpeg", 0.95)
        resolve(dataURL)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

export function flipImageWithBackground(
  imageUrl: string,
  horizontal: boolean,
  vertical: boolean,
  backgroundColor: string,
): Promise<string> {
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

      // Fill background first
      ctx.fillStyle = backgroundColor || "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Apply flip transforms
      ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)

      // Adjust position based on flips
      const x = horizontal ? -img.width : 0
      const y = vertical ? -img.height : 0

      ctx.drawImage(img, x, y)

      try {
        const dataURL = canvas.toDataURL("image/jpeg", 0.95)
        resolve(dataURL)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

export function combineTransformsWithBackground(
  imageUrl: string,
  rotation: number,
  flipHorizontal: boolean,
  flipVertical: boolean,
  backgroundColor: string,
): Promise<string> {
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

      const radians = (rotation * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))

      // Calculate canvas size for rotation
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos

      // Fill background first
      ctx.fillStyle = backgroundColor || "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Apply rotation
      if (rotation !== 0) {
        ctx.rotate(radians)
      }

      // Apply flips
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

      // Draw image
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      try {
        const dataURL = canvas.toDataURL("image/jpeg", 0.95)
        resolve(dataURL)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

// Force background application - works on any image regardless of current state
export function forceApplyBackground(imageUrl: string, backgroundColor: string): Promise<string> {
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

      // Clear any existing content and fill with new background
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = backgroundColor || "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw image on top
      ctx.drawImage(img, 0, 0)

      try {
        const dataURL = canvas.toDataURL("image/jpeg", 0.95)
        resolve(dataURL)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = reject
    img.src = imageUrl
  })
}
