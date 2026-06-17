-- ICARO - Schema para Supabase
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'pending',
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de datos de usuario (JSONB para toda la data)
CREATE TABLE IF NOT EXISTS user_data (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de solicitudes pendientes
CREATE TABLE IF NOT EXISTS pending_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'pending',
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

-- Políticas abiertas (el control de acceso se hace en la app)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on user_data" ON user_data FOR ALL USING (true);
CREATE POLICY "Allow all on pending_users" ON pending_users FOR ALL USING (true);

-- Función para upsert de datos de usuario
CREATE OR REPLACE FUNCTION upsert_user_data(p_user_id TEXT, p_data JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO user_data (user_id, data, updated_at)
  VALUES (p_user_id, p_data, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET data = p_data, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
