import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Cookie utilities
export function setCookie(name: string, value: string, days = 30) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// Photo layout calculations
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
export const MM_TO_PX = 300 / 25.4 // 300 DPI conversion

export function calculatePhotosPerPage(photoWidth: number, photoHeight: number, gap: number): number {
  const photosPerRow = Math.floor((A4_WIDTH_MM - gap) / (photoWidth + gap))
  const photosPerColumn = Math.floor((A4_HEIGHT_MM - gap) / (photoHeight + gap))
  return photosPerRow * photosPerColumn
}

export function calculatePhotoPosition(
  index: number,
  photoWidth: number,
  photoHeight: number,
  gap: number,
): { x: number; y: number; page: number } {
  const photosPerRow = Math.floor((A4_WIDTH_MM - gap) / (photoWidth + gap))
  const photosPerColumn = Math.floor((A4_HEIGHT_MM - gap) / (photoHeight + gap))
  const photosPerPage = photosPerRow * photosPerColumn

  const page = Math.floor(index / photosPerPage)
  const indexOnPage = index % photosPerPage
  const row = Math.floor(indexOnPage / photosPerRow)
  const col = indexOnPage % photosPerRow

  const x = gap + col * (photoWidth + gap)
  const y = gap + row * (photoHeight + gap)

  return { x, y, page }
}
