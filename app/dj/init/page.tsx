"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    procedures: boolean
    storage: boolean
    tables: boolean
  }>({
    procedures: false,
    storage: false,
    tables: false,
  })

  async function initProcedures() {
    setLoading(true)
    try {
      const response = await fetch("/api/db/procedures")
      if (response.ok) {
        setStatus((prev) => ({ ...prev, procedures: true }))
        toast({
          title: "¡Éxito!",
          description: "Procedimientos creados correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron crear los procedimientos",
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

  async function initStorage() {
    setLoading(true)
    try {
      const response = await fetch("/api/storage/init")
      if (response.ok) {
        setStatus((prev) => ({ ...prev, storage: true }))
        toast({
          title: "¡Éxito!",
          description: "Almacenamiento inicializado correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo inicializar el almacenamiento",
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

  async function initTables() {
    setLoading(true)
    try {
      const response = await fetch("/api/db/init")
      if (response.ok) {
        setStatus((prev) => ({ ...prev, tables: true }))
        toast({
          title: "¡Éxito!",
          description: "Tablas creadas correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron crear las tablas",
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

  async function initAll() {
    setLoading(true)
    try {
      // 1. Crear procedimientos
      await initProcedures()

      // 2. Inicializar almacenamiento
      await initStorage()

      // 3. Crear tablas
      await initTables()

      toast({
        title: "¡Éxito!",
        description: "Base de datos inicializada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al inicializar la base de datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Inicialización de Base de Datos</CardTitle>
            <Link href="/dj">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                Volver al Panel
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Inicialización de la Base de Datos</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">1. Crear Procedimientos</p>
                    <p className="text-sm text-gray-400">Crea los procedimientos almacenados necesarios</p>
                  </div>
                  <Button
                    onClick={initProcedures}
                    disabled={loading || status.procedures}
                    className={`${status.procedures ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"}`}
                  >
                    {status.procedures ? "✓ Completado" : "Inicializar"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2. Inicializar Almacenamiento</p>
                    <p className="text-sm text-gray-400">Crea los buckets de almacenamiento necesarios</p>
                  </div>
                  <Button
                    onClick={initStorage}
                    disabled={loading || status.storage}
                    className={`${status.storage ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"}`}
                  >
                    {status.storage ? "✓ Completado" : "Inicializar"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">3. Crear Tablas</p>
                    <p className="text-sm text-gray-400">Crea las tablas necesarias para la aplicación</p>
                  </div>
                  <Button
                    onClick={initTables}
                    disabled={loading || status.tables}
                    className={`${status.tables ? "bg-green-600" : "bg-purple-600 hover:bg-purple-700"}`}
                  >
                    {status.tables ? "✓ Completado" : "Inicializar"}
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={initAll}
                  disabled={loading || (status.procedures && status.storage && status.tables)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Inicializando..." : "Inicializar Todo"}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Información</h3>
              <p className="text-sm text-gray-400">
                Este proceso inicializa la base de datos y crea todas las tablas necesarias para la aplicación. Solo es
                necesario ejecutarlo una vez al configurar la aplicación por primera vez.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

