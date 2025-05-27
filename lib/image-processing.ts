// New utility file for actual image processing
export function rotateImage(imageUrl: string, degrees: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(imageUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const radians = (degrees * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))

      // Calculate new canvas size to fit rotated image
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos

      // Move to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }
    img.src = imageUrl
  })
}

export function flipImage(imageUrl: string, horizontal: boolean, vertical: boolean): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(imageUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Apply flip transforms
      ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)

      // Adjust position based on flips
      const x = horizontal ? -img.width : 0
      const y = vertical ? -img.height : 0

      ctx.drawImage(img, x, y)

      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }
    img.src = imageUrl
  })
}

export function combineTransforms(
  imageUrl: string,
  rotation: number,
  flipHorizontal: boolean,
  flipVertical: boolean,
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(imageUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const radians = (rotation * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))

      // Calculate canvas size for rotation
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Apply rotation
      ctx.rotate(radians)

      // Apply flips
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

      // Draw image
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }
    img.src = imageUrl
  })
}
