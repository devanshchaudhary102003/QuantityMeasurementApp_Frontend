import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

/* ── Replace with your actual Google Client ID ── */
const GOOGLE_CLIENT_ID = '620356479604-07u4rmon7tef0v9fu84d638vparnigou.apps.googleusercontent.com';

/* ── Eye Icon ── */
function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C6.48 20 2 12 2 12a17.6 17.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c5.52 0 10 8 10 8a17.8 17.8 0 0 1-2.36 3.38M1 1l22 22" />
    </svg>
  );
}

function PwField({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="lp-inp"
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', background: 'none',
          border: 'none', cursor: 'pointer', color: 'var(--text3)',
          display: 'flex', alignItems: 'center', padding: 4,
        }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function Alert({ msg }) {
  if (!msg) return null;
  const ok = msg.type === 'success';
  return (
    <div style={{
      padding: '11px 14px', borderRadius: 4, fontSize: 13,
      fontWeight: 600, marginBottom: 16, lineHeight: 1.5,
      background: ok ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
      color: ok ? '#34d399' : '#f87171',
      border: `1px solid ${ok ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'}`,
    }}>{msg.text}</div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.9 29.5 5 24 5 13 5 4 14 4 25s9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 7 29.5 5 24 5 16.3 5 9.7 9.2 6.3 15.2z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10.1-1.9 13.8-5l-6.4-5.4C29.5 36.5 26.9 37 24 37c-5.3 0-9.6-2.8-11.3-7l-6.5 5C9.6 41.2 16.3 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.9 2.4-2.4 4.5-4.4 6l6.4 5.4C37 39.6 44 34 44 25c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

const LP_STYLES = `
  .lp-root {
    position: relative; z-index: 1;
    min-height: 100vh; display: flex;
  }

  /* Left panel */
  .lp-left {
    flex: 1; display: flex; flex-direction: column;
    justify-content: center; padding: 60px 64px;
  }

  .lp-brand {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 72px;
  }
  .lp-logo {
    width: 44px; height: 44px; background: var(--amber);
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 900; color: #111;
  }
  .lp-brand-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px; font-weight: 700; letter-spacing: 0.05em;
    color: var(--text2);
  }
  .lp-brand-name em { color: var(--amber); font-style: normal; }

  .lp-eyebrow {
    font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--amber);
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }
  .lp-eyebrow::before { content: '—'; }

  .lp-headline {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(52px, 6vw, 78px);
    font-weight: 900; line-height: 0.93;
    text-transform: uppercase; margin-bottom: 28px;
  }
  .lp-headline .amber { color: var(--amber); }

  .lp-desc {
    font-size: 15px; color: var(--text2); line-height: 1.7;
    max-width: 400px; margin-bottom: 48px;
  }

  .lp-cats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; max-width: 440px;
  }
  .lp-cat {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 6px; padding: 14px 18px;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .lp-cat-dot {
    width: 8px; height: 8px; border-radius: 1px;
    background: var(--amber); flex-shrink: 0; margin-top: 5px;
  }
  .lp-cat-title {
    font-size: 11px; font-weight: 800; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text); margin-bottom: 4px;
  }
  .lp-cat-units { font-size: 12px; color: var(--text3); }

  /* Right auth panel */
  .lp-right {
    width: 460px; flex-shrink: 0;
    background: var(--bg2); border-left: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px;
  }
  .lp-card { width: 100%; }

  /* Tabs */
  .lp-tabs {
    display: flex; border-bottom: 2px solid var(--border);
    margin-bottom: 32px;
  }
  .lp-tab {
    flex: 1; padding: 14px 10px; background: none; border: none;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text3); cursor: pointer; position: relative; transition: color 0.2s;
  }
  .lp-tab.active { color: var(--text); }
  .lp-tab.active::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 2px; background: var(--amber);
  }

  /* Google btn */
  .lp-google {
    width: 100%; padding: 13px; background: var(--bg3);
    border: 1px solid var(--border); border-radius: 6px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600;
    color: var(--text); cursor: pointer; transition: background 0.2s;
    margin-bottom: 20px;
  }
  .lp-google:hover:not(:disabled) { background: var(--bg4); }
  .lp-google:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Divider */
  .lp-divider {
    text-align: center; font-size: 12px; color: var(--text3);
    margin-bottom: 20px; position: relative;
  }
  .lp-divider::before, .lp-divider::after {
    content: ''; position: absolute; top: 50%;
    width: calc(50% - 16px); height: 1px; background: var(--border);
  }
  .lp-divider::before { left: 0; }
  .lp-divider::after { right: 0; }

  /* Fields */
  .lp-field { margin-bottom: 16px; }
  .lp-field label {
    display: block; font-size: 10px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text3); margin-bottom: 8px;
  }
  .lp-inp {
    width: 100%; padding: 12px 14px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 6px; font-family: 'Barlow', sans-serif;
    font-size: 14px; color: var(--text); outline: none;
    transition: border-color 0.2s;
  }
  .lp-inp::placeholder { color: var(--text3); }
  .lp-inp:focus { border-color: var(--amber); }

  /* Forgot */
  .lp-forgot { text-align: right; margin-bottom: 20px; }
  .lp-forgot a {
    font-size: 12px; color: var(--amber);
    text-decoration: none; font-weight: 600; cursor: pointer;
  }

  /* Submit */
  .lp-submit {
    width: 100%; padding: 14px; background: var(--amber);
    border: none; border-radius: 6px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 900;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #111; cursor: pointer; transition: background 0.15s;
    margin-bottom: 18px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lp-submit:hover:not(:disabled) { background: var(--amber-dark); }
  .lp-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  .lp-spin {
    display: none; width: 18px; height: 18px;
    border: 2.5px solid rgba(0,0,0,0.3); border-top-color: #111;
    border-radius: 50%; animation: lp-rotate 0.7s linear infinite;
  }
  .lp-submit.loading .lp-btn-text { display: none; }
  .lp-submit.loading .lp-spin     { display: block; }
  @keyframes lp-rotate { to { transform: rotate(360deg); } }

  /* Footer */
  .lp-footer {
    text-align: center; font-size: 13px; color: var(--text3);
    margin-bottom: 14px;
  }
  .lp-footer a { color: var(--amber); text-decoration: none; font-weight: 700; cursor: pointer; }

  /* Guest skip */
  .lp-skip {
    text-align: center;
  }
  .lp-skip button {
    background: none; border: none; font-family: 'Barlow', sans-serif;
    font-size: 13px; color: var(--text3); cursor: pointer;
    transition: color 0.2s;
  }
  .lp-skip button:hover { color: var(--text2); }

  @media (max-width: 860px) {
    .lp-left { display: none; }
    .lp-right { width: 100%; border-left: none; }
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const googleBtnRef = useRef(null);

  const [tab,     setTab]     = useState('login');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw,    setLoginPw]    = useState('');
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPw,      setRegPw]      = useState('');
  const [regPhone,   setRegPhone]   = useState('');

  useEffect(() => { if (token) navigate('/dashboard'); }, [token, navigate]);

  useEffect(() => {
    function initGoogle() {
      if (!window.google || !googleBtnRef.current) return;
      if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black', size: 'large',
        shape: 'rectangular', width: 360,
        text: tab === 'login' ? 'continue_with' : 'signup_with',
      });
    }
    if (window.google) { initGoogle(); }
    else {
      window.addEventListener('load', initGoogle);
      return () => window.removeEventListener('load', initGoogle);
    }
  }, [tab]);

  async function handleGoogleCredential(response) {
    setMsg(null); setLoading(true);
    try {
      const { ok, data } = await authAPI.googleLogin(response.credential);
      if (!ok) return setMsg({ type: 'error', text: data.message || 'Google login failed.' });
      login(data.token, data.userName || data.email, data.email);
      setMsg({ type: 'success', text: 'Google login successful! Redirecting…' });
      setTimeout(() => navigate('/dashboard'), 700);
    } catch { setMsg({ type: 'error', text: 'Cannot connect to server.' }); }
    finally { setLoading(false); }
  }

  function sw(t) { setTab(t); setMsg(null); }

  async function handleLogin() {
    setMsg(null);
    if (!loginEmail) return setMsg({ type: 'error', text: 'Email is required.' });
    if (!loginPw)    return setMsg({ type: 'error', text: 'Password is required.' });
    setLoading(true);
    try {
      const { ok, data } = await authAPI.login(loginEmail, loginPw);
      if (!ok) return setMsg({ type: 'error', text: data.message || 'Invalid credentials.' });
      login(data.token, data.userName || loginEmail, loginEmail);
      setMsg({ type: 'success', text: 'Login successful! Redirecting…' });
      setTimeout(() => navigate('/dashboard'), 700);
    } catch { setMsg({ type: 'error', text: 'Cannot connect to server.' }); }
    finally { setLoading(false); }
  }

  async function handleRegister() {
    setMsg(null);
    if (!regName)          return setMsg({ type: 'error', text: 'Full name is required.' });
    if (!regEmail)         return setMsg({ type: 'error', text: 'Email is required.' });
    if (regPw.length < 6) return setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    if (!regPhone)         return setMsg({ type: 'error', text: 'Phone number is required.' });
    setLoading(true);
    try {
      const { ok, data } = await authAPI.register(regName, regEmail, regPw, regPhone);
      if (!ok) return setMsg({ type: 'error', text: data.message || 'Registration failed.' });
      setMsg({ type: 'success', text: data.message || 'Account created! Please login.' });
      setTimeout(() => { setRegName(''); setRegEmail(''); setRegPw(''); setRegPhone(''); sw('login'); }, 1500);
    } catch { setMsg({ type: 'error', text: 'Cannot connect to server.' }); }
    finally { setLoading(false); }
  }

  function handleKey(e) {
    if (e.key !== 'Enter') return;
    tab === 'login' ? handleLogin() : handleRegister();
  }

  const isGoogleConfigured = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  const categories = [
    { title: 'Length',      units: 'Inch · Feet · Yard · Centimeter' },
    { title: 'Weight',      units: 'Gram · Kilogram · Tonne' },
    { title: 'Temperature', units: 'Celsius · Fahrenheit · Kelvin' },
    { title: 'Volume',      units: 'Milliliter · Liter · Gallon' },
  ];

  return (
    <div className="lp-root" onKeyDown={handleKey}>
      <style>{LP_STYLES}</style>

      {/* Left */}
      <div className="lp-left">
        <div className="lp-brand">
          <div className="lp-logo">A</div>
          <span className="lp-brand-name">Q<em>MEASURE</em></span>
        </div>

        <div className="lp-eyebrow">Industrial Precision</div>

        <div className="lp-headline">
          QUANTITY<br />
          <span className="amber">MEASURE</span><br />
          SYSTEM
        </div>

        <p className="lp-desc">
          Professional-grade unit conversion and measurement operations.
          Compare, convert, and calculate across all measurement categories with full history.
        </p>

        <div className="lp-cats">
          {categories.map(c => (
            <div className="lp-cat" key={c.title}>
              <div className="lp-cat-dot" />
              <div>
                <div className="lp-cat-title">{c.title}</div>
                <div className="lp-cat-units">{c.units}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="lp-right">
        <div className="lp-card">
          <div className="lp-tabs">
            {['login', 'signup'].map(t => (
              <button key={t} className={`lp-tab ${tab === t ? 'active' : ''}`} onClick={() => sw(t)}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <Alert msg={msg} />

          {isGoogleConfigured ? (
            <div ref={googleBtnRef} style={{ marginBottom: 20 }} />
          ) : (
            <button className="lp-google" disabled={loading}>
              <GoogleIcon />
              {tab === 'login' ? 'Continue with Google' : 'Sign up with Google'}
            </button>
          )}

          <div className="lp-divider">or</div>

          {tab === 'login' ? (
            <>
              <div className="lp-field">
                <label>Email</label>
                <input className="lp-inp" type="email" placeholder="your@email.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="lp-field">
                <label>Password</label>
                <PwField value={loginPw} onChange={e => setLoginPw(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" />
              </div>
              <div className="lp-forgot">
                <a onClick={() => !loginEmail
                  ? setMsg({ type: 'error', text: 'Enter your email first.' })
                  : alert('Password reset link sent to: ' + loginEmail)}>
                  Forgot Password?
                </a>
              </div>
              <button className={`lp-submit ${loading ? 'loading' : ''}`} onClick={handleLogin} disabled={loading}>
                <span className="lp-btn-text">SIGN IN</span>
                <div className="lp-spin" />
              </button>
            </>
          ) : (
            <>
              <div className="lp-field">
                <label>Full Name</label>
                <input className="lp-inp" type="text" placeholder="John Doe"
                  value={regName} onChange={e => setRegName(e.target.value)} autoComplete="name" />
              </div>
              <div className="lp-field">
                <label>Email</label>
                <input className="lp-inp" type="email" placeholder="your@email.com"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="lp-field">
                <label>Password</label>
                <PwField value={regPw} onChange={e => setRegPw(e.target.value)}
                  placeholder="Min 6 characters" autoComplete="new-password" />
              </div>
              <div className="lp-field">
                <label>Phone Number</label>
                <input className="lp-inp" type="tel" placeholder="+91 98765 43210"
                  value={regPhone} onChange={e => setRegPhone(e.target.value)} autoComplete="tel" />
              </div>
              <button className={`lp-submit ${loading ? 'loading' : ''}`} onClick={handleRegister} disabled={loading}>
                <span className="lp-btn-text">CREATE ACCOUNT</span>
                <div className="lp-spin" />
              </button>
            </>
          )}

          <div className="lp-footer">
            {tab === 'login'
              ? <span>No account? <a onClick={() => sw('signup')}>Create one free</a></span>
              : <span>Have an account? <a onClick={() => sw('login')}>Sign in</a></span>}
          </div>

          <div className="lp-skip">
            <button onClick={() => navigate('/dashboard')}>
              → Continue without login (guest mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
