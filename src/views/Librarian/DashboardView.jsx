// src/views/Librarian/DashboardView.jsx - CÓDIGO COMPLETO CON TODAS LAS FUNCIONALIDADES

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoanController from '../../controllers/LoanController';
import LoanModel from '../../models/LoanModel';
import BookModel from '../../models/BookModel';
import AuthController from '../../controllers/AuthController';
import { supabase } from '../../config/supabaseClient';
import '../../styles/GlobalStyles.css';

// Helper Componente para una fila de la tabla
const LoanRow = ({ loan, index, onAccept, onReject, onConclude, onEdit, currentUserId }) => {
    const imgSrc = loan.bookImg && loan.bookImg.startsWith('http') 
        ? loan.bookImg 
        : 'https://via.placeholder.com/60';
    
    return (
        <tr>
            <td><img src={imgSrc} className="libro-img" alt="Portada" /></td>
            <td>{loan.userName}</td>
            <td>{loan.guestAddress || loan.userEmail}</td>
            <td>{loan.guestPhone || '-'}</td>
            <td>{loan.notes ? loan.notes.split('Fiador:')[1]?.split('.')[0]?.trim() : '-'}</td>
            <td>{loan.bookTitle}</td>
            <td>{loan.libraryName || ''}</td>
            <td>Bibliotecario</td>
            <td className="acciones">
                <button className="editar" onClick={() => onEdit(loan)}>Editar</button>
                {loan.estado === 'pendiente' || loan.status === 'pending' ? (
                    <>
                        <button className="aceptar" onClick={() => onAccept(loan.id, currentUserId)}>Aceptar</button>
                        <button className="rechazar" onClick={() => onReject(loan.id, currentUserId)}>Rechazar</button>
                    </>
                ) : (
                    <button className="eliminar" onClick={() => onConclude(loan.id)}>Concluir</button>
                )}
            </td>
        </tr>
    );
};

