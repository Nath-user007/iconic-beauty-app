/**
 * ============================================
 * NOTIFICATIONS.JS - Notificaciones Locales
 * ============================================
 */

const NOTIFICATIONS = {
    
    /**
     * Enviar confirmación (por ahora solo muestra alerta)
     */
    sendConfirmationWhatsApp: async function(appointment) {
        console.log("📱 Confirmación (WhatsApp no configurado):", appointment.clientPhone);
        return true;
    },
    
    /**
     * Enviar recordatorio
     */
    sendReminderWhatsApp: async function(appointment) {
        console.log("⏰ Recordatorio (WhatsApp no configurado):", appointment.clientPhone);
        return true;
    },
    
    /**
     * Notificación del navegador
     */
    sendBrowserNotification: function(title, options = {}) {
        try {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    icon: '/icon-iconic.png',
                    ...options
                });
            }
        } catch (error) {
            console.log("Notificación:", title);
        }
    },
    
    /**
     * Pedir permiso para notificaciones
     */
    requestBrowserPermission: async function() {
        try {
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
            }
            return true;
        } catch (error) {
            return false;
        }
    }
};

console.log("✓ Notificaciones inicializadas");