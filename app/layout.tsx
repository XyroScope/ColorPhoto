import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "PhotoStudio Pro - Professional Passport Photo Printing Tool | Bangladesh",
  description:
    "The first professional passport photo printing tool for Bangladesh. Create perfect passport photos, ID photos, and stamp-sized photos with advanced editing features. Print-ready PDF generation with 300 DPI quality.",
  keywords:
    "passport photo, photo printing, Bangladesh, ID photo, professional photo tool, photo editor, PDF generation, print ready photos, Sheba Enterprise",
  authors: [{ name: "Sheba Enterprise", url: "https://sheba.pages.dev" }],
  creator: "Sheba Enterprise",
  publisher: "Sheba Enterprise",
  robots: "index, follow",
  openGraph: {
    title: "PhotoStudio Pro - Professional Passport Photo Printing Tool",
    description:
      "Create perfect passport photos with Bangladesh's first professional photo printing tool. Advanced editing, multiple formats, print-ready PDFs.",
    type: "website",
    locale: "en_US",
    siteName: "PhotoStudio Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoStudio Pro - Professional Passport Photo Printing Tool",
    description: "Create perfect passport photos with Bangladesh's first professional photo printing tool.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://photostudio-pro.com" />
        <meta name="geo.region" content="BD" />
        <meta name="geo.country" content="Bangladesh" />
        <meta name="language" content="English" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
