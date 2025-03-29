import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Crear un SVG simple para los iconos
    const iconContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="#9333ea" />
      <circle cx="256" cy="256" r="128" fill="white" />
      <circle cx="256" cy="256" r="64" fill="#9333ea" />
    </svg>`

    const publicDir = path.join(process.cwd(), "public")

    // Asegurarse de que el directorio public existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Escribir los archivos de iconos
    fs.writeFileSync(path.join(publicDir, "icon-192x192.png"), iconContent)
    fs.writeFileSync(path.join(publicDir, "icon-512x512.png"), iconContent)

    return NextResponse.json({ success: true, message: "Iconos generados" })
  } catch (error) {
    console.error("Error generando iconos:", error)
    return NextResponse.json({ error: "Error generando iconos" }, { status: 500 })
  }
}