// Modal para editar préstamo
const EditLoanModal = ({ loan, onClose, onSave, libraries }) => {
    const [formData, setFormData] = useState({
        expectedReturnDate: loan?.expectedReturnDate?.split('T')[0] || '',
        notes: loan?.notes || '',
        libraryId: loan?.libraryId || '',
        guestName: loan?.userName || '',
        guestPhone: loan?.guestPhone || '',
        guestAddress: loan?.guestAddress || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(loan.id, formData);
    };

    if (!loan) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <h2>Editar Préstamo</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label><strong>Libro:</strong> {loan.bookTitle}</label>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Nombre del Usuario</label>
                        <input
                            type="text"
                            value={formData.guestName}
                            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Teléfono</label>
                        <input
                            type="tel"
                            value={formData.guestPhone}
                            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Dirección</label>
                        <input
                            type="text"
                            value={formData.guestAddress}
                            onChange={(e) => setFormData({ ...formData, guestAddress: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Fecha de Devolución Esperada</label>
                        <input
                            type="date"
                            value={formData.expectedReturnDate}
                            onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Biblioteca</label>
                        <select
                            value={formData.libraryId}
                            onChange={(e) => setFormData({ ...formData, libraryId: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        >
                            <option value="">Selecciona una biblioteca</option>
                            {libraries.map(lib => (
                                <option key={lib.id} value={lib.id}>{lib.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Notas</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="4"
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                background: '#ccc',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                background: '#004aad',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DashboardView = () => {
    const { 
        filteredSolicitudes,
        concluidos,
        loading,
        error,
        acceptLoan,
        rejectLoan,
        concludeLoan,
        editLoan,
        setFilter,
        exportarPDF,
        clearHistory,
        reloadData
    } = LoanController.useLoanManager();

    const navigate = useNavigate();
    const [bookCatalog, setBookCatalog] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [bookSearchTerm, setBookSearchTerm] = useState('');
    const [editingLoan, setEditingLoan] = useState(null);

    const initialFormState = {
        nombre: '',
        domicilio: '',
        telefono: '',
        fiador: '',
        libro: '',
        selectedBookIndex: '',
        bibliotecario: 'Jesus Flores',
        biblioteca: 'Biblioteca Fortino León Almada'
    };
    const [formData, setFormData] = useState(initialFormState);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // Verificar usuario actual
            const user = await AuthController.getCurrentUser();
            if (!user || user.role !== 'librarian') {
                navigate('/login');
                return;
            }
            setCurrentUser(user);

            // Cargar catálogo y bibliotecas
            const [books, libs] = await Promise.all([
                BookModel.getRecommendedBooks(),
                BookModel.getLibraries()
            ]);

            setBookCatalog(books || []);
            setLibraries(libs || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    };

    const filteredCatalog = LoanController.filterBookCatalog(bookCatalog, bookSearchTerm);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleBookSelection = (e) => {
        const index = e.target.value;
        setFormData({ ...formData, selectedBookIndex: index });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const selectedBookIndex = formData.selectedBookIndex;
        if (selectedBookIndex === '') {
            alert('Por favor, selecciona un libro del catálogo.');
            return;
        }

        const selectedBook = bookCatalog[selectedBookIndex];

        try {
            // Buscar la biblioteca por nombre
            const library = libraries.find(lib => lib.name === formData.biblioteca);
            if (!library) {
                alert('Error: Biblioteca no encontrada');
                return;
            }

            // Calcular fecha de devolución (15 días desde hoy)
            const today = new Date();
            const returnDate = new Date(today);
            returnDate.setDate(returnDate.getDate() + 15);
            const expectedReturnDate = returnDate.toISOString().split('T')[0];

            // Crear el préstamo como PENDIENTE (para que requiera aprobación)
            const { data, error } = await supabase
                .from('loans')
                .insert([{
                    user_id: null,
                    guest_name: formData.nombre,
                    guest_email: null,
                    guest_phone: formData.telefono,
                    guest_address: formData.domicilio,
                    book_id: selectedBook.id,
                    library_id: library.id,
                    expected_return_date: expectedReturnDate,
                    notes: `Préstamo creado por ${formData.bibliotecario}. Fiador: ${formData.fiador}.`,
                    status: 'pending'  // PENDIENTE - requiere aceptación
                }])
                .select();

            if (error) {
                console.error('Error al crear préstamo:', error);
                alert(`Error al crear préstamo: ${error.message}`);
                return;
            }

            alert('¡Solicitud de préstamo creada! Ahora debes aceptarla en la tabla.');
            setFormData(initialFormState);
            reloadData();

        } catch (error) {
            console.error('Error en handleFormSubmit:', error);
            alert('Error al procesar el préstamo: ' + error.message);
        }
    };

    const handleAcceptLoan = async (loanId) => {
        const result = await acceptLoan(loanId, currentUser?.id);
        if (result.success) {
            alert('Préstamo aceptado exitosamente');
        } else {
            alert('Error al aceptar préstamo');
        }
    };

    const handleRejectLoan = async (loanId) => {
        if (window.confirm('¿Estás seguro de rechazar este préstamo?')) {
            const result = await rejectLoan(loanId, currentUser?.id);
            if (result.success) {
                alert('Préstamo rechazado');
            } else {
                alert('Error al rechazar préstamo');
            }
        }
    };

    const handleConcludeLoan = async (loanId) => {
        if (window.confirm('¿Marcar este préstamo como devuelto?')) {
            const result = await concludeLoan(loanId);
            if (result.success) {
                alert('Libro devuelto exitosamente');
            } else {
                alert('Error al marcar como devuelto');
            }
        }
    };

    const handleEditLoan = (loan) => {
        setEditingLoan(loan);
    };

    const handleSaveEdit = async (loanId, updates) => {
        const result = await editLoan(loanId, updates, currentUser?.id);
        if (result.success) {
            alert('Préstamo actualizado exitosamente');
            setEditingLoan(null);
        } else {
            alert('Error al actualizar préstamo');
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('¿Estás seguro de eliminar todo el historial? Esta acción no se puede deshacer.')) {
            const result = await clearHistory();
            if (result.success) {
                alert('Historial eliminado');
            } else {
                alert('Error al eliminar historial');
            }
        }
    };

    const handleLogout = async () => {
        await AuthController.logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="librarian-body">
                <div className="container">
                    <p style={{ textAlign: 'center', padding: '50px' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="librarian-body">
            <div className="container">
                <div className="perfil" id="perfilInfo">
                    <img 
                        src={currentUser?.photoUrl || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"} 
                        alt="Perfil Bibliotecario" 
                    />
                    <span>Bibliotecario: {currentUser?.fullName || 'Jesus Flores'}</span>
                </div>
                <h1>Gestión de Préstamos</h1>

                {error && (
                    <div style={{ 
                        background: '#ffebee', 
                        color: '#c62828', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        marginBottom: '20px' 
                    }}>
                        {error}
                    </div>
                )}

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
                            {filteredCatalog.map((book, index) => (
                                <option key={book.id} value={bookCatalog.indexOf(book)}>
                                    {book.title} ({book.author}) {book.isbn ? `[ISBN: ${book.isbn}]` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div><label>Bibliotecario</label><input type="text" id="bibliotecario" value={formData.bibliotecario} onChange={handleFormChange} required /></div>
                    <div>
                        <label>Biblioteca</label>
                        <select id="biblioteca" value={formData.biblioteca} onChange={handleFormChange} required>
                            {libraries.map((lib) => (
                                <option key={lib.id} value={lib.name}>
                                    {lib.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Agregar Solicitud</button>
                </form>

                {/* Filtro y Exportar PDF */}
                <div className="filter">
                    <input type="text" id="buscar" placeholder="Buscar por nombre o libro..." onChange={(e) => setFilter(e.target.value)} />
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
                        {filteredSolicitudes.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                    No hay préstamos activos o pendientes
                                </td>
                            </tr>
                        ) : (
                            filteredSolicitudes.map((loan, index) => (
                                <LoanRow 
                                    key={loan.id}
                                    loan={loan}
                                    index={index}
                                    onAccept={handleAcceptLoan}
                                    onReject={handleRejectLoan}
                                    onConclude={handleConcludeLoan}
                                    onEdit={handleEditLoan}
                                    currentUserId={currentUser?.id}
                                />
                            ))
                        )}
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
                        {concluidos.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                    No hay préstamos concluidos
                                </td>
                            </tr>
                        ) : (
                            concluidos.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.nombre}</td>
                                    <td>{p.libro}</td>
                                    <td>{p.autorizadoPor || 'N/A'}</td>
                                    <td>{p.fecha_conclusion || 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* ELIMINAR HISTORIAL */}
                <div style={{ textAlign: 'right', marginTop: '20px', marginBottom: '40px' }}>
                    <button className="eliminar" onClick={handleClearHistory}>
                        Eliminar Historial
                    </button>
                </div>

                {/* Botón de Cerrar sesión */}
                <button className="cerrar-sesion" onClick={handleLogout}>Cerrar sesión</button>

                {/* Modal de Edición */}
                {editingLoan && (
                    <EditLoanModal
                        loan={editingLoan}
                        libraries={libraries}
                        onClose={() => setEditingLoan(null)}
                        onSave={handleSaveEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardView;