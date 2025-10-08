// src/models/LoanModel.js (CÓDIGO COMPLETO)

const LOANS_KEY = 'solicitudes';
const CONCLUDED_KEY = 'concluidos';

const LoanModel = {
    // Obtener todas las solicitudes activas
    getSolicitudes: () => {
        return JSON.parse(localStorage.getItem(LOANS_KEY)) || [];
    },

    // Guardar todas las solicitudes activas
    saveSolicitudes: (solicitudes) => {
        localStorage.setItem(LOANS_KEY, JSON.stringify(solicitudes));
    },

    // Obtener todos los préstamos concluidos
    getConcluidos: () => {
        return JSON.parse(localStorage.getItem(CONCLUDED_KEY)) || [];
    },

    // Guardar todos los préstamos concluidos
    saveConcluidos: (concluidos) => {
        localStorage.setItem(CONCLUDED_KEY, JSON.stringify(concluidos));
    },

    // NUEVA FUNCIÓN: Limpiar el historial (resetea ambas claves)
    clearAllData: () => {
        localStorage.removeItem(LOANS_KEY);
        localStorage.removeItem(CONCLUDED_KEY);
    },
};

export default LoanModel;