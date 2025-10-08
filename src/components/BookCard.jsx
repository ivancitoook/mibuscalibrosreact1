// src/components/BookCard.jsx (VISTA: Sub-componente)
import React from 'react';

// Se asume que los estilos están en GlobalStyles.css
const BookCard = ({ book, status }) => {
    // VISTA: Determina la clase del badge según el estado (status)
    const badgeClass = status === 'Vigente' ? 'badgevig' : status === 'Expirado' ? 'badgeexp' : 'badge';
    
    // VISTA: Lógica para renderizar estrellas
    const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);

    // VISTA: Ajuste de ruta de imagen (asume que las imágenes locales están en public/Libreria)
    const imgSrc = book.img.startsWith('http') ? book.img : `/Libreria/${book.img}`;

    return (
        <div className="book-card">
            <a href={book.link || "#"}> 
                <img src={imgSrc} alt={book.title} />
            </a>
            <div className={badgeClass}>{book.badge || status}</div>
            <div className="book-title">{book.title}</div>
            <div className="book-author">{book.author}</div>
            <div className="book-editorial">Editorial: {book.editorial}</div>
            <div className="stars">{renderStars(book.stars)}</div>
        </div>
    );
};

export default BookCard;