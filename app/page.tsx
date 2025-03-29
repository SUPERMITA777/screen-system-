"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function Home() {
  const [song, setSong] = useState("")
  const [name, setName] = useState("")
  const [tip, setTip] = useState("")
  const [message, setMessage] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showTipSection, setShowTipSection] = useState(true)

  useEffect(() => {
    // Cargar la configuración del DJ
    async function loadConfig() {
      try {
        // Intentamos cargar la configuración
        const response = await fetch("/api/dj/config")
        if (response.ok) {
          const data = await response.json()
          // Usar el valor de la configuración, o false si no está definido
          setShowTipSection(data.config?.show_tip_section ?? false)
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        // Si hay error, ocultamos la sección de propinas por defecto
        setShowTipSection(false)
      }
    }

    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Error",
        description: "Por favor completa tu nombre",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("song", song || "Sin canción")
      formData.append("name", name)
      formData.append("tip", tip || "0")
      formData.append("timestamp", new Date().toISOString())

      // Agregar mensaje y foto si están presentes
      if (message) {
        formData.append("message", message)
      }

      if (image) {
        formData.append("image", image)
      }

      const response = await fetch("/api/song-request", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "¡Solicitud enviada!",
          description: "Tu solicitud ha sido enviada al DJ",
        })

        // Limpiar el formulario
        setSong("")
        setName("")
        setTip("")
        setMessage("")
        setImage(null)
        setImagePreview(null)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "No se pudo enviar la solicitud",
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

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="max-w-md mx-auto">
        <Card className="bg-black/60 border-purple-500 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-400">PIDE TU CANCIÓN</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="song" className="text-white">
                  CANCIÓN (OPCIONAL)
                </Label>
                <Input
                  id="song"
                  placeholder="Nombre de la canción y artista"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  className="bg-gray-800 border-purple-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  TU NOMBRE <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-800 border-purple-500 text-white"
                />
              </div>

              {/* Sección de mensaje - siempre visible */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">
                  MENSAJE (OPCIONAL)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Escribe un mensaje para mostrar en la pantalla"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-800 border-purple-500 text-white"
                />
                <p className="text-xs text-gray-400">Tu mensaje se mostrará en la pantalla del evento</p>
              </div>

              {/* Sección de foto - siempre visible */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-white">
                  FOTO (OPCIONAL)
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-gray-800 border-purple-500 text-white"
                />
                <p className="text-xs text-gray-400">Máximo 5MB. Tu foto se mostrará en la pantalla del evento</p>

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

              {showTipSection && (
                <div className="space-y-2">
                  <Label htmlFor="tip" className="text-white">
                    PROPINA (OPCIONAL)
                  </Label>
                  <Input
                    id="tip"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Cantidad en $"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="bg-gray-800 border-purple-500 text-white"
                  />
                  <p className="text-xs text-gray-400">Las propinas ayudan a priorizar tu solicitud</p>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700">
                {submitting ? "Enviando..." : "ENVIAR SOLICITUD"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

