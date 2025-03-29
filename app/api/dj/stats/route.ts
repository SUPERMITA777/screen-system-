import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const supabase = getSupabaseServer()

    let timeRange = supabase.from("song_requests").select("*")

    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      timeRange = timeRange.gte("timestamp", start.toISOString())
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      timeRange = timeRange.lte("timestamp", end.toISOString())
    }

    const { data, error } = await timeRange

    if (error) {
      console.error("Error al consultar Supabase:", error)
      return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }

    // Calculate statistics
    const totalRequests = data.length
    const totalPlayed = data.filter((req) => req.played).length
    const totalPending = totalRequests - totalPlayed
    const totalTips = data.reduce((sum, req) => sum + Number.parseFloat(req.tip), 0)
    const averageTip = totalRequests > 0 ? totalTips / totalRequests : 0

    // Get top requested songs (top 5)
    const songCounts: Record<string, number> = {}
    data.forEach((req) => {
      songCounts[req.song] = (songCounts[req.song] || 0) + 1
    })

    const topSongs = Object.entries(songCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([song, count]) => ({ song, count }))

    return NextResponse.json({
      totalRequests,
      totalPlayed,
      totalPending,
      totalTips,
      averageTip,
      topSongs,
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

