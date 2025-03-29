"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function RequestHistory() {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [date])

  async function fetchRequests() {
    setLoading(true)
    try {
      const response = await fetch(`/api/dj/all-requests?date=${date}&status=played`)
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

  async function deleteRequest(id: number) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta solicitud?")) {
      return
    }

    try {
      const response = await fetch(`/api/dj/delete-request?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRequests(requests.filter((req) => req.id !== id))
        toast({
          title: "¡Éxito!",
          description: "Solicitud eliminada correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la solicitud",
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
            <CardTitle className="text-2xl font-bold text-purple-400">Historial de Solicitudes</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Link href="/dj">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Solicitudes Pendientes
                </Button>
              </Link>
              <Link href="/dj/stats">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Estadísticas
                </Button>
              </Link>
              <Link href="/dj/screen">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Mensajes
                </Button>
              </Link>
              <Link href="/dj/storage">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Imágenes
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando solicitudes...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">No hay solicitudes reproducidas para esta fecha</div>
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
                      <Button
                        onClick={() => deleteRequest(request.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
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

