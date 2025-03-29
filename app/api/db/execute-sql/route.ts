import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "SQL requerido" }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // Ejecutar SQL usando la función RPC exec_sql
    const { data, error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error al ejecutar SQL:", error)
      return NextResponse.json({ error: "Error al ejecutar SQL", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

