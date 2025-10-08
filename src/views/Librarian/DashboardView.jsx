// src/views/Librarian/DashboardView.jsx (CÓDIGO COMPLETO Y FINAL)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoanController from '../../controllers/LoanController'; 
import BookModel from '../../models/BookModel';
import '../../styles/GlobalStyles.css';

// Helper Componente para una fila de la tabla
const LoanRow = ({ loan, index, onAccept, onReject, onConclude }) => {
    const imgSrc = loan.imagen && loan.imagen.startsWith('http') ? loan.imagen : 'https://via.placeholder.com/60';
    
    return (
        <tr>
            <td><img src={imgSrc} className="libro-img" alt="Portada" /></td>
            <td>{loan.nombre}</td>
            <td>{loan.domicilio}</td>
            <td>{loan.telefono}</td>
            <td>{loan.fiador}</td>
            <td>{loan.libro}</td>
            <td>{loan.biblioteca || ''}</td>
            <td>{loan.autorizadoPor || ''}</td>
            <td className="acciones">
                <button className="editar" onClick={() => alert('Función de edición pendiente')}>Editar</button> 
                {loan.estado === 'pendiente' ? (
                    <>
                        <button className="aceptar" onClick={() => onAccept(index)}>Aceptar</button> 
                        <button className="rechazar" onClick={() => onReject(index)}>Rechazar</button> 
                    </>
                ) : (
                    <button className="eliminar" onClick={() => onConclude(index)}>Concluir</button> 
                )}
            </td>
        </tr>
    );
};

const DashboardView = () => {
    const { 
        filteredSolicitudes, 
        concluidos, 
        addLoan, 
        concludeLoan, 
        acceptLoan, 
        rejectLoan, 
        setFilter, 
        exportarPDF,
        clearHistory
    } = LoanController.useLoanManager();

    const navigate = useNavigate();
    
    const bookCatalog = BookModel.getRecommendedBooks();

    const [bookSearchTerm, setBookSearchTerm] = useState('');

    const initialFormState = {
        nombre: '', domicilio: '', telefono: '', fiador: '', libro: '', selectedBookIndex: '', bibliotecario: 'Jesus Flores', 
        biblioteca: 'Biblioteca Fortino León Almada'
    };
    const [formData, setFormData] = useState(initialFormState);

    const filteredCatalog = LoanController.filterBookCatalog(bookCatalog, bookSearchTerm);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleBookSelection = (e) => {
        const index = e.target.value;
        setFormData({ ...formData, selectedBookIndex: index });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        const selectedBookIndex = formData.selectedBookIndex;
        if (selectedBookIndex === '') {
             alert('Por favor, selecciona un libro del catálogo.');
             return;
        }
        
        const selectedBook = bookCatalog[selectedBookIndex];

        addLoan({
            ...formData,
            libro: selectedBook.title, 
            imagen: selectedBook.img,  
            autorizadoPor: formData.bibliotecario,
        });
        setFormData(initialFormState); 
    };

    const handleLogout = () => {
        navigate('/login'); 
    }

    return (
        <div className="librarian-body">
            <div className="container">
                <div className="perfil" id="perfilInfo">
                    <img src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png" alt="Perfil Bibliotecario" />
                    <span>Bibliotecario: Jesus Flores</span>
                </div>  
                <h1>Gestión de Préstamos</h1>
                
                {/* Formulario de Préstamos */}
                <form id="prestamoForm" onSubmit={handleFormSubmit}>
                    <div><label>Nombre</label><input type="text" id="nombre" value={formData.nombre} onChange={handleFormChange} required /></div>
                    <div><label>Domicilio</label><input type="text" id="domicilio" value={formData.domicilio} onChange={handleFormChange} required /></div>
                    <div><label>Teléfono</label><input type="tel" id="telefono" value={formData.telefono} onChange={handleFormChange} required /></div>
                    <div><label>Fiador o Aval</label><input type="text" id="fiador" value={formData.fiador} onChange={handleFormChange} required /></div>
                    
                    {/* BUSCADOR DE CATÁLOGO */}
                    <div>
                        <label>Buscar Libro (Título, Autor o ISBN)</label>
                        <input 
                            type="text" 
                            placeholder="Escribe para buscar..." 
                            value={bookSearchTerm} 
                            onChange={(e) => setBookSearchTerm(e.target.value)} 
                        />
                    </div>
                    
                    {/* DROP DOWN DEL CATÁLOGO FILTRADO */}
                    <div>
                        <label>Seleccionar Libro</label>
                        <select id="selectedBookIndex" value={formData.selectedBookIndex} onChange={handleBookSelection} required>
                            <option value="">{bookSearchTerm ? `Resultados: ${filteredCatalog.length}` : 'Selecciona un libro...'}</option>
                            {filteredCatalog.map((book) => (
                                <option key={bookCatalog.indexOf(book)} value={bookCatalog.indexOf(book)}>
                                    {book.title} ({book.author}) {book.isbn ? `[ISBN: ${book.isbn}]` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div><label>Bibliotecario</label><input type="text" id="bibliotecario" value={formData.bibliotecario} onChange={handleFormChange} required /></div>
                    <div>
                        <label>Biblioteca</label>
                        <select id="biblioteca" value={formData.biblioteca} onChange={handleFormChange} required>
                            <option value="Biblioteca Fortino León Almada">Biblioteca Fortino León Almada</option>
                            <option value="Biblioteca Rafael Meneses">Biblioteca Rafael Meneses</option>
                        </select>
                    </div>
                    <button type="submit">Agregar Solicitud</button>
                </form>

                {/* Filtro y Exportar PDF (Acomodado) */}
                <div className="filter">
                    <input type="text" id="buscar" placeholder="Buscar por nombre o libro..." onChange={(e) => setFilter(e.target.value)} />
                    {/* Botón Exportar PDF a la derecha */}
                    <button className="exportar" onClick={exportarPDF}>
                        Exportar PDF
                    </button>
                </div>

                {/* Tabla de Préstamos Activos */}
                <table id="tablaHistorial">
                    <thead>
                        <tr>
                            <th>Imagen</th><th>Nombre</th><th>Domicilio</th><th>Teléfono</th><th>Fiador</th><th>Libro</th><th>Biblioteca</th><th>Bibliotecario</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSolicitudes.map((loan, index) => (
                            <LoanRow 
                                key={index}
                                loan={loan}
                                index={index}
                                onAccept={acceptLoan}
                                onReject={rejectLoan}
                                onConclude={concludeLoan}
                            />
                        ))}
                    </tbody>
                </table>

                {/* Tabla de Préstamos Concluidos */}
                <h2 style={{marginTop:'40px', color:'#004aad'}}>Préstamos Concluidos</h2>
                <table id="tablaConcluidos">
                    <thead>
                        <tr>
                            <th>Nombre</th><th>Libro</th><th>Bibliotecario</th><th>Fecha Conclusión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {concluidos.map((p, i) => (
                            <tr key={i}>
                                <td>{p.nombre}</td><td>{p.libro}</td><td>{p.autorizadoPor || ''}</td><td>{p.fecha_conclusion || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* NUEVA UBICACIÓN: ELIMINAR HISTORIAL (Debajo del historial) */}
                <div style={{ textAlign: 'right', marginTop: '20px', marginBottom: '40px' }}>
                    <button className="eliminar" onClick={clearHistory}>
                        Eliminar Historial
                    </button>
                </div>

                {/* Botón de Cerrar sesión */}
                <button className="cerrar-sesion" onClick={handleLogout}>Cerrar sesión</button>
            </div>
        </div>
    );
};

export default DashboardView;