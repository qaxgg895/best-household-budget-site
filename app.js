// Hearth Ledger — the site's behaviour. Plain script (no modules), so the
// site works from file:// as well as from a server. All state lives in
// memory seeded from data.js, with the household's own edits kept in
// localStorage under keys starting "hl-".

const MONTHS = [
  { id: '2026-10', label: 'October 2026' },
  { id: '2026-11', label: 'November 2026' },
];
let currentMonth = '2026-11';

// ---------- persistence ----------
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}
let extraTx = loadJSON('hl-extra-tx', []);       // user-added transactions
let deletedTx = loadJSON('hl-deleted-tx', []);   // ids of removed transactions
let budgetOverrides = loadJSON('hl-budgets', {});// category -> planned amount
let goalExtra = loadJSON('hl-goals', {});        // goal id -> extra saved
let habitsDone = loadJSON('hl-habits', []);     // indexes of checked habits

// ---------- data access ----------
function allTx() {
  const seeded = TRANSACTIONS.map((t, i) => ({
    id: 's' + i, date: t[0], desc: t[1], cat: t[2], amount: t[3], kind: t[4],
  }));
  const added = extraTx.map((t) => ({ ...t }));
  return seeded.concat(added).filter((t) => !deletedTx.includes(t.id));
}
function txsForMonth(month) {
  return allTx().filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
}
function monthTotals(month) {
  const txs = txsForMonth(month);
  let income = 0, spent = 0, saved = 0;
  const byCat = {};
  for (const t of txs) {
    if (t.kind === 'income') income += t.amount;
    else if (t.kind === 'transfer') saved += t.amount;
    else {
      spent += t.amount;
      byCat[t.cat] = (byCat[t.cat] || 0) + t.amount;
    }
  }
  return { income, spent, saved, left: income - spent - saved, byCat };
}
function budgets() {
  const b = { ...BUDGETS_NOV };
  for (const k of Object.keys(budgetOverrides)) b[k] = budgetOverrides[k];
  return b;
}
function goals() {
  return GOALS.map((g) => ({ ...g, saved: g.saved + (goalExtra[g.id] || 0) }));
}
function catLabel(id) { const c = CATEGORIES.find((x) => x.id === id); return c ? c.label : id; }
function catColor(id) { const c = CATEGORIES.find((x) => x.id === id); return c ? c.color : '#6b7280'; }

// ---------- formatting ----------
const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n) => '$' + Math.round(n).toLocaleString('en-US');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

function monthLabel(id) { const m = MONTHS.find((x) => x.id === id); return m ? m.label : id; }
function monthSwitcher() {
  const idx = MONTHS.findIndex((m) => m.id === currentMonth);
  const prev = MONTHS[idx - 1], next = MONTHS[idx + 1];
  return '<div class="month-switch">' +
    (prev ? `<button class="ghost" data-month="${prev.id}">&larr; ${prev.label}</button>` : '<button class="ghost" disabled>&larr; —</button>') +
    `<span class="current">${monthLabel(currentMonth)}</span>` +
    (next ? `<button class="ghost" data-month="${next.id}">${next.label} &rarr;</button>` : '<button class="ghost" disabled>— &rarr;</button>') +
    '</div>';
}

// ---------- shared bits ----------
function budgetRows(month) {
  const t = monthTotals(month);
  const b = budgets();
  return CATEGORIES.filter((c) => c.id !== 'savings').map((c) => {
    const spent = t.byCat[c.id] || 0;
    const planned = b[c.id] || 0;
    const p = pct(spent, planned);
    const over = spent > planned;
    const cls = over ? 'over' : (p >= 85 ? 'amber' : '');
    return `<div class="budget-row">
      <span class="cat"><span class="dot" style="background:${c.color}"></span>${c.label}</span>
      <span><span class="bar ${cls}"><i style="width:${Math.min(p, 100)}%"></i></span></span>
      <span class="nums">${fmt(spent)} of ${fmt(planned)}${over ? '<span class="badge over">over ' + fmt(spent - planned) + '</span>' : (p >= 85 ? '<span class="badge left">' + p + '%</span>' : '')}</span>
    </div>`;
  }).join('');
}

