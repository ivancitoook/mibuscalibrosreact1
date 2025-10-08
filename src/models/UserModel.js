// src/models/UserModel.js (CÓDIGO COMPLETO)

const UserModel = {
    getUserByCredentials: (email, password) => {
        // Credenciales de Usuario
        if (email === "user@test.com" && password === "1234") { 
            return { id: 1, name: "Iván Díaz", role: 'user' }; 
        }
        // Credenciales de Bibliotecario (Actualizado: Jesus Flores)
        if (email === "jesus@test.com" && password === "1234") { 
            return { id: 2, name: "Jesus Flores", role: 'librarian' }; // ¡NOMBRE CAMBIADO!
        }
        return null;
    },
    
    registerUser: (userData) => { 
        // ...
        return { success: true, user: userData };
    },
};

export default UserModel;