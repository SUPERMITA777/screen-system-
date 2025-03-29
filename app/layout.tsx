import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "INTERACTIVE SCREEN & MUSIC",
  description: "Aplicación para solicitar canciones y mostrar mensajes interactivos",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png",
  },
    generator: 'v0.dev'
}

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Inicializar la tabla zocal_config
    await fetch("/api/screen/zocal/init")

    // Agregar el campo display_time a la tabla screen_messages
    await fetch("/api/db/add-display-time")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inicializar la base de datos en el servidor
  if (typeof window === "undefined") {
    initializeDatabase()
  }

  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#9333ea" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <style>{`
          :root {
            --primary-color: #9333ea;
            --secondary-color: #000000;
            --accent-color: #6b21a8;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'