"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

interface TitleConfig {
  text: string
  image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  enabled: boolean
  image_size_percent: number
  is_static: boolean
}

export default function TitleConfigPage() {
  const [config, setConfig] = useState<TitleConfig>({
    text: "INTERACTIVE SCREEN & MUSIC",
    image_url: null,
    left_image_url: null,
    right_image_url: null,
    enabled: true,
    image_size_percent: 80,
    is_static: false,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [leftImage, setLeftImage] = useState<File | null>(null)
  const [leftImagePreview, setLeftImagePreview] = useState<string | null>(null)
  const [rightImage, setRightImage] = useState<File | null>(null)
  const [rightImagePreview, setRightImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/screen/title")

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.instructions) {
          // Si la tabla no existe, intentar crearla
          const createResponse = await fetch("/api/db/create-title-config")
          if (!createResponse.ok) {
            throw new Error("No se pudo crear la tabla title_config")
          }
          // Recargar la configuración después de crear la tabla
          return loadConfig()
        }
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const data = await response.json()

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
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
      setError("No se pudo cargar la configuración. La tabla title_config podría no existir.")
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración del título",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setIsSaving(true)
      setError(null)

      const formData = new FormData()
      formData.append("text", config.text)
      formData.append("enabled", String(config.enabled))
      formData.append("is_static", String(config.is_static))
      formData.append("image_size_percent", String(config.image_size_percent))

      // Mantener las imágenes existentes si no se cambian
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

      const response = await fetch("/api/screen/title", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.instructions) {
          // Si la tabla no existe, intentar crearla
          const createResponse = await fetch("/api/db/create-title-config")
          if (!createResponse.ok) {
            throw new Error("No se pudo crear la tabla title_config")
          }
          // Reintentar guardar después de crear la tabla
          return handleSubmit(e)
        }
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      await response.json()

      toast({
        title: "Configuración guardada",
        description: "La configuración del título se ha guardado correctamente",
      })

      // Recargar la configuración
      loadConfig()
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      setError("No se pudo guardar la configuración. La tabla title_config podría no existir.")
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
      setConfig({ ...config, image_url: null })
    } else if (type === "left") {
      setLeftImage(null)
      setLeftImagePreview(null)
      setConfig({ ...config, left_image_url: null })
    } else if (type === "right") {
      setRightImage(null)
      setRightImagePreview(null)
      setConfig({ ...config, right_image_url: null })
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Configuración del Título</CardTitle>
            <Link href="/dj">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                Volver al Panel
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Error</h3>
              <p className="text-white mb-2">{error}</p>
              <p className="text-white mb-2">
                Debes crear la tabla title_config en la base de datos. Puedes hacerlo desde la página de SQL Executor.
              </p>
              <Link href="/dj/sql-executor">
                <Button className="bg-red-600 hover:bg-red-700 mt-2">Ir a SQL Executor</Button>
              </Link>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title-text">Texto del título</Label>
                <Input
                  id="title-text"
                  value={config.text}
                  onChange={(e) => setConfig({ ...config, text: e.target.value })}
                  placeholder="Texto del título"
                  className="bg-gray-800 border-purple-500 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="title-enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
                <Label htmlFor="title-enabled" className="text-white">
                  Mostrar título
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="title-static"
                  checked={config.is_static}
                  onCheckedChange={(checked) => setConfig({ ...config, is_static: checked })}
                />
                <Label htmlFor="title-static" className="text-white">
                  Texto estático (sin movimiento)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-size">Tamaño de las imágenes: {config.image_size_percent}%</Label>
                <Slider
                  id="image-size"
                  min={20}
                  max={100}
                  step={5}
                  value={[config.image_size_percent]}
                  onValueChange={(value) => setConfig({ ...config, image_size_percent: value[0] })}
                  className="py-4"
                />
                <p className="text-xs text-gray-400">Ajusta el tamaño de las imágenes en el título.</p>
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
                  <p className="text-xs text-gray-400">Esta imagen se mostrará en el lado izquierdo del título.</p>

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
                  <p className="text-xs text-gray-400">Esta imagen se mostrará en el centro del título.</p>

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
                  <p className="text-xs text-gray-400">Esta imagen se mostrará en el lado derecho del título.</p>

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

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSaving || error !== null}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Configuración
                    </>
                  )}
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

