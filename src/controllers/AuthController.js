// src/controllers/AuthController.js
// CONTROLADOR: Lógica para manejar los formularios de inicio de sesión.
import UserModel from '../models/UserModel'; // Usa el Modelo

const AuthController = {
    // Controlador principal para el LOGIN (para ambas vistas de login)
    handleLogin: (email, password) => {
        const user = UserModel.getUserByCredentials(email, password); // Llama al Modelo
        
        if (user) {
            // Lógica de éxito: podrías guardar el token aquí
            return { success: true, user: user, redirectPath: user.role === 'librarian' ? '/librarian/dashboard' : '/user/profile' };
        } else {
            return { success: false, message: 'Credenciales incorrectas.' };
        }
    },
    
    // Controlador para el REGISTRO (para registrousuarios.html)
    handleRegister: (formData) => {
        const result = UserModel.registerUser(formData);
        if (result.success) {
            return { success: true, redirectPath: '/login' };
        }
        return { success: false, message: 'Error al registrar.' };
    }
};

export default AuthController;