// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan las variables de entorno de Supabase');
  console.error('Asegúrate de crear un archivo .env con:');
  console.error('VITE_SUPABASE_URL=tu_url');
  console.error('VITE_SUPABASE_ANON_KEY=tu_key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Función helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Error de Supabase:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
  return null;
};

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('books').select('count');
    if (error) throw error;
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    return false;
  }
};