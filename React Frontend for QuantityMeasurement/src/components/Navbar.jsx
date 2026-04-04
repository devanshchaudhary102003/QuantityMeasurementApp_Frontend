import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_STYLES = `
  .qm-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 56px; background: var(--bg);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 28px;
  }

  .qm-nav-brand {
    display: flex; align-items: center; gap: 10px; text-decoration: none;
  }
  .qm-nav-logo {
    width: 34px; height: 34px; background: var(--amber);
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 900; color: #111;
  }
  .qm-nav-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 800;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--text);
  }

  .qm-nav-right { display: flex; align-items: center; gap: 10px; }

  .qm-nav-badge {
    padding: 5px 12px; border: 1px solid var(--border);
    border-radius: 4px; font-family: 'Barlow', sans-serif;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--text2);
  }

  .qm-nav-avatar {
    width: 32px; height: 32px; border-radius: 4px;
    background: var(--amber);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 900; color: #111;
  }
  .qm-nav-username {
    font-size: 14px; font-weight: 600; color: var(--text2);
  }

  .qm-nav-btn {
    padding: 6px 14px; border: 1px solid var(--border);
    border-radius: 4px; background: none;
    font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text2); cursor: pointer; transition: border-color 0.2s, color 0.2s;
  }
  .qm-nav-btn:hover { border-color: var(--amber); color: var(--amber); }

  @media (max-width: 520px) {
    .qm-nav { padding: 0 16px; }
    .qm-nav-username { display: none; }
  }
`;

export default function Navbar() {
  const { token, userName, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/'); }

  return (
    <>
      <style>{NAV_STYLES}</style>
      <nav className="qm-nav">
        <div className="qm-nav-brand">
          <div className="qm-nav-logo">A</div>
          <span className="qm-nav-title">QMEASURE</span>
        </div>

        <div className="qm-nav-right">
          {token ? (
            <>
              <div className="qm-nav-avatar">
                {(userName || 'U')[0].toUpperCase()}
              </div>
              <span className="qm-nav-username">{userName || 'User'}</span>
              <button className="qm-nav-btn" onClick={handleLogout}>SIGN OUT</button>
            </>
          ) : (
            <>
              <span className="qm-nav-badge">GUEST MODE</span>
              <button className="qm-nav-btn" onClick={() => navigate('/')}>SIGN IN</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
