/* ══════════════════════════════════════════════
   dashboard.js  —  Quantity Measurement App
   Dashboard page logic
══════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────
   Update this port to match your launchSettings.json
   https profile → applicationUrl → port number
─────────────────────────────────────────────*/
var API = 'http://localhost:5042/api';

/* ── Exact unit names from backend enums ── */
var UNITS = {
  Length:      ['Inch', 'Feet', 'Yard', 'Centimeter'],
  Weight:      ['Gram', 'Kilogram', 'Tonne'],
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  Volume:      ['Milliliter', 'Liter', 'Gallon']
};

/* ── App state ── */
var curType   = 'Length';
var curArith  = 'add';
var curAction = 'compare';  // tracks the active action tab

/* Stores the raw arithmetic result so the unit dropdown can re-convert on change */
var rawResultValue = null;
var rawResultUnit  = null;
var token    = localStorage.getItem('qm_token');
var userName = localStorage.getItem('qm_username');

/* ════════════════════════════════════════
   BOOT  —  runs when the page loads
════════════════════════════════════════ */
(function init() {
  renderNav();
  populateAllUnits();
  renderHistory();
})();

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
function renderNav() {
  var el = document.getElementById('navRight');
  if (token) {
    el.innerHTML =
      '<div class="user-chip">👤 ' + escHtml(userName || 'User') + '</div>' +
      '<button class="logout-btn" onclick="doLogout()">Sign Out</button>';
  } else {
    el.innerHTML =
      '<button class="login-nav-btn" onclick="goLogin()">Login / Signup</button>';
  }
}

function goLogin() {
  window.location.href = 'login.html';
}

function doLogout() {
  localStorage.removeItem('qm_token');
  localStorage.removeItem('qm_username');
  token    = null;
  userName = null;
  renderNav();
  renderHistory();
}

/* ════════════════════════════════════════
   TYPE SELECTION  (Length / Weight / …)
════════════════════════════════════════ */
function selectType(el, type) {
  document.querySelectorAll('.type-chip').forEach(function (c) {
    c.classList.remove('active');
  });
  el.classList.add('active');
  curType = type;
  populateAllUnits();
  clearOutput();

  /* Hide Arithmetic tab for Temperature (not mathematically meaningful) */
  var arithTab = document.querySelectorAll('.act-tab')[2]; /* 3rd tab = Arithmetic */
  if (type === 'Temperature') {
    arithTab.style.display = 'none';
    /* If arithmetic was active, fall back to compare */
    if (curAction === 'arithmetic') {
      var compareTab = document.querySelectorAll('.act-tab')[0]; /* 1st tab = Compare */
      selectAction(compareTab, 'compare');
    }
  } else {
    arithTab.style.display = '';
  }
}

/* ════════════════════════════════════════
   ACTION SELECTION  (Compare / Convert / Arithmetic)
════════════════════════════════════════ */
function selectAction(el, action) {
  document.querySelectorAll('.act-tab').forEach(function (b) {
    b.classList.remove('active');
  });
  el.classList.add('active');
  curAction = action;

  ['compare', 'convert', 'arithmetic'].forEach(function (p) {
    document.getElementById('op-' + p).classList.toggle('active', p === action);
  });

  clearOutput();
}

/* ════════════════════════════════════════
   ARITHMETIC SUB-TAB  (Add / Subtract / Divide)
════════════════════════════════════════ */
function selectArith(el, op) {
  document.querySelectorAll('.arith-sub-tab').forEach(function (b) {
    b.classList.remove('active');
  });
  el.classList.add('active');
  curArith = op;

  var badges = { add: '+', subtract: '−', divide: '÷' };
  document.getElementById('arith-op-badge').textContent = badges[op];

  /* Always show Value 2 — divide needs a divisor entered by the user */
  document.getElementById('arV2Wrap').style.display = '';

  clearOutput();
}

/* ════════════════════════════════════════
   POPULATE UNIT DROPDOWNS
════════════════════════════════════════ */
function populateAllUnits() {
  var units = UNITS[curType];

  /* Fill all six unit selects */
  ['cmpU1', 'cmpU2', 'convU', 'convT', 'arU1', 'arU2'].forEach(function (id) {
    var sel = document.getElementById(id);
    sel.innerHTML = units.map(function (u) {
      return '<option value="' + u + '">' + u + '</option>';
    }).join('');
  });

  /* Give second dropdowns a different default so comparison makes sense */
  if (units.length > 1) {
    document.getElementById('cmpU2').selectedIndex = 1;
    document.getElementById('convT').selectedIndex = 1;
    document.getElementById('arU2').selectedIndex  = 1;
  }

  /* Fill the result unit selector too */
  var rSel = document.getElementById('resultUnitSel');
  rSel.innerHTML = units.map(function (u) {
    return '<option value="' + u + '">' + u + '</option>';
  }).join('');
}

/* ════════════════════════════════════════
   UTILITY HELPERS
════════════════════════════════════════ */

/* Read a number input */
function getVal(id) {
  return parseFloat(document.getElementById(id).value);
}

