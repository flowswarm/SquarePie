/* ===== ADMIN MODULE ===== */

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'squarepie2026'
};

const SESSION_KEY = 'sp_admin_session';
const EMAIL_CONFIG_KEY = 'sp_email_config';
const SMTP_CONFIG_KEY = 'sp_smtp_config';

/* ===== AUTH HELPERS ===== */
function isAuthenticated() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data.authenticated && (Date.now() - data.timestamp < 3600000); // 1 hour session
  } catch { return false; }
}

function setSession(username) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    authenticated: true,
    username,
    timestamp: Date.now()
  }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ===== LOGIN PAGE LOGIC ===== */
function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.href = '/admin-dashboard.html';
    return;
  }

  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  const togglePw = document.getElementById('togglePassword');
  const pwInput = document.getElementById('adminPassword');

  // Toggle password visibility
  if (togglePw && pwInput) {
    togglePw.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      togglePw.classList.toggle('is-visible', !isPassword);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;

    // Show loading state
    btn.classList.add('is-loading');
    errorEl.classList.remove('is-visible');

    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        setSession(username);
        btn.classList.remove('is-loading');
        // Success animation
        btn.classList.add('is-success');
        setTimeout(() => {
          window.location.href = '/admin-dashboard.html';
        }, 600);
      } else {
        btn.classList.remove('is-loading');
        errorEl.classList.add('is-visible');
        // Shake animation
        form.classList.add('is-shake');
        setTimeout(() => form.classList.remove('is-shake'), 500);
      }
    }, 800);
  });
}

/* ===== DASHBOARD LOGIC ===== */
function initAdminDashboard() {
  const dash = document.getElementById('adminDash');
  if (!dash) return;

  // Protect dashboard
  if (!isAuthenticated()) {
    window.location.href = '/admin.html';
    return;
  }

  // Set username
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  const userEl = document.getElementById('dashUser');
  if (userEl && session) userEl.textContent = session.username;

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = '/admin.html';
    });
  }

  // Load saved email config
  const savedEmail = localStorage.getItem(EMAIL_CONFIG_KEY);
  if (savedEmail) {
    try {
      const config = JSON.parse(savedEmail);
      const emailInput = document.getElementById('emailAddress');
      const nameInput = document.getElementById('emailName');
      if (emailInput) emailInput.value = config.email || '';
      if (nameInput) nameInput.value = config.displayName || '';
      // Set toggles
      setCheckbox('notifyContact', config.notifyContact);
      setCheckbox('notifyOrders', config.notifyOrders);
      setCheckbox('notifyUpdates', config.notifyUpdates);
      setCheckbox('notifyReviews', config.notifyReviews);
      // Update status
      if (config.email) {
        updateEmailStatus(true, config.email);
      }
    } catch {}
  }

  // Load saved SMTP config
  const savedSmtp = localStorage.getItem(SMTP_CONFIG_KEY);
  if (savedSmtp) {
    try {
      const smtp = JSON.parse(savedSmtp);
      setInputValue('smtpHost', smtp.host);
      setInputValue('smtpPort', smtp.port);
      setInputValue('smtpUser', smtp.user);
      setCheckbox('smtpSSL', smtp.ssl);
    } catch {}
  }

  // Email form submit
  const emailForm = document.getElementById('emailForm');
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('emailAddress').value.trim();
      const displayName = document.getElementById('emailName').value.trim();
      const config = {
        email,
        displayName,
        notifyContact: getCheckbox('notifyContact'),
        notifyOrders: getCheckbox('notifyOrders'),
        notifyUpdates: getCheckbox('notifyUpdates'),
        notifyReviews: getCheckbox('notifyReviews'),
        connectedAt: new Date().toISOString()
      };
      localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
      updateEmailStatus(true, email);
      showToast('Email connected successfully!', 'success');
    });
  }

  // Test email button
  const testBtn = document.getElementById('testEmailBtn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      const email = document.getElementById('emailAddress').value.trim();
      if (!email) {
        showToast('Please enter an email address first.', 'error');
        return;
      }
      testBtn.textContent = 'Sending...';
      testBtn.disabled = true;
      setTimeout(() => {
        showToast(`Test email sent to ${email}`, 'success');
        testBtn.textContent = 'Send Test Email';
        testBtn.disabled = false;
      }, 1500);
    });
  }

  // Disconnect button
  const disconnectBtn = document.getElementById('disconnectBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      localStorage.removeItem(EMAIL_CONFIG_KEY);
      document.getElementById('emailAddress').value = '';
      document.getElementById('emailName').value = '';
      updateEmailStatus(false);
      showToast('Email disconnected.', 'info');
    });
  }

  // SMTP form
  const smtpForm = document.getElementById('smtpForm');
  if (smtpForm) {
    smtpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const smtp = {
        host: document.getElementById('smtpHost').value.trim(),
        port: document.getElementById('smtpPort').value.trim(),
        user: document.getElementById('smtpUser').value.trim(),
        ssl: getCheckbox('smtpSSL')
      };
      localStorage.setItem(SMTP_CONFIG_KEY, JSON.stringify(smtp));
      showToast('SMTP settings saved!', 'success');
    });
  }
}

/* ===== HELPERS ===== */
function setCheckbox(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = value !== false;
}

function getCheckbox(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.value = value;
}

function updateEmailStatus(connected, email = '') {
  const indicator = document.getElementById('emailIndicator');
  const statusText = document.getElementById('emailStatusText');
  const disconnectBtn = document.getElementById('disconnectBtn');

  if (indicator) {
    indicator.classList.toggle('is-connected', connected);
    indicator.classList.toggle('is-disconnected', !connected);
  }
  if (statusText) {
    statusText.textContent = connected ? `Connected — ${email}` : 'Not Connected';
  }
  if (disconnectBtn) {
    disconnectBtn.style.display = connected ? 'inline-flex' : 'none';
  }
}

function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.admin-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast--${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initAdminLogin();
  initAdminDashboard();
});
