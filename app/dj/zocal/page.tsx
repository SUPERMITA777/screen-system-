"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

interface ZocalConfig {
  text: string
  image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  enabled: boolean
  image_size_percent: number
  is_static: boolean
}

export default function ZocalConfigPage() {
  const [config, setConfig] = useState<ZocalConfig>({
    text: "DJ Song Request System - Envía tu mensaje y solicita tu canción favorita",
    image_url: null,
    left_image_url: null,
    right_image_url: null,
    enabled: true,
    image_size_percent: 80,
    is_static: false,
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [leftImage, setLeftImage] = useState<File | null>(null)
  const [leftImagePreview, setLeftImagePreview] = useState<string | null>(null)
  const [rightImage, setRightImage] = useState<File | null>(null)
  const [rightImagePreview, setRightImagePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    setLoading(true)
    try {
      console.log("Cargando configuración del zócalo...")
      const response = await fetch("/api/screen/zocal")
      if (response.ok) {
        const data = await response.json()
        console.log("Configuración del zócalo recibida:", data)
        if (data.config) {
          setConfig(data.config)
          if (data.config.image_url) {
            setImagePreview(data.config.image_url)
          }
          if (data.config.left_image_url) {
            setLeftImagePreview(data.config.left_image_url)
          }
          if (data.config.right_image_url) {
            setRightImagePreview(data.config.right_image_url)
          }
        } else {
          console.log("No se recibió configuración del zócalo, usando valores por defecto")
        }
      } else {
        const errorData = await response.json()
        console.error("Error al cargar configuración del zócalo:", errorData)

        if (errorData.instructions) {
          setTableError(errorData.instructions)
        }

        toast({
          title: "Error de configuración",
          description:
            "No se pudo cargar la configuración del zócalo. La tabla puede necesitar ser actualizada en Supabase.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append("text", config.text)
      formData.append("enabled", String(config.enabled))
      formData.append("is_static", String(config.is_static))
      formData.append("image_size_percent", String(config.image_size_percent))

      formData.append("keepExistingImage", String(!image && imagePreview !== null))
      formData.append("keepExistingLeftImage", String(!leftImage && leftImagePreview !== null))
      formData.append("keepExistingRightImage", String(!rightImage && rightImagePreview !== null))

      if (image) {
        formData.append("image", image)
      }

      if (leftImage) {
        formData.append("left_image", leftImage)
      }

      if (rightImage) {
        formData.append("right_image", rightImage)
      }

      const response = await fetch("/api/screen/zocal", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Configuración del zócalo guardada correctamente",
        })
        loadConfig()
      } else {
        const data = await response.json()

        if (data.instructions) {
          setTableError(data.instructions)
        }

        toast({
          title: "Error",
          description: data.error || "No se pudo guardar la configuración",
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
      setSaving(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, type: "center" | "left" | "right") {
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

      if (type === "center") {
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
      } else if (type === "left") {
        setLeftImage(file)
        setLeftImagePreview(URL.createObjectURL(file))
      } else if (type === "right") {
        setRightImage(file)
        setRightImagePreview(URL.createObjectURL(file))
      }
    }
  }

  function removeImage(type: "center" | "left" | "right") {
    if (type === "center") {
      setImage(null)
      setImagePreview(null)
    } else if (type === "left") {
      setLeftImage(null)
      setLeftImagePreview(null)
    } else if (type === "right") {
      setRightImage(null)
      setRightImagePreview(null)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Configuración del Zócalo</CardTitle>
            <Link href="/dj">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                Volver al Panel
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {tableError && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error de configuración</h3>
              <p className="text-white mb-2">
                La tabla <code className="bg-black/30 px-1 rounded">zocal_config</code> necesita ser actualizada.
              </p>
              <p className="text-white mb-2">
                Debes actualizar esta tabla manualmente en el panel de Supabase o ejecutar el script de actualización.
              </p>
              <Link href="/dj/sql-executor/update-tables">
                <Button className="bg-red-600 hover:bg-red-700 mt-2">Ir a Actualizar Tablas</Button>
              </Link>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Cargando configuración...</div>
          ) : (
            <form onSubmit={saveConfig} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text">Texto del Zócalo</Label>
                <Textarea
                  id="text"
                  value={config.text}
                  onChange={(e) => setConfig({ ...config, text: e.target.value })}
                  placeholder="Texto que se mostrará en el zócalo"
                  className="bg-gray-800 border-purple-500 text-white"
                />
                <p className="text-xs text-gray-400">Este texto se mostrará en la parte inferior de la pantalla.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_size">Tamaño de las imágenes: {config.image_size_percent}%</Label>
                <Slider
                  id="image_size"
                  min={20}
                  max={100}
                  step={5}
                  value={[config.image_size_percent]}
                  onValueChange={(value) => setConfig({ ...config, image_size_percent: value[0] })}
                  className="py-4"
                />
                <p className="text-xs text-gray-400">Ajusta el tamaño de las imágenes en el zócalo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="left_image">Imagen Izquierda (opcional)</Label>
                  <Input
                    id="left_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "left")}
                    className="bg-gray-800 border-purple-500 text-white"
                  />
                  <p className="text-xs text-gray-400">Esta imagen se mostrará en el lado izquierdo del zócalo.</p>

                  {leftImagePreview && (
                    <div className="relative mt-2 h-20 w-20">
                      <Image
                        src={leftImagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        fill
                        className="object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("left")}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-1"
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

                <div className="space-y-2">
                  <Label htmlFor="image">Logo o Imagen Central (opcional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "center")}
                    className="bg-gray-800 border-purple-500 text-white"
                  />
                  <p className="text-xs text-gray-400">Esta imagen se mostrará en el centro del zócalo.</p>

                  {imagePreview && (
                    <div className="relative mt-2 h-20 w-20">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        fill
                        className="object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("center")}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-1"
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

                <div className="space-y-2">
                  <Label htmlFor="right_image">Imagen Derecha (opcional)</Label>
                  <Input
                    id="right_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "right")}
                    className="bg-gray-800 border-purple-500 text-white"
                  />
                  <p className="text-xs text-gray-400">Esta imagen se mostrará en el lado derecho del zócalo.</p>

                  {rightImagePreview && (
                    <div className="relative mt-2 h-20 w-20">
                      <Image
                        src={rightImagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        fill
                        className="object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("right")}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-1"
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
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled" className="text-white">
                    Mostrar Zócalo
                  </Label>
                  <p className="text-xs text-gray-400">Activa o desactiva la visualización del zócalo en la pantalla</p>
                </div>
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_static" className="text-white">
                    Texto Estático
                  </Label>
                  <p className="text-xs text-gray-400">Si está activado, el texto no se moverá</p>
                </div>
                <Switch
                  id="is_static"
                  checked={config.is_static}
                  onCheckedChange={(checked) => setConfig({ ...config, is_static: checked })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={saving || tableError !== null}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? "Guardando..." : "Guardar Configuración"}
                </Button>

                <Link href="/pantalla" target="_blank">
                  <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                    Ver Pantalla
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

