-- Crear nuevas tablas para las categorías
CREATE TABLE IF NOT EXISTS altares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  effect TEXT,
  location TEXT,
  quote TEXT,
  description TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consumibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  effect TEXT,
  quote TEXT,
  description TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS secretos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  how_to_find TEXT,
  quote TEXT,
  description TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadida tabla text_pages para las páginas de texto de Maldición y Genialidad
CREATE TABLE IF NOT EXISTS text_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT UNIQUE NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar páginas de texto iniciales
INSERT INTO text_pages (page_name, content) VALUES 
  ('maldicion', 'La maldición es una mecánica del juego que afecta...'),
  ('genialidad', 'La genialidad (coolness) es una estadística oculta que...')
ON CONFLICT (page_name) DO NOTHING;

-- Eliminar la tabla de misceláneo
DROP TABLE IF EXISTS miscellaneous;
