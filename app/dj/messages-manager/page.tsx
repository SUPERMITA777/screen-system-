"use client"

import type React from "react"

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
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

interface Message {
  id: number
  message: string | null
  image_url: string | null
  timestamp: string
  visible: boolean
  display_time?: number
  name?: string
  max_repetitions?: number
  current_repetitions?: number
}

export default function MessagesManagerPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [hiddenMessages, setHiddenMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editForm, setEditForm] = useState({
    message: "",
    display_time: 10,
    visible: true,
    max_repetitions: 10,
  })
  const [newMessage, setNewMessage] = useState("")
  const [displayTime, setDisplayTime] = useState(10)
  const [maxRepetitions, setMaxRepetitions] = useState(10)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    setLoading(true)
    try {
      const response = await fetch("/api/screen/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Separar mensajes visibles y ocultos
        const visible = data.messages.filter((msg: Message) => msg.visible) || []
        const hidden = data.messages.filter((msg: Message) => !msg.visible) || []

        setVisibleMessages(visible)
        setHiddenMessages(hidden)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes",
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

  async function toggleVisibility(id: number, currentVisible: boolean) {
    try {
      const response = await fetch("/api/screen/messages/visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          visible: !currentVisible,
        }),
      })

      if (response.ok) {
        // Actualizar las listas locales
        const updatedMessage = messages.find((msg) => msg.id === id)
        if (updatedMessage) {
          updatedMessage.visible = !currentVisible

          if (!currentVisible) {
            setHiddenMessages(hiddenMessages.filter((msg) => msg.id !== id))
            setVisibleMessages([...visibleMessages, updatedMessage])
          } else {
            setVisibleMessages(visibleMessages.filter((msg) => msg.id !== id))
            setHiddenMessages([...hiddenMessages, updatedMessage])
          }
        }

        toast({
          title: "¡Éxito!",
          description: `Mensaje ${!currentVisible ? "visible" : "oculto"}`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la visibilidad",
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

  async function updateDisplayTime(id: number, newDisplayTime: number) {
    try {
      const response = await fetch("/api/screen/messages/visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          display_time: newDisplayTime,
        }),
      })

      if (response.ok) {
        // Actualizar las listas locales
        setMessages(messages.map((msg) => (msg.id === id ? { ...msg, display_time: newDisplayTime } : msg)))
        setVisibleMessages(
          visibleMessages.map((msg) => (msg.id === id ? { ...msg, display_time: newDisplayTime } : msg)),
        )
        setHiddenMessages(hiddenMessages.map((msg) => (msg.id === id ? { ...msg, display_time: newDisplayTime } : msg)))

        toast({
          title: "¡Éxito!",
          description: `Tiempo de visualización actualizado`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el tiempo de visualización",
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

  async function updateMaxRepetitions(id: number, newMaxRepetitions: number) {
    try {
      const response = await fetch("/api/screen/messages/visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          max_repetitions: newMaxRepetitions,
        }),
      })

      if (response.ok) {
        // Actualizar las listas locales
        setMessages(messages.map((msg) => (msg.id === id ? { ...msg, max_repetitions: newMaxRepetitions } : msg)))
        setVisibleMessages(
          visibleMessages.map((msg) => (msg.id === id ? { ...msg, max_repetitions: newMaxRepetitions } : msg)),
        )
        setHiddenMessages(
          hiddenMessages.map((msg) => (msg.id === id ? { ...msg, max_repetitions: newMaxRepetitions } : msg)),
        )

        toast({
          title: "¡Éxito!",
          description: `Número máximo de repeticiones actualizado`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el número de repeticiones",
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

  async function resetRepetitions(id: number) {
    try {
      const response = await fetch("/api/screen/messages/visibility", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          current_repetitions: 0,
        }),
      })

      if (response.ok) {
        // Actualizar las listas locales
        setMessages(messages.map((msg) => (msg.id === id ? { ...msg, current_repetitions: 0 } : msg)))
        setVisibleMessages(visibleMessages.map((msg) => (msg.id === id ? { ...msg, current_repetitions: 0 } : msg)))
        setHiddenMessages(hiddenMessages.map((msg) => (msg.id === id ? { ...msg, current_repetitions: 0 } : msg)))

        toast({
          title: "¡Éxito!",
          description: `Contador de repeticiones reiniciado`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo reiniciar el contador",
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

  async function deleteMessage(id: number) {
    if (!confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
      return
    }

    try {
      const response = await fetch(`/api/screen/messages/delete?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Actualizar las listas locales
        setMessages(messages.filter((msg) => msg.id !== id))
        setVisibleMessages(visibleMessages.filter((msg) => msg.id !== id))
        setHiddenMessages(hiddenMessages.filter((msg) => msg.id !== id))

        toast({
          title: "¡Éxito!",
          description: "Mensaje eliminado correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el mensaje",
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

  function startEdit(message: Message) {
    setEditingMessage(message)
    setEditForm({
      message: message.message || "",
      display_time: message.display_time || 10,
      visible: message.visible,
      max_repetitions: message.max_repetitions || 10,
    })
  }

  async function saveEdit() {
    if (!editingMessage) return

    try {
      // Actualizar visibilidad si cambió
      if (editingMessage.visible !== editForm.visible) {
        await fetch("/api/screen/messages/visibility", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingMessage.id,
            visible: editForm.visible,
          }),
        })
      }

      // Actualizar tiempo de visualización si cambió
      if (editingMessage.display_time !== editForm.display_time) {
        await fetch("/api/screen/messages/visibility", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingMessage.id,
            display_time: editForm.display_time,
          }),
        })
      }

      // Actualizar número máximo de repeticiones si cambió
      if (editingMessage.max_repetitions !== editForm.max_repetitions) {
        await fetch("/api/screen/messages/visibility", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingMessage.id,
            max_repetitions: editForm.max_repetitions,
          }),
        })
      }

      // Actualizar las listas locales
      const updatedMessage = {
        ...editingMessage,
        message: editForm.message,
        display_time: editForm.display_time,
        visible: editForm.visible,
        max_repetitions: editForm.max_repetitions,
      }

      // Actualizar en la lista principal
      setMessages(messages.map((msg) => (msg.id === editingMessage.id ? updatedMessage : msg)))

      // Actualizar en las listas filtradas
      if (editForm.visible) {
        setHiddenMessages(hiddenMessages.filter((msg) => msg.id !== editingMessage.id))
        setVisibleMessages([...visibleMessages.filter((msg) => msg.id !== editingMessage.id), updatedMessage])
      } else {
        setVisibleMessages(visibleMessages.filter((msg) => msg.id !== editingMessage.id))
        setHiddenMessages([...hiddenMessages.filter((msg) => msg.id !== editingMessage.id), updatedMessage])
      }

      setEditingMessage(null)
      toast({
        title: "¡Éxito!",
        description: "Mensaje actualizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el mensaje",
        variant: "destructive",
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!newMessage && !image) {
      toast({
        title: "Error",
        description: "Debes incluir un mensaje o una imagen",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("message", newMessage)
      formData.append("display_time", displayTime.toString())
      formData.append("max_repetitions", maxRepetitions.toString())
      formData.append("name", "Admin")
      if (image) {
        formData.append("image", image)
      }

      const response = await fetch("/api/screen/messages", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Mensaje agregado correctamente",
        })
        setNewMessage("")
        setDisplayTime(10)
        setMaxRepetitions(10)
        setImage(null)
        setImagePreview(null)
        fetchMessages()
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar el mensaje",
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
      setSubmitting(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          variant: "destructive",
        })
        return
      }

      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Filtrar mensajes por término de búsqueda
  const filteredVisible = visibleMessages.filter(
    (msg) =>
      (msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.name && msg.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredHidden = hiddenMessages.filter(
    (msg) =>
      (msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.name && msg.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Gestor de Mensajes</CardTitle>
            <div className="flex gap-2">
              <Link href="/dj">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Volver al Panel
                </Button>
              </Link>
              <Link href="/pantalla" target="_blank">
                <Button className="bg-purple-600 hover:bg-purple-700">Ver Pantalla</Button>
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Buscar mensajes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-purple-500 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add">
            <TabsList className="bg-gray-800 border-purple-500 mb-6">
              <TabsTrigger value="add" className="data-[state=active]:bg-purple-900">
                Agregar Mensaje
              </TabsTrigger>
              <TabsTrigger value="visible" className="data-[state=active]:bg-purple-900">
                Visibles ({filteredVisible.length})
              </TabsTrigger>
              <TabsTrigger value="hidden" className="data-[state=active]:bg-purple-900">
                Ocultos ({filteredHidden.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add">
              <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold">Agregar Nuevo Mensaje</h3>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe un mensaje para mostrar en la pantalla"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-gray-700 border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_time">Tiempo de visualización (segundos)</Label>
                    <Input
                      id="display_time"
                      type="number"
                      min="1"
                      max="60"
                      value={displayTime}
                      onChange={(e) => setDisplayTime(Number.parseInt(e.target.value, 10))}
                      className="bg-gray-700 border-purple-500"
                    />
                    <p className="text-xs text-gray-400">Tiempo que permanecerá visible este mensaje en la pantalla</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_repetitions">Número máximo de repeticiones</Label>
                    <Input
                      id="max_repetitions"
                      type="number"
                      min="1"
                      max="100"
                      value={maxRepetitions}
                      onChange={(e) => setMaxRepetitions(Number.parseInt(e.target.value, 10))}
                      className="bg-gray-700 border-purple-500"
                    />
                    <p className="text-xs text-gray-400">
                      Número de veces que se mostrará el mensaje antes de desactivarse
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Imagen (opcional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-gray-700 border-purple-500"
                  />

                  {imagePreview && (
                    <div className="relative mt-2 h-40 w-full">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        fill
                        className="object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-600 rounded-full p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700">
                  {submitting ? "Agregando..." : "Agregar Mensaje"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="visible">
              {loading ? (
                <div className="text-center py-8">Cargando mensajes...</div>
              ) : filteredVisible.length === 0 ? (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  {searchTerm ? "No se encontraron mensajes visibles con ese término" : "No hay mensajes visibles"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVisible.map((message) => (
                    <Card key={message.id} className="bg-gray-800 border-green-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {message.image_url && (
                            <div className="relative h-40 w-full md:w-1/3 rounded-md overflow-hidden">
                              <Image
                                src={message.image_url || "/placeholder.svg"}
                                alt="Imagen del mensaje"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}

                          <div className="flex-1 space-y-2">
                            {message.message && <p className="text-lg">{message.message}</p>}
                            {message.name && <p className="text-sm text-gray-300">- {message.name}</p>}
                            <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleString()}</p>

                            <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={message.visible}
                                  onCheckedChange={() => toggleVisibility(message.id, message.visible)}
                                />
                                <span className="text-sm">{message.visible ? "Visible" : "Oculto"}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">Duración:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="60"
                                  value={message.display_time || 10}
                                  onChange={(e) => updateDisplayTime(message.id, Number.parseInt(e.target.value, 10))}
                                  className="w-20 h-8 bg-gray-700 border-purple-500"
                                />
                                <span className="text-sm">seg</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">Repeticiones:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={message.max_repetitions || 10}
                                  onChange={(e) =>
                                    updateMaxRepetitions(message.id, Number.parseInt(e.target.value, 10))
                                  }
                                  className="w-20 h-8 bg-gray-700 border-purple-500"
                                />
                                <span className="text-sm">
                                  ({message.current_repetitions || 0}/{message.max_repetitions || 10})
                                </span>
                                <Button
                                  onClick={() => resetRepetitions(message.id)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs border-purple-500 text-purple-400 hover:bg-purple-900/20"
                                >
                                  Reiniciar
                                </Button>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => startEdit(message)}
                                  variant="outline"
                                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                                >
                                  Editar
                                </Button>
                                <Button onClick={() => deleteMessage(message.id)} variant="destructive" size="sm">
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hidden">
              {loading ? (
                <div className="text-center py-8">Cargando mensajes...</div>
              ) : filteredHidden.length === 0 ? (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  {searchTerm ? "No se encontraron mensajes ocultos con ese término" : "No hay mensajes ocultos"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHidden.map((message) => (
                    <Card key={message.id} className="bg-gray-800 border-red-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {message.image_url && (
                            <div className="relative h-40 w-full md:w-1/3 rounded-md overflow-hidden">
                              <Image
                                src={message.image_url || "/placeholder.svg"}
                                alt="Imagen del mensaje"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}

                          <div className="flex-1 space-y-2">
                            {message.message && <p className="text-lg">{message.message}</p>}
                            {message.name && <p className="text-sm text-gray-300">- {message.name}</p>}
                            <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleString()}</p>

                            <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={message.visible}
                                  onCheckedChange={() => toggleVisibility(message.id, message.visible)}
                                />
                                <span className="text-sm">{message.visible ? "Visible" : "Oculto"}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">Duración:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="60"
                                  value={message.display_time || 10}
                                  onChange={(e) => updateDisplayTime(message.id, Number.parseInt(e.target.value, 10))}
                                  className="w-20 h-8 bg-gray-700 border-purple-500"
                                />
                                <span className="text-sm">seg</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm">Repeticiones:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={message.max_repetitions || 10}
                                  onChange={(e) =>
                                    updateMaxRepetitions(message.id, Number.parseInt(e.target.value, 10))
                                  }
                                  className="w-20 h-8 bg-gray-700 border-purple-500"
                                />
                                <span className="text-sm">
                                  ({message.current_repetitions || 0}/{message.max_repetitions || 10})
                                </span>
                                <Button
                                  onClick={() => resetRepetitions(message.id)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs border-purple-500 text-purple-400 hover:bg-purple-900/20"
                                >
                                  Reiniciar
                                </Button>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => startEdit(message)}
                                  variant="outline"
                                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                                >
                                  Editar
                                </Button>
                                <Button onClick={() => deleteMessage(message.id)} variant="destructive" size="sm">
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Diálogo para editar mensaje */}
          <Dialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
            <DialogContent className="bg-gray-800 border-purple-500 text-white">
              <DialogHeader>
                <DialogTitle className="text-purple-400">Editar Mensaje</DialogTitle>
                <DialogDescription className="text-gray-400">Modifica los detalles del mensaje</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-message">Mensaje</Label>
                  <Textarea
                    id="edit-message"
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    className="bg-gray-700 border-purple-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-display-time">Tiempo de visualización (segundos)</Label>
                  <Input
                    id="edit-display-time"
                    type="number"
                    min="1"
                    max="60"
                    value={editForm.display_time}
                    onChange={(e) => setEditForm({ ...editForm, display_time: Number.parseInt(e.target.value, 10) })}
                    className="bg-gray-700 border-purple-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-max-repetitions">Número máximo de repeticiones</Label>
                  <Input
                    id="edit-max-repetitions"
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.max_repetitions}
                    onChange={(e) => setEditForm({ ...editForm, max_repetitions: Number.parseInt(e.target.value, 10) })}
                    className="bg-gray-700 border-purple-500 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-visible">Visible</Label>
                  <Switch
                    id="edit-visible"
                    checked={editForm.visible}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, visible: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingMessage(null)}
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

