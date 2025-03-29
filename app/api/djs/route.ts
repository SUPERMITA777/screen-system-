import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase.from("users").select("id, name").order("name")

    if (error) {
      console.error("Error al consultar Supabase:", error)
      return NextResponse.json({ error: "Error al obtener los DJs" }, { status: 500 })
    }

    // Si no hay DJs, crear uno por defecto
    if (!data || data.length === 0) {
      return NextResponse.json({
        djs: [{ id: 1, name: "DJ Default" }],
      })
    }

    // Inicializar configuraciones por defecto para cada DJ
    for (const dj of data) {
      try {
        await fetch(`/api/setup/init-default-settings?userId=${dj.id}`)
      } catch (initError) {
        console.error(`Error inicializando configuraciones para DJ ${dj.id}:`, initError)
        // Continuamos de todos modos
      }
    }

    return NextResponse.json({ djs: data })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({
      djs: [{ id: 1, name: "DJ Default" }],
    })
  }
}

