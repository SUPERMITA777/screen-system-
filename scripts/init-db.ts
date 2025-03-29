import { initializeDatabase } from '../lib/supabase/init-db'

async function main() {
  console.log('Iniciando inicialización de la base de datos...')
  const success = await initializeDatabase()
  
  if (success) {
    console.log('Base de datos inicializada correctamente')
  } else {
    console.error('Error al inicializar la base de datos')
    process.exit(1)
  }
}

main() 