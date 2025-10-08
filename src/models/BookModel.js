// src/models/BookModel.js (CÓDIGO COMPLETO)

const BookModel = {
    getProfileData: () => ({
        name: "Iván Díaz",
        email: "ivangilberto04@hotmail.com.com",
        fullName: "Iván Gilberto Díaz Sonoqui",
        location: "-",
        photo: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"
    }),

    getLibraries: () => [
        { 
            name: "Biblioteca Fortino León Almada", 
            address: "C. Guerrero, Centro, 83000 Hermosillo, Son.", 
            phone: "662 217 0691", 
            imgUrl: '/Librerias/Fortino León Almada.webp'
        },
        { 
            name: "Biblioteca Rafael Meneses", 
            address: "Av Tabasco 4-5, Modelo, 83190 Hermosillo, Son.", 
            phone: "-", 
            imgUrl: '/Librerias/Rafael Meneses.webp'
        },
    ],

    // Catálogo de Libros (Actualizado con ISBNs para la búsqueda)
    getRecommendedBooks: () => [
        { title: "Culpa Nuestra", author: "Mercedes Ron", editorial: "Molino", img: "https://gandhi.vtexassets.com/arquivos/ids/6835699-1200-auto?v=638780018406300000&width=1200&height=auto&aspect=true", badge: "Los más leídos", stars: 3, link: "1.html", isbn: "9786075740010" },
        { title: "En Agosto Nos Vemos", author: "Gabriel García Márquez", editorial: "Planeta", img: "https://gandhi.vtexassets.com/arquivos/ids/4614852-1200-auto?v=638574589263170000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 4, link: "2.html", isbn: "9788439743071" },
        { title: "Caída Libre", author: "Ali Hazelwood", editorial: "Planeta", img: "https://gandhi.vtexassets.com/arquivos/ids/1817481-1200-auto?v=638585715644300000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 4, link: "3.html", isbn: "9788419822543" },
        { title: "No estás en la lista", author: "Alison Espach", editorial: "VR", img: "https://gandhi.vtexassets.com/arquivos/ids/1799826-1200-auto?v=638491751435830000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 3, link: "4.html", isbn: "9786313003341" },
        { title: "Al final mueren los dos", author: "Adam Silvera", editorial: "Planeta", img: "https://gandhi.vtexassets.com/arquivos/ids/1978915-1200-auto?v=638429277040630000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 4, link: "5.html", isbn: "9788496886704" },
        { title: "La canción de Aquiles", author: "Madeline Miller", editorial: "VR", img: "https://gandhi.vtexassets.com/arquivos/ids/6247194-1200-auto?v=638610088884470000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 3, link: "6.html", isbn: "9788413622132" },
        { title: "La Biblioteca de la Medianoche", author: "Matt Haig", editorial: "AdN", img: "https://gandhi.vtexassets.com/arquivos/ids/6808984-1200-auto?v=638737628486530000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 3, link: "7.html", isbn: "9786075507712" },
        { title: "Heartless", author: "Marissa Meyer", editorial: "VR", img: "https://gandhi.vtexassets.com/arquivos/ids/6619499-1200-auto?v=638658253845130000&width=1200&height=auto&aspect=true", badge: "Recomendados", stars: 3, link: "8.html", isbn: "9786313002979" },
    ],
};

export default BookModel;