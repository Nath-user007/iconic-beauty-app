/**
 * ============================================
 * DATABASE.JS - Gestión Local (localStorage)
 * ============================================
 * 
 * Versión simplificada que NO usa Firebase.
 * Perfecta para aprender y probar.
 * Firebase se puede agregar después.
 */

const DB = {
    
    /**
     * CREAR una nueva cita
     */
    createAppointment: async function(appointmentData) {
        try {
            const appointment = {
                ...appointmentData,
                id: appointmentData.id || Date.now().toString(),
                createdAt: appointmentData.createdAt || new Date().toISOString(),
                status: appointmentData.status || "confirmada"
            };
            
            // Guardar en localStorage
            let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            appointments.push(appointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            console.log("✓ Cita creada:", appointment.id);
            return appointment;
        } catch (error) {
            console.error("✗ Error creando cita:", error);
            throw error;
        }
    },
    
    /**
     * LEER todas las citas
     */
    getAllAppointments: async function() {
        try {
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            console.log(`✓ Obtenidas ${appointments.length} citas`);
            return appointments;
        } catch (error) {
            console.error("✗ Error obteniendo citas:", error);
            return [];
        }
    },
    
    /**
     * LEER citas de una fecha específica
     */
    getAppointmentsByDate: async function(date) {
        try {
            const allAppointments = await this.getAllAppointments();
            const filteredAppointments = allAppointments.filter(apt => apt.date === date);
            return filteredAppointments;
        } catch (error) {
            console.error("✗ Error obteniendo citas por fecha:", error);
            return [];
        }
    },
    
    /**
     * LEER una cita específica por ID
     */
    getAppointmentById: async function(appointmentId) {
        try {
            const appointments = await this.getAllAppointments();
            const appointment = appointments.find(apt => apt.id === appointmentId);
            if (!appointment) throw new Error("Cita no encontrada");
            return appointment;
        } catch (error) {
            console.error("✗ Error obteniendo cita:", error);
            return null;
        }
    },
    
    /**
     * ACTUALIZAR una cita existente
     */
    updateAppointment: async function(appointmentId, updates) {
        try {
            let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            appointments = appointments.map(apt => 
                apt.id === appointmentId ? { ...apt, ...updates, updatedAt: new Date().toISOString() } : apt
            );
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            console.log("✓ Cita actualizada:", appointmentId);
            return true;
        } catch (error) {
            console.error("✗ Error actualizando cita:", error);
            throw error;
        }
    },
    
    /**
     * ELIMINAR una cita
     */
    deleteAppointment: async function(appointmentId) {
        try {
            let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            appointments = appointments.filter(apt => apt.id !== appointmentId);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            console.log("✓ Cita eliminada:", appointmentId);
            return true;
        } catch (error) {
            console.error("✗ Error eliminando cita:", error);
            throw error;
        }
    },
    
    /**
     * GUARDAR configuración de horarios
     */
    saveScheduleConfig: async function(scheduleData) {
        try {
            localStorage.setItem('scheduleConfig', JSON.stringify(scheduleData));
            console.log("✓ Configuración guardada");
            return true;
        } catch (error) {
            console.error("✗ Error guardando configuración:", error);
            throw error;
        }
    },
    
    /**
     * OBTENER configuración de horarios
     */
    getScheduleConfig: async function() {
        try {
            const config = localStorage.getItem('scheduleConfig');
            if (config) {
                return JSON.parse(config);
            }
            // Retornar configuración por defecto
            return APP_CONFIG.schedule;
        } catch (error) {
            console.error("✗ Error obteniendo configuración:", error);
            return APP_CONFIG.schedule;
        }
    }
};

console.log("✓ Database inicializada (localStorage)");