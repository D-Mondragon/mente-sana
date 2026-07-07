/* ════════════════════════════════════════════════════════
   MENTE SANA — Shared JS
   Auth · Toast · Nav state
   Deployment: Vercel static (no server). All state via localStorage.
   ════════════════════════════════════════════════════════ */

const KEYS = {
  USERS:    'ms_users',
  SESSION:  'ms_session',
  BOOKINGS: 'ms_bookings',
  CONTACTS: 'ms_contacts',
};

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 3500) {
  const prev = document.querySelector('.ms-toast');
  if (prev) prev.remove();

  const icons = { success: '✓', error: '✕', info: 'i' };
  const toast = document.createElement('div');
  toast.className = `ms-toast ms-toast--${type}`;
  toast.innerHTML = `<span class="ms-toast__icon">${icons[type] || 'i'}</span><span class="ms-toast__msg">${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('ms-toast--in'));
  });

  setTimeout(() => {
    toast.classList.remove('ms-toast--in');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ─────────────────────────────────────────────
   AUTH HELPERS
───────────────────────────────────────────── */
function getUsers()   { return JSON.parse(localStorage.getItem(KEYS.USERS)   || '[]');  }
function getSession() { return JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null'); }
function saveUsers(u) { localStorage.setItem(KEYS.USERS, JSON.stringify(u)); }

function saveSession(user) {
  localStorage.setItem(KEYS.SESSION, JSON.stringify({
    id: user.id, name: user.name, email: user.email
  }));
}

function clearSession() { localStorage.removeItem(KEYS.SESSION); }
function isLoggedIn()   { return getSession() !== null; }

/* ─────────────────────────────────────────────
   NAV AUTH STATE
───────────────────────────────────────────── */
function updateNavAuth() {
  const session = getSession();
  const targets = [
    document.querySelector('.nav-inner .nav-actions'),
    document.querySelector('.mobile-menu .nav-actions'),
  ].filter(Boolean);

  targets.forEach(el => {
    if (session) {
      el.innerHTML = `
        <a href="mi-cuenta.html" class="nav-user" style="text-decoration:none;">
          <div class="nav-avatar">${session.name.charAt(0).toUpperCase()}</div>
          <span class="nav-user-name">Hola, ${session.name.split(' ')[0]}</span>
        </a>
        <button class="btn btn-ghost btn-sm" onclick="logout()">Salir</button>`;
    } else {
      el.innerHTML = `
        <button class="btn btn-ghost btn-sm" onclick="openAuthModal('login')">Iniciar sesión</button>
        <button class="btn btn-primary btn-sm" onclick="openAuthModal('register')">Registrarse gratis</button>`;
    }
  });
}

/* ─────────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────────── */
let _authOverlay = null;

function buildAuthModal() {
  if (_authOverlay) return;

  _authOverlay = document.createElement('div');
  _authOverlay.id = 'authOverlay';
  _authOverlay.className = 'auth-modal-overlay';
  _authOverlay.setAttribute('role', 'dialog');
  _authOverlay.setAttribute('aria-modal', 'true');
  _authOverlay.setAttribute('aria-label', 'Acceso a tu cuenta');

  _authOverlay.innerHTML = `
    <div class="auth-modal">
      <button class="auth-close" onclick="closeAuthModal()" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div class="auth-brand">
        <img src="img/logo2.png" alt="Mente Sana" class="auth-logo-img">
      </div>

      <div class="auth-tabs" role="tablist">
        <button class="auth-tab-btn active" data-tab="login"    role="tab" onclick="switchAuthTab('login')">Iniciar sesión</button>
        <button class="auth-tab-btn"        data-tab="register" role="tab" onclick="switchAuthTab('register')">Registrarse</button>
      </div>

      <!-- LOGIN -->
      <div class="auth-panel active" id="auth-login" role="tabpanel">
        <p class="auth-subtitle">Bienvenido/a de vuelta</p>
        <form id="loginForm" onsubmit="handleLogin(event)" novalidate>
          <div class="auth-field">
            <label class="form-label" for="loginEmail">Correo electrónico</label>
            <input type="email" id="loginEmail" class="form-input" placeholder="tucorreo@gmail.com" autocomplete="email">
            <span class="auth-error" id="loginEmailErr"></span>
          </div>
          <div class="auth-field">
            <label class="form-label" for="loginPassword">Contraseña</label>
            <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" autocomplete="current-password">
            <span class="auth-error" id="loginPassErr"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-full" style="margin-top:4px;">Ingresar</button>
        </form>
        <p class="auth-switch">¿No tienes cuenta? <a href="#" onclick="switchAuthTab('register');return false;">Regístrate gratis</a></p>
      </div>

      <!-- REGISTER -->
      <div class="auth-panel" id="auth-register" role="tabpanel">
        <p class="auth-subtitle">Crea tu cuenta gratuita</p>
        <form id="registerForm" onsubmit="handleRegister(event)" novalidate>
          <div class="auth-field">
            <label class="form-label" for="regName">Nombre completo</label>
            <input type="text" id="regName" class="form-input" placeholder="Juan Pérez" autocomplete="name">
            <span class="auth-error" id="regNameErr"></span>
          </div>
          <div class="auth-field">
            <label class="form-label" for="regEmail">Correo electrónico</label>
            <input type="email" id="regEmail" class="form-input" placeholder="tucorreo@gmail.com" autocomplete="email">
            <span class="auth-error" id="regEmailErr"></span>
          </div>
          <div class="auth-field">
            <label class="form-label" for="regPassword">Contraseña</label>
            <input type="password" id="regPassword" class="form-input" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
            <span class="auth-error" id="regPassErr"></span>
          </div>
          <button type="submit" class="btn btn-primary btn-full" style="margin-top:4px;">Crear cuenta</button>
        </form>
        <p class="auth-switch">¿Ya tienes cuenta? <a href="#" onclick="switchAuthTab('login');return false;">Inicia sesión</a></p>
      </div>
    </div>`;

  _authOverlay.addEventListener('click', e => {
    if (e.target === _authOverlay) closeAuthModal();
  });

  document.body.appendChild(_authOverlay);
}

function openAuthModal(tab = 'login') {
  buildAuthModal();
  switchAuthTab(tab);
  _authOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const first = _authOverlay.querySelector(`#auth-${tab} .form-input`);
    if (first) first.focus();
  }, 280);
}

