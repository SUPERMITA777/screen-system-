"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ImageManager } from "@/components/image-manager"

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

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/screen/title")

        if (response.ok) {
          const data = await response.json()
          if (data.config) {
            setConfig(data.config)
          }
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la configuración",
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
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      const formData = new FormData()
      formData.append("text", config.text)
      formData.append("enabled", config.enabled.toString())
      formData.append("is_static", config.is_static.toString())
      formData.append("image_size_percent", config.image_size_percent.toString())

      // Mantener las imágenes existentes si no se cambian
      formData.append("keepExistingImage", "true")
      formData.append("keepExistingLeftImage", "true")
      formData.append("keepExistingRightImage", "true")

      const response = await fetch("/api/screen/title", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Configuración guardada",
          description: "La configuración del título se ha guardado correctamente",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar la configuración")
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Título</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Título Superior</CardTitle>
            <CardDescription>
              Configura el texto y las imágenes que aparecen en la barra de título superior
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title-text">Texto del título</Label>
              <Input
                id="title-text"
                value={config.text}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="Texto del título"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="title-enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
              <Label htmlFor="title-enabled">Mostrar título</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="title-static"
                checked={config.is_static}
                onCheckedChange={(checked) => setConfig({ ...config, is_static: checked })}
              />
              <Label htmlFor="title-static">Texto estático (sin movimiento)</Label>
            </div>

            <div className="space-y-2">
              <Label>Tamaño de las imágenes (%)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[config.image_size_percent]}
                  min={20}
                  max={100}
                  step={5}
                  onValueChange={(value) => setConfig({ ...config, image_size_percent: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{config.image_size_percent}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <ImageManager
                label="Imagen izquierda"
                initialImageUrl={config.left_image_url}
                onImageChange={(url) => setConfig({ ...config, left_image_url: url })}
                folder="title"
              />

              <ImageManager
                label="Imagen central"
                initialImageUrl={config.image_url}
                onImageChange={(url) => setConfig({ ...config, image_url: url })}
                folder="title"
              />

              <ImageManager
                label="Imagen derecha"
                initialImageUrl={config.right_image_url}
                onImageChange={(url) => setConfig({ ...config, right_image_url: url })}
                folder="title"
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar configuración
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

