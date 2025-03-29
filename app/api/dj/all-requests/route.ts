import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const status = searchParams.get("status") // "all", "pending", "played"
    const supabase = getSupabaseServer()

    let query = supabase.from("song_requests").select("*").order("timestamp", { ascending: false })

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      query = query.gte("timestamp", startDate.toISOString()).lte("timestamp", endDate.toISOString())
    }

    // Filter by status if provided
    if (status === "pending") {
      query = query.eq("played", false)
    } else if (status === "played") {
      query = query.eq("played", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al consultar Supabase:", error)
      return NextResponse.json({ error: "Error al obtener las solicitudes" }, { status: 500 })
    }

    return NextResponse.json({ requests: data })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

