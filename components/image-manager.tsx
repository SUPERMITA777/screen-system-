"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageManagerProps {
  initialImageUrl?: string | null
  onImageChange?: (url: string | null) => void
  folder?: string
  label?: string
  className?: string
}

export function ImageManager({
  initialImageUrl = null,
  onImageChange,
  folder = "uploads",
  label = "Imagen",
  className = "",
}: ImageManagerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setImageUrl(initialImageUrl)
  }, [initialImageUrl])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("image", file)
      formData.append("folder", folder)

      const response = await fetch("/api/storage/images", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen")
      }

      setImageUrl(data.url)
      onImageChange?.(data.url)
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageDelete = async () => {
    if (!imageUrl) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/storage/images?url=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la imagen")
      }

      setImageUrl(null)
      onImageChange?.(null)
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
      setIsDeleting(false)
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="image-upload">{label}</Label>

      <div className="mt-2">
        {imageUrl ? (
          <Card>
            <CardContent className="p-4">
              <div className="relative w-full h-40 mb-2">
                <Image src={imageUrl || "/placeholder.svg"} alt={label} fill className="object-contain rounded-md" />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Copiar URL al portapapeles
                    navigator.clipboard.writeText(imageUrl)
                    toast({
                      title: "URL copiada",
                      description: "La URL de la imagen se ha copiado al portapapeles",
                    })
                  }}
                >
                  Copiar URL
                </Button>

                <Button variant="destructive" size="sm" onClick={handleImageDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center">
            <Label
              htmlFor="image-upload"
              className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                  <p className="mt-2 text-sm text-gray-500">Subiendo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Haz clic para seleccionar una imagen</p>
                </>
              )}
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

