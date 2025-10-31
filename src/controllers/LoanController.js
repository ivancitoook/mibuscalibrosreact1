// src/controllers/LoanController.js - VERSIÓN COMPLETA CON TODAS LAS FUNCIONALIDADES
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import LoanModel from '../models/LoanModel';
import BookModel from '../models/BookModel';

// Función utilitaria para filtrar el catálogo
const filterBookCatalog = (books, searchTerm) => {
  if (!searchTerm) {
    return books;
  }
  const term = searchTerm.toLowerCase();

  return books.filter(book =>
    book.title.toLowerCase().includes(term) ||
    book.author.toLowerCase().includes(term) ||
    (book.isbn && book.isbn.includes(term))
  );
};

const LoanController = {
  // Hook para manejar préstamos con Supabase - VERSIÓN COMPLETA
  useLoanManager: () => {
    const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
    const [solicitudesActivas, setSolicitudesActivas] = useState([]);
    const [concluidos, setConcluidos] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos al montar el componente
    useEffect(() => {
      loadAllData();
    }, []);

    const loadAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadPendientes(),
          loadActivas(),
          loadConcluidos()
        ]);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    const loadPendientes = async () => {
      try {
        const data = await LoanModel.getPendingSolicitudes();
        setSolicitudesPendientes(data);
      } catch (err) {
        console.error('Error al cargar pendientes:', err);
      }
    };

    const loadActivas = async () => {
      try {
        const data = await LoanModel.getSolicitudes();
        setSolicitudesActivas(data);
      } catch (err) {
        console.error('Error al cargar activas:', err);
      }
    };

    const loadConcluidos = async () => {
      try {
        const data = await LoanModel.getConcluidos();
        setConcluidos(data);
      } catch (err) {
        console.error('Error al cargar concluidos:', err);
      }
    };

    // Agregar nueva solicitud de préstamo
    const addLoan = async (loanData) => {
      try {
        const result = await LoanModel.createLoan(loanData);

        if (!result.success) {
          setError(result.error || 'Error al crear préstamo');
          return { success: false, message: result.error };
        }

        await loadAllData();
        return { success: true, message: 'Préstamo creado exitosamente' };
      } catch (err) {
        console.error('Error al agregar préstamo:', err);
        setError('Error al crear el préstamo');
        return { success: false, message: 'Error al crear el préstamo' };
      }
    };

    // Aceptar préstamo (pending -> active)
    const acceptLoan = async (loanId, acceptedBy) => {
      try {
        const result = await LoanModel.acceptLoan(loanId, acceptedBy);

        if (!result.success) {
          setError(result.error || 'Error al aceptar préstamo');
          return { success: false };
        }

        await loadAllData();
        return { success: true, message: 'Préstamo aceptado' };
      } catch (err) {
        console.error('Error al aceptar préstamo:', err);
        setError('Error al aceptar el préstamo');
        return { success: false };
      }
    };

    // Rechazar préstamo (pending -> cancelled)
    const rejectLoan = async (loanId, rejectedBy) => {
      try {
        const result = await LoanModel.rejectLoan(loanId, rejectedBy);

        if (!result.success) {
          setError(result.error || 'Error al rechazar préstamo');
          return { success: false };
        }

        await loadAllData();
        return { success: true, message: 'Préstamo rechazado' };
      } catch (err) {
        console.error('Error al rechazar préstamo:', err);
        setError('Error al rechazar el préstamo');
        return { success: false };
      }
    };

    // Concluir préstamo (active -> returned)
    const concludeLoan = async (loanId) => {
      try {
        const result = await LoanModel.markAsReturned(loanId);

        if (!result.success) {
          setError(result.error || 'Error al concluir préstamo');
          return { success: false };
        }

        await loadAllData();
        return { success: true, message: 'Libro devuelto exitosamente' };
      } catch (err) {
        console.error('Error al concluir préstamo:', err);
        setError('Error al concluir el préstamo');
        return { success: false };
      }
    };

    // Editar préstamo
    const editLoan = async (loanId, updates, editedBy) => {
      try {
        const result = await LoanModel.updateLoan(loanId, updates, editedBy);

        if (!result.success) {
          setError(result.error || 'Error al editar préstamo');
          return { success: false };
        }

        await loadAllData();
        return { success: true, message: 'Préstamo actualizado' };
      } catch (err) {
        console.error('Error al editar préstamo:', err);
        setError('Error al editar el préstamo');
        return { success: false };
      }
    };

    // Combinar pendientes y activas para mostrar en la tabla
    const allSolicitudes = [...solicitudesPendientes, ...solicitudesActivas];

    // Filtrar solicitudes
    const filteredSolicitudes = allSolicitudes.filter(p =>
      (p.userName && p.userName.toLowerCase().includes(filter.toLowerCase())) ||
      (p.bookTitle && p.bookTitle.toLowerCase().includes(filter.toLowerCase())) ||
      (p.userEmail && p.userEmail.toLowerCase().includes(filter.toLowerCase()))
    );

    // Exportar PDF con los datos actuales
    const exportarPDF = async () => {
      try {
        const doc = new jsPDF();

        const lineHeight = 5;
        const blockHeight = 40;
        const imageWidth = 25;
        const imageHeight = 35;
        const margin = 14;

        let y = 20;

        const solicitudesActivas = allSolicitudes.filter(p => p.status === 'active');
        const concluidosData = concluidos;

        const generateRecords = (title, data, isConcluded) => {
          if (y > 270 - 20) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(14);
          doc.text(title, margin, y);
          doc.setFontSize(10);
          y += 10;

          data.forEach((p, idx) => {
            if (y + blockHeight > 270) {
              doc.addPage();
              y = 20;
            }

            try {
              if (p.bookImg && p.bookImg.startsWith('http')) {
                doc.addImage(p.bookImg, 'JPEG', margin, y, imageWidth, imageHeight);
              } else {
                doc.rect(margin, y, imageWidth, imageHeight);
                doc.text(`[Sin imagen]`, margin + 3, y + imageHeight / 2);
              }
            } catch (e) {
              doc.rect(margin, y, imageWidth, imageHeight);
              doc.text(`[Error CORS]`, margin + 2, y + imageHeight / 2);
            }

            const textX = margin + imageWidth + 5;
            let textY = y + 5;

            doc.setFontSize(12);
            doc.text(`${p.bookTitle}`, textX, textY);
            doc.setFontSize(10);
            textY += lineHeight * 2;

            doc.text(`Usuario: ${p.userName}`, textX, textY);
            textY += lineHeight;
            doc.text(`Email: ${p.userEmail}`, textX, textY);
            textY += lineHeight;
            doc.text(`Biblioteca: ${p.libraryName || 'N/A'}`, textX, textY);
            textY += lineHeight;

            if (isConcluded) {
              doc.text(`Devuelto: ${p.actualReturnDate || 'N/A'}`, textX, textY);
              textY += lineHeight;
            } else {
              doc.text(`Fecha Préstamo: ${new Date(p.loanDate).toLocaleDateString()}`, textX, textY);
              textY += lineHeight;
              doc.text(`Devolución Esperada: ${new Date(p.expectedReturnDate).toLocaleDateString()}`, textX, textY);
              textY += lineHeight;
            }

            y += blockHeight + 5;
          });
        };

        doc.setFontSize(16);
        doc.text('Historial de Préstamos', margin, 10);

        generateRecords('Préstamos Activos', solicitudesActivas, false);

        y += 10;
        generateRecords('Historial de Préstamos Devueltos', concluidosData, true);

        doc.save('historial_prestamos.pdf');
        return { success: true };
      } catch (error) {
        console.error('Error al generar PDF:', error);
        return { success: false, error: error.message };
      }
    };

    // Limpiar historial
    const clearHistory = async () => {
      try {
        const result = await LoanModel.clearAllData();
        
        if (!result.success) {
          setError(result.error || 'Error al limpiar historial');
          return { success: false };
        }

        await loadAllData();
        return { success: true };
      } catch (err) {
        console.error('Error al limpiar historial:', err);
        return { success: false };
      }
    };

    return {
      solicitudesPendientes,
      solicitudesActivas,
      filteredSolicitudes,
      concluidos,
      loading,
      error,
      addLoan,
      acceptLoan,
      rejectLoan,
      concludeLoan,
      editLoan,
      setFilter,
      exportarPDF,
      clearHistory,
      reloadData: loadAllData
    };
  },

  filterBookCatalog: filterBookCatalog
};

export default LoanController;