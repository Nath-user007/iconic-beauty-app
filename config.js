/**
 * ============================================
 * CONFIGURACIÓN - ICONIC Beauty App
 * ============================================
 * 
 * Este archivo contiene todas las claves y configuraciones
 * que necesita la aplicación para funcionar.
 * 
 * IMPORTANTE: Nunca compartas estas claves en público,
 * especialmente en GitHub. Úsalas con una archivo .env
 */

// ============================================
// 1. CONFIGURACIÓN DE FIREBASE
// ============================================
// Firebase es la base de datos que usaremos
// Pasos para obtener estas claves:
// 1. Ve a https://firebase.google.com
// 2. Crea un proyecto nuevo
// 3. Ve a Configuración del Proyecto
// 4. Copia estas credenciales

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD_TU_EJEMPLO_REEMPLAZA_ESTO",
    authDomain: "iconic-beauty-app.firebaseapp.com",
    projectId: "iconic-beauty-app",
    storageBucket: "iconic-beauty-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// ============================================
// 2. CONFIGURACIÓN DE TWILIO (Para WhatsApp)
// ============================================
// Twilio envía mensajes de WhatsApp automáticamente
// Pasos:
// 1. Ve a https://www.twilio.com
// 2. Crea una cuenta
// 3. Ve a Console → Messaging → Try it Out
// 4. Obtén tu número de Twilio

const TWILIO_CONFIG = {
    accountSid: "ACxxxxxxxxxxxxxxxx",  // Tu Account SID
    authToken: "your_auth_token",       // Tu Auth Token
    whatsappNumber: "+1234567890",      // Tu número Twilio (incluyendo +)
    apiUrl: "https://api.twilio.com/2010-04-01/"
};

// ============================================
// 3. CONFIGURACIÓN DE GOOGLE CALENDAR
// ============================================
// Para sincronizar con Google Calendar
// Pasos:
// 1. Ve a Google Cloud Console
// 2. Activa Google Calendar API
// 3. Crea una OAuth 2.0 ID de cliente

const GOOGLE_CONFIG = {
    clientId: "your-client-id.apps.googleusercontent.com",
    apiKey: "your_api_key",
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scopes: "https://www.googleapis.com/auth/calendar"
};

// ============================================
// 4. CONFIGURACIÓN DE DEUNA (Pagos)
// ============================================
// Para integrar pagos con código DEUNA

const DEUNA_CONFIG = {
    merchantId: "iconic-beauty",
    apiKey: "your_deuna_api_key",
    sandboxMode: true  // Cambiar a false en producción
};

// ============================================
// 5. CONFIGURACIÓN LOCAL (Horarios, etc)
// ============================================

const APP_CONFIG = {
    // Nombre del negocio
    businessName: "ICONIC Beauty",
    
    // Horarios por defecto
    schedule: {
        startHour: "09:00",
        endHour: "20:00",
        timeInterval: 30,  // minutos entre turnos
        nonWorkDays: ["domingo"]  // días sin atención
    },
    
    // Servicios disponibles
    services: {
        cejas: [
            { 
                id: "pigmentacion-cejas",
                name: "Pigmentación de cejas", 
                price: 5, 
                duration: 15  // minutos
            },
            { 
                id: "laminado-cejas",
                name: "Laminado de cejas", 
                price: 7, 
                duration: 45 
            },
            { 
                id: "brown-lamination",
                name: "Brown lamination", 
                price: 10, 
                duration: 60 
            },
            { 
                id: "cejas-iconicas",
                name: "Cejas Icónicas", 
                price: 12, 
                duration: 60 
            }
        ],
        pestanas: [
            { 
                id: "efecto-clasico",
                name: "Efecto Clásico", 
                price: 25, 
                duration: 90 
            },
            { 
                id: "efecto-rimel",
                name: "Efecto Rimel", 
                price: 25, 
                duration: 90 
            },
            { 
                id: "efecto-volumen",
                name: "Efecto Volumen", 
                price: 30, 
                duration: 90 
            },
            { 
                id: "efecto-whispy",
                name: "Efecto Whispy", 
                price: 30, 
                duration: 120 
            },
            { 
                id: "efecto-megavolumen",
                name: "Efecto Megavolumen", 
                price: 35, 
                duration: 120 
            },
            { 
                id: "efecto-tecnologico",
                name: "Efecto Tecnológico", 
                price: 30, 
                duration: 120 
            },
            { 
                id: "retoques",
                name: "Retoques", 
                price: 15, 
                duration: 30 
            }
        ],
        manicure: [
            { 
                id: "manicure-basico",
                name: "Manicure Básico", 
                price: 15, 
                duration: 30 
            },
            { 
                id: "manicure-gel",
                name: "Manicure Gel", 
                price: 25, 
                duration: 45 
            },
            { 
                id: "diseño-uñas",
                name: "Diseño de Uñas", 
                price: 20, 
                duration: 60 
            }
        ],
        pedicure: [
            { 
                id: "pedicure-basico",
                name: "Pedicure Básico", 
                price: 18, 
                duration: 30 
            },
            { 
                id: "pedicure-gel",
                name: "Pedicure Gel", 
                price: 28, 
                duration: 45 
            },
            { 
                id: "pedicure-diseño",
                name: "Pedicure con Diseño", 
                price: 35, 
                duration: 60 
            }
        ]
    }
};

// ============================================
// EXPORTAR CONFIGURACIÓN
// ============================================
// Si estamos usando módulos ES6, podemos exportar:
// export { FIREBASE_CONFIG, TWILIO_CONFIG, GOOGLE_CONFIG, APP_CONFIG };

console.log("✓ Configuración cargada correctamente");
