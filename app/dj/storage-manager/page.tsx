"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ImageInfo {
  url: string
  name: string
  size?: number
  created_at?: string
}

export default function StorageManagerPage() {
  const [images, setImages] = useState<ImageInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    initializeStorage()
    fetchImages()
  }, [])

  async function initializeStorage() {
    try {
      const response = await fetch("/api/storage/init")
      if (!response.ok) {
        toast({
          title: "Error",
          description: "No se pudo inicializar el almacenamiento",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al inicializar almacenamiento:", error)
    }
  }

  async function fetchImages() {
    setLoading(true)
    try {
      const response = await fetch("/api/storage/images")
      if (response.ok) {
        const data = await response.json()
        const formattedImages = data.images.map((url: string) => {
          const urlParts = url.split("/")
          const name = urlParts[urlParts.length - 1]
          return {
            url,
            name,
            created_at: new Date().toISOString(), // Esto es un placeholder, idealmente vendría del servidor
          }
        })
        setImages(formattedImages)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las imágenes",
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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

      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Selecciona una imagen para subir",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const response = await fetch("/api/storage/images", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Imagen subida correctamente",
        })
        setSelectedFile(null)
        setImagePreview(null)
        fetchImages()
      } else {
        toast({
          title: "Error",
          description: "No se pudo subir la imagen",
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
      setUploading(false)
    }
  }

  async function handleDelete(url: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return
    }

    try {
      const response = await fetch(`/api/storage/images/delete?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter((img) => img.url !== url))
        toast({
          title: "¡Éxito!",
          description: "Imagen eliminada correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la imagen",
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

  // Filtrar y ordenar imágenes
  const filteredImages = images
    .filter((img) => img.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortOrder === "asc"
          ? (a.created_at || "").localeCompare(b.created_at || "")
          : (b.created_at || "").localeCompare(a.created_at || "")
      }
    })

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Gestor de Almacenamiento</CardTitle>
            <div className="flex gap-2">
              <Link href="/dj">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                  Volver al Panel
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="images">
            <TabsList className="bg-gray-800 border-purple-500 mb-6">
              <TabsTrigger value="images" className="data-[state=active]:bg-purple-900">
                Imágenes
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-purple-900">
                Subir Archivos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold">Subir Nueva Imagen</h3>

                <div className="space-y-2">
                  <Label htmlFor="image">Seleccionar Imagen</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
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
                          setSelectedFile(null)
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

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? "Subiendo..." : "Subir Imagen"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 w-full">
                    <Input
                      placeholder="Buscar imágenes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800 border-purple-500 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="bg-gray-800 border-purple-500 text-white rounded-md px-3 py-2 text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "name" | "date")}
                    >
                      <option value="date">Fecha</option>
                      <option value="name">Nombre</option>
                    </select>
                    <Button
                      variant="outline"
                      className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                    <Button
                      onClick={fetchImages}
                      variant="outline"
                      className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                    >
                      Actualizar
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">Cargando imágenes...</div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-8 bg-gray-800 rounded-lg">
                    {searchTerm ? "No se encontraron imágenes con ese término" : "No hay imágenes almacenadas"}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredImages.map((image, index) => (
                      <Card key={index} className="bg-gray-800 border-purple-700 overflow-hidden">
                        <div className="relative h-48 w-full cursor-pointer" onClick={() => setSelectedImage(image)}>
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={`Imagen ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm truncate mb-2">{image.name}</p>
                          <div className="flex justify-between items-center">
                            <Button
                              onClick={() => navigator.clipboard.writeText(image.url)}
                              variant="outline"
                              size="sm"
                              className="text-xs border-purple-500 text-purple-400 hover:bg-purple-900/20"
                            >
                              Copiar URL
                            </Button>
                            <Button
                              onClick={() => handleDelete(image.url)}
                              variant="destructive"
                              size="sm"
                              className="text-xs"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Diálogo para vista previa de imagen */}
          <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
            <DialogContent className="bg-gray-800 border-purple-500 text-white max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-purple-400">{selectedImage?.name}</DialogTitle>
              </DialogHeader>
              <div className="relative h-[60vh] w-full">
                {selectedImage && (
                  <Image
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.name}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <DialogFooter className="flex justify-between">
                <Button
                  onClick={() => selectedImage && navigator.clipboard.writeText(selectedImage.url)}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                >
                  Copiar URL
                </Button>
                <Button onClick={() => selectedImage && handleDelete(selectedImage.url)} variant="destructive">
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  )
}

