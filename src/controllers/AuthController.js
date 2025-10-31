// src/controllers/AuthController.js - ACTUALIZADO PARA SUPABASE
import UserModel from '../models/UserModel';

const AuthController = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      // Validación básica
      if (!email || !password) {
        return {
          success: false,
          message: 'Por favor ingresa email y contraseña'
        };
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Por favor ingresa un email válido'
        };
      }

      // Intentar iniciar sesión
      const user = await UserModel.getUserByCredentials(email, password);

      if (!user) {
        return {
          success: false,
          message: 'Email o contraseña incorrectos'
        };
      }

      // Guardar sesión en localStorage (opcional, ya que Supabase maneja la sesión)
      localStorage.setItem('currentUser', JSON.stringify(user));

      return {
        success: true,
        user,
        message: `¡Bienvenido ${user.name}!`
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error al iniciar sesión. Intenta nuevamente.'
      };
    }
  },

  // Registrar nuevo usuario
  register: async (userData) => {
    try {
      // Validaciones
      if (!userData.email || !userData.password || !userData.fullName) {
        return {
          success: false,
          message: 'Por favor completa todos los campos obligatorios'
        };
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          success: false,
          message: 'Por favor ingresa un email válido'
        };
      }

      // Validar longitud de contraseña
      if (userData.password.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // Confirmar contraseña
      if (userData.password !== userData.confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden'
        };
      }

      // Registrar usuario
      const result = await UserModel.registerUser(userData);

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Error al registrar usuario'
        };
      }

      return {
        success: true,
        user: result.user,
        message: '¡Registro exitoso! Por favor verifica tu email.'
      };
    } catch (error) {
      console.error('Error en register:', error);
      return {
        success: false,
        message: 'Error al registrar usuario. Intenta nuevamente.'
      };
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      // Cerrar sesión en Supabase
      await UserModel.signOut();

      // Limpiar localStorage
      localStorage.removeItem('currentUser');

      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión'
      };
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      // Intentar obtener de localStorage primero (más rápido)
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        return JSON.parse(localUser);
      }

      // Si no está en localStorage, obtener de Supabase
      const user = await UserModel.getCurrentUser();
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  // Verificar si hay una sesión activa
  isAuthenticated: async () => {
    try {
      const session = await UserModel.getCurrentSession();
      return !!session;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }
  },

  // Actualizar perfil
  updateProfile: async (userId, updates) => {
    try {
      const result = await UserModel.updateProfile(userId, updates);

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Error al actualizar perfil'
        };
      }

      // Actualizar localStorage
      const currentUser = await AuthController.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          fullName: updates.fullName || currentUser.fullName,
          location: updates.location || currentUser.location,
          photoUrl: updates.photoUrl || currentUser.photoUrl
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      return {
        success: true,
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        message: 'Error al actualizar perfil'
      };
    }
  },

  // Cambiar contraseña
  changePassword: async (newPassword, confirmPassword) => {
    try {
      // Validaciones
      if (!newPassword || !confirmPassword) {
        return {
          success: false,
          message: 'Por favor completa todos los campos'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden'
        };
      }

      // Actualizar contraseña
      const result = await UserModel.updatePassword(newPassword);

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Error al cambiar contraseña'
        };
      }

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        message: 'Error al cambiar contraseña'
      };
    }
  },

  // Recuperar contraseña
  recoverPassword: async (email) => {
    try {
      // Validación
      if (!email) {
        return {
          success: false,
          message: 'Por favor ingresa tu email'
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Por favor ingresa un email válido'
        };
      }

      // Enviar email de recuperación
      const result = await UserModel.resetPassword(email);

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Error al enviar email de recuperación'
        };
      }

      return {
        success: true,
        message: 'Se ha enviado un email con instrucciones para recuperar tu contraseña'
      };
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      return {
        success: false,
        message: 'Error al enviar email de recuperación'
      };
    }
  },

  // Verificar si el usuario es bibliotecario
  isLibrarian: async (userId) => {
    try {
      return await UserModel.isLibrarian(userId);
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return false;
    }
  }
};

export default AuthController;