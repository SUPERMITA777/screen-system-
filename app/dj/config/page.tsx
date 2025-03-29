"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

interface DJConfig {
  show_tip_section: boolean
  show_message_section: boolean
}

interface ScreenConfig {
  enabled: boolean
  display_time: number
  transition_effect: string
  image_size_percent: number
  enable_movement: boolean
  enable_effects: boolean
  effect_type: string
  random_transitions: boolean
}

interface TitleConfig {
  text: string
  image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  enabled: boolean
  image_size_percent: number
  is_static: boolean
}

interface ZocalConfig {
  text: string
  image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  enabled: boolean
  image_size_percent: number
  is_static: boolean
}

export default function ConfigPage() {
  const [djConfig, setDJConfig] = useState<DJConfig>({
    show_tip_section: false,
    show_message_section: false,
  })

  const [screenConfig, setScreenConfig] = useState<ScreenConfig>({
    enabled: true,
    display_time: 10000,
    transition_effect: "fade",
    image_size_percent: 80,
    enable_movement: true,
    enable_effects: false,
    effect_type: "none",
    random_transitions: false,
  })

  const [titleConfig, setTitleConfig] = useState<TitleConfig>({
    text: "INTERACTIVE SCREEN & MUSIC",
    image_url: null,
    left_image_url: null,
    right_image_url: null,
    enabled: true,
    image_size_percent: 80,
    is_static: false,
  })

  const [zocalConfig, setZocalConfig] = useState<ZocalConfig>({
    text: "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita",
    image_url: null,
    left_image_url: null,
    right_image_url: null,
    enabled: true,
    image_size_percent: 80,
    is_static: false,
  })

  // Imágenes para el título
  const [titleImage, setTitleImage] = useState<File | null>(null)
  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(null)
  const [titleLeftImage, setTitleLeftImage] = useState<File | null>(null)
  const [titleLeftImagePreview, setTitleLeftImagePreview] = useState<string | null>(null)
  const [titleRightImage, setTitleRightImage] = useState<File | null>(null)
  const [titleRightImagePreview, setTitleRightImagePreview] = useState<string | null>(null)

  // Imágenes para el zócalo
  const [zocalImage, setZocalImage] = useState<File | null>(null)
  const [zocalImagePreview, setZocalImagePreview] = useState<string | null>(null)
  const [zocalLeftImage, setZocalLeftImage] = useState<File | null>(null)
  const [zocalLeftImagePreview, setZocalLeftImagePreview] = useState<string | null>(null)
  const [zocalRightImage, setZocalRightImage] = useState<File | null>(null)
  const [zocalRightImagePreview, setZocalRightImagePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    setLoading(true)
    try {
      // Primero intentamos crear las tablas necesarias
      try {
        await fetch("/api/db/create-tables-manual")
      } catch (initError) {
        console.error("Error al inicializar tablas:", initError)
        // Continuamos de todos modos
      }

      // Cargar configuración del DJ
      try {
        const djResponse = await fetch("/api/dj/config")
        if (djResponse.ok) {
          const djData = await djResponse.json()
          if (djData.config) {
            setDJConfig({
              show_tip_section: djData.config.show_tip_section || false,
              show_message_section: djData.config.show_message_section || false,
            })
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración del DJ:", error)
      }

      // Cargar configuración de la pantalla
      try {
        const screenResponse = await fetch("/api/screen/config")
        if (screenResponse.ok) {
          const screenData = await screenResponse.json()
          if (screenData.config) {
            // Asegurarse de que todas las propiedades tengan valores por defecto
            setScreenConfig({
              enabled: screenData.config.enabled !== undefined ? screenData.config.enabled : true,
              display_time: screenData.config.display_time || 10000,
              transition_effect: screenData.config.transition_effect || "fade",
              image_size_percent: screenData.config.image_size_percent || 80,
              enable_movement:
                screenData.config.enable_movement !== undefined ? screenData.config.enable_movement : true,
              enable_effects: screenData.config.enable_effects !== undefined ? screenData.config.enable_effects : false,
              effect_type: screenData.config.effect_type || "none",
              random_transitions:
                screenData.config.random_transitions !== undefined ? screenData.config.random_transitions : false,
            })
          }
        } else {
          const errorData = await screenResponse.json()
          if (errorData.instructions) {
            setTableError(errorData.instructions)
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración de la pantalla:", error)
      }

      // Cargar configuración del título
      try {
        const titleResponse = await fetch("/api/screen/title")
        if (titleResponse.ok) {
          const titleData = await titleResponse.json()
          if (titleData.config) {
            setTitleConfig(titleData.config)
            if (titleData.config.image_url) {
              setTitleImagePreview(titleData.config.image_url)
            }
            if (titleData.config.left_image_url) {
              setTitleLeftImagePreview(titleData.config.left_image_url)
            }
            if (titleData.config.right_image_url) {
              setTitleRightImagePreview(titleData.config.right_image_url)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración del título:", error)
      }

      // Cargar configuración del zócalo
      try {
        const zocalResponse = await fetch("/api/screen/zocal")
        if (zocalResponse.ok) {
          const zocalData = await zocalResponse.json()
          if (zocalData.config) {
            setZocalConfig(zocalData.config)
            if (zocalData.config.image_url) {
              setZocalImagePreview(zocalData.config.image_url)
            }
            if (zocalData.config.left_image_url) {
              setZocalLeftImagePreview(zocalData.config.left_image_url)
            }
            if (zocalData.config.right_image_url) {
              setZocalRightImagePreview(zocalData.config.right_image_url)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración del zócalo:", error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveDJConfig() {
    setSaving(true)
    try {
      const response = await fetch("/api/dj/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(djConfig),
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Configuración guardada correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración",
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

  async function saveScreenConfig() {
    setSaving(true)
    try {
      const response = await fetch("/api/screen/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(screenConfig),
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Configuración de pantalla guardada correctamente",
        })
      } else {
        const errorData = await response.json()
        if (errorData.instructions) {
          setTableError(errorData.instructions)
          toast({
            title: "Error",
            description: "La tabla screen_config no existe. Debes crearla manualmente.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: "No se pudo guardar la configuración de pantalla",
            variant: "destructive",
          })
        }
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

  async function saveTitleConfig() {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("text", titleConfig.text)
      formData.append("enabled", String(titleConfig.enabled))
      formData.append("is_static", String(titleConfig.is_static))
      formData.append("image_size_percent", String(titleConfig.image_size_percent))

      formData.append("keepExistingImage", String(!titleImage && titleImagePreview !== null))
      formData.append("keepExistingLeftImage", String(!titleLeftImage && titleLeftImagePreview !== null))
      formData.append("keepExistingRightImage", String(!titleRightImage && titleRightImagePreview !== null))

      if (titleImage) {
        formData.append("image", titleImage)
      }

      if (titleLeftImage) {
        formData.append("left_image", titleLeftImage)
      }

      if (titleRightImage) {
        formData.append("right_image", titleRightImage)
      }

      const response = await fetch("/api/screen/title", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Configuración del título guardada correctamente",
        })
      } else {
        const errorData = await response.json()
        if (errorData.instructions) {
          setTableError(errorData.instructions)
          toast({
            title: "Error",
            description: "La tabla title_config no existe. Debes ejecutar el script de actualización.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "No se pudo guardar la configuración del título",
            variant: "destructive",
          })
        }
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

  async function saveZocalConfig() {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("text", zocalConfig.text)
      formData.append("enabled", String(zocalConfig.enabled))
      formData.append("is_static", String(zocalConfig.is_static))
      formData.append("image_size_percent", String(zocalConfig.image_size_percent))

      formData.append("keepExistingImage", String(!zocalImage && zocalImagePreview !== null))
      formData.append("keepExistingLeftImage", String(!zocalLeftImage && zocalLeftImagePreview !== null))
      formData.append("keepExistingRightImage", String(!zocalRightImage && zocalRightImagePreview !== null))

      if (zocalImage) {
        formData.append("image", zocalImage)
      }

      if (zocalLeftImage) {
        formData.append("left_image", zocalLeftImage)
      }

      if (zocalRightImage) {
        formData.append("right_image", zocalRightImage)
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
      } else {
        const errorData = await response.json()
        if (errorData.instructions) {
          setTableError(errorData.instructions)
          toast({
            title: "Error",
            description: "La tabla zocal_config necesita ser actualizada. Debes ejecutar el script de actualización.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "No se pudo guardar la configuración del zócalo",
            variant: "destructive",
          })
        }
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

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
    position: "center" | "left" | "right",
  ) {
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

      if (type === "title") {
        if (position === "center") {
          setTitleImage(file)
          setTitleImagePreview(URL.createObjectURL(file))
        } else if (position === "left") {
          setTitleLeftImage(file)
          setTitleLeftImagePreview(URL.createObjectURL(file))
        } else if (position === "right") {
          setTitleRightImage(file)
          setTitleRightImagePreview(URL.createObjectURL(file))
        }
      } else if (type === "zocal") {
        if (position === "center") {
          setZocalImage(file)
          setZocalImagePreview(URL.createObjectURL(file))
        } else if (position === "left") {
          setZocalLeftImage(file)
          setZocalLeftImagePreview(URL.createObjectURL(file))
        } else if (position === "right") {
          setZocalRightImage(file)
          setZocalRightImagePreview(URL.createObjectURL(file))
        }
      }
    }
  }

  function removeImage(type: string, position: "center" | "left" | "right") {
    if (type === "title") {
      if (position === "center") {
        setTitleImage(null)
        setTitleImagePreview(null)
      } else if (position === "left") {
        setTitleLeftImage(null)
        setTitleLeftImagePreview(null)
      } else if (position === "right") {
        setTitleRightImage(null)
        setTitleRightImagePreview(null)
      }
    } else if (type === "zocal") {
      if (position === "center") {
        setZocalImage(null)
        setZocalImagePreview(null)
      } else if (position === "left") {
        setZocalLeftImage(null)
        setZocalLeftImagePreview(null)
      } else if (position === "right") {
        setZocalRightImage(null)
        setZocalRightImagePreview(null)
      }
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Configuración</CardTitle>
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
              <p className="text-white mb-2">Una o más tablas necesarias no existen en la base de datos.</p>
              <p className="text-white mb-2">Debes crear estas tablas manualmente en el panel de Supabase.</p>
              <Link href="/dj/sql-executor/update-tables">
                <Button className="bg-red-600 hover:bg-red-700 mt-2">Ir a Actualizar Tablas</Button>
              </Link>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Cargando configuración...</div>
          ) : (
            <Tabs defaultValue="general">
              <TabsList className="bg-gray-800 border-purple-500">
                <TabsTrigger value="general" className="data-[state=active]:bg-purple-900">
                  General
                </TabsTrigger>
                <TabsTrigger value="screen" className="data-[state=active]:bg-purple-900">
                  Pantalla
                </TabsTrigger>
                <TabsTrigger value="title" className="data-[state=active]:bg-purple-900">
                  Título
                </TabsTrigger>
                <TabsTrigger value="zocal" className="data-[state=active]:bg-purple-900">
                  Zócalo
                </TabsTrigger>
                <TabsTrigger value="effects" className="data-[state=active]:bg-purple-900">
                  Efectos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-4">
                <Card className="bg-gray-800 border-purple-700">
                  <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-tip" className="text-white">
                            Mostrar sección de propinas
                          </Label>
                          <p className="text-sm text-gray-400">
                            Permite a los usuarios incluir propinas con sus solicitudes
                          </p>
                        </div>
                        <Switch
                          id="show-tip"
                          checked={djConfig.show_tip_section}
                          onCheckedChange={(checked) => setDJConfig({ ...djConfig, show_tip_section: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-message" className="text-white">
                            Mostrar sección de mensajes
                          </Label>
                          <p className="text-sm text-gray-400">
                            Permite a los usuarios incluir mensajes y fotos con sus solicitudes
                          </p>
                        </div>
                        <Switch
                          id="show-message"
                          checked={djConfig.show_message_section}
                          onCheckedChange={(checked) => setDJConfig({ ...djConfig, show_message_section: checked })}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={saveDJConfig}
                      disabled={saving}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? "Guardando..." : "Guardar Configuración"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="screen" className="mt-4">
                <Card className="bg-gray-800 border-purple-700">
                  <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="screen-enabled" className="text-white">
                            Activar pantalla
                          </Label>
                          <p className="text-sm text-gray-400">
                            Habilita o deshabilita la visualización de mensajes en la pantalla
                          </p>
                        </div>
                        <Switch
                          id="screen-enabled"
                          checked={screenConfig.enabled}
                          onCheckedChange={(checked) => setScreenConfig({ ...screenConfig, enabled: checked })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="display-time" className="text-white">
                          Tiempo de visualización (ms)
                        </Label>
                        <Input
                          id="display-time"
                          type="number"
                          min="1000"
                          step="1000"
                          value={screenConfig.display_time}
                          onChange={(e) =>
                            setScreenConfig({
                              ...screenConfig,
                              display_time: Number.parseInt(e.target.value) || 10000,
                            })
                          }
                          className="bg-gray-700 border-purple-500 text-white"
                        />
                        <p className="text-xs text-gray-400">
                          Tiempo en milisegundos que se muestra cada mensaje (1000ms = 1 segundo)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image-size" className="text-white">
                          Tamaño de imágenes: {screenConfig.image_size_percent}%
                        </Label>
                        <Slider
                          id="image-size"
                          min={20}
                          max={100}
                          step={5}
                          value={[screenConfig.image_size_percent]}
                          onValueChange={(value) =>
                            setScreenConfig({
                              ...screenConfig,
                              image_size_percent: value[0],
                            })
                          }
                          className="py-4"
                        />
                        <p className="text-xs text-gray-400">Porcentaje del tamaño de las imágenes en la pantalla</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transition-effect" className="text-white">
                          Efecto de transición
                        </Label>
                        <Select
                          value={screenConfig.transition_effect}
                          onValueChange={(value) => setScreenConfig({ ...screenConfig, transition_effect: value })}
                        >
                          <SelectTrigger id="transition-effect" className="bg-gray-700 border-purple-500 text-white">
                            <SelectValue placeholder="Selecciona un efecto" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-purple-500 text-white">
                            <SelectItem value="fadeIn">Desvanecer</SelectItem>
                            <SelectItem value="slideUp">Deslizar hacia arriba</SelectItem>
                            <SelectItem value="slideDown">Deslizar hacia abajo</SelectItem>
                            <SelectItem value="zoomIn">Zoom</SelectItem>
                            <SelectItem value="rotateIn">Rotar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="random-transitions" className="text-white">
                            Transiciones aleatorias
                          </Label>
                          <p className="text-sm text-gray-400">
                            Mezcla diferentes tipos de transiciones automáticamente
                          </p>
                        </div>
                        <Switch
                          id="random-transitions"
                          checked={screenConfig.random_transitions}
                          onCheckedChange={(checked) =>
                            setScreenConfig({ ...screenConfig, random_transitions: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={saveScreenConfig}
                        disabled={saving}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="title" className="mt-4">
                <Card className="bg-gray-800 border-purple-700">
                  <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title-text" className="text-white">
                          Texto del Título
                        </Label>
                        <Textarea
                          id="title-text"
                          value={titleConfig.text}
                          onChange={(e) => setTitleConfig({ ...titleConfig, text: e.target.value })}
                          placeholder="Texto que se mostrará en la parte superior de la pantalla"
                          className="bg-gray-700 border-purple-500 text-white"
                        />
                        <p className="text-xs text-gray-400">
                          Este texto se mostrará en la parte superior de la pantalla.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title-image-size" className="text-white">
                          Tamaño de las imágenes: {titleConfig.image_size_percent}%
                        </Label>
                        <Slider
                          id="title-image-size"
                          min={20}
                          max={100}
                          step={5}
                          value={[titleConfig.image_size_percent]}
                          onValueChange={(value) => setTitleConfig({ ...titleConfig, image_size_percent: value[0] })}
                          className="py-4"
                        />
                        <p className="text-xs text-gray-400">Ajusta el tamaño de las imágenes en el título.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title-left-image" className="text-white">
                            Imagen Izquierda (opcional)
                          </Label>
                          <Input
                            id="title-left-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "title", "left")}
                            className="bg-gray-700 border-purple-500 text-white"
                          />
                          <p className="text-xs text-gray-400">
                            Esta imagen se mostrará en el lado izquierdo del título.
                          </p>

                          {titleLeftImagePreview && (
                            <div className="relative mt-2 h-20 w-20">
                              <Image
                                src={titleLeftImagePreview || "/placeholder.svg"}
                                alt="Vista previa"
                                fill
                                className="object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage("title", "left")}
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
                          <Label htmlFor="title-center-image" className="text-white">
                            Logo o Imagen Central (opcional)
                          </Label>
                          <Input
                            id="title-center-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "title", "center")}
                            className="bg-gray-700 border-purple-500 text-white"
                          />
                          <p className="text-xs text-gray-400">Esta imagen se mostrará en el centro del título.</p>

                          {titleImagePreview && (
                            <div className="relative mt-2 h-20 w-20">
                              <Image
                                src={titleImagePreview || "/placeholder.svg"}
                                alt="Vista previa"
                                fill
                                className="object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage("title", "center")}
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
                          <Label htmlFor="title-right-image" className="text-white">
                            Imagen Derecha (opcional)
                          </Label>
                          <Input
                            id="title-right-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "title", "right")}
                            className="bg-gray-700 border-purple-500 text-white"
                          />
                          <p className="text-xs text-gray-400">
                            Esta imagen se mostrará en el lado derecho del título.
                          </p>

                          {titleRightImagePreview && (
                            <div className="relative mt-2 h-20 w-20">
                              <Image
                                src={titleRightImagePreview || "/placeholder.svg"}
                                alt="Vista previa"
                                fill
                                className="object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage("title", "right")}
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
                          <Label htmlFor="title-enabled" className="text-white">
                            Mostrar Título
                          </Label>
                          <p className="text-xs text-gray-400">
                            Activa o desactiva la visualización del título en la pantalla
                          </p>
                        </div>
                        <Switch
                          id="title-enabled"
                          checked={titleConfig.enabled}
                          onCheckedChange={(checked) => setTitleConfig({ ...titleConfig, enabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="title-is-static" className="text-white">
                            Texto Estático
                          </Label>
                          <p className="text-xs text-gray-400">Si está activado, el texto no se moverá</p>
                        </div>
                        <Switch
                          id="title-is-static"
                          checked={titleConfig.is_static}
                          onCheckedChange={(checked) => setTitleConfig({ ...titleConfig, is_static: checked })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={saveTitleConfig}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="zocal" className="mt-4">
                <Card className="bg-gray-800 border-purple-700">
                  <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="zocal-text" className="text-white">
                          Texto del Zócalo
                        </Label>
                        <Textarea
                          id="zocal-text"
                          value={zocalConfig.text}
                          onChange={(e) => setZocalConfig({ ...zocalConfig, text: e.target.value })}
                          placeholder="Texto que se mostrará en el zócalo"
                          className="bg-gray-700 border-purple-500 text-white"
                        />
                        <p className="text-xs text-gray-400">
                          Este texto se mostrará en la parte inferior de la pantalla.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zocal-image-size" className="text-white">
                          Tamaño de las imágenes: {zocalConfig.image_size_percent}%
                        </Label>
                        <Slider
                          id="zocal-image-size"
                          min={20}
                          max={100}
                          step={5}
                          value={[zocalConfig.image_size_percent]}
                          onValueChange={(value) => setZocalConfig({ ...zocalConfig, image_size_percent: value[0] })}
                          className="py-4"
                        />
                        <p className="text-xs text-gray-400">Ajusta el tamaño de las imágenes en el zócalo.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zocal-left-image" className="text-white">
                            Imagen Izquierda (opcional)
                          </Label>
                          <Input
                            id="zocal-left-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "zocal", "left")}
                            className="bg-gray-700 border-purple-500 text-white"
                          />
                          <p className="text-xs text-gray-400">
                            Esta imagen se mostrará en el lado izquierdo del zócalo.
                          </p>

                          {zocalLeftImagePreview && (
                            <div className="relative mt-2 h-20 w-20">
                              <Image
                                src={zocalLeftImagePreview || "/placeholder.svg"}
                                alt="Vista previa"
                                fill
                                className="object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage("zocal", "left")}
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
                          <Label htmlFor="zocal-center-image" className="text-white">
                            Logo o Imagen Central (opcional)
                          </Label>
                          <Input
                            id="zocal-center-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "zocal", "center")}
                            className="bg-gray-700 border-purple-500 text-white"
                          />
                          <p className="text-xs text-gray-400">Esta imagen se mostrará en el centro del zócalo.</p>

                          {zocalImagePreview && (
                            <div className="relative mt-2 h-20 w-20">
                              <Image
                                src={zocalImagePreview || "/placeholder.svg"}
                                alt="Vista previa"
                                fill
                                className="object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage("zocal", "center")}
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
                          <Label htmlFor="zocal-right-image" className="text-white">
                            Imagen Derecha (opcional)
                          </Label>
                          <Input
                            id="zocal-right-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, "zocal", "right")}
                            className="bg-gray-700 border-purple-500 text-white"
                          />
                          <p className="text-xs text-gray-400">
                            Esta imagen se mostrará en el lado derecho del zócalo.
                          </p>

                          {zocalRightImagePreview && (
                            <div className="relative mt-2 h-20 w-20">
                              <Image
                                src={zocalRightImagePreview || "/placeholder.svg"}
                                alt="Vista previa"
                                fill
                                className="object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage("zocal", "right")}
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
                          <Label htmlFor="zocal-enabled" className="text-white">
                            Mostrar Zócalo
                          </Label>
                          <p className="text-xs text-gray-400">
                            Activa o desactiva la visualización del zócalo en la pantalla
                          </p>
                        </div>
                        <Switch
                          id="zocal-enabled"
                          checked={zocalConfig.enabled}
                          onCheckedChange={(checked) => setZocalConfig({ ...zocalConfig, enabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="zocal-is-static" className="text-white">
                            Texto Estático
                          </Label>
                          <p className="text-xs text-gray-400">Si está activado, el texto no se moverá</p>
                        </div>
                        <Switch
                          id="zocal-is-static"
                          checked={zocalConfig.is_static}
                          onCheckedChange={(checked) => setZocalConfig({ ...zocalConfig, is_static: checked })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={saveZocalConfig}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects" className="mt-4">
                <Card className="bg-gray-800 border-purple-700">
                  <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-movement" className="text-white">
                            Activar movimiento
                          </Label>
                          <p className="text-sm text-gray-400">
                            Habilita o deshabilita el movimiento de los mensajes en la pantalla
                          </p>
                        </div>
                        <Switch
                          id="enable-movement"
                          checked={screenConfig.enable_movement}
                          onCheckedChange={(checked) => setScreenConfig({ ...screenConfig, enable_movement: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-effects" className="text-white">
                            Activar efectos visuales
                          </Label>
                          <p className="text-sm text-gray-400">
                            Habilita efectos visuales adicionales para los mensajes
                          </p>
                        </div>
                        <Switch
                          id="enable-effects"
                          checked={screenConfig.enable_effects}
                          onCheckedChange={(checked) => setScreenConfig({ ...screenConfig, enable_effects: checked })}
                        />
                      </div>

                      {screenConfig.enable_effects && (
                        <div className="space-y-2">
                          <Label htmlFor="effect-type" className="text-white">
                            Tipo de efecto
                          </Label>
                          <Select
                            value={screenConfig.effect_type}
                            onValueChange={(value) => setScreenConfig({ ...screenConfig, effect_type: value })}
                          >
                            <SelectTrigger id="effect-type" className="bg-gray-700 border-purple-500 text-white">
                              <SelectValue placeholder="Selecciona un efecto" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-purple-500 text-white">
                              <SelectItem value="none">Ninguno</SelectItem>
                              <SelectItem value="pulse">Pulso</SelectItem>
                              <SelectItem value="shake">Vibración</SelectItem>
                              <SelectItem value="bounce">Rebote</SelectItem>
                              <SelectItem value="spin">Giro</SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-400">Efecto visual que se aplicará a los mensajes</p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={saveScreenConfig}
                      disabled={saving}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? "Guardando..." : "Guardar Configuración"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

