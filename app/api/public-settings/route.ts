import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const supabase = getSupabaseServer()

    if (!key) {
      return NextResponse.json({ error: "Se requiere el parámetro key" }, { status: 400 })
    }

    // Consultar la configuración (sin filtrar por user_id)
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", key).limit(1)

    // Verificar si hay error o no hay datos
    if (error) {
      console.error("Error al consultar configuraciones:", error)
      return NextResponse.json({ error: "Error al obtener configuraciones" }, { status: 500 })
    }

    // Si no hay datos, devolver un valor por defecto según la clave
    if (!data || data.length === 0) {
      if (key === "payment_message") {
        return NextResponse.json({ value: "Para completar tu solicitud, envía ${amount} al siguiente alias:" })
      } else if (key === "payment_alias") {
        return NextResponse.json({ value: "djs.unidos.argentina" })
      } else if (key === "tip_enabled") {
        return NextResponse.json({ value: "true" })
      } else if (key === "no_tip_message") {
        return NextResponse.json({ value: "¡Gracias por tu solicitud! El DJ la reproducirá pronto." })
      } else {
        return NextResponse.json({ value: "" })
      }
    }

    // Devolver el primer valor encontrado
    return NextResponse.json({ value: data[0].value })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

