// src/views/User/ProfileView.jsx - ACTUALIZADO PARA SUPABASE

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookModel from '../../models/BookModel';
import AuthController from '../../controllers/AuthController';
import BookCard from '../../components/BookCard.jsx';
import '../../styles/GlobalStyles.css';

const ProfileView = () => {
    const [activeSection, setActiveSection] = useState('menu');
    const [profileData, setProfileData] = useState(null);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Cargar datos al montar el componente
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Obtener usuario actual
            const user = await AuthController.getCurrentUser();
            
            if (!user) {
                // Si no hay usuario, redirigir al login
                navigate('/login');
                return;
            }

            setCurrentUser(user);

            // Cargar datos en paralelo
            const [profile, books, libs] = await Promise.all([
                BookModel.getProfileData(user.id),
                BookModel.getRecommendedBooks(),
                BookModel.getLibraries()
            ]);

            setProfileData(profile);
            setRecommendedBooks(books || []);
            setLibraries(libs || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cerrar sesión
    const handleLogout = async () => {
        await AuthController.logout();
        navigate('/login');
    };

    // Componente para las Bibliotecas
    const LibrariesSectionContent = () => (
        <>
            <div className="book-grid" style={{ flexWrap: 'wrap', overflowX: 'visible' }}>
                {libraries.map((lib, index) => (
                    <div key={lib.id || index} className="book-card" style={{ flex: '0 0 280px', minWidth: '280px' }}>
                        <img 
                            src={lib.imgUrl} 
                            alt={lib.name} 
                            style={{ height: '150px', objectFit: 'cover', borderRadius: '8px' }} 
                        />
                        <div className="book-title">{lib.name}</div>
                        <div className="book-editorial">Dirección: {lib.address}</div>
                        <div className="book-editorial">Teléfono: {lib.phone}</div>
                    </div>
                ))}
            </div>
            {activeSection === 'bibliotecas' && (
                <div style={{ marginTop: '30px' }}>
                    <h2>Mapa de Bibliotecas Hermosillo</h2>
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d111540.8679614797!2d-110.98028182707519!3d29.115949960353788!3m2!1i1024!2i768!4f13.1!2m1!1sbibliotecas%20publicas%20en%20hermosillo!5e0!3m2!1ses!2smx!4v1748283614749!5m2!1ses!2smx" 
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            )}
        </>
    );

    // Renderizar contenido de la sección activa
    const renderSection = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>;
        }

        if (!profileData) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>Error al cargar el perfil</div>;
        }

        switch (activeSection) {
            case 'menu':
                return (
                    <section id="menu">
                        <h2>Menú Principal</h2>
                        <h3>Recomendados</h3>
                        <div className="book-grid">
                            {recommendedBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                        
                        <h2 style={{ marginTop: '40px' }}>Bibliotecas Cercanas</h2>
                        <LibrariesSectionContent />
                    </section>
                );
            case 'perfil':
                return (
                    <section id="perfil">
                        <div className="profile-container">
                            <img className="profile-photo" src={profileData.photo} alt="Foto de perfil" />
                            <div className="profile-info">
                                <h2>{profileData.name}</h2>
                                <p><strong>Email:</strong> {profileData.email}</p>
                                <p><strong>Nombre:</strong> {profileData.fullName}</p>
                                <p><strong>Ubicación:</strong> {profileData.location}</p>
                                
                                <div style={{ display: 'flex' }}>
                                    <button className="edit-profile-btn">
                                        Editar Perfil
                                    </button>
                                    
                                    <button 
                                        className="delete-profile-btn" 
                                        onClick={handleLogout}
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h3>Libros Favoritos</h3>
                        <div className="book-grid">
                            {recommendedBooks.slice(0, 4).map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </section>
                );
            case 'bibliotecas':
                return (
                    <section id="bibliotecas">
                        <h2>Bibliotecas Cercanas</h2>
                        <LibrariesSectionContent />
                    </section>
                );
            case 'historial':
                return (
                    <section id="historial">
                        <h2>Historial de Lectura</h2>
                        <p>Aquí aparecerán los libros que has leído recientemente.</p>
                    </section>
                );
            case 'apartados':
                return (
                    <section id="apartados">
                        <h3>Mis Apartados</h3>
                        <div className="book-grid">
                            <BookCard 
                                book={{ 
                                    title: "Culpa Nuestra", 
                                    author: "Mercedes Ron", 
                                    editorial: "Molino", 
                                    img: "https://gandhi.vtexassets.com/arquivos/ids/6835699-1200-auto?v=638780018406300000&width=1200&height=auto&aspect=true", 
                                    stars: 3 
                                }} 
                                status="Vigente" 
                            />
                            <BookCard 
                                book={{ 
                                    title: "La Biblioteca de la Medianoche", 
                                    author: "Matt Haig", 
                                    editorial: "Planeta", 
                                    img: "https://gandhi.vtexassets.com/arquivos/ids/6247194-1200-auto?v=638610088884470000&width=1200&height=auto&aspect=true", 
                                    stars: 4 
                                }} 
                                status="Expirado" 
                            />
                        </div>
                    </section>
                );
            default: 
                return null;
        }
    };

    return (
        <div className="user-profile-body">
            <header>
                <div className="logo">
                    <img 
                        src="/Librerias/BIENVENIDOS.png" 
                        alt="Logo" 
                        width="400" 
                        height="100" 
                    />
                </div>
                
                <div className="top-nav">
                    <input type="text" className="search-bar" placeholder="¿Qué estás buscando?" />
                    {['menu', 'bibliotecas', 'historial', 'apartados', 'perfil'].map((section) => (
                        <button
                            key={section}
                            className={`nav-btn ${activeSection === section ? 'active' : ''}`}
                            onClick={() => setActiveSection(section)}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </button>
                    ))}
                </div>
            </header>
            <main>{renderSection()}</main>
        </div>
    );
};

export default ProfileView;