/* Read a select value */
function getSel(id) {
  return document.getElementById(id).value;
}

/* Build a QuantityDTO object */
function makeQty(valueId, unitId) {
  return {
    value:    getVal(valueId),
    unit:     getSel(unitId),
    category: curType
  };
}

/* Clear result and error boxes */
function clearOutput() {
  document.getElementById('resultBox').classList.remove('show');
  document.getElementById('errBox').classList.remove('show');
  document.getElementById('resultUnitSel').style.display = 'none';
  rawResultValue = null;
  rawResultUnit  = null;
}

/* Called whenever the result unit dropdown changes — re-converts the raw value */
async function convertResultUnit(newUnit) {
  if (rawResultValue === null || rawResultUnit === null) return;

  /* Same unit — just restore the original number, no API call needed */
  if (newUnit === rawResultUnit) {
    document.getElementById('resultValue').textContent = roundDisplay(rawResultValue);
    return;
  }

  /* Show a brief loading indicator */
  document.getElementById('resultValue').textContent = '…';

  try {
    var body = {
      quantityOne: { value: rawResultValue, unit: rawResultUnit, category: curType },
      targetUnit:  newUnit
    };
    var res  = await apiFetch('/QuantityMeasurementAPI/convert', body);
    var data = await res.json();

    if (!res.ok) {
      /* On error, restore previous value */
      document.getElementById('resultValue').textContent = roundDisplay(rawResultValue);
      return;
    }

    var converted = (data.value !== undefined) ? data.value : data.result;
    document.getElementById('resultValue').textContent = roundDisplay(converted);

  } catch (err) {
    document.getElementById('resultValue').textContent = roundDisplay(rawResultValue);
  }
}

/* Show the result box */
function showResult(value, meta, showUnitDropdown) {
  document.getElementById('resultValue').textContent = value;
  document.getElementById('resultMeta').textContent  = meta || '';
  document.getElementById('resultUnitSel').style.display = showUnitDropdown ? '' : 'none';
  document.getElementById('resultBox').classList.add('show');
  document.getElementById('errBox').classList.remove('show');
}

/* Show the error box */
function showError(msg) {
  document.getElementById('errBox').textContent = '⚠ ' + msg;
  document.getElementById('errBox').classList.add('show');
  document.getElementById('resultBox').classList.remove('show');
}

/* Escape HTML to prevent XSS */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Round to 6 significant figures for display */
function roundDisplay(n) {
  if (n === undefined || n === null) return '—';
  var num = parseFloat(n);
  if (isNaN(num)) return String(n);
  return parseFloat(num.toPrecision(6)).toString();
}

