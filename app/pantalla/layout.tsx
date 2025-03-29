import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pantalla de Mensajes - INTERACTIVE SCREEN & MUSIC",
  description: "Pantalla para mostrar mensajes y fotos interactivas",
}

export default function PantallaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black">{children}</div>
}

