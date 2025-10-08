// src/controllers/LoanController.js (CÓDIGO COMPLETO Y FINAL)

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import LoanModel from '../models/LoanModel'; 
import BookModel from '../models/BookModel'; // Incluido por si se requiere en el futuro

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
    useLoanManager: () => {
        const [solicitudes, setSolicitudes] = useState(LoanModel.getSolicitudes());
        const [concluidos, setConcluidos] = useState(LoanModel.getConcluidos());
        const [filter, setFilter] = useState('');

        useEffect(() => { LoanModel.saveSolicitudes(solicitudes); }, [solicitudes]);
        useEffect(() => { LoanModel.saveConcluidos(concluidos); }, [concluidos]);

        const addLoan = (nuevo) => {
            setSolicitudes(prev => [...prev, { ...nuevo, estado: 'pendiente' }]);
        };

        const acceptLoan = (index) => {
            setSolicitudes(prev => prev.map((p, i) => 
                i === index ? { ...p, estado: 'aceptado', fecha: new Date().toLocaleDateString() } : p
            ));
        };

        const rejectLoan = (index) => {
            setSolicitudes(prev => prev.filter((_, i) => i !== index));
        };

        const concludeLoan = (index) => {
            const [eliminado] = solicitudes.filter((_, i) => i === index);
            if (eliminado) {
                const concluido = { ...eliminado, fecha_conclusion: new Date().toLocaleDateString() };
                setConcluidos(prev => [...prev, concluido]);
                setSolicitudes(prev => prev.filter((_, i) => i !== index));
            }
        };

        const filteredSolicitudes = solicitudes.filter(p =>
            p.nombre.toLowerCase().includes(filter.toLowerCase()) ||
            p.libro.toLowerCase().includes(filter.toLowerCase())
        );

        // IMPLEMENTACIÓN DEL PDF (CON LÓGICA DE DIBUJO DE IMAGEN)
        const exportarPDF = () => {
            const doc = new jsPDF();
            
            // Parámetros de diseño
            const lineHeight = 5;
            const blockHeight = 40; // Altura reservada por cada registro
            const imageWidth = 25;
            const imageHeight = 35;
            const margin = 14;

            let y = 20;
            const solicitudesAceptadas = LoanModel.getSolicitudes().filter(p => p.estado === 'aceptado');
            const concluidosData = LoanModel.getConcluidos();

            const generateRecords = (title, data, isConcluded) => {
                if (y > 270 - 20) { doc.addPage(); y = 20; }
                doc.setFontSize(14);
                doc.text(title, margin, y); 
                doc.setFontSize(10);
                y += 10;

                data.forEach((p, idx) => {
                    if (y + blockHeight > 270) {
                        doc.addPage();
                        y = 20;
                    }

                    // --- 1. DIBUJAR IMAGEN (Intento de Base64 o URL) ---
                    
                    // Nota: Si p.imagen NO es Base64, esto fallará por CORS.
                    try {
                        if (p.imagen && p.imagen.startsWith('http')) {
                            // Intentamos añadir la imagen. Si falla, el bloque catch dibujará el error.
                            // Para Base64, el segundo argumento debe ser el tipo MIME (e.g., 'PNG', 'JPEG')
                            // Dado que no sabemos el tipo, usamos un simple placeholder en caso de fallo.
                             doc.addImage(p.imagen, 'JPEG', margin, y, imageWidth, imageHeight);
                        } else {
                            doc.rect(margin, y, imageWidth, imageHeight);
                            doc.text(`[No hay URL]`, margin + 3, y + imageHeight / 2);
                        }
                    } catch (e) {
                         // Dibuja un placeholder si falla la carga por CORS
                        doc.rect(margin, y, imageWidth, imageHeight);
                        doc.text(`[Img Falló por CORS]`, margin + 2, y + imageHeight / 2);
                    }
                    
                    const textX = margin + imageWidth + 5;
                    let textY = y + 5;

                    // --- 2. DIBUJAR TEXTO AL LADO DE LA IMAGEN ---
                    doc.setFontSize(12);
                    doc.text(`${p.libro}`, textX, textY);
                    doc.setFontSize(10);
                    textY += lineHeight * 2;
                    
                    doc.text(`Nombre: ${p.nombre}`, textX, textY); textY += lineHeight;
                    doc.text(`Domicilio: ${p.domicilio}`, textX, textY); textY += lineHeight;
                    doc.text(`Teléfono: ${p.telefono}`, textX, textY); textY += lineHeight;
                    
                    if (isConcluded) {
                        doc.text(`Concluido: ${p.fecha_conclusion || 'N/A'}`, textX, textY); textY += lineHeight;
                    } else {
                        doc.text(`Fiador: ${p.fiador}`, textX, textY); textY += lineHeight;
                        doc.text(`Fecha Préstamo: ${p.fecha || 'N/A'}`, textX, textY); textY += lineHeight;
                    }
                    doc.text(`Bibliotecario: ${p.autorizadoPor || 'N/A'}`, textX, textY); textY += lineHeight;
                    
                    y += blockHeight + 5; // Mover Y para el siguiente bloque
                });
            };

            // Generar secciones
            generateRecords("Préstamos Activos Aceptados", solicitudesAceptadas, false);
            
            y += 10; // Espacio extra entre secciones
            generateRecords("Historial de Préstamos Concluidos", concluidosData, true);
            
            doc.save("historial_prestamos.pdf");
        };

        return {
            filteredSolicitudes,
            concluidos,
            addLoan,
            acceptLoan,
            rejectLoan,
            concludeLoan,
            setFilter,
            exportarPDF // Función de PDF actualizada
        };
    },
    filterBookCatalog: filterBookCatalog 
};

export default LoanController;  