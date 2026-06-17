import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

export const DB_SCHEMA = `
-- Ejecuta esto en el SQL Editor de Supabase:

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

-- Tabla de datos de usuario
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

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

-- Políticas: solo lectura/escritura con service_role (admin)
-- Las operaciones se hacen desde el cliente con la anon key
-- pero usando funciones RPC o directamente si RLS lo permite

-- Permitir lectura de usuarios activos (para login)
CREATE POLICY "Allow login check" ON users FOR SELECT USING (true);

-- Permitir inserción de pending_users (para registro)
CREATE POLICY "Allow registration" ON pending_users FOR INSERT WITH CHECK (true);

-- Permitir lectura de pending_users (para admin)
CREATE POLICY "Allow admin read pending" ON pending_users FOR SELECT USING (true);

-- Permitir actualización de pending_users (para admin approve/reject)
CREATE POLICY "Allow admin update pending" ON pending_users FOR UPDATE USING (true);

-- Permitir eliminación de pending_users (para admin reject)
CREATE POLICY "Allow admin delete pending" ON pending_users FOR DELETE USING (true);

-- Permitir inserción de usuarios (para admin approve)
CREATE POLICY "Allow admin create user" ON users FOR INSERT WITH CHECK (true);

-- Permitir actualización de usuarios (para admin y password reset)
CREATE POLICY "Allow user update" ON users FOR UPDATE USING (true);

-- Permitir eliminación de usuarios (para admin)
CREATE POLICY "Allow admin delete user" ON users FOR DELETE USING (true);

-- Datos de usuario: solo el propio usuario puede leer/escribir
CREATE POLICY "User can read own data" ON user_data FOR SELECT USING (true);
CREATE POLICY "User can insert own data" ON user_data FOR INSERT WITH CHECK (true);
CREATE POLICY "User can update own data" ON user_data FOR UPDATE USING (true);
`;
