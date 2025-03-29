"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StorageInitializer } from "@/components/storage-initializer"
import { ImageGallery } from "@/components/image-gallery"
import { ImageManager } from "@/components/image-manager"
import { FileManager } from "@/components/file-manager"

export default function ArchivosPage() {
  const [selectedTab, setSelectedTab] = useState("imagenes")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Archivos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StorageInitializer />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
          <TabsTrigger value="archivos">Archivos</TabsTrigger>
        </TabsList>

        <TabsContent value="imagenes">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de imágenes</CardTitle>
              <CardDescription>Sube, visualiza y elimina imágenes</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-1">
                  <ImageManager
                    label="Subir nueva imagen"
                    initialImageUrl={selectedImage}
                    onImageChange={setSelectedImage}
                    folder="uploads"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageGallery folder="uploads" onSelectImage={setSelectedImage} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archivos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de archivos</CardTitle>
              <CardDescription>Sube, descarga y elimina archivos</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileManager
                  label="Subir nuevo archivo"
                  initialFileUrl={selectedFile}
                  onFileChange={setSelectedFile}
                  folder="uploads"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

