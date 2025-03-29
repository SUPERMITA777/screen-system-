import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Crear un cliente singleton para el servidor
let supabaseServerInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseServer() {
  if (!supabaseServerInstance) {
    supabaseServerInstance = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseServerInstance
}

