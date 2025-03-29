"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { initializeStorage } from "@/lib/storage-utils"

export function StorageInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      const success = await initializeStorage()

      if (success) {
        setIsInitialized(true)
        toast({
          title: "Almacenamiento inicializado",
          description: "El almacenamiento se ha inicializado correctamente",
        })
      } else {
        throw new Error("No se pudo inicializar el almacenamiento")
      }
    } catch (error) {
      console.error("Error al inicializar almacenamiento:", error)
      setError("No se pudo inicializar el almacenamiento")
      toast({
        title: "Error",
        description: "No se pudo inicializar el almacenamiento",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicializar almacenamiento</CardTitle>
        <CardDescription>Crea los buckets necesarios para almacenar imágenes y archivos</CardDescription>
      </CardHeader>

      <CardContent>
        {isInitialized ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>Almacenamiento inicializado correctamente</p>
          </div>
        ) : error ? (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        ) : (
          <p className="text-gray-500">Haz clic en el botón para inicializar el almacenamiento</p>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleInitialize} disabled={isInitializing || isInitialized} className="w-full">
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inicializando...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Inicializar almacenamiento
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

