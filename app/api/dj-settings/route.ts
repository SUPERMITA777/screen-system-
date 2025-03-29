import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const userId = searchParams.get("userId")
    const supabase = getSupabaseServer()

    if (!key || !userId) {
      return NextResponse.json({ error: "Se requieren key y userId" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error al consultar Supabase:", error)

      // Si no se encuentra la configuración, devolver un valor por defecto
      if (error.code === "PGRST116") {
        if (key === "payment_message") {
          return NextResponse.json({ value: "Para completar tu solicitud, envía ${amount} al siguiente alias:" })
        } else if (key === "payment_alias") {
          return NextResponse.json({ value: "djs.unidos.argentina" })
        }
      }

      return NextResponse.json({ error: "Error al obtener la configuración" }, { status: 500 })
    }

    return NextResponse.json({ value: data.value })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

