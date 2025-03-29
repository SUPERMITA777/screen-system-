import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const supabase = getSupabaseServer()

    if (!id) {
      return NextResponse.json({ error: "ID de solicitud requerido" }, { status: 400 })
    }

    const { error } = await supabase.from("song_requests").update({ played: true }).eq("id", id)

    if (error) {
      console.error("Error al actualizar en Supabase:", error)
      return NextResponse.json({ error: "Error al actualizar la solicitud" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

