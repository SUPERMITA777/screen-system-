"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw, Trash2, Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageGalleryProps {
  folder?: string
  onSelectImage?: (url: string) => void
  className?: string
}

interface ImageItem {
  name: string
  url: string
  size: number
  created_at: string
}

export function ImageGallery({ folder = "uploads", onSelectImage, className = "" }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const loadImages = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/storage/images?folder=${encodeURIComponent(folder)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar imágenes")
      }

      setImages(data.images || [])
    } catch (error) {
      console.error("Error al cargar imágenes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [folder])

  const handleDeleteImage = async (url: string) => {
    try {
      setIsDeleting((prev) => ({ ...prev, [url]: true }))

      const response = await fetch(`/api/storage/images?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la imagen")
      }

      // Actualizar la lista de imágenes
      setImages((prev) => prev.filter((img) => img.url !== url))

      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsDeleting((prev) => ({ ...prev, [url]: false }))
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)

    setTimeout(() => {
      setCopiedUrl(null)
    }, 2000)

    toast({
      title: "URL copiada",
      description: "La URL de la imagen se ha copiado al portapapeles",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Galería de imágenes</h3>

        <Button variant="outline" size="sm" onClick={loadImages} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Actualizar</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No hay imágenes disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.url} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image src={image.url || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
              </div>

              <CardContent className="p-3">
                <p className="text-sm font-medium truncate mb-1">{image.name}</p>
                <p className="text-xs text-gray-500 mb-2">{formatFileSize(image.size)}</p>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyUrl(image.url)}>
                      {copiedUrl === image.url ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    {onSelectImage && (
                      <Button variant="outline" size="sm" onClick={() => onSelectImage(image.url)}>
                        Seleccionar
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteImage(image.url)}
                    disabled={isDeleting[image.url]}
                  >
                    {isDeleting[image.url] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

