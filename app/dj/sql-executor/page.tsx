"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function SqlExecutorPage() {
  const [sql, setSql] = useState(`
-- Crear tabla title_config si no existe
CREATE TABLE IF NOT EXISTS public.title_config (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL DEFAULT 'INTERACTIVE SCREEN & MUSIC',
  image_url TEXT,
  left_image_url TEXT,
  right_image_url TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  image_size_percent INTEGER DEFAULT 80,
  is_static BOOLEAN DEFAULT FALSE
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO public.title_config (id, text, enabled, image_size_percent, is_static)
SELECT 1, 'INTERACTIVE SCREEN & MUSIC', TRUE, 80, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.title_config WHERE id = 1);
`)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function executeSql() {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/db/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "SQL ejecutado correctamente",
        })
        setResult(JSON.stringify(data, null, 2))
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al ejecutar SQL",
          variant: "destructive",
        })
        setResult(JSON.stringify(data, null, 2))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
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
            <CardTitle className="text-2xl font-bold text-purple-400">Ejecutar SQL</CardTitle>
            <Link href="/dj">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-900/20">
                Volver a Panel
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">SQL a Ejecutar</h3>

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

            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Advertencia</h3>
              <p className="text-sm text-gray-400">
                Esta herramienta permite ejecutar SQL directamente en la base de datos. Úsala con precaución, ya que las
                operaciones incorrectas pueden dañar la base de datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

