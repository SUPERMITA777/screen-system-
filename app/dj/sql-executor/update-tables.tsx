"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function UpdateTablesPage() {
  const [sql, setSql] = useState(`
-- Actualizar tabla screen_messages para agregar contador de repeticiones
ALTER TABLE IF EXISTS public.screen_messages 
ADD COLUMN IF NOT EXISTS max_repetitions INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS current_repetitions INTEGER DEFAULT 0;

-- Actualizar tabla zocal_config para agregar nuevas opciones
ALTER TABLE IF EXISTS public.zocal_config 
ADD COLUMN IF NOT EXISTS left_image_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS right_image_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_size_percent INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS is_static BOOLEAN DEFAULT FALSE;

-- Crear tabla title_config si no existe
CREATE TABLE IF NOT EXISTS public.title_config (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL DEFAULT 'DJ Song Request System',
  image_url TEXT DEFAULT NULL,
  left_image_url TEXT DEFAULT NULL,
  right_image_url TEXT DEFAULT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  image_size_percent INTEGER DEFAULT 80,
  is_static BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO public.title_config (id, text, enabled, is_static)
SELECT 1, 'DJ Song Request System', TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.title_config WHERE id = 1);
  `)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function executeSql() {
    setLoading(true)
    setResult(null)

    try {
      // Dividir el SQL en sentencias individuales
      const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)
      const results = []

      for (const statement of statements) {
        try {
          const response = await fetch("/api/db/execute-sql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql: statement }),
          })

          const data = await response.json()
          results.push({
            statement: statement.trim(),
            result: data,
          })
        } catch (error) {
          results.push({
            statement: statement.trim(),
            error: String(error),
          })
        }
      }

      toast({
        title: "SQL ejecutado",
        description: "Se han procesado todas las sentencias SQL",
      })

      setResult(JSON.stringify(results, null, 2))
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al ejecutar SQL",
        variant: "destructive",
      })
      setResult(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900 text-white">
      <Card className="bg-black/60 border-purple-500 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-purple-400">Actualizar Tablas</CardTitle>
            <Link href="/dj">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                Volver al Panel
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">SQL para Actualizar Tablas</h3>
              <p className="text-sm text-gray-400 mb-4">
                Este script SQL actualizará las tablas existentes y creará nuevas tablas para soportar las nuevas
                funcionalidades:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 mb-4">
                <li>Contador de repeticiones para mensajes</li>
                <li>Imágenes a la izquierda y derecha del zócalo</li>
                <li>Título en la parte superior de la pantalla</li>
                <li>Opciones de texto estático o con movimiento</li>
              </ul>

              <Textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="min-h-[300px] bg-gray-700 border-purple-500 text-white font-mono"
              />

              <Button onClick={executeSql} disabled={loading} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                {loading ? "Ejecutando..." : "Ejecutar SQL"}
              </Button>
            </div>

            {result && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                <pre className="bg-gray-700 p-4 rounded-lg overflow-auto max-h-[300px] text-sm">{result}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

