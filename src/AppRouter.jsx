// src/AppRouter.jsx
// CONTROLADOR PRINCIPAL: Enlaza las URLs a las Vistas.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importa las VISTAS
import LoginView from "./views/Auth/LoginView.jsx"; // VISTA ÚNICA para ambos logins
import DashboardView from "./views/Librarian/DashboardView.jsx";
import ProfileView from "./views/User/ProfileView.jsx"; 
// ... (otras vistas)

const AppRouter = () => {
    return (
        <Router> 
            <Routes>
                {/* --- INICIO DE SESIÓN DE USUARIO (TU ARCHIVO iniciosesion.html) --- */}
                {/* La ruta por defecto y la ruta /login cargan la Vista en modo "user" */}
                <Route path="/" element={<LoginView role="user" />} /> 
                <Route path="/login" element={<LoginView role="user" />} /> 
                
                {/* --- INICIO DE SESIÓN DE BIBLIOTECARIO (TU ARCHIVO iniciosesionbibliotecario.html) --- */}
                {/* Esta ruta carga la Vista en modo "librarian" */}
                <Route path="/librarian/login" element={<LoginView role="librarian" />} />
                
                {/* Rutas de gestión */}
                <Route path="/librarian/dashboard" element={<DashboardView />} />
                <Route path="/user/profile" element={<ProfileView />} /> 

                <Route path="*" element={<h1>404 | No Encontrado</h1>} />
            </Routes>
        </Router>
    );
};

export default AppRouter;