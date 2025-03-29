import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel de Control - INTERACTIVE SCREEN & MUSIC",
  description: "Panel de control para gestionar mensajes y solicitudes de música",
}

export default function DJLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black">{children}</div>
}

