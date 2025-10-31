// src/models/LoanModel.js - VERSIÓN COMPLETA CON TODAS LAS FUNCIONALIDADES
import { supabase, handleSupabaseError } from '../config/supabaseClient';

const LoanModel = {
  // Crear una nueva solicitud de préstamo
  createLoan: async (loanData) => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([{
          user_id: loanData.userId || null,
          guest_name: loanData.guestName || null,
          guest_email: loanData.guestEmail || null,
          guest_phone: loanData.guestPhone || null,
          guest_address: loanData.guestAddress || null,
          book_id: loanData.bookId,
          library_id: loanData.libraryId,
          expected_return_date: loanData.expectedReturnDate,
          notes: loanData.notes || null,
          status: loanData.status || 'pending' // Por defecto: pending
        }])
        .select(`
          *,
          books(*),
          libraries(*),
          users(full_name, email)
        `)
        .single();

      if (error) return handleSupabaseError(error);

      // Marcar el libro como no disponible
      await supabase
        .from('books')
        .update({ available: false })
        .eq('id', loanData.bookId);

      return { success: true, data };
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener todas las solicitudes PENDIENTES
 // Obtener todas las solicitudes PENDIENTES
getPendingSolicitudes: async () => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        books(title, author, img_url),
        libraries(name),
        user:users!loans_user_id_fkey(full_name, email)
      `)
      .eq('status', 'pending')
      .order('loan_date', { ascending: false });

    if (error) {
      console.error('Error al obtener pendientes:', error);
      return [];
    }

    return data.map(loan => ({
      id: loan.id,
      userId: loan.user_id,
      userName: loan.user_id ? loan.user?.full_name : loan.guest_name,
      userEmail: loan.user_id ? loan.user?.email : loan.guest_email || 'Invitado',
      guestPhone: loan.guest_phone,
      guestAddress: loan.guest_address,
      bookId: loan.book_id,
      bookTitle: loan.books?.title,
      bookAuthor: loan.books?.author,
      bookImg: loan.books?.img_url,
      libraryName: loan.libraries?.name,
      loanDate: loan.loan_date,
      expectedReturnDate: loan.expected_return_date,
      notes: loan.notes,
      status: loan.status,
      estado: 'pendiente'
    }));
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    return [];
  }
},

// Obtener todas las solicitudes ACTIVAS (aceptadas)
getSolicitudes: async () => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        books(title, author, img_url),
        libraries(name),
        user:users!loans_user_id_fkey(full_name, email)
      `)
      .eq('status', 'active')
      .order('loan_date', { ascending: false });

    if (error) {
      console.error('Error al obtener activas:', error);
      return [];
    }

    return data.map(loan => ({
      id: loan.id,
      userId: loan.user_id,
      userName: loan.user_id ? loan.user?.full_name : loan.guest_name,
      userEmail: loan.user_id ? loan.user?.email : loan.guest_email || 'Invitado',
      guestPhone: loan.guest_phone,
      guestAddress: loan.guest_address,
      bookId: loan.book_id,
      bookTitle: loan.books?.title,
      bookAuthor: loan.books?.author,
      bookImg: loan.books?.img_url,
      libraryName: loan.libraries?.name,
      loanDate: loan.loan_date,
      expectedReturnDate: loan.expected_return_date,
      notes: loan.notes,
      status: loan.status,
      estado: 'aceptado'
    }));
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return [];
  }
},

  // ACEPTAR una solicitud (pending -> active)
  acceptLoan: async (loanId, acceptedBy) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          status: 'active',
          last_edited_by: acceptedBy,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al aceptar préstamo:', error);
      return { success: false, error: error.message };
    }
  },

  // RECHAZAR una solicitud (pending -> cancelled)
  rejectLoan: async (loanId, rejectedBy) => {
    try {
      // 1. Obtener el libro asociado
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('book_id')
        .eq('id', loanId)
        .single();

      if (loanError) return handleSupabaseError(loanError);

      // 2. Actualizar el préstamo a cancelled
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'cancelled',
          last_edited_by: rejectedBy,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (updateError) return handleSupabaseError(updateError);

      // 3. Marcar el libro como disponible nuevamente
      await supabase
        .from('books')
        .update({ available: true })
        .eq('id', loanData.book_id);

      return { success: true };
    } catch (error) {
      console.error('Error al rechazar préstamo:', error);
      return { success: false, error: error.message };
    }
  },

  // EDITAR un préstamo
  updateLoan: async (loanId, updates, editedBy) => {
    try {
      const updateData = {
        last_edited_by: editedBy,
        last_edited_at: new Date().toISOString()
      };

      // Solo actualizar los campos que se proporcionaron
      if (updates.expectedReturnDate) updateData.expected_return_date = updates.expectedReturnDate;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.libraryId) updateData.library_id = updates.libraryId;
      if (updates.guestName) updateData.guest_name = updates.guestName;
      if (updates.guestPhone) updateData.guest_phone = updates.guestPhone;
      if (updates.guestAddress) updateData.guest_address = updates.guestAddress;

      const { data, error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', loanId)
        .select()
        .single();

      if (error) return handleSupabaseError(error);

      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar préstamo:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener préstamos concluidos
  // Obtener préstamos concluidos
getConcluidos: async () => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        books(title, author, img_url),
        libraries(name),
        user:users!loans_user_id_fkey(full_name, email)
      `)
      .in('status', ['returned', 'cancelled'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error al obtener concluidos:', error);
      return [];
    }

    return data.map(loan => ({
      id: loan.id,
      userId: loan.user_id,
      userName: loan.user_id ? loan.user?.full_name : loan.guest_name,
      userEmail: loan.user_id ? loan.user?.email : loan.guest_email || 'Invitado',
      bookId: loan.book_id,
      bookTitle: loan.books?.title,
      bookAuthor: loan.books?.author,
      bookImg: loan.books?.img_url,
      libraryName: loan.libraries?.name,
      loanDate: loan.loan_date,
      expectedReturnDate: loan.expected_return_date,
      actualReturnDate: loan.actual_return_date,
      notes: loan.notes,
      status: loan.status,
      nombre: loan.user_id ? loan.user?.full_name : loan.guest_name,
      libro: loan.books?.title,
      autorizadoPor: 'Bibliotecario',
      fecha_conclusion: loan.actual_return_date
    }));
  } catch (error) {
    console.error('Error al obtener préstamos concluidos:', error);
    return [];
  }
},

  // Marcar préstamo como devuelto
  markAsReturned: async (loanId) => {
    try {
      // 1. Obtener el libro asociado
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('book_id')
        .eq('id', loanId)
        .single();

      if (loanError) return handleSupabaseError(loanError);

      // 2. Actualizar el préstamo
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'returned',
          actual_return_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', loanId);

      if (updateError) return handleSupabaseError(updateError);

      // 3. Marcar el libro como disponible
      await supabase
        .from('books')
        .update({ available: true })
        .eq('id', loanData.book_id);

      return { success: true };
    } catch (error) {
      console.error('Error al marcar como devuelto:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancelar préstamo
  cancelLoan: async (loanId) => {
    try {
      // 1. Obtener el libro asociado
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('book_id')
        .eq('id', loanId)
        .single();

      if (loanError) return handleSupabaseError(loanError);

      // 2. Actualizar el préstamo
      const { error: updateError } = await supabase
        .from('loans')
        .update({ status: 'cancelled' })
        .eq('id', loanId);

      if (updateError) return handleSupabaseError(updateError);

      // 3. Marcar el libro como disponible
      await supabase
        .from('books')
        .update({ available: true })
        .eq('id', loanData.book_id);

      return { success: true };
    } catch (error) {
      console.error('Error al cancelar préstamo:', error);
      return { success: false, error: error.message };
    }
  },

  // Limpiar todos los datos (solo para desarrollo/testing)
  clearAllData: async () => {
    try {
      // Primero marcar todos los libros como disponibles
      await supabase
        .from('books')
        .update({ available: true })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Luego eliminar todos los préstamos
      const { error } = await supabase
        .from('loans')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) return handleSupabaseError(error);

      return { success: true };
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      return { success: false, error: error.message };
    }
  }
};

export default LoanModel;