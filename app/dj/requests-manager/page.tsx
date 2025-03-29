"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface SongRequest {
  id: number
  song: string
  name: string
  tip: number
  timestamp: string
  played: boolean
}

export default function RequestsManagerPage() {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<SongRequest[]>([])
  const [playedRequests, setPlayedRequests] = useState<SongRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRequest, setEditingRequest] = useState<SongRequest | null>(null)
  const [editForm, setEditForm] = useState({
    song: "",
    name: "",
    tip: "0",
    played: false,
  })

  useEffect(() => {
    fetchAllRequests()
  }, [date])

  async function fetchAllRequests() {
    setLoading(true)
    try {
      const response = await fetch(`/api/dj/all-requests?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])

        // Separar solicitudes pendientes y reproducidas
        const pending = data.requests.filter((req: SongRequest) => !req.played) || []
        const played = data.requests.filter((req: SongRequest) => req.played) || []

        setPendingRequests(pending)
        setPlayedRequests(played)
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
        // Actualizar las listas locales
        const updatedRequest = requests.find((req) => req.id === id)
        if (updatedRequest) {
          updatedRequest.played = true
          setPendingRequests(pendingRequests.filter((req) => req.id !== id))
          setPlayedRequests([...playedRequests, updatedRequest])
        }

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

  async function markAsPending(id: number) {
    try {
      const response = await fetch(`/api/dj/update-request`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          played: false,
        }),
      })

      if (response.ok) {
        // Actualizar las listas locales
        const updatedRequest = requests.find((req) => req.id === id)
        if (updatedRequest) {
          updatedRequest.played = false
          setPlayedRequests(playedRequests.filter((req) => req.id !== id))
          setPendingRequests([...pendingRequests, updatedRequest])
        }

        toast({
          title: "¡Éxito!",
          description: "Canción marcada como pendiente",
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

  async function deleteRequest(id: number) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta solicitud?")) {
      return
    }

    try {
      const response = await fetch(`/api/dj/delete-request?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Actualizar las listas locales
        setRequests(requests.filter((req) => req.id !== id))
        setPendingRequests(pendingRequests.filter((req) => req.id !== id))
        setPlayedRequests(playedRequests.filter((req) => req.id !== id))

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

  function startEdit(request: SongRequest) {
    setEditingRequest(request)
    setEditForm({
      song: request.song,
      name: request.name,
      tip: request.tip.toString(),
      played: request.played,
    })
  }

  async function saveEdit() {
    if (!editingRequest) return

    try {
      const response = await fetch(`/api/dj/update-request`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingRequest.id,
          song: editForm.song,
          name: editForm.name,
          tip: Number.parseFloat(editForm.tip),
          played: editForm.played,
        }),
      })

      if (response.ok) {
        // Actualizar las listas locales
        const updatedRequest = {
          ...editingRequest,
          song: editForm.song,
          name: editForm.name,
          tip: Number.parseFloat(editForm.tip),
          played: editForm.played,
        }

        // Actualizar en la lista principal
        setRequests(requests.map((req) => (req.id === editingRequest.id ? updatedRequest : req)))

        // Actualizar en las listas filtradas
        if (editForm.played) {
          setPendingRequests(pendingRequests.filter((req) => req.id !== editingRequest.id))
          setPlayedRequests([...playedRequests.filter((req) => req.id !== editingRequest.id), updatedRequest])
        } else {
          setPlayedRequests(playedRequests.filter((req) => req.id !== editingRequest.id))
          setPendingRequests([...pendingRequests.filter((req) => req.id !== editingRequest.id), updatedRequest])
        }

        setEditingRequest(null)
        toast({
          title: "¡Éxito!",
          description: "Solicitud actualizada correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la solicitud",
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

  // Filtrar solicitudes por término de búsqueda
  const filteredPending = pendingRequests.filter(
    (req) =>
      req.song.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPlayed = playedRequests.filter(
    (req) =>
      req.song.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Gestor de Solicitudes</CardTitle>
            <div className="flex gap-2">
              <Link href="/dj">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Volver al Panel
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Label htmlFor="date" className="mb-2 block">
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
            <div className="flex-1">
              <Label htmlFor="search" className="mb-2 block">
                Buscar:
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por canción o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-purple-500 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="bg-gray-800 border-purple-500 mb-6">
              <TabsTrigger value="pending" className="data-[state=active]:bg-purple-900">
                Pendientes ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger value="played" className="data-[state=active]:bg-purple-900">
                Reproducidas ({filteredPlayed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {loading ? (
                <div className="text-center py-8">Cargando solicitudes...</div>
              ) : filteredPending.length === 0 ? (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  {searchTerm
                    ? "No se encontraron solicitudes pendientes con ese término"
                    : "No hay solicitudes pendientes para esta fecha"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPending.map((request) => (
                    <Card key={request.id} className="bg-gray-800 border-purple-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold">{request.song}</h3>
                            <p className="text-gray-300">Solicitado por: {request.name}</p>
                            <p className="text-green-400 font-semibold">Propina: ${request.tip}</p>
                            <p className="text-xs text-gray-400">{new Date(request.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => markAsPlayed(request.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Marcar como Reproducida
                            </Button>
                            <Button
                              onClick={() => startEdit(request)}
                              variant="outline"
                              className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                            >
                              Editar
                            </Button>
                            <Button onClick={() => deleteRequest(request.id)} variant="destructive">
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="played">
              {loading ? (
                <div className="text-center py-8">Cargando solicitudes...</div>
              ) : filteredPlayed.length === 0 ? (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  {searchTerm
                    ? "No se encontraron solicitudes reproducidas con ese término"
                    : "No hay solicitudes reproducidas para esta fecha"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPlayed.map((request) => (
                    <Card key={request.id} className="bg-gray-800 border-purple-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold">{request.song}</h3>
                            <p className="text-gray-300">Solicitado por: {request.name}</p>
                            <p className="text-green-400 font-semibold">Propina: ${request.tip}</p>
                            <p className="text-xs text-gray-400">{new Date(request.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => markAsPending(request.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Marcar como Pendiente
                            </Button>
                            <Button
                              onClick={() => startEdit(request)}
                              variant="outline"
                              className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                            >
                              Editar
                            </Button>
                            <Button onClick={() => deleteRequest(request.id)} variant="destructive">
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Diálogo para editar solicitud */}
          <Dialog open={!!editingRequest} onOpenChange={(open) => !open && setEditingRequest(null)}>
            <DialogContent className="bg-gray-800 border-purple-500 text-white">
              <DialogHeader>
                <DialogTitle className="text-purple-400">Editar Solicitud</DialogTitle>
                <DialogDescription className="text-gray-400">Modifica los detalles de la solicitud</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-song">Canción</Label>
                  <Input
                    id="edit-song"
                    value={editForm.song}
                    onChange={(e) => setEditForm({ ...editForm, song: e.target.value })}
                    className="bg-gray-700 border-purple-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-gray-700 border-purple-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tip">Propina</Label>
                  <Input
                    id="edit-tip"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.tip}
                    onChange={(e) => setEditForm({ ...editForm, tip: e.target.value })}
                    className="bg-gray-700 border-purple-500 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-played">Reproducida</Label>
                  <Switch
                    id="edit-played"
                    checked={editForm.played}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, played: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingRequest(null)}
                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                >
                  Cancelar
                </Button>
                <Button onClick={saveEdit} className="bg-purple-600 hover:bg-purple-700">
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  )
}

