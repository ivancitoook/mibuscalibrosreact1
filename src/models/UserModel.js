// src/models/UserModel.js - MIGRADO A SUPABASE AUTH
import { supabase, handleSupabaseError } from '../config/supabaseClient';

const UserModel = {
  // Registrar un nuevo usuario
  registerUser: async (userData) => {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: 'user' // Por defecto es usuario
          }
        }
      });

      if (authError) return handleSupabaseError(authError);

      // 2. Insertar datos adicionales en la tabla users
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          password_hash: 'handled_by_auth', // Supabase Auth maneja esto
          full_name: userData.fullName,
          role: 'user',
          location: userData.location || null,
          photo_url: userData.photoUrl || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'
        }])
        .select()
        .single();

      if (userError) return handleSupabaseError(userError);

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: userData.fullName,
          role: 'user'
        }
      };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Iniciar sesión
  getUserByCredentials: async (email, password) => {
    try {
      // 1. Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Error de autenticación:', authError);
        return null;
      }

      // 2. Obtener datos adicionales del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Error al obtener datos del usuario:', userError);
        return null;
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.full_name.split(' ')[0], // Primer nombre
        fullName: userData.full_name,
        role: userData.role,
        location: userData.location,
        photoUrl: userData.photo_url
      };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return null;
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return handleSupabaseError(error);
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener sesión actual
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return handleSupabaseError(error);
      return session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) return null;

      return {
        id: userData.id,
        email: userData.email,
        name: userData.full_name.split(' ')[0],
        fullName: userData.full_name,
        role: userData.role,
        location: userData.location,
        photoUrl: userData.photo_url
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  // Actualizar perfil de usuario
  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.fullName,
          location: updates.location,
          photo_url: updates.photoUrl
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return { success: false, error: error.message };
    }
  },

  // Cambiar contraseña
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return { success: false, error: error.message };
    }
  },

  // Recuperar contraseña (enviar email)
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar si el usuario es bibliotecario
  isLibrarian: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) return false;

      return data.role === 'librarian' || data.role === 'admin';
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return false;
    }
  },

  // Obtener todos los usuarios (solo para bibliotecarios)
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return handleSupabaseError(error);

      return data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }
};

export default UserModel;