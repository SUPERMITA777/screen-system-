"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

interface Message {
  id: number
  message: string | null
  image_url: string | null
  timestamp: string
  visible: boolean
  display_time?: number
}

export default function ScreenMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [displayTime, setDisplayTime] = useState(10)
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
        setMessages(messages.map((msg) => (msg.id === id ? { ...msg, visible: !currentVisible } : msg)))
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
        setMessages(messages.map((msg) => (msg.id === id ? { ...msg, display_time: newDisplayTime } : msg)))
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

  async function deleteMessage(id: number) {
    if (!confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
      return
    }

    try {
      const response = await fetch(`/api/screen/messages/delete?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== id))
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

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Mensajes de Pantalla</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
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
                <Label htmlFor="image">Imagen (opcional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0]
                      setImage(file)
                      setImagePreview(URL.createObjectURL(file))
                    }
                  }}
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Mensajes Existentes</h3>
                <Button
                  onClick={fetchMessages}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                >
                  Actualizar
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Cargando mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 bg-gray-800 rounded-lg">No hay mensajes disponibles</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      className={`bg-gray-800 ${message.visible ? "border-green-500" : "border-red-500"}`}
                    >
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

                              <Button onClick={() => deleteMessage(message.id)} variant="destructive" size="sm">
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