function closeAuthModal() {
  if (!_authOverlay) return;
  _authOverlay.classList.remove('active');
  document.body.style.overflow = '';
  _authOverlay.querySelectorAll('.auth-error').forEach(el => el.textContent = '');
  _authOverlay.querySelectorAll('.form-input').forEach(el => {
    el.classList.remove('input-error');
    el.value = '';
  });
}

function switchAuthTab(tab) {
  if (!_authOverlay) return;
  _authOverlay.querySelectorAll('.auth-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  _authOverlay.querySelectorAll('.auth-panel').forEach(p => {
    p.classList.toggle('active', p.id === `auth-${tab}`);
  });
}

/* ─────────────────────────────────────────────
   AUTH HANDLERS
───────────────────────────────────────────── */
function _setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function _clearErrs(...ids) { ids.forEach(id => _setErr(id, '')); }

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  _clearErrs('loginEmailErr', 'loginPassErr');

  let ok = true;
  if (!/\S+@\S+\.\S+/.test(email)) { _setErr('loginEmailErr', 'Ingresa un correo válido.'); ok = false; }
  if (pass.length < 6)             { _setErr('loginPassErr',  'La contraseña debe tener al menos 6 caracteres.'); ok = false; }
  if (!ok) return;

  const user = getUsers().find(u => u.email === email && u.password === pass);
  if (!user) { _setErr('loginPassErr', 'Correo o contraseña incorrectos.'); return; }

  saveSession(user);
  closeAuthModal();
  updateNavAuth();
  showToast(`¡Bienvenido/a de vuelta, ${user.name.split(' ')[0]}!`);
  if (typeof initAccountPage === 'function') initAccountPage();
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPassword').value;
  _clearErrs('regNameErr', 'regEmailErr', 'regPassErr');

  let ok = true;
  if (name.length < 2)             { _setErr('regNameErr',  'Ingresa tu nombre completo.'); ok = false; }
  if (!/\S+@\S+\.\S+/.test(email)) { _setErr('regEmailErr', 'Ingresa un correo válido.'); ok = false; }
  if (pass.length < 6)             { _setErr('regPassErr',  'La contraseña debe tener al menos 6 caracteres.'); ok = false; }
  if (!ok) return;

  const users = getUsers();
  if (users.find(u => u.email === email)) { _setErr('regEmailErr', 'Este correo ya está registrado.'); return; }

  const newUser = { id: Date.now(), name, email, password: pass, createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);
  closeAuthModal();
  updateNavAuth();
  showToast(`Cuenta creada. ¡Bienvenido/a, ${name.split(' ')[0]}!`);
  if (typeof initAccountPage === 'function') initAccountPage();
}

function logout() {
  clearSession();
  updateNavAuth();
  showToast('Sesión cerrada correctamente.', 'info');
  if (window.location.pathname.endsWith('mi-cuenta.html')) {
    setTimeout(() => { window.location.href = 'index.html'; }, 1100);
  }
}

/* ─────────────────────────────────────────────
   GLOBAL KEYBOARD
───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (_authOverlay && _authOverlay.classList.contains('active')) closeAuthModal();
});

/* ─────────────────────────────────────────────
   INIT — works whether script is in <head> or end of <body>
   Also calls optional page-specific hooks if defined.
───────────────────────────────────────────── */
function _globalInit() {
  updateNavAuth();
  if (typeof initFavoriteState          === 'function') initFavoriteState();
  if (typeof initReviewSection          === 'function') initReviewSection();
  if (typeof initAccountPage            === 'function') initAccountPage();
  if (typeof updateFreeConsultVisibility === 'function') updateFreeConsultVisibility();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _globalInit);
} else {
  _globalInit();
}
