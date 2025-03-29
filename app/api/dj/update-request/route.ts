import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSupabaseServer } from "@/lib/supabase"

export async function PUT(request: Request) {
  try {
    // Usar URLSearchParams para leer el cuerpo como texto y luego parsearlo
    const text = await request.text()
    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      // Si no es JSON, intentar parsear como URLSearchParams
      const params = new URLSearchParams(text)
      body = Object.fromEntries(params)
    }

    const { id, song, name, tip, played } = body
    const supabase = getSupabaseServer()

    // Obtener el user_id de la sesión
    const sessionCookie = cookies().get("dj_session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("id", sessionCookie.value)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: "ID de solicitud requerido" }, { status: 400 })
    }

    // Verificar que la solicitud pertenezca al usuario
    const { data: requestData, error: requestError } = await supabase
      .from("song_requests")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user_id)
      .single()

    if (requestError || !requestData) {
      return NextResponse.json({ error: "Solicitud no encontrada o no autorizada" }, { status: 404 })
    }

    const updateData: any = {}
    if (song !== undefined) updateData.song = song
    if (name !== undefined) updateData.name = name
    if (tip !== undefined) updateData.tip = tip
    if (played !== undefined) updateData.played = played

    const { error } = await supabase.from("song_requests").update(updateData).eq("id", id)

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

