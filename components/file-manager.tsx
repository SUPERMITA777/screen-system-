"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Trash2, FileText, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FileManagerProps {
  initialFileUrl?: string | null
  onFileChange?: (url: string | null) => void
  folder?: string
  label?: string
  className?: string
  accept?: string
}

export function FileManager({
  initialFileUrl = null,
  onFileChange,
  folder = "uploads",
  label = "Archivo",
  className = "",
  accept = "*/*",
}: FileManagerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl)
  const [fileName, setFileName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setFileUrl(initialFileUrl)
    if (initialFileUrl) {
      // Extraer el nombre del archivo de la URL
      const url = new URL(initialFileUrl)
      const pathParts = url.pathname.split("/")
      setFileName(pathParts[pathParts.length - 1])
    } else {
      setFileName("")
    }
  }, [initialFileUrl])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/storage/files", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al subir el archivo")
      }

      setFileUrl(data.url)
      setFileName(file.name)
      onFileChange?.(data.url)
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error al subir archivo:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileDelete = async () => {
    if (!fileUrl) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/storage/files?url=${encodeURIComponent(fileUrl)}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el archivo")
      }

      setFileUrl(null)
      setFileName("")
      onFileChange?.(null)
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar archivo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="file-upload">{label}</Label>

      <div className="mt-2">
        {fileUrl ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <FileText className="h-8 w-8 mr-2 text-blue-500" />
                <div className="flex-1 truncate">
                  <p className="font-medium">{fileName}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Copiar URL al portapapeles
                      navigator.clipboard.writeText(fileUrl)
                      toast({
                        title: "URL copiada",
                        description: "La URL del archivo se ha copiado al portapapeles",
                      })
                    }}
                  >
                    Copiar URL
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </a>
                  </Button>
                </div>

                <Button variant="destructive" size="sm" onClick={handleFileDelete} disabled={isDeleting}>
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
              htmlFor="file-upload"
              className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                  <p className="mt-2 text-sm text-gray-500">Subiendo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Haz clic para seleccionar un archivo</p>
                </>
              )}
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

