"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface SongRequest {
  id: number
  song: string
  name: string
  tip: number
  timestamp: string
  played: boolean
}

export default function DJDashboard() {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [date])

  async function fetchRequests() {
    setLoading(true)
    try {
      const response = await fetch(`/api/dj/requests?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes",
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

  async function markAsPlayed(id: number) {
    try {
      const response = await fetch(`/api/dj/mark-played?id=${id}`, {
        method: "POST",
      })

      if (response.ok) {
        // Actualizar la lista local
        setRequests(requests.filter((req) => req.id !== id))
        toast({
          title: "¡Éxito!",
          description: "Canción marcada como reproducida",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Panel de Control</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Link href="/dj/requests-manager">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Gestor de Solicitudes
                </Button>
              </Link>
              <Link href="/dj/messages-manager">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Gestor de Mensajes
                </Button>
              </Link>
              <Link href="/dj/storage-manager">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Gestor de Archivos
                </Button>
              </Link>
              <Link href="/dj/title">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Título
                </Button>
              </Link>
              <Link href="/dj/zocal">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Zócalo
                </Button>
              </Link>
              <Link href="/dj/config">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Configuración
                </Button>
              </Link>
              <Link href="/dj/sql-executor">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Ejecutor SQL
                </Button>
              </Link>
              <Link href="/pantalla" target="_blank">
                <Button className="bg-purple-600 hover:bg-purple-700">Ver Pantalla</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="date" className="whitespace-nowrap">
              Filtrar por fecha:
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-800 border-purple-500 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Solicitudes Pendientes</h2>

          {loading ? (
            <div className="text-center py-8">Cargando solicitudes...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">No hay solicitudes pendientes para esta fecha</div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="bg-gray-800 border-purple-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">{request.song}</h3>
                        <p className="text-gray-300">Solicitado por: {request.name}</p>
                        <p className="text-green-400 font-semibold">Propina: ${request.tip}</p>
                        <p className="text-xs text-gray-400">{new Date(request.timestamp).toLocaleString()}</p>
                      </div>
                      <Button onClick={() => markAsPlayed(request.id)} className="bg-purple-600 hover:bg-purple-700">
                        YA LA PUSE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