// ---------- views ----------
function viewDashboard() {
  const t = monthTotals(currentMonth);
  const recent = txsForMonth(currentMonth).slice(0, 8);
  const months = HISTORY.concat(MONTHS.map((m) => {
    const mt = monthTotals(m.id);
    return { month: m.id, label: m.label.slice(0, 3), income: mt.income, spent: mt.spent, saved: mt.saved };
  }));
  const overCats = CATEGORIES.filter((c) => c.id !== 'savings' && (t.byCat[c.id] || 0) > (budgets()[c.id] || 0));
  const donutSlices = CATEGORIES.filter((c) => c.id !== 'savings' && (t.byCat[c.id] || 0) > 0)
    .map((c) => ({ label: c.label, value: t.byCat[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  return `
  <h1>${HOUSEHOLD.name}</h1>
  <p class="muted">${HOUSEHOLD.members} · ${HOUSEHOLD.monthNote} · After-tax income ${fmt0(6850)} a month</p>
  ${monthSwitcher()}
  ${overCats.length ? `<div class="notice"><strong>Over budget:</strong> ${overCats.map((c) => `${c.label} is ${fmt((t.byCat[c.id] || 0) - budgets()[c.id])} over`).join('; ')}. Move money from a category with room, or trim next week’s spending.</div>` : `<div class="ok-note">Every category is inside its budget for ${monthLabel(currentMonth)}. Nice work.</div>`}
  <div class="grid kpis">
    <div class="card kpi"><div class="label">Income</div><div class="value">${fmt0(t.income)}</div><div class="sub">Maya ${fmt0(3900)} + Daniel ${fmt0(2950)}</div></div>
    <div class="card kpi warn"><div class="label">Spent</div><div class="value">${fmt0(t.spent)}</div><div class="sub">${pct(t.spent, t.income)}% of income</div></div>
    <div class="card kpi good"><div class="label">Saved</div><div class="value">${fmt0(t.saved)}</div><div class="sub">${pct(t.saved, t.income)}% of income · auto-transfer on the 1st</div></div>
    <div class="card kpi"><div class="label">Left to assign</div><div class="value">${fmt0(t.left)}</div><div class="sub">Give it a job on the <a href="#/budgets">Budgets</a> page</div></div>
  </div>
  <div class="grid two" style="margin-top:1rem">
    <div class="card"><h2>Cash flow — last 6 months</h2>
      <p class="muted">Income vs spending, June to November 2026.</p>
      <canvas class="chart" id="ch-cashflow"></canvas></div>
    <div class="card"><h2>Where November’s money went</h2>
      <p class="muted">Spending by category, rent included.</p>
      <canvas class="chart" id="ch-donut"></canvas>
      <div class="legend">${donutSlices.slice(0, 6).map((s) => `<span><span class="dot" style="background:${s.color}"></span>${s.label} ${fmt0(s.value)}</span>`).join('')}</div></div>
  </div>
  <div class="grid two" style="margin-top:1rem">
    <div class="card"><h2>Budget progress</h2>
      <p class="muted">Spending against the plan for ${monthLabel(currentMonth)}. <a href="#/budgets">See all budgets &rarr;</a></p>
      ${budgetRows(currentMonth)}
    </div>
    <div class="card"><h2>Recent transactions</h2>
      <p class="muted">Latest in ${monthLabel(currentMonth)}. <a href="#/transactions">Full ledger &rarr;</a></p>
      <table><thead><tr><th>Date</th><th>What</th><th class="num">Amount</th></tr></thead><tbody>
      ${recent.map((x) => `<tr class="${x.kind}"><td>${x.date.slice(5)}</td><td>${esc(x.desc)}</td><td class="num amount">${x.kind === 'income' ? '+' : '−'}${fmt(x.amount)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </div>`;
}

function viewBudgets() {
  const t = monthTotals(currentMonth);
  const b = budgets();
  const plannedTotal = Object.values(b).reduce((s, v) => s + v, 0);
  const rows = CATEGORIES.map((c) => {
    const spent = c.id === 'savings' ? t.saved : (t.byCat[c.id] || 0);
    const planned = b[c.id] || 0;
    const p = pct(spent, planned);
    const over = spent > planned;
    const cls = over ? 'over' : (p >= 85 ? 'amber' : '');
    return `<div class="budget-row">
      <span class="cat"><span class="dot" style="background:${c.color}"></span>${c.label}</span>
      <span><span class="bar ${cls}"><i style="width:${Math.min(p, 100)}%"></i></span></span>
      <span class="nums">${fmt(spent)} of ${fmt(planned)}${over ? '<span class="badge over">over</span>' : ''}</span>
    </div>`;
  }).join('');
  const options = CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  return `
  <h1>Budgets — ${monthLabel(currentMonth)}</h1>
  <p class="muted">Planned spending ${fmt(plannedTotal)} against income of ${fmt0(t.income)}. ${fmt0(t.income - plannedTotal)} is unassigned — give it a job, or leave it as next month’s buffer.</p>
  ${monthSwitcher()}
  <div class="card">
    ${rows}
    <p class="muted" style="margin-top:.8rem">Savings is a budget line too: the ${fmt0(b.savings)} auto-transfer goes out on the 1st, before anything else is spent.</p>
  </div>
  <div class="card" style="margin-top:1rem">
    <h2>Change a budget</h2>
    <p class="muted">Pick a category, set a new monthly amount, and the dashboard updates at once. Saved in this browser.</p>
    <form id="budget-form" class="toolbar">
      <div class="field"><label for="bf-cat">Category</label><select id="bf-cat">${options}</select></div>
      <div class="field"><label for="bf-amount">New monthly budget ($)</label><input id="bf-amount" type="number" min="0" step="1" value="200" required></div>
      <div><button type="submit">Save budget</button></div>
    </form>
    <p class="muted" id="budget-msg"></p>
  </div>`;
}

function viewTransactions() {
  const cats = [{ id: '', label: 'All categories' }].concat(CATEGORIES);
  const options = cats.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  return `
  <h1>Transactions</h1>
  <p class="muted">Every dollar in and out. Filter the ledger, or add a transaction — totals everywhere update at once.</p>
  ${monthSwitcher()}
  <div class="toolbar">
    <div class="field"><label for="tf-cat">Category</label><select id="tf-cat">${options}</select></div>
    <div class="field"><label for="tf-search">Search</label><input id="tf-search" type="text" placeholder="e.g. GreenMart, rent, fuel"></div>
    <div><button type="button" class="ghost" id="tx-export">Export CSV</button></div>
  </div>
  <div class="card"><div id="tx-table"></div></div>
  <div class="card" style="margin-top:1rem">
    <h2>Add a transaction</h2>
    <form id="tx-form" class="toolbar">
      <div class="field"><label for="af-date">Date</label><input id="af-date" type="date" value="2026-11-26" required></div>
      <div class="field"><label for="af-desc">What</label><input id="af-desc" type="text" placeholder="e.g. GreenMart weekly shop" required></div>
      <div class="field"><label for="af-cat">Category</label><select id="af-cat">${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div>
      <div class="field"><label for="af-amount">Amount ($)</label><input id="af-amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>
      <div class="field"><label for="af-kind">Type</label><select id="af-kind"><option value="expense">Spending</option><option value="income">Income</option><option value="transfer">To savings</option></select></div>
      <div><button type="submit">Add transaction</button></div>
    </form>
    <p class="muted" id="tx-msg"></p>
  </div>`;
}

function renderTxTable() {
  const host = document.getElementById('tx-table');
  if (!host) return;
  const cat = document.getElementById('tf-cat').value;
  const q = (document.getElementById('tf-search').value || '').toLowerCase();
  let rows = txsForMonth(currentMonth);
  if (cat) rows = rows.filter((t) => t.cat === cat);
  if (q) rows = rows.filter((t) => t.desc.toLowerCase().includes(q));
  let income = 0, spent = 0, saved = 0;
  for (const t of rows) {
    if (t.kind === 'income') income += t.amount;
    else if (t.kind === 'transfer') saved += t.amount;
    else spent += t.amount;
  }
  host.innerHTML = rows.length === 0
    ? '<p class="muted">No transactions match. Try another filter, or add one below.</p>'
    : `<table class="tx"><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>
      ${rows.map((t) => `<tr class="${t.kind}"><td>${t.date}</td><td>${esc(t.desc)}</td><td>${catLabel(t.cat)}</td><td class="num amount">${t.kind === 'income' ? '+' : '−'}${fmt(t.amount)}</td><td><button class="danger small" data-del="${t.id}">Delete</button></td></tr>`).join('')}
      </tbody></table>
      <p class="muted" style="margin-top:.6rem">${rows.length} transaction${rows.length === 1 ? '' : 's'} · in ${fmt(income)} · out ${fmt(spent)} · to savings ${fmt(saved)}</p>`;
}

function viewGoals() {
  const gs = goals();
  const totalSaved = gs.reduce((s, g) => s + g.saved, 0);
  const totalTarget = gs.reduce((s, g) => s + g.target, 0);
  return `
  <h1>Savings goals</h1>
  <p class="muted">${fmt0(totalSaved)} saved toward ${fmt0(totalTarget)} across ${gs.length} goals — ${pct(totalSaved, totalTarget)}% of the way there. Contributions move money in the ledger too: use “Add” and it counts as a transfer to savings.</p>
  <div class="grid two">
  ${gs.map((g) => {
    const p = pct(g.saved, g.target);
    return `<div class="card goal">
      <div class="top"><h2>${esc(g.title)}</h2><span class="pct">${p}%</span></div>
      <p class="muted">${esc(g.note)}</p>
      <div class="bar"><i style="width:${Math.min(p, 100)}%"></i></div>
      <p style="margin-top:.5rem">${fmt(g.saved)} of ${fmt(g.target)} · ${fmt(g.target - g.saved)} to go</p>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="ghost small" data-goal="${g.id}" data-amt="25">+ $25</button>
        <button class="ghost small" data-goal="${g.id}" data-amt="50">+ $50</button>
        <button class="ghost small" data-goal="${g.id}" data-amt="100">+ $100</button>
      </div>
    </div>`;
  }).join('')}
  </div>
  <div class="card" style="margin-top:1rem">
    <h2>How the goals are funded</h2>
    <p>The ${fmt0(900)} monthly auto-transfer is split by a standing order: ${fmt0(500)} to the emergency fund, ${fmt0(250)} to the Lisbon trip and ${fmt0(150)} to the car. Anything left over at month’s end goes to the emergency fund first — it is the one that protects the other two.</p>
  </div>`;
}

function viewPlanner() {
  return `
  <h1>Budget planner</h1>
  <p class="muted">The 50/30/20 rule: about half of after-tax income for needs, 30% for wants, 20% for savings and extra debt payments. Set your income and your split, then compare it with what this household actually spent in ${monthLabel(currentMonth)}.</p>
  <div class="card">
    <div class="toolbar">
      <div class="field"><label for="pl-income">Monthly after-tax income ($)</label><input id="pl-income" type="number" min="0" step="50" value="6850"></div>
    </div>
    <div class="slider-row"><label for="pl-needs">Needs</label><input id="pl-needs" type="range" min="0" max="100" value="50"><output id="pl-needs-out">50%</output></div>
    <div class="slider-row"><label for="pl-wants">Wants</label><input id="pl-wants" type="range" min="0" max="100" value="30"><output id="pl-wants-out">30%</output></div>
    <div class="slider-row"><label>Savings</label><span id="pl-saves-out" style="font-weight:700">20% — the rest</span><output id="pl-saves-pct"></output></div>
    <p class="muted" id="pl-warn"></p>
    <div class="split" id="pl-split"></div>
    <div id="pl-compare" style="margin-top:1rem"></div>
  </div>
  <div class="card" style="margin-top:1rem">
    <h2>Savings growth calculator</h2>
    <p class="muted">What does a monthly deposit become? Compounded monthly at the rate you enter.</p>
    <div class="toolbar">
      <div class="field"><label for="sv-deposit">Monthly deposit ($)</label><input id="sv-deposit" type="number" min="0" step="10" value="200"></div>
      <div class="field"><label for="sv-rate">Annual return (%)</label><input id="sv-rate" type="number" min="0" max="20" step="0.1" value="4"></div>
      <div class="field"><label for="sv-years">Years</label><input id="sv-years" type="number" min="1" max="30" step="1" value="10"></div>
    </div>
    <p id="sv-result" style="font-weight:700"></p>
    <canvas class="chart" id="ch-projection"></canvas>
  </div>`;
}

function renderPlanner() {
  const income = Math.max(0, Number(document.getElementById('pl-income').value) || 0);
  const needs = Number(document.getElementById('pl-needs').value);
  const wants = Number(document.getElementById('pl-wants').value);
  const saves = 100 - needs - wants;
  document.getElementById('pl-needs-out').textContent = needs + '%';
  document.getElementById('pl-wants-out').textContent = wants + '%';
  document.getElementById('pl-saves-out').textContent = saves + '% — the rest';
  document.getElementById('pl-warn').textContent = saves < 0
    ? 'Needs + wants add up to more than 100% — savings would be negative. Pull one slider back.'
    : (saves < 10 ? 'Savings under 10% is thin for most households — see if wants can give a little.' : '');
  const val = (p) => fmt0((income * p) / 100);
  document.getElementById('pl-split').innerHTML =
    `<div class="seg needs"><div>Needs</div><div class="big">${val(Math.max(needs, 0))}</div><div class="muted">${needs}% of income</div></div>` +
    `<div class="seg wants"><div>Wants</div><div class="big">${val(Math.max(wants, 0))}</div><div class="muted">${wants}% of income</div></div>` +
    `<div class="seg saves"><div>Savings</div><div class="big">${val(Math.max(saves, 0))}</div><div class="muted">${Math.max(saves, 0)}% of income</div></div>`;
  // Actual split this month
  const t = monthTotals(currentMonth);
  const needsCats = ['housing', 'groceries', 'utilities', 'transport', 'health', 'kids'];
  const wantsCats = ['dining', 'entertainment', 'clothing', 'subscriptions', 'other'];
  const sumCats = (list) => list.reduce((s, c) => s + (t.byCat[c] || 0), 0);
  const aNeeds = sumCats(needsCats), aWants = sumCats(wantsCats), aSaves = t.saved;
  const row = (label, actual, guide) =>
    `<div class="budget-row"><span class="cat">${label}</span><span><span class="bar"><i style="width:${Math.min(pct(actual, t.income), 100)}%"></i></span></span><span class="nums">${fmt(actual)} · ${pct(actual, t.income)}% (guide ${guide}%)</span></div>`;
  document.getElementById('pl-compare').innerHTML =
    `<h3>Actual — ${monthLabel(currentMonth)}</h3>` +
    row('Needs', aNeeds, needs) + row('Wants', aWants, wants) + row('Savings', aSaves, Math.max(saves, 0)) +
    `<p class="muted">Needs are at ${pct(aNeeds, t.income)}% (rent is the big one), wants only ${pct(aWants, t.income)}% — this household is well under on wants and banks the difference.</p>`;
}

function renderProjection() {
  const dep = Math.max(0, Number(document.getElementById('sv-deposit').value) || 0);
  const rate = Math.max(0, Number(document.getElementById('sv-rate').value) || 0);
  const years = Math.min(30, Math.max(1, Number(document.getElementById('sv-years').value) || 10));
  const r = rate / 100 / 12;
  const points = [];
  let bal = 0;
  for (let y = 0; y <= years; y++) {
    if (y > 0) for (let m = 0; m < 12; m++) bal = bal * (1 + r) + dep;
    points.push({ year: y, balance: Math.round(bal) });
  }
  const final = points[points.length - 1].balance;
  const paid = dep * 12 * years;
  document.getElementById('sv-result').textContent =
    `After ${years} year${years === 1 ? '' : 's'}: ${fmt0(final)} — you put in ${fmt0(paid)} and growth added ${fmt0(final - paid)}.`;
  drawProjection(document.getElementById('ch-projection'), points);
}

function viewTips() {
  const done = habitsDone.length;
  return `
  <h1>Tips &amp; habits</h1>
  <p class="muted">What actually works for a household budget — written from this household’s own numbers, not generic advice.</p>
  <div class="grid two">
    <div>
      ${TIPS.map((t) => `<div class="tip"><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div>`).join('')}
    </div>
    <div class="card checklist">
      <h2>Weekly habits checklist</h2>
      <p class="muted">${done} of ${HABITS.length} done this week. Tick them off as you go — it saves in this browser.</p>
      ${HABITS.map((h, i) => `<label><input type="checkbox" data-habit="${i}" ${habitsDone.includes(i) ? 'checked' : ''}> ${esc(h)}</label>`).join('')}
      <p class="muted" style="margin-top:.8rem">A budget is a habit, not a spreadsheet. The households that stick with it check in weekly, for fifteen minutes, together.</p>
    </div>
  </div>`;
}

// ---------- router ----------
const VIEWS = {
  dashboard: viewDashboard,
  budgets: viewBudgets,
  transactions: viewTransactions,
  goals: viewGoals,
  planner: viewPlanner,
  tips: viewTips,
};

function route() {
  const hash = (location.hash || '#/').replace(/^#\/?/, '');
  const name = VIEWS[hash] ? hash : 'dashboard';
  const app = document.getElementById('app');
  app.innerHTML = VIEWS[name]();
  document.querySelectorAll('nav.main a').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === name);
  });
  window.scrollTo(0, 0);
  afterRender(name);
}

function afterRender(name) {
  if (name === 'dashboard') {
    const months = HISTORY.concat(MONTHS.map((m) => {
      const mt = monthTotals(m.id);
      return { month: m.id, label: m.label.slice(0, 3), income: mt.income, spent: mt.spent, saved: mt.saved };
    }));
    drawCashflow(document.getElementById('ch-cashflow'), months);
    const t = monthTotals(currentMonth);
    const slices = CATEGORIES.filter((c) => c.id !== 'savings' && (t.byCat[c.id] || 0) > 0)
      .map((c) => ({ label: c.label, value: t.byCat[c.id], color: c.color }))
      .sort((a, b) => b.value - a.value);
    drawDonut(document.getElementById('ch-donut'), slices);
  }
  if (name === 'budgets') {
    document.getElementById('budget-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = document.getElementById('bf-cat').value;
      const amt = Math.max(0, Math.round(Number(document.getElementById('bf-amount').value) || 0));
      budgetOverrides[cat] = amt;
      saveJSON('hl-budgets', budgetOverrides);
      document.getElementById('budget-msg').textContent = `${catLabel(cat)} budget set to ${fmt(amt)}.`;
      route();
      document.getElementById('budget-msg').textContent = `${catLabel(cat)} budget set to ${fmt(amt)}.`;
    });
  }
  if (name === 'transactions') {
    const rerender = () => renderTxTable();
    document.getElementById('tf-cat').addEventListener('change', rerender);
    document.getElementById('tf-search').addEventListener('input', rerender);
    renderTxTable();
    document.getElementById('tx-export').addEventListener('click', () => {
      const cat = document.getElementById('tf-cat').value;
      const q = (document.getElementById('tf-search').value || '').toLowerCase();
      let rows = txsForMonth(currentMonth);
      if (cat) rows = rows.filter((t) => t.cat === cat);
      if (q) rows = rows.filter((t) => t.desc.toLowerCase().includes(q));
      const csv = ['date,description,category,amount,type']
        .concat(rows.map((t) => [t.date, '"' + t.desc.replace(/"/g, '""') + '"', t.cat, t.amount.toFixed(2), t.kind].join(',')))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `hearth-ledger-${currentMonth}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
    document.getElementById('tx-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const tx = {
        id: 'u' + Date.now(),
        date: document.getElementById('af-date').value,
        desc: document.getElementById('af-desc').value.trim(),
        cat: document.getElementById('af-cat').value,
        amount: Math.round(Number(document.getElementById('af-amount').value) * 100) / 100,
        kind: document.getElementById('af-kind').value,
      };
      if (!tx.desc || !(tx.amount > 0)) return;
      extraTx.push(tx);
      saveJSON('hl-extra-tx', extraTx);
      if (tx.date.startsWith('2026-10') || tx.date.startsWith('2026-11')) currentMonth = tx.date.slice(0, 7);
      route();
      const msg = document.getElementById('tx-msg');
      if (msg) msg.textContent = `Added “${tx.desc}” — ${fmt(tx.amount)}. Totals updated everywhere.`;
    });
    document.getElementById('tx-table').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-del]');
      if (!btn) return;
      if (!deletedTx.includes(btn.dataset.del)) deletedTx.push(btn.dataset.del);
      saveJSON('hl-deleted-tx', deletedTx);
      renderTxTable();
    });
  }
  if (name === 'goals') {
    document.querySelectorAll('[data-goal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.goal, amt = Number(btn.dataset.amt);
        goalExtra[id] = (goalExtra[id] || 0) + amt;
        saveJSON('hl-goals', goalExtra);
        extraTx.push({ id: 'u' + Date.now(), date: '2026-11-26', desc: 'Contribution — ' + (GOALS.find((g) => g.id === id) || {}).title, cat: 'savings', amount: amt, kind: 'transfer' });
        saveJSON('hl-extra-tx', extraTx);
        route();
      });
    });
  }
  if (name === 'planner') {
    ['pl-income', 'pl-needs', 'pl-wants'].forEach((id) => {
      document.getElementById(id).addEventListener('input', () => { renderPlanner(); renderProjection(); });
    });
    ['sv-deposit', 'sv-rate', 'sv-years'].forEach((id) => {
      document.getElementById(id).addEventListener('input', renderProjection);
    });
    renderPlanner();
    renderProjection();
  }
  if (name === 'tips') {
    document.querySelectorAll('[data-habit]').forEach((box) => {
      box.addEventListener('change', () => {
        const i = Number(box.dataset.habit);
        habitsDone = box.checked ? [...new Set([...habitsDone, i])] : habitsDone.filter((x) => x !== i);
        saveJSON('hl-habits', habitsDone);
        route();
      });
    });
  }
}

// Month switcher buttons (delegated, present on several views)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-month]');
  if (btn) { currentMonth = btn.dataset.month; route(); }
});

window.addEventListener('hashchange', route);
route();
