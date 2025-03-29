import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL no está definido')
  throw new Error('Missing Supabase URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definido')
  throw new Error('Missing Supabase Anon Key environment variable')
}

console.log('Inicializando cliente Supabase con URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Verificar la conexión
supabase.auth.getSession().then(() => {
  console.log('Conexión a Supabase establecida correctamente')
}).catch((error) => {
  console.error('Error al conectar con Supabase:', error.message)
}) 