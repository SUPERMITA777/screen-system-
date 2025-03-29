"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function UpdateTablesPage() {
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function executeSQL() {
    setExecuting(true)
    setResult(null)
    try {
      const response = await fetch("/api/db/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: `
-- Crear tabla screen_config si no existe
CREATE TABLE IF NOT EXISTS screen_config (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  display_time INTEGER DEFAULT 10000,
  transition_effect TEXT DEFAULT 'fade',
  image_size_percent INTEGER DEFAULT 80,
  enable_movement BOOLEAN DEFAULT true,
  enable_effects BOOLEAN DEFAULT false,
  effect_type TEXT DEFAULT 'none',
  random_transitions BOOLEAN DEFAULT false
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO screen_config (enabled, display_time, transition_effect, image_size_percent, enable_movement, enable_effects, effect_type, random_transitions)
SELECT true, 10000, 'fade', 80, true, false, 'none', false
WHERE NOT EXISTS (SELECT 1 FROM screen_config);

-- Crear tabla title_config si no existe
CREATE TABLE IF NOT EXISTS title_config (
  id SERIAL PRIMARY KEY,
  text TEXT DEFAULT 'INTERACTIVE SCREEN & MUSIC',
  image_url TEXT DEFAULT NULL,
  left_image_url TEXT DEFAULT NULL,
  right_image_url TEXT DEFAULT NULL,
  enabled BOOLEAN DEFAULT true,
  image_size_percent INTEGER DEFAULT 80,
  is_static BOOLEAN DEFAULT false
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO title_config (text, enabled, image_size_percent, is_static)
SELECT 'INTERACTIVE SCREEN & MUSIC', true, 80, false
WHERE NOT EXISTS (SELECT 1 FROM title_config);

-- Crear tabla zocal_config si no existe
CREATE TABLE IF NOT EXISTS zocal_config (
  id SERIAL PRIMARY KEY,
  text TEXT DEFAULT 'INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita',
  image_url TEXT DEFAULT NULL,
  left_image_url TEXT DEFAULT NULL,
  right_image_url TEXT DEFAULT NULL,
  enabled BOOLEAN DEFAULT true,
  image_size_percent INTEGER DEFAULT 80,
  is_static BOOLEAN DEFAULT false
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO zocal_config (text, enabled, image_size_percent, is_static)
SELECT 'INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita', true, 80, false
WHERE NOT EXISTS (SELECT 1 FROM zocal_config);
          `,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult("Tablas actualizadas correctamente")
        toast({
          title: "¡Éxito!",
          description: "Tablas actualizadas correctamente",
        })
      } else {
        const errorData = await response.json()
        setResult(`Error: ${errorData.error || "No se pudieron actualizar las tablas"}`)
        toast({
          title: "Error",
          description: errorData.error || "No se pudieron actualizar las tablas",
          variant: "destructive",
        })
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setExecuting(false)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Actualizar Tablas</CardTitle>
            <Link href="/dj/config">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                Volver a Configuración
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">Actualización de Tablas</h2>
              <p className="mb-4">Este script creará o actualizará las siguientes tablas:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>screen_config - Configuración general de la pantalla</li>
                <li>title_config - Configuración del título superior</li>
                <li>zocal_config - Configuración del zócalo inferior</li>
              </ul>
              <p className="mb-4 text-yellow-300">Nota: Este proceso es seguro y no borrará datos existentes.</p>
              <Button onClick={executeSQL} disabled={executing} className="w-full bg-purple-600 hover:bg-purple-700">
                {executing ? "Ejecutando..." : "Actualizar Tablas"}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${result.startsWith("Error") ? "bg-red-900/50" : "bg-green-900/50"}`}>
                <h3 className="font-semibold mb-2">Resultado:</h3>
                <p>{result}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

