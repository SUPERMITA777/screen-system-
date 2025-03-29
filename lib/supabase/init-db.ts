import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function initializeDatabase() {
  try {
    // Insertar configuración inicial si no existe
    const { error: insertError } = await supabase
      .from('title_config')
      .upsert({
        title: 'Sistema de Pantalla Interactiva',
        subtitle: 'DJ Screen System'
      }, {
        onConflict: 'id'
      })

    if (insertError) {
      console.error('Error inserting initial title config:', insertError)
      return false
    }

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
} 