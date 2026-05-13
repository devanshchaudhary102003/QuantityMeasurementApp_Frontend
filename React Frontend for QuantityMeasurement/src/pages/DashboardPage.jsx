import { useState } from 'react';
import Navbar from '../components/Navbar';
import History from '../components/History';
import { measureAPI, UNITS, roundDisplay } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DASH_STYLES = `
  .dash-root { padding-top: 56px; min-height: 100vh; position: relative; z-index: 1; }
  .dash-layout {
    display: flex; min-height: calc(100vh - 56px);
  }
  .dash-main {
    flex: 1; min-width: 0; padding: 28px 28px 80px;
  }
  .dash-sidebar {
    width: 380px; flex-shrink: 0;
    border-left: 1px solid var(--border);
    padding: 28px 20px;
    position: sticky; top: 56px;
    height: calc(100vh - 56px); overflow-y: auto;
  }

  /* Page header */
  .dash-header {
    display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
  }
  .dash-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 900;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .dash-badge {
    padding: 4px 12px; border: 1px solid var(--amber);
    border-radius: 3px; font-size: 10px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--amber);
  }

  /* Section labels */
  .sec-lbl {
    font-size: 10px; font-weight: 800;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text3); margin-bottom: 12px;
  }
  .sec-num { color: var(--amber); margin-right: 4px; }

  /* Category grid */
  .cat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: var(--border);
    border: 1px solid var(--border); border-radius: 6px;
    overflow: hidden; margin-bottom: 24px;
  }
  .cat-btn {
    background: var(--bg2); border: none;
    padding: 18px 10px 14px;
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
    cursor: pointer; transition: background 0.15s;
    font-family: 'Barlow', sans-serif;
  }
  .cat-btn:hover { background: var(--bg3); }
  .cat-btn.active {
    background: rgba(245,166,35,0.1);
    border-top: 2px solid var(--amber);
    padding-top: 16px;
  }
  .cat-icon { font-size: 24px; }
  .cat-label {
    font-size: 10px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3);
  }
  .cat-btn.active .cat-label { color: var(--amber); }

  /* Operation tabs */
  .op-tabs {
    display: flex; border: 1px solid var(--border);
    border-radius: 6px; overflow: hidden; margin-bottom: 24px;
  }
  .op-tab {
    flex: 1; padding: 10px 6px; background: none; border: none;
    border-right: 1px solid var(--border);
    font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 800;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text3); cursor: pointer; transition: all 0.15s;
  }
  .op-tab:last-child { border-right: none; }
  .op-tab:hover { background: var(--bg3); color: var(--text2); }
  .op-tab.active { background: var(--amber); color: #111; }

  /* Input area */
  .two-col {
    display: grid; grid-template-columns: 1fr 44px 1fr;
    gap: 12px; align-items: end; margin-bottom: 20px;
  }
  .f-group { display: flex; flex-direction: column; gap: 6px; }
  .f-lbl {
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3);
  }
  .num-inp {
    width: 100%; padding: 12px 14px;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 4px; font-family: 'Barlow', sans-serif;
    font-size: 20px; font-weight: 700; color: var(--text);
    outline: none; transition: border-color 0.2s;
  }
  .num-inp::placeholder { color: var(--text3); }
  .num-inp:focus { border-color: var(--amber); }

  .unit-sel {
    width: 100%; padding: 10px 14px;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 4px; font-family: 'Barlow', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--text2);
    outline: none; cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='%23555'%3E%3Cpath d='M5 6L0 0h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 30px; transition: border-color 0.2s;
  }
  .unit-sel option { background: var(--bg2); }
  .unit-sel:focus { border-color: var(--amber); }

  .mid-badge {
    height: 44px; background: var(--bg2);
    border: 1px solid var(--border); border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: var(--amber); flex-shrink: 0;
  }
  .spacer-44 { height: 44px; }

  /* Calc button */
  .calc-btn {
    padding: 12px 32px; background: var(--amber);
    border: none; border-radius: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px; font-weight: 900;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #111; cursor: pointer; transition: background 0.15s;
  }
  .calc-btn:hover  { background: var(--amber-dark); }
  .calc-btn:active { transform: scale(0.98); }

  /* Result */
  .result-sec { margin-top: 28px; }
  .result-box {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 6px; padding: 20px 24px;
    min-height: 68px; display: flex; align-items: center;
  }
  .result-placeholder { font-size: 13px; color: var(--text3); font-style: italic; }
  .result-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px; font-weight: 800; color: var(--text);
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  }
  .result-unit-sel {
    font-size: 15px; padding: 6px 12px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 4px; color: var(--text2);
    font-family: 'Barlow', sans-serif; font-weight: 600;
    outline: none; cursor: pointer; appearance: none;
  }
  .result-meta {
    font-size: 12px; color: var(--text3); margin-top: 6px;
  }

  /* Error */
  .err-box {
    padding: 12px 16px; border-radius: 4px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #f87171; font-size: 13px; font-weight: 600;
    margin-top: 12px;
  }

  /* Guest banner */
  .guest-banner {
    margin-top: 16px; padding: 11px 16px;
    background: rgba(245,166,35,0.08);
    border: 1px solid rgba(245,166,35,0.2);
    border-radius: 4px; font-size: 12px; font-weight: 600;
    color: var(--amber); display: flex; align-items: center; gap: 8px;
  }
  .guest-banner a { color: var(--amber); text-decoration: underline; cursor: pointer; }

  /* History sidebar title */
  .hist-sidebar-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 900;
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .hist-sidebar-count {
    padding: 3px 10px; border: 1px solid var(--amber);
    border-radius: 3px; font-size: 10px; font-weight: 800; color: var(--amber);
    font-family: 'Barlow', sans-serif;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .dash-layout { flex-direction: column; }
    .dash-sidebar { width: 100%; position: static; height: auto; border-left: none; border-top: 1px solid var(--border); }
  }
  @media (max-width: 580px) {
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
    .two-col  { grid-template-columns: 1fr; }
    .mid-badge { display: none; }
    .dash-main { padding: 20px 16px 60px; }
  }
`;