/* ── Generic fetch wrapper ── */
async function apiFetch(path, body, method) {
  method = method || 'POST';
  var headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  var opts = { method: method, headers: headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  return fetch(API + path, opts);
}

/* ════════════════════════════════════════
   COMPARE
   API: POST /QuantityMeasurementAPI/compare
   Returns: boolean (true = equal)
════════════════════════════════════════ */
async function doCompare() {
  clearOutput();

  var body = {
    quantityOne: makeQty('cmpV1', 'cmpU1'),
    quantityTwo: makeQty('cmpV2', 'cmpU2')
  };

  if (isNaN(body.quantityOne.value) || isNaN(body.quantityTwo.value)) {
    showError('Please enter valid numbers.');
    return;
  }

  try {
    var res  = await apiFetch('/QuantityMeasurementAPI/compare', body);
    var data = await res.json();

    if (!res.ok) {
      showError(data.message || JSON.stringify(data));
      return;
    }

    var equal = (data === true || data === 'true');
    var label = equal ? '✅ Equal' : '❌ Not Equal';
    var meta  = body.quantityOne.value + ' ' + body.quantityOne.unit
              + ' vs '
              + body.quantityTwo.value + ' ' + body.quantityTwo.unit;

    showResult(label, meta, false);
    if (token) loadHistory();

  } catch (err) {
    showError('Cannot connect to server. Is your API running?');
  }
}

/* ════════════════════════════════════════
   CONVERT
   API: POST /QuantityMeasurementAPI/convert?targetUnit=X
   Returns: QuantityDTO { value, unit, category }
════════════════════════════════════════ */
async function doConvert() {
  clearOutput();

  var q      = makeQty('convV', 'convU');
  var target = getSel('convT');

  if (isNaN(q.value)) {
    showError('Please enter a valid number.');
    return;
  }
  if (q.unit === target) {
    showError('Source and target units are the same.');
    return;
  }

  try {
    // FIX: targetUnit is now part of the JSON body (ConvertRequestDTO),
    //      not a query-string param — avoids mixed [FromBody]+query issues.
    var res  = await apiFetch(
      '/QuantityMeasurementAPI/convert',
      { quantityOne: q, targetUnit: target }
    );
    var data = await res.json();

    if (!res.ok) {
      showError(data.message || JSON.stringify(data));
      return;
    }

    var resultVal  = (data.value !== undefined) ? data.value : data.result;
    var resultUnit = data.unit || target;

    showResult(
      roundDisplay(resultVal) + ' ' + resultUnit,
      q.value + ' ' + q.unit + ' → ' + resultUnit,
      false
    );
    if (token) loadHistory();

  } catch (err) {
    showError('Cannot connect to server. Is your API running?');
  }
}

/* ════════════════════════════════════════
   ARITHMETIC  (Add / Subtract / Divide)
   API: POST /QuantityMeasurementAPI/add
        POST /QuantityMeasurementAPI/subtract
        POST /QuantityMeasurementAPI/divide
   Add/Subtract return: QuantityDTO { value, unit, category }
   Divide returns: double (ratio)
════════════════════════════════════════ */
async function doArithmetic() {
  clearOutput();

  var body = { quantityOne: makeQty('arV1', 'arU1') };

  // FIX: Divide also needs quantityTwo — backend validates both for a ratio.
  //      The UI hides arV2Wrap visually for divide, but we still send the same unit.
  body.quantityTwo = makeQty('arV2', 'arU2');

  if (isNaN(body.quantityOne.value)) {
    showError('Please enter a valid number for Value 1.');
    return;
  }
  if (isNaN(body.quantityTwo.value)) {
    showError('Please enter a valid number for Value 2.');
    return;
  }

  try {
    var res  = await apiFetch('/QuantityMeasurementAPI/' + curArith, body);
    var data = await res.json();

    if (!res.ok) {
      showError(data.message || JSON.stringify(data));
      return;
    }

    if (curArith === 'divide') {
      /* Divide → plain double ratio */
      showResult(roundDisplay(data), 'Ratio (unitless)', false);

    } else {
      /* Add / Subtract → QuantityDTO */
      var resultVal  = (data.value !== undefined) ? data.value : data.result;
      var resultUnit = data.unit || UNITS[curType][0];

      /* Store raw value + base unit for live re-conversion when dropdown changes */
      rawResultValue = resultVal;
      rawResultUnit  = resultUnit;

      /* Pre-select the correct unit in the result dropdown */
      var rSel = document.getElementById('resultUnitSel');
      for (var i = 0; i < rSel.options.length; i++) {
        if (rSel.options[i].value === resultUnit) {
          rSel.selectedIndex = i;
          break;
        }
      }

      showResult(roundDisplay(resultVal), 'Operation: ' + curArith, true);
    }

    if (token) loadHistory();

  } catch (err) {
    showError('Cannot connect to server. Is your API running?');
  }
}

/* ════════════════════════════════════════
   HISTORY
════════════════════════════════════════ */

/* Decide what to render based on login state */
function renderHistory() {
  var refreshBtn = document.getElementById('refreshBtn');

  if (!token) {
    /* Guest — show lock screen */
    refreshBtn.style.display = 'none';
    document.getElementById('histContent').innerHTML =
      '<div class="hist-lock">' +
        '<div class="lock-icon"></div>' +
        '<p>Your operation history is saved to your account.<br>' +
        'Please <strong>login or signup</strong> to view it.</p>' +
        '<button class="hist-lock-btn" onclick="goLogin()">' +
          'Login / Signup to View History' +
        '</button>' +
      '</div>';
  } else {
    /* Logged in — load from API */
    refreshBtn.style.display = '';
    loadHistory();
  }
}

/* Fetch history from API and render */
async function loadHistory() {
  var content = document.getElementById('histContent');
  content.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';

  try {
    var res = await apiFetch('/QuantityMeasurementAPI/history', null, 'GET');

    /* Token expired */
    if (res.status === 401) {
      doLogout();
      return;
    }

    var data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      content.innerHTML =
        '<div class="empty-state">' +
          '<div class="ei">📂</div>' +
          '<p>No history yet. Run an operation above!</p>' +
        '</div>';
      return;
    }

    /* QuantityMeasurementEntity fields used:
       operation, value1, unit1, value2, unit2, category, result */
    var rows = data.slice().reverse().map(function (item) {
      var desc = roundDisplay(item.value1) + ' ' + escHtml(item.unit1 || '');

      /* Show second quantity only when it is meaningful */
      if (item.operation !== 'Convert' && item.value2 !== 0) {
        desc += ' &amp; ' + roundDisplay(item.value2) + ' ' + escHtml(item.unit2 || '');
      }

      return (
        '<div class="hist-item">' +
          '<span class="h-op">'     + escHtml(item.operation || 'OP') + '</span>' +
          '<span class="h-desc">'   + desc                             + '</span>' +
          '<span class="h-result">= ' + roundDisplay(item.result)      + '</span>' +
          '<span class="h-cat">'    + escHtml(item.category || '')     + '</span>' +
        '</div>'
      );
    });

    content.innerHTML = '<div class="hist-list">' + rows.join('') + '</div>';

  } catch (err) {
    content.innerHTML =
      '<div class="empty-state">' +
        '<div class="ei">⚠️</div>' +
        '<p>Could not load history.</p>' +
      '</div>';
  }
}