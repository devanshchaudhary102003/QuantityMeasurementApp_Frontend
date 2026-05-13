import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { measureAPI, roundDisplay } from '../api';

const OP_COLORS = {
  Compare:     { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa',  border: 'rgba(96,165,250,0.25)' },
  Convert:     { bg: 'rgba(245,166,35,0.15)',  text: '#f5a623',  border: 'rgba(245,166,35,0.25)' },
  Addition:    { bg: 'rgba(52,211,153,0.15)',  text: '#34d399',  border: 'rgba(52,211,153,0.25)' },
  Subtraction: { bg: 'rgba(168,85,247,0.15)',  text: '#a855f7',  border: 'rgba(168,85,247,0.25)' },
  Divide:      { bg: 'rgba(249,115,22,0.15)',  text: '#f97316',  border: 'rgba(249,115,22,0.25)' },
};

const CAT_ICON = { Length: '📏', Weight: '⚖️', Temperature: '🌡️', Volume: '🧪' };

const HIST_STYLES = `
  .hist-wrap { color: var(--text); }

  /* Controls row */
  .hist-controls {
    display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;
  }
  .hist-ctrl-btn {
    padding: 6px 12px; border-radius: 4px;
    border: 1px solid var(--border); background: var(--bg2);
    font-family: 'Barlow', sans-serif; font-size: 11px; font-weight: 800;
    letter-spacing: 0.05em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 5px;
  }
  .hist-ctrl-btn.refresh { color: #60a5fa; border-color: rgba(96,165,250,0.3); }
  .hist-ctrl-btn.refresh:hover { background: rgba(96,165,250,0.1); }
  .hist-ctrl-btn.clear { color: #f87171; border-color: rgba(248,113,113,0.3); }
  .hist-ctrl-btn.clear:hover { background: rgba(248,113,113,0.1); }
  .hist-ctrl-btn.cancel { color: var(--text2); }

  /* Filters */
  .hist-filters { display: flex; gap: 8px; margin-bottom: 14px; }
  .hist-filter-sel {
    flex: 1; padding: 7px 10px;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 4px; font-family: 'Barlow', sans-serif;
    font-size: 11px; font-weight: 600; color: var(--text2);
    outline: none; cursor: pointer; appearance: none;
    transition: border-color 0.2s;
  }
  .hist-filter-sel:focus { border-color: var(--amber); }
  .hist-filter-sel option { background: var(--bg2); }

  /* Stats */
  .hist-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 8px; margin-bottom: 14px;
  }
  .hist-stat {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 4px; padding: 10px; text-align: center;
  }
  .hist-stat-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 24px; font-weight: 900; color: var(--amber); line-height: 1;
  }
  .hist-stat-lbl {
    font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text3); margin-top: 3px;
  }

  /* List */
  .hist-list {
    display: flex; flex-direction: column; gap: 6px;
    max-height: 420px; overflow-y: auto; padding-right: 2px;
  }
  .hist-list::-webkit-scrollbar { width: 3px; }
  .hist-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .hist-item {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 4px; padding: 11px 14px;
    display: flex; align-items: center; gap: 10px;
    transition: background 0.12s;
  }
  .hist-item:hover { background: var(--bg3); }

  .hist-op-badge {
    padding: 3px 8px; border-radius: 3px;
    font-size: 9px; font-weight: 800;
    letter-spacing: 0.06em; text-transform: uppercase;
    white-space: nowrap; flex-shrink: 0;
  }
  .hist-desc {
    flex: 1; font-size: 12px; color: var(--text2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hist-result {
    font-size: 14px; font-weight: 800; color: var(--amber); white-space: nowrap;
  }
  .hist-cat {
    font-size: 10px; font-weight: 700; color: var(--text3);
    background: var(--bg3); border-radius: 3px;
    padding: 3px 7px; white-space: nowrap; flex-shrink: 0;
  }

  /* States */
  .hist-empty {
    text-align: center; padding: 48px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .hist-empty-icon {
    width: 56px; height: 56px; background: var(--bg2);
    border: 1px solid var(--border); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 26px;
  }
  .hist-empty-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 900;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .hist-empty-desc { font-size: 12px; color: var(--text3); line-height: 1.6; }
  .hist-login-btn {
    padding: 10px 24px; background: var(--amber);
    border: none; border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 900;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #111; cursor: pointer; transition: background 0.15s;
  }
  .hist-login-btn:hover { background: var(--amber-dark); }

  .hist-loading { text-align: center; padding: 40px; color: var(--text3); font-size: 14px; }
  .hist-err { text-align: center; padding: 32px 20px; color: #f87171; font-size: 13px; }
  .hist-no-records {
    text-align: center; padding: 32px 20px;
    color: var(--text3); font-size: 13px; font-style: italic;
  }
`;

export default function History() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [items,      setItems]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(false);
  const [opFilter,   setOpFilter]   = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { if (token) { load(); loadStats(); } }, [token]);
  useEffect(() => { if (token) load(); }, [opFilter, catFilter]);

  async function load() {
    setLoading(true); setError(false);
    try {
      let res;
      if (opFilter)       res = await measureAPI.historyByOperation(opFilter);
      else if (catFilter) res = await measureAPI.historyByType(catFilter);
      else                res = await measureAPI.history();

      const { ok, status, data } = res;
      if (status === 401) { logout(); navigate('/'); return; }
      if (!ok) { setError(true); return; }
      setItems([...data].reverse());
    } catch { setError(true); }
    finally   { setLoading(false); }
  }

  async function loadStats() {
    try {
      const { ok, data } = await measureAPI.stats();
      if (ok) setStats(data);
    } catch {}
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    try {
      await measureAPI.deleteHistory();
      setItems([]); setStats(null); setConfirming(false);
      loadStats();
    } catch {}
  }

  /* ── Locked (guest) state ── */
  if (!token) {
    return (
      <>
        <style>{HIST_STYLES}</style>
        <div className="hist-empty">
          <div className="hist-empty-icon">🔒</div>
          <div className="hist-empty-title">HISTORY LOCKED</div>
          <div className="hist-empty-desc">
            Sign in to save your operations,<br />view history and track stats.
          </div>
          <button className="hist-login-btn" onClick={() => navigate('/')}>
            SIGN IN TO UNLOCK
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{HIST_STYLES}</style>
      <div className="hist-wrap">

        {/* Controls */}
        <div className="hist-controls">
          <button className="hist-ctrl-btn refresh" onClick={() => { load(); loadStats(); }}>
            ↻ Refresh
          </button>
          {items.length > 0 && (
            <button className="hist-ctrl-btn clear" onClick={handleDelete}>
              {confirming ? '⚠ Confirm Delete' : '✕ Clear'}
            </button>
          )}
          {confirming && (
            <button className="hist-ctrl-btn cancel" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="hist-filters">
          <select className="hist-filter-sel" value={opFilter}
            onChange={e => { setOpFilter(e.target.value); setCatFilter(''); }}>
            <option value="">All Opera…</option>
            {['Compare', 'Addition', 'Subtraction', 'Divide', 'Convert'].map(o =>
              <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="hist-filter-sel" value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setOpFilter(''); }}>
            <option value="">All Categ…</option>
            {['Length', 'Weight', 'Temperature', 'Volume'].map(c =>
              <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
          </select>
        </div>

        {/* Stats */}
        {stats && stats.totalOperations > 0 && (
          <div className="hist-stats">
            <div className="hist-stat">
              <div className="hist-stat-val">{stats.totalOperations}</div>
              <div className="hist-stat-lbl">Total Ops</div>
            </div>
            {(stats.byOperation || []).map(o => (
              <div className="hist-stat" key={o.operation}>
                <div className="hist-stat-val">{o.count}</div>
                <div className="hist-stat-lbl">{o.operation}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading && <div className="hist-loading">Loading history…</div>}
        {error && !loading && <div className="hist-err">⚠ Could not load history. Check your connection.</div>}

        {!loading && !error && items.length === 0 && (
          <div className="hist-no-records">
            No history found{opFilter || catFilter ? ' for this filter' : ''}.<br />
            Run an operation to start tracking!
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="hist-list">
            {items.map((item, i) => {
              const colors = OP_COLORS[item.operation] || { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' };
              let desc = `${roundDisplay(item.value1)} ${item.unit1 || ''}`;
              if (item.operation !== 'Convert' && item.value2 !== 0) {
                desc += ` & ${roundDisplay(item.value2)} ${item.unit2 || ''}`;
              }
              return (
                <div className="hist-item" key={i}>
                  <span className="hist-op-badge" style={{
                    background: colors.bg, color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}>
                    {item.operation}
                  </span>
                  <span className="hist-desc" title={desc}>{desc}</span>
                  <span className="hist-result">= {roundDisplay(item.result)}</span>
                  <span className="hist-cat">
                    {CAT_ICON[item.category] || ''} {item.category}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}
