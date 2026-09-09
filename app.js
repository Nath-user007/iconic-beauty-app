/**
 * ============================================
 * APP.JS - Lógica Principal de la Aplicación
 * ============================================
 * 
 * Este archivo contiene toda la lógica de:
 * - Gestión de servicios
 * - Cálculo de horarios disponibles
 * - Validación de formularios
 * - Calendario
 * - Panel admin
 */

// Variables globales
let currentCategory = 'cejas';
let selectedService = null;
let calendar = null;

// ============================================
// 1. INICIALIZACIÓN DE LA APP
// ============================================

/**
 * Ejecutar cuando el documento esté totalmente cargado
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log("🚀 Inicializando ICONIC Beauty App...");
    
    // Establecer fecha mínima en input date (hoy + 1 día)
    setMinDate();
    
    // Cargar servicios
    renderServices('cejas');
    
    // Cargar citas existentes
    await loadAppointments();
    
    // Inicializar calendario
    initCalendar();
    
    // Actualizar estadísticas
    updateStats();
    
    // Event listeners
    setupEventListeners();
    
    console.log("✓ App iniciada correctamente");
});

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Formulario de reserva
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await bookAppointment();
        });
    }
    
    // Cambio de fecha
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.addEventListener('change', updateAvailableHours);
    }
}

// ============================================
// 2. GESTIÓN DE SERVICIOS
// ============================================

/**
 * Mostrar servicios de una categoría
 * @param {String} category - Categoría de servicio
 */
function showServiceCategory(category) {
    currentCategory = category;
    
    // Actualizar botones de categoría
    document.querySelectorAll('.service-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');  // ← CAMBIO: event.currentTarget
    
    // Renderizar servicios
    renderServices(category);
}

/**
 * Renderizar servicios de una categoría
 * @param {String} category - Categoría de servicio
 */
function renderServices(category) {
    const servicesList = document.getElementById('servicesList');
    const services = APP_CONFIG.services[category] || [];
    
    servicesList.innerHTML = services.map((service, index) => `
        <div class="service-card" onclick="selectService('${category}-${index}', this)">
            <div class="service-name">${service.name}</div>
            <div class="service-price">$${service.price}</div>
            <div class="service-duration">${service.duration} min</div>
        </div>
    `).join('');
}

/**
 * Seleccionar un servicio
 * @param {String} serviceId - ID del servicio
 * @param {HTMLElement} element - Elemento clickeado
 */
function selectService(serviceId, element) {
    // Remover selección anterior
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Marcar como seleccionado
    element.classList.add('selected');
    selectedService = serviceId;
    
    // Mostrar duración estimada
    const [category, index] = serviceId.split('-');
    const service = APP_CONFIG.services[category][index];
    document.getElementById('estimatedDuration').value = `${service.duration} minutos`;
    
    // Actualizar horarios disponibles
    updateAvailableHours();
}

// ============================================
// 3. GESTIÓN DE HORARIOS
// ============================================

/**
 * Establecer fecha mínima (mañana)
 */
function setMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = minDate;
}

/**
 * Actualizar horarios disponibles según fecha y servicio seleccionado
 */
async function updateAvailableHours() {
    const date = document.getElementById('appointmentDate').value;
    
    if (!date) {
        document.getElementById('timeSlots').innerHTML = '';
        return;
    }
    
    if (!selectedService) {
        alert('Selecciona un servicio primero');
        return;
    }
    
    try {
        // Obtener citas para esa fecha
        const appointmentsOnDate = await DB.getAppointmentsByDate(date);
        
        // Obtener configuración de horarios
        const schedule = await DB.getScheduleConfig();
        
        // Generar horarios disponibles
        const availableHours = calculateAvailableHours(
            schedule,
            appointmentsOnDate,
            selectedService
        );
        
        // Renderizar horarios
        renderTimeSlots(availableHours);
    } catch (error) {
        console.error("Error actualizando horarios:", error);
        // Si hay error, mostrar horarios por defecto
        const defaultHours = generateDefaultHours();
        renderTimeSlots(defaultHours);
    }
}

// Agregar esta función de backup
function generateDefaultHours() {
    const hours = [];
    for (let h = 9; h < 20; h++) {
        for (let m of [0, 30]) {
            hours.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    return hours;
}

/**
 * Calcular horarios disponibles
 * @param {Object} schedule - Configuración de horarios
 * @param {Array} appointments - Citas existentes
 * @param {String} serviceId - ID del servicio
 * @returns {Array} Array de horarios disponibles
 */
function calculateAvailableHours(schedule, appointments, serviceId) {
    const [category, index] = serviceId.split('-');
    const service = APP_CONFIG.services[category][index];
    const serviceDuration = service.duration;
    
    // Parsear horas de inicio y fin
    const [startH, startM] = schedule.startHour.split(':').map(Number);
    const [endH, endM] = schedule.endHour.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const interval = schedule.timeInterval;
    
    // Generar todos los horarios posibles
    const allHours = [];
    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        allHours.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    }
    
    // Obtener horarios ocupados
    const occupiedHours = new Set();
    appointments.forEach(apt => {
        const [h, m] = apt.time.split(':').map(Number);
        const startMin = h * 60 + m;
        const endMin = startMin + apt.duration;
        
        // Marcar todos los minutos durante el servicio como ocupados
        for (let min = startMin; min < endMin; min += interval) {
            const hours = Math.floor(min / 60);
            const mins = min % 60;
            occupiedHours.add(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
        }
    });
    
    // Filtrar horarios disponibles
    const available = allHours.filter(time => !occupiedHours.has(time));
    
    return available;
}

/**
 * Renderizar slots de tiempo
 * @param {Array} hours - Array de horas disponibles
 */
function renderTimeSlots(hours) {
    const container = document.getElementById('timeSlots');
    
    if (hours.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No hay horarios disponibles para esta fecha</p>';
        return;
    }
    
    container.innerHTML = hours.map(hour => `
        <div class="time-slot" onclick="selectTime(this)">${hour}</div>
    `).join('');
}

/**
 * Seleccionar un horario
 */
function selectTime(element) {
    // Remover selección anterior
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Marcar como seleccionado
    element.classList.add('selected');
}

// ============================================
// 4. AGENDAR CITA
// ============================================

/**
 * Procesar agendamiento de cita
 */
async function bookAppointment() {
    try {
        // Obtener datos del formulario
        const clientName = document.getElementById('clientName').value.trim();
        const clientPhone = document.getElementById('clientPhone').value.trim();
        const date = document.getElementById('appointmentDate').value;
        const selectedTimeSlot = document.querySelector('.time-slot.selected');
        
        // Validar datos
        if (!clientName || !clientPhone) {
            showAlert('Por favor completa nombre y teléfono', 'danger');
            return;
        }
        
        if (!selectedService) {
            showAlert('Selecciona un servicio', 'danger');
            return;
        }
        
        if (!date) {
            showAlert('Selecciona una fecha', 'danger');
            return;
        }
        
        if (!selectedTimeSlot) {
            showAlert('Selecciona un horario', 'danger');
            return;
        }
        
        // Obtener datos del servicio
        const [category, index] = selectedService.split('-');
        const service = APP_CONFIG.services[category][index];
        
        // Crear objeto de cita
        const appointmentData = {
            clientName,
            clientPhone,
            service: service.name,
            price: service.price,
            duration: service.duration,
            date,
            time: selectedTimeSlot.textContent,
            category,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: "confirmada"
        };
        
                // Guardar la cita
        try {
            await DB.createAppointment(appointmentData);
        } catch (error) {
            console.error("Error guardando cita:", error);
        }
        
        console.log("✓ Cita creada:", appointmentData);
        
        // Mostrar mensaje de éxito
        showAlert('✓ ¡Cita agendada exitosamente!', 'success');
        
        // Limpiar formulario
        resetForm();
        
        // Actualizar lista de citas del admin
        await loadAppointments();
        updateStats();
        
        // Cambiar a tab de calendario después de 1.5s
        // setTimeout(() => switchTab('calendar'), 1500);  //
        
    } catch (error) {
        console.error("Error agendando cita:", error);
        showAlert('Error al agendar. Intenta nuevamente', 'danger');
    }
}

/**
 * Limpiar formulario
 */
function resetForm() {
    document.getElementById('bookingForm').reset();
    document.getElementById('estimatedDuration').value = '';
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    selectedService = null;
}

// ============================================
// 5. CALENDARIO (FullCalendar)
// ============================================

/**
 * Inicializar calendario
 */
async function initCalendar() {
    const calendarEl = document.getElementById('calendar-container');
    
    if (!calendarEl || !window.FullCalendar) {
        console.warn("FullCalendar no está disponible");
        return;
    }
    
    // Obtener citas existentes
    const appointments = await DB.getAllAppointments();
    
    // Convertir citas a eventos de calendario
    const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.clientName} - ${apt.service}`,
        start: `${apt.date}T${apt.time}`,
        backgroundColor: '#d4af37',
        borderColor: '#1a1a1a',
        textColor: '#1a1a1a',
        extendedProps: apt
    }));
    
    // Crear calendario
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events,
        eventClick: function(info) {
            showAppointmentDetails(info.event.extendedProps);
        },
        datesSet: function() {
            // Recalcular cuando cambia la vista
        }
    });
    
    calendar.render();
    console.log("✓ Calendario inicializado");
}

/**
 * Mostrar detalles de cita en modal
 */
function showAppointmentDetails(apt) {
    const details = `
        Cliente: ${apt.clientName}
        Teléfono: ${apt.clientPhone}
        Servicio: ${apt.service}
        Fecha: ${apt.date}
        Hora: ${apt.time}
        Precio: $${apt.price}
        Estado: ${apt.status}
    `;
    
    // Mostrar en alert (en producción, hacer un modal más bonito)
    alert(details);
}

/**
 * Sincronizar con Google Calendar
 */
async function syncGoogleCalendar() {
    try {
        console.log("Sincronizando con Google Calendar...");
        
        // Verificar si tenemos Google Calendar API cargada
        if (!window.gapi) {
            showAlert('Google Calendar API no está disponible', 'danger');
            return;
        }
        
        showAlert('Función en desarrollo. Pronto podrás sincronizar con Google Calendar', 'info');
        
    } catch (error) {
        console.error("Error sincronizando:", error);
        showAlert('Error en la sincronización', 'danger');
    }
}

/**
 * Exportar calendario a formato ICS
 */
async function exportToICS() {
    try {
        const appointments = await DB.getAllAppointments();
        
        // Construir archivo ICS
        let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ICONIC Beauty//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:ICONIC Beauty Appointments
X-WR-TIMEZONE:UTC
`;
        
        appointments.forEach(apt => {
            const startDate = apt.date.replace(/-/g, '');
            const [h, m] = apt.time.split(':');
            const startTime = `${startDate}T${h}${m}00Z`;
            
            ics += `BEGIN:VEVENT
DTSTART:${startTime}
SUMMARY:${apt.clientName} - ${apt.service}
DESCRIPTION:Cliente: ${apt.clientName}\\nTeléfono: ${apt.clientPhone}\\nPrecio: $${apt.price}
END:VEVENT
`;
        });
        
        ics += `END:VCALENDAR`;
        
        // Descargar archivo
        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iconic-calendar-${new Date().toISOString().split('T')[0]}.ics`;
        a.click();
        
        showAlert('Calendario descargado', 'success');
        
    } catch (error) {
        console.error("Error exportando:", error);
        showAlert('Error exportando calendario', 'danger');
    }
}

// ============================================
// 6. PANEL ADMINISTRADOR
// ============================================

/**
 * Cargar y mostrar todas las citas
 */
async function loadAppointments() {
    try {
        // Intentar obtener de Firebase primero
        let appointments = [];
        
        try {
            if (DB && DB.getAllAppointments) {
                appointments = await DB.getAllAppointments();
            }
        } catch (firebaseError) {
            console.warn("Firebase no disponible, usando localStorage");
        }
        
        // Si no hay en Firebase, usar localStorage
        if (appointments.length === 0) {
            appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        }
        
        const container = document.getElementById('appointmentsList');
        
        if (!container) return;
        
        if (appointments.length === 0) {
            container.innerHTML = '<p class="no-appointments" style="text-align: center; color: #999; padding: 20px;">Sin citas agendadas aún</p>';
            return;
        }
        
        // Ordenar por fecha y hora más recientes primero
        appointments.sort((a, b) => {
            return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
        });
        
        container.innerHTML = appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-title">${apt.clientName}</div>
                        <div style="font-size: 12px; color: #d4af37; margin-top: 4px;">${apt.service}</div>
                    </div>
                    <span class="appointment-status status-${apt.status}">${apt.status}</span>
                </div>
                <div class="appointment-info">
                    <div>📱 ${apt.clientPhone}</div>
                    <div>📅 ${apt.date} a las ${apt.time}</div>
                    <div>💰 $${apt.price}</div>
                </div>
                <div class="appointment-actions" style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 12px;" 
                            onclick="completeAppointment('${apt.id}')">✓ Completada</button>
                    <button class="btn btn-danger" style="flex: 1; padding: 8px; font-size: 12px;" 
                            onclick="cancelAppointment('${apt.id}')">✗ Cancelar</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error("Error cargando citas:", error);
    }
}

/**
 * Marcar cita como completada
 */
async function completeAppointment(appointmentId) {
    try {
        await DB.updateAppointment(appointmentId, { status: 'completada' });
        await loadAppointments();
        updateStats();
        showAlert('Cita marcada como completada', 'success');
    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Cancelar cita
 */
async function cancelAppointment(appointmentId) {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    try {
        // ELIMINAR la cita completamente (no solo cambiar estado)
        await DB.deleteAppointment(appointmentId);
        
        // Recargar lista y actualizar estadísticas
        await loadAppointments();
        updateStats();
        
        showAlert('✓ Cita cancelada', 'success');
    } catch (error) {
        console.error("Error:", error);
        showAlert('Error cancelando cita', 'danger');
    }
}

/**
 * Guardar configuración de horarios
 */
async function saveScheduleConfig() {
    try {
        const config = {
            startHour: document.getElementById('startHour').value,
            endHour: document.getElementById('endHour').value,
            timeInterval: parseInt(document.getElementById('timeInterval').value),
            nonWorkDays: document.getElementById('nonWorkDays').value.split(',').map(d => d.trim())
        };
        
        // Guardar en localStorage primero (funciona sin Firebase)
        localStorage.setItem('scheduleConfig', JSON.stringify(config));
        
        // Intentar guardar en Firebase si está disponible
        if (DB && DB.ref) {
            await DB.saveScheduleConfig(config);
        }
        
        showAlert('✓ Configuración guardada', 'success');
    } catch (error) {
        console.error("Error:", error);
        showAlert('Error guardando configuración', 'danger');
    }
}

/**
 * Filtrar citas por estado
 */
async function filterAppointments() {
    const status = document.getElementById('filterStatus').value;
    let appointments = await DB.getAllAppointments();
    
    if (status) {
        appointments = appointments.filter(apt => apt.status === status);
    }
    
    const container = document.getElementById('appointmentsList');
    container.innerHTML = appointments.map(apt => `
        <div class="appointment-card">
            <div class="appointment-header">
                <div>
                    <div class="appointment-title">${apt.clientName}</div>
                    <div style="font-size: 12px; color: #d4af37; margin-top: 4px;">${apt.service}</div>
                </div>
                <span class="appointment-status status-${apt.status}">${apt.status}</span>
            </div>
            <div class="appointment-info">
                <div>📱 ${apt.clientPhone}</div>
                <div>📅 ${apt.date} a las ${apt.time}</div>
                <div>💰 $${apt.price}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Actualizar estadísticas del admin
 */
async function updateStats() {
    try {
        const appointments = await DB.getAllAppointments();
        const today = new Date().toISOString().split('T')[0];
        
        // Solo contar citas confirmadas y completadas (NO canceladas)
        const activeAppointments = appointments.filter(apt => 
            apt.status !== 'cancelada'
        );
        
        const todayAppointments = activeAppointments.filter(apt => 
            apt.date === today && apt.status !== 'cancelada'
        ).length;
        
        // Calcular ingresos solo de citas completadas
        const revenue = activeAppointments
            .filter(apt => apt.status === 'completada')
            .reduce((sum, apt) => sum + apt.price, 0);
        
        document.getElementById('totalAppointments').textContent = activeAppointments.length;
        document.getElementById('todayAppointments').textContent = todayAppointments;
        document.getElementById('totalRevenue').textContent = `$${revenue}`;
        
    } catch (error) {
        console.error("Error actualizando stats:", error);
    }
}

// ============================================
// 7. NAVEGACIÓN Y UTILIDADES
// ============================================

/**
 * Cambiar entre tabs
 */
function switchTab(tabName) {
    try {
        // Ocultar todos los tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar el tab seleccionado
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Marcar botón como activo
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes('admin') && tabName === 'admin') {
                btn.classList.add('active');
            } else if (btn.textContent.toLowerCase().includes('calendario') && tabName === 'calendar') {
                btn.classList.add('active');
            } else if (btn.textContent.toLowerCase().includes('agendar') && tabName === 'booking') {
                btn.classList.add('active');
            }
        });
    } catch (error) {
        console.error("Error cambiando tab:", error);
    }
}

/**
 * Mostrar alerta
 */
function showAlert(message, type = 'info') {
    try {
        // Buscar o crear elemento de alerta
        let alertDiv = document.querySelector('.alert-container');
        
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.className = 'alert-container';
            alertDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                z-index: 9999;
            `;
            document.body.appendChild(alertDiv);
        }
        
        // Crear el mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            margin-bottom: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        alertDiv.appendChild(messageDiv);
        
        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 4000);
    } catch (error) {
        console.error("Error mostrando alerta:", error);
    }
}

/**
 * Crear elemento de alerta si no existe
 */
function createAlert() {
    const div = document.createElement('div');
    div.id = 'successMsg';
    document.querySelector('.tab-content.active').prepend(div);
    return div;
}

/**
 * Logout
 */
function logout() {
    if (confirm('¿Estás seguro de que quieres salir?')) {
        localStorage.clear();
        location.href = '/login.html';  // Redirigir a login
    }
}
