"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  async function createTables() {
    setLoading(true)
    try {
      // Ejecutar SQL para crear las tablas
      const sql = `
      -- Crear tabla dj_config
      CREATE TABLE IF NOT EXISTS public.dj_config (
        id SERIAL PRIMARY KEY,
        show_tip_section BOOLEAN DEFAULT FALSE,
        show_message_section BOOLEAN DEFAULT FALSE
      );
      
      -- Insertar configuración por defecto si la tabla está vacía
      INSERT INTO public.dj_config (id, show_tip_section, show_message_section)
      SELECT 1, FALSE, FALSE
      WHERE NOT EXISTS (SELECT 1 FROM public.dj_config WHERE id = 1);
      
      -- Crear tabla screen_messages
      CREATE TABLE IF NOT EXISTS public.screen_messages (
        id SERIAL PRIMARY KEY,
        message TEXT,
        image_url TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        visible BOOLEAN DEFAULT TRUE
      );
      
      -- Crear tabla screen_config
      CREATE TABLE IF NOT EXISTS public.screen_config (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT TRUE,
        display_time INTEGER DEFAULT 10000,
        transition_effect TEXT DEFAULT 'fade',
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Insertar configuración por defecto si la tabla está vacía
      INSERT INTO public.screen_config (id, enabled, display_time, transition_effect)
      SELECT 1, TRUE, 10000, 'fade'
      WHERE NOT EXISTS (SELECT 1 FROM public.screen_config WHERE id = 1);
      
      -- Crear tabla song_requests
      CREATE TABLE IF NOT EXISTS public.song_requests (
        id SERIAL PRIMARY KEY,
        song TEXT NOT NULL,
        name TEXT NOT NULL,
        tip NUMERIC DEFAULT 0,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        played BOOLEAN DEFAULT FALSE
      );
      `

      const response = await fetch("/api/db/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Tablas creadas correctamente",
        })
        setInitialized(true)
      } else {
        const data = await response.json()
        toast({
          title: "Advertencia",
          description: "No se pudieron crear las tablas automáticamente. Intenta usar SQL directo.",
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

  async function initializeStorage() {
    setLoading(true)
    try {
      const response = await fetch("/api/storage/init")
      if (response.ok) {
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

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="max-w-md mx-auto bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-400">Configuración Inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Inicialización del Sistema</h3>

              <p className="text-sm text-gray-400 mb-4">
                Este proceso inicializa la base de datos y crea todas las tablas necesarias para la aplicación. Solo es
                necesario ejecutarlo una vez al configurar la aplicación por primera vez.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={createTables}
                  disabled={loading || initialized}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading
                    ? "Inicializando..."
                    : initialized
                      ? "✓ Base de Datos Inicializada"
                      : "Inicializar Base de Datos"}
                </Button>

                <Button
                  onClick={initializeStorage}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Inicializando..." : "Inicializar Almacenamiento"}
                </Button>

                <Link href="/setup/sql">
                  <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-900/20">
                    Ejecutar SQL Manualmente
                  </Button>
                </Link>
              </div>
            </div>

            {initialized && (
              <div className="flex justify-center">
                <Link href="/">
                  <Button className="bg-green-600 hover:bg-green-700">Ir a la Página Principal</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

