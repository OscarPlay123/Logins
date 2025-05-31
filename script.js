// =====================================================================
// !!! MUY IMPORTANTE: REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO SUPABASE !!!
// Puedes encontrarlos en tu dashboard de Supabase, en "Project Settings" -> "API".
// =====================================================================
const SUPABASE_URL = 'https://rhegwyaybgwusskaonbi.supabase.co'; // Ejemplo: 'https://xyzabcdefg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZWd3eWF5Ymd3dXNza2FvbmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NjgxMTMsImV4cCI6MjA2NDI0NDExM30.0uhCTZJrJf2t0DIlP3g-o74mngFT8yRPV_MX-zsSprQ'; // Ejemplo: 'eyJhbGciOiJIUzI1Ni...'
// =====================================================================

// Crear el cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Obtener referencias comunes del DOM
const authContainer = document.getElementById('auth-container');
const messageDiv = document.getElementById('message');

// Referencias específicas para el dashboard (solo en login.html)
const dashboardContainer = document.getElementById('dashboard-container');
const userIdSpan = document.getElementById('user-id');
const userEmailSpan = document.getElementById('user-email');
const userConfirmedSpan = document.getElementById('user-confirmed');
const userRoleSpan = document.getElementById('user-role');
const userInfoDiv = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');

// Función para mostrar mensajes
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
        messageDiv.textContent = '';
    }, 5000);
}

// Esta función es relevante principalmente para login.html
async function updateUIForUser(user) {
    // Solo si estamos en login.html y existen los contenedores del dashboard
    if (dashboardContainer && authContainer) {
        if (user) {
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            userInfoDiv.style.display = 'block';

            userIdSpan.textContent = user.id || 'N/A';
            userEmailSpan.textContent = user.email || 'N/A';
            userConfirmedSpan.textContent = user.confirmed_at ? 'Sí' : 'No';
            userRoleSpan.textContent = user.role || 'N/A';

            // ! Aquí iría la lógica para cargar datos adicionales del perfil si es necesario
        } else {
            authContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            userInfoDiv.style.display = 'none';
            // resetAuthForm(); // Limpiar formulario si vuelves de sesión cerrada
        }
    }
}

// Manejar el formulario de login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');

        loginBtn.disabled = true;
        showMessage('Iniciando sesión...', 'info');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                showMessage(`Error al iniciar sesión: ${error.message}`, 'error');
            } else {
                showMessage('¡Sesión iniciada correctamente!', 'success');
                // Redirigir a la página principal después del login exitoso
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            showMessage('Error al iniciar sesión. Intenta de nuevo.', 'error');
        } finally {
            loginBtn.disabled = false;
        }
    });
}

// Manejar el formulario de REGISTRO (solo si existe en la página actual)
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const registerBtn = document.getElementById('register-btn');

        registerBtn.disabled = true;
        showMessage('Registrando usuario...', 'info');

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            showMessage(`Error al registrar: ${error.message}`, 'error');
            console.error('Error al registrar:', error.message);
        } else if (data.user) {
            showMessage('Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.', 'success');
            console.log('Usuario registrado (necesita confirmación):', data.user);
            // Opcional: Redirigir a la página de login después de un registro exitoso
            // window.location.href = 'login.html';
        } else {
            showMessage('Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.', 'success');
            console.log('Registro exitoso (esperando confirmación de email)');
        }
        registerBtn.disabled = false;
    });
}

// Manejar el clic en el botón de cerrar sesión (solo si existe en la página actual)
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        showMessage('Cerrando sesión...', 'info');
        const { error } = await supabase.auth.signOut();

        if (error) {
            showMessage(`Error al cerrar sesión: ${error.message}`, 'error');
            console.error('Error al cerrar sesión:', error.message);
        } else {
            showMessage('Sesión cerrada exitosamente!', 'success');
            console.log('Sesión cerrada');
            // Redirigir a la página de inicio de sesión después de cerrar sesión
            window.location.href = 'login.html';
        }
    });
}

// --- Manejo del Estado de Autenticación al cargar la página y en tiempo real ---

// Listener para cambios de estado de autenticación (login, logout, etc.)
// Esto es útil para actualizar la UI si el estado cambia (ej. el token expira, o si el usuario inicia sesión desde otro dispositivo)
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    // Solo actualiza la UI si estamos en login.html
    if (dashboardContainer && authContainer) {
        if (session && session.user) {
            updateUIForUser(session.user);
        } else {
            updateUIForUser(null);
        }
    }
});

// Verificar si el usuario ya está logueado al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        window.location.href = 'dashboard.html';
    }
});
