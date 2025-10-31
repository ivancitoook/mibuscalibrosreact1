// src/views/Auth/LoginView.jsx
// VISTA: Formulario de Login (para Usuario y Bibliotecario)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthController from '../../controllers/AuthController'; // Usa el Controlador
import '../../styles/GlobalStyles.css'; // Estilos compartidos

// El prop 'role' es la clave para diferenciar la Vista y el destino de la redirección
const LoginView = ({ role = 'user' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // VISTA: Captura el evento y lo pasa al Controlador
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Llama al Controlador para verificar la autenticación
        const result = await AuthController.login(email, password); 

        if (result.success) {
            // Redirigir según el rol del usuario
            if (result.user.role === 'librarian') {
                navigate('/librarian/dashboard');
            } else {
                navigate('/user/profile');
            }
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="auth-body-background">
            <div className="login-container">
                <h2 className="auth-title">
                    Iniciar Sesión {role === 'user' ? 'Usuarios' : 'Bibliotecario'} 
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Correo electrónico</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="auth-input"
                        required 
                        placeholder="ejemplo@correo.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">Contraseña</label>
                    <input 
                        type="password" 
                        id="password" 
                        className="auth-input"
                        required 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="auth-button">Entrar</button>
                    <p></p>
                    
                    {/* El enlace cambia según el rol actual */}
                    {role === 'user' ? (
                        <>
                            <Link to="/register">¿No tienes cuenta?</Link>
                            <p></p>
                            <Link to="/librarian/login">¿Eres bibliotecario?</Link>
                        </>
                    ) : (
                         <Link to="/login">¿No eres bibliotecario?</Link>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginView;