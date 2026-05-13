/* ══════════════════════════════════════════════
   login.js  —  Quantity Measurement App
   Login & Signup page logic
══════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────
   Update this port to match your launchSettings.json
   https profile → applicationUrl → port number
─────────────────────────────────────────────*/
var API = 'http://localhost:5042/api';

/* ── Redirect if user is already logged in ── */
if (localStorage.getItem('qm_token')) {
  window.location.href = 'dashboard.html';
}

/* ══════════════════════════════════════════════
   TAB SWITCHING  (Login ↔ Signup)
══════════════════════════════════════════════ */
function switchTab(tab) {
  var tabs   = ['login', 'signup'];

  tabs.forEach(function (t) {
    document.getElementById('tab-'   + t).classList.toggle('active', t === tab);
    document.getElementById('panel-' + t).classList.toggle('active', t === tab);
  });

  /* Clear any existing messages */
  hideMsg('loginMsg');
  hideMsg('signupMsg');

  /* Update footer text */
  var footer = document.getElementById('cardFooter');
  if (tab === 'login') {
    footer.innerHTML = 'Don\'t have an account? <a onclick="switchTab(\'signup\')">Sign up</a>';
  } else {
    footer.innerHTML = 'Already have an account? <a onclick="switchTab(\'login\')">Login</a>';
  }
}

/* ══════════════════════════════════════════════
   PASSWORD EYE TOGGLE
══════════════════════════════════════════════ */
var EYE_CLOSED = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C6.48 20 2 12 2 12'
               + ' a17.6 17.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4'
               + ' c5.52 0 10 8 10 8a17.8 17.8 0 0 1-2.36 3.38M1 1l22 22"/>';

var EYE_OPEN   = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>'
               + '<circle cx="12" cy="12" r="3"/>';

function toggleEye(inputId, btn) {
  var input    = document.getElementById(inputId);
  var isHidden = (input.type === 'password');

  input.type = isHidden ? 'text' : 'password';
  btn.querySelector('svg').innerHTML = isHidden ? EYE_OPEN : EYE_CLOSED;
}

/* ══════════════════════════════════════════════
   MESSAGE HELPERS
══════════════════════════════════════════════ */
function showMsg(id, text, type) {
  var el      = document.getElementById(id);
  el.textContent = text;
  el.className   = 'msg-box ' + type;
}

function hideMsg(id) {
  document.getElementById(id).className = 'msg-box';
}

/* ══════════════════════════════════════════════
   BUTTON LOADING STATE
══════════════════════════════════════════════ */
function setLoading(btnId, on) {
  var btn    = document.getElementById(btnId);
  btn.disabled = on;
  btn.classList.toggle('loading', on);
}

/* ══════════════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════════════ */
function forgotPassword(e) {
  e.preventDefault();
  var email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    showMsg('loginMsg', 'Please enter your email address first.', 'error');
    return;
  }
  alert('Password reset link sent to: ' + email + '\n(Wire up your reset endpoint here.)');
}

/* ══════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════ */
async function handleLogin() {
  hideMsg('loginMsg');

  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;

  /* Client-side validation */
  if (!email) {
    showMsg('loginMsg', 'Email is required.', 'error');
    return;
  }
  if (!password) {
    showMsg('loginMsg', 'Password is required.', 'error');
    return;
  }

  setLoading('loginBtn', true);

  try {
    var res  = await fetch(API + '/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email, password: password })
    });

    var data = await res.json();

    if (!res.ok) {
      showMsg('loginMsg', data.message || 'Invalid credentials. Please try again.', 'error');
      return;
    }

    /* Save token & username, then redirect */
    localStorage.setItem('qm_token',    data.token);
    localStorage.setItem('qm_username', data.userName || email);

    showMsg('loginMsg', 'Login successful! Redirecting…', 'success');
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 800);

  } catch (err) {
    showMsg('loginMsg',
      'Cannot connect to server. Make sure your API is running on ' + API,
      'error');
  } finally {
    setLoading('loginBtn', false);
  }
}

/* ══════════════════════════════════════════════
   SIGNUP
══════════════════════════════════════════════ */
async function handleSignup() {
  hideMsg('signupMsg');

  var username = document.getElementById('signupUsername').value.trim();
  var email    = document.getElementById('signupEmail').value.trim();
  var password = document.getElementById('signupPassword').value;
  var phone    = document.getElementById('signupPhone').value.trim();

  /* Client-side validation */
  if (!username) {
    showMsg('signupMsg', 'Full Name is required.', 'error');
    return;
  }
  if (!email) {
    showMsg('signupMsg', 'Email is required.', 'error');
    return;
  }
  if (!password) {
    showMsg('signupMsg', 'Password is required.', 'error');
    return;
  }
  if (password.length < 6) {
    showMsg('signupMsg', 'Password must be at least 6 characters.', 'error');
    return;
  }
  if (!phone) {
    showMsg('signupMsg', 'Phone number is required.', 'error');
    return;
  }

  setLoading('signupBtn', true);

  try {
    var res  = await fetch(API + '/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        username: username,
        email:    email,
        password: password,
        phone:    phone
      })
    });

    var data = await res.json();

    if (!res.ok) {
      showMsg('signupMsg', data.message || 'Registration failed. Please try again.', 'error');
      return;
    }

    showMsg('signupMsg', data.message || 'Account created successfully! Please login.', 'success');

    /* Clear fields, then switch to login tab */
    setTimeout(function () {
      document.getElementById('signupUsername').value = '';
      document.getElementById('signupEmail').value    = '';
      document.getElementById('signupPassword').value = '';
      document.getElementById('signupPhone').value    = '';
      switchTab('login');
    }, 1500);

  } catch (err) {
    showMsg('signupMsg',
      'Cannot connect to server. Make sure your API is running on ' + API,
      'error');
  } finally {
    setLoading('signupBtn', false);
  }
}

/* ══════════════════════════════════════════════
   ENTER KEY SUPPORT
══════════════════════════════════════════════ */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  var loginActive = document.getElementById('panel-login').classList.contains('active');
  if (loginActive) {
    handleLogin();
  } else {
    handleSignup();
  }
});
