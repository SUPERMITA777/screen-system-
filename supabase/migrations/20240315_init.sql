-- Habilitar la extensión uuid-ossp si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Eliminar tablas si existen
DROP TABLE IF EXISTS title_config CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS screen_config CASCADE;

-- Crear tabla title_config
CREATE TABLE title_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla messages
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla requests
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  song_name TEXT NOT NULL,
  artist TEXT,
  requester_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla screen_config
CREATE TABLE screen_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  current_song TEXT,
  current_artist TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en todas las tablas
ALTER TABLE title_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_config ENABLE ROW LEVEL SECURITY;

-- Políticas para title_config
CREATE POLICY "Permitir lectura pública de title_config"
  ON title_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
  ON title_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
  ON title_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para messages
CREATE POLICY "Permitir lectura pública de messages"
  ON messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
  ON messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para requests
CREATE POLICY "Permitir lectura pública de requests"
  ON requests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
  ON requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para screen_config
CREATE POLICY "Permitir lectura pública de screen_config"
  ON screen_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
  ON screen_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
  ON screen_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insertar configuración inicial
INSERT INTO title_config (title, subtitle)
VALUES ('Sistema de Pantalla Interactiva', 'DJ Screen System'); 