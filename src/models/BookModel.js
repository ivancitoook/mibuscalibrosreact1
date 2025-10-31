// src/models/BookModel.js - MIGRADO A SUPABASE
import { supabase, handleSupabaseError } from '../config/supabaseClient';

const BookModel = {
  // Obtener datos del perfil (ahora desde Supabase)
  getProfileData: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, location, photo_url')
        .eq('id', userId)
        .single();

      if (error) return handleSupabaseError(error);

      return {
        name: data.full_name.split(' ')[0], // Primer nombre
        email: data.email,
        fullName: data.full_name,
        location: data.location || '-',
        photo: data.photo_url
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  },

  // Obtener todas las bibliotecas
  getLibraries: async () => {
    try {
      const { data, error } = await supabase
        .from('libraries')
        .select('*')
        .order('name');

      if (error) return handleSupabaseError(error);

      return data.map(lib => ({
        id: lib.id,
        name: lib.name,
        address: lib.address,
        phone: lib.phone,
        imgUrl: lib.img_url
      }));
    } catch (error) {
      console.error('Error al obtener bibliotecas:', error);
      return [];
    }
  },

  // Obtener libros recomendados
  getRecommendedBooks: async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('available', true)
        .order('stars', { ascending: false })
        .limit(8);

      if (error) return handleSupabaseError(error);

      return data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        editorial: book.editorial,
        img: book.img_url,
        badge: book.badge,
        stars: book.stars,
        isbn: book.isbn,
        available: book.available
      }));
    } catch (error) {
      console.error('Error al obtener libros:', error);
      return [];
    }
  },

  // Buscar libros por término de búsqueda
  searchBooks: async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%`)
        .eq('available', true);

      if (error) return handleSupabaseError(error);

      return data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        editorial: book.editorial,
        img: book.img_url,
        badge: book.badge,
        stars: book.stars,
        isbn: book.isbn,
        available: book.available
      }));
    } catch (error) {
      console.error('Error al buscar libros:', error);
      return [];
    }
  },

  // Obtener un libro por ID
  getBookById: async (bookId) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) return handleSupabaseError(error);

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        editorial: data.editorial,
        img: data.img_url,
        badge: data.badge,
        stars: data.stars,
        isbn: data.isbn,
        available: data.available
      };
    } catch (error) {
      console.error('Error al obtener libro:', error);
      return null;
    }
  },

  // Crear un nuevo libro (solo bibliotecarios)
  createBook: async (bookData) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          title: bookData.title,
          author: bookData.author,
          editorial: bookData.editorial,
          isbn: bookData.isbn,
          img_url: bookData.img,
          badge: bookData.badge || 'Nuevo',
          stars: bookData.stars || 0,
          available: true
        }])
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      return { success: true, data };
    } catch (error) {
      console.error('Error al crear libro:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar un libro (solo bibliotecarios)
  updateBook: async (bookId, updates) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .update({
          title: updates.title,
          author: updates.author,
          editorial: updates.editorial,
          isbn: updates.isbn,
          img_url: updates.img,
          badge: updates.badge,
          stars: updates.stars,
          available: updates.available
        })
        .eq('id', bookId)
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar libro:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar un libro (solo bibliotecarios)
  deleteBook: async (bookId) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar libro como no disponible
  markAsUnavailable: async (bookId) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ available: false })
        .eq('id', bookId);

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al marcar libro como no disponible:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar libro como disponible
  markAsAvailable: async (bookId) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ available: true })
        .eq('id', bookId);

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al marcar libro como disponible:', error);
      return { success: false, error: error.message };
    }
  }
};

export default BookModel;