/* ── Unit select ── */
function UnitSel({ value, onChange, units }) {
  return (
    <select className="unit-sel" value={value} onChange={e => onChange(e.target.value)}>
      {units.map(u => <option key={u} value={u}>{u}</option>)}
    </select>
  );
}

/* ── Result box ── */
function ResultBox({ result, error }) {
  const [displayVal, setDisplayVal] = useState(null);
  const [selUnit,    setSelUnit]    = useState(null);
  const [cvting,     setCvting]     = useState(false);

  if (error) return <div className="err-box">⚠ {error}</div>;
  if (!result) return null;

  const isArith  = result.rawValue !== undefined;
  const shownVal  = displayVal !== null ? displayVal : result.rawValue;
  const shownUnit = selUnit   !== null ? selUnit    : result.baseUnit;

  async function changeUnit(newUnit) {
    setSelUnit(newUnit);
    if (newUnit === result.baseUnit) { setDisplayVal(result.rawValue); return; }
    setCvting(true);
    try {
      const qty = { value: result.rawValue, unit: result.baseUnit, category: result.category };
      const { ok, data } = await measureAPI.convert(qty, newUnit);
      if (ok) setDisplayVal(data.value !== undefined ? data.value : data.result);
    } catch {}
    setCvting(false);
  }

  return (
    <div className="result-box" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div className="result-value">
        {isArith
          ? (cvting ? '…' : roundDisplay(shownVal))
          : result.value}
        {isArith && result.units && (
          <select className="result-unit-sel" value={shownUnit}
            onChange={e => changeUnit(e.target.value)}>
            {result.units.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        )}
      </div>
      {result.meta && <div className="result-meta">{result.meta}</div>}
    </div>
  );
}

/* ══ PANELS ══ */
function ComparePanel({ type, units, onResult, onError }) {
  const [v1, setV1] = useState('1');   const [u1, setU1] = useState(units[0]);
  const [v2, setV2] = useState('1000'); const [u2, setU2] = useState(units[1] || units[0]);

  async function run() {
    onError(null); onResult(null);
    if (isNaN(parseFloat(v1)) || isNaN(parseFloat(v2))) return onError('Enter valid numbers.');
    try {
      const { ok, data } = await measureAPI.compare(
        { value: parseFloat(v1), unit: u1, category: type },
        { value: parseFloat(v2), unit: u2, category: type }
      );
      if (!ok) return onError(data.message || 'Error');
      const equal = data === true || data === 'true';
      onResult({ value: equal ? '✅  Equal' : '❌  Not Equal', meta: `${v1} ${u1}  vs  ${v2} ${u2}` });
    } catch { onError('Cannot connect to server.'); }
  }

  return (
    <div>
      <div className="two-col">
        <div className="f-group">
          <span className="f-lbl">Value A</span>
          <input className="num-inp" type="number" value={v1} step="any" onChange={e => setV1(e.target.value)} placeholder="0" />
          <UnitSel value={u1} onChange={setU1} units={units} />
        </div>
        <div className="mid-badge">=?</div>
        <div className="f-group">
          <span className="f-lbl">Value B</span>
          <input className="num-inp" type="number" value={v2} step="any" onChange={e => setV2(e.target.value)} placeholder="0" />
          <UnitSel value={u2} onChange={setU2} units={units} />
        </div>
      </div>
      <button className="calc-btn" onClick={run}>CALCULATE</button>
    </div>
  );
}

function ConvertPanel({ type, units, onResult, onError }) {
  const [v,    setV]    = useState('1');
  const [unit,  setUnit]  = useState(units[0]);
  const [target, setTarget] = useState(units[1] || units[0]);

  async function run() {
    onError(null); onResult(null);
    if (isNaN(parseFloat(v))) return onError('Enter a valid number.');
    if (unit === target) return onError('Source and target units must differ.');
    try {
      const { ok, data } = await measureAPI.convert({ value: parseFloat(v), unit, category: type }, target);
      if (!ok) return onError(data.message || 'Error');
      const val  = data.value !== undefined ? data.value : data.result;
      const uOut = data.unit || target;
      onResult({ value: `${roundDisplay(val)} ${uOut}`, meta: `${v} ${unit} → ${uOut}` });
    } catch { onError('Cannot connect to server.'); }
  }

  return (
    <div>
      <div className="two-col">
        <div className="f-group">
          <span className="f-lbl">Value &amp; Unit</span>
          <input className="num-inp" type="number" value={v} step="any" onChange={e => setV(e.target.value)} placeholder="0" />
          <UnitSel value={unit} onChange={setUnit} units={units} />
        </div>
        <div className="mid-badge">→</div>
        <div className="f-group">
          <span className="f-lbl">Target Unit</span>
          <div className="spacer-44" />
          <UnitSel value={target} onChange={setTarget} units={units} />
        </div>
      </div>
      <button className="calc-btn" onClick={run}>CALCULATE</button>
    </div>
  );
}

function ArithPanel({ type, units, onResult, onError }) {
  const [op, setOp] = useState('add');
  const [v1, setV1] = useState('1'); const [u1, setU1] = useState(units[0]);
  const [v2, setV2] = useState('1'); const [u2, setU2] = useState(units[0]);
  const badges = { add: '+', subtract: '−', divide: '÷' };

  async function run() {
    onError(null); onResult(null);
    if (isNaN(parseFloat(v1))) return onError('Enter a valid number for Value 1.');
    if (isNaN(parseFloat(v2))) return onError('Enter a valid number for Value 2.');
    try {
      const q1 = { value: parseFloat(v1), unit: u1, category: type };
      const q2 = { value: parseFloat(v2), unit: u2, category: type };
      const fn = { add: measureAPI.add, subtract: measureAPI.subtract, divide: measureAPI.divide }[op];
      const { ok, data } = await fn(q1, q2);
      if (!ok) return onError(data.message || 'Error');
      if (op === 'divide') {
        onResult({ value: roundDisplay(data), meta: 'Ratio (unitless)' });
      } else {
        const val = data.value !== undefined ? data.value : data.result;
        const baseUnit = data.unit || units[0];
        onResult({ rawValue: val, baseUnit, units, category: type, meta: `Operation: ${op}` });
      }
    } catch { onError('Cannot connect to server.'); }
  }

  return (
    <div>
      {/* Sub-op selector rendered as small op tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['add','subtract','divide'].map(o => (
          <button key={o}
            onClick={() => { setOp(o); onResult(null); onError(null); }}
            style={{
              padding:'7px 18px', borderRadius:4,
              border:`1.5px solid ${op===o ? 'var(--amber)' : 'var(--border)'}`,
              background: op===o ? 'rgba(245,166,35,0.12)' : 'var(--bg2)',
              color: op===o ? 'var(--amber)' : 'var(--text3)',
              fontFamily:'Barlow, sans-serif', fontSize:12, fontWeight:800,
              letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer',
              transition:'all 0.15s',
            }}>
            {badges[o]} {o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        ))}
      </div>
      <div className="two-col">
        <div className="f-group">
          <span className="f-lbl">Value 1</span>
          <input className="num-inp" type="number" value={v1} step="any" onChange={e => setV1(e.target.value)} placeholder="0" />
          <UnitSel value={u1} onChange={setU1} units={units} />
        </div>
        <div className="mid-badge">{badges[op]}</div>
        <div className="f-group">
          <span className="f-lbl">Value 2</span>
          <input className="num-inp" type="number" value={v2} step="any" onChange={e => setV2(e.target.value)} placeholder="0" />
          <UnitSel value={u2} onChange={setU2} units={units} />
        </div>
      </div>
      <button className="calc-btn" onClick={run}>CALCULATE</button>
    </div>
  );
}

/* ══ DASHBOARD ══ */
const TYPES = [
  { key: 'Length',      icon: '📏', label: 'Length' },
  { key: 'Weight',      icon: '⚖️',  label: 'Weight' },
  { key: 'Temperature', icon: '🌡️', label: 'Temp'   },
  { key: 'Volume',      icon: '🧪', label: 'Volume'  },
];

export default function DashboardPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [curType,   setCurType]   = useState('Length');
  const [curAction, setCurAction] = useState('compare');
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  const units = UNITS[curType];

  function selectType(type) {
    setCurType(type); setResult(null); setError(null);
    if (type === 'Temperature' && curAction === 'arithmetic') setCurAction('compare');
  }

  function selectAction(action) {
    setCurAction(action); setResult(null); setError(null);
  }

  const actions = curType === 'Temperature'
    ? [{ key: 'compare', label: '⇌ Compare' }, { key: 'convert', label: '→ Convert' }]
    : [
        { key: 'compare',    label: '⇌ Compare'  },
        { key: 'convert',    label: '→ Convert'   },
        { key: 'add',        label: '+ ADD'        },
        { key: 'subtract',   label: '− Subtract'  },
        { key: 'divide',     label: '÷ Divide'    },
      ];

  return (
    <>
      <style>{DASH_STYLES}</style>
      <Navbar />

      <div className="dash-root">
        <div className="dash-layout">

          {/* ── Main ── */}
          <div className="dash-main">

            <div className="dash-header">
              <span className="dash-title">Measurement Operations</span>
              <span className="dash-badge">All Units</span>
            </div>

            {/* 01 Category */}
            <div className="sec-lbl"><span className="sec-num">01 —</span> Select Category</div>
            <div className="cat-grid">
              {TYPES.map(({ key, icon, label }) => (
                <button key={key}
                  className={`cat-btn ${curType === key ? 'active' : ''}`}
                  onClick={() => selectType(key)}>
                  <span className="cat-icon">{icon}</span>
                  <span className="cat-label">{label}</span>
                </button>
              ))}
            </div>

            {/* 02 Operation */}
            <div className="sec-lbl"><span className="sec-num">02 —</span> Select Operation</div>
            <div className="op-tabs">
              {actions.map(({ key, label }) => (
                <button key={key}
                  className={`op-tab ${curAction === key ? 'active' : ''}`}
                  onClick={() => selectAction(key)}>
                  {label}
                </button>
              ))}
            </div>

            {/* 03 Enter Values */}
            <div className="sec-lbl"><span className="sec-num">03 —</span> Enter Values</div>
            {curAction === 'compare'    && <ComparePanel key={`c-${curType}`} type={curType} units={units} onResult={setResult} onError={setError} />}
            {curAction === 'convert'    && <ConvertPanel key={`v-${curType}`} type={curType} units={units} onResult={setResult} onError={setError} />}
            {['add','subtract','divide'].includes(curAction) && (
              <ArithPanel key={`a-${curType}-${curAction}`} type={curType} units={units} onResult={setResult} onError={setError} />
            )}

            {/* 04 Result */}
            <div className="result-sec">
              <div className="sec-lbl"><span className="sec-num">04 —</span> Result</div>
              <div className="result-box">
                {!result && !error && <span className="result-placeholder">Run an operation to see the result</span>}
                <ResultBox result={result} error={error} />
              </div>
            </div>

            {/* Guest notice */}
            {!token && (
              <div className="guest-banner">
                ⚠ Guest mode — results are not saved.{' '}
                <a onClick={() => navigate('/')}>Login to track history.</a>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="dash-sidebar">
            <div className="hist-sidebar-title">
              History &amp; Stats
              <button style={{
                padding:'4px 10px', border:'1px solid var(--border)',
                borderRadius:3, background:'none', cursor:'pointer',
                color:'var(--text3)', fontFamily:'Barlow Condensed, sans-serif',
                fontSize:12, fontWeight:800, letterSpacing:'0.08em',
              }}>−</button>
            </div>
            <History />
          </div>

        </div>
      </div>
    </>
  );
}
