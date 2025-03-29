"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Stats {
  totalRequests: number
  totalPlayed: number
  totalPending: number
  totalTips: number
  averageTip: number
  topSongs: { song: string; count: number }[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set default date range to current month
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    setStartDate(firstDay.toISOString().split("T")[0])
    setEndDate(lastDay.toISOString().split("T")[0])

    fetchStats(firstDay.toISOString().split("T")[0], lastDay.toISOString().split("T")[0])
  }, [])

  async function fetchStats(start: string, end: string) {
    setLoading(true)
    try {
      const response = await fetch(`/api/dj/stats?startDate=${start}&endDate=${end}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleDateFilter() {
    fetchStats(startDate, endDate)
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Estadísticas</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Link href="/dj">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Solicitudes Pendientes
                </Button>
              </Link>
              <Link href="/dj/history">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Historial
                </Button>
              </Link>
              <Link href="/dj/screen">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Mensajes
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate" className="whitespace-nowrap">
                Desde:
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-800 border-purple-500 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate" className="whitespace-nowrap">
                Hasta:
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-800 border-purple-500 text-white"
              />
            </div>
            <Button onClick={handleDateFilter} className="bg-purple-600 hover:bg-purple-700">
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando estadísticas...</div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-400">Resumen de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de solicitudes:</span>
                      <span className="font-bold">{stats.totalRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solicitudes reproducidas:</span>
                      <span className="font-bold text-green-400">{stats.totalPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solicitudes pendientes:</span>
                      <span className="font-bold text-yellow-400">{stats.totalPending}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-400">Resumen de Propinas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de propinas:</span>
                      <span className="font-bold text-green-400">${stats.totalTips.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propina promedio:</span>
                      <span className="font-bold">${stats.averageTip.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-700 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-400">Canciones Más Solicitadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.topSongs.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topSongs.map((song, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="truncate max-w-[70%]">{song.song}</span>
                          <span className="font-bold bg-purple-900/50 px-3 py-1 rounded-full">
                            {song.count} {song.count === 1 ? "vez" : "veces"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">No hay datos suficientes</div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">No se pudieron cargar las estadísticas</div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

