// Hearth Ledger — small canvas chart helpers. Plain canvas, no libraries,
// no network. All charts are drawn from the numbers passed in, so they
// always match the tables beside them.

function setupCanvas(canvas, heightCss) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const height = heightCss || 220;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

function money(n) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// Grouped bars: income (green) vs spending (terracotta) per month.
function drawCashflow(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas, 230);
  const padL = 46, padB = 26, padT = 14, padR = 8;
  const maxV = Math.max(...months.map((m) => Math.max(m.income, m.spent))) * 1.08;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.strokeStyle = '#e5e0d5';
  for (let i = 0; i <= 4; i++) {
    const v = (maxV / 4) * i;
    const y = padT + plotH - (plotH * v) / maxV;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(width - padR, y); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(money(v), padL - 6, y + 4);
  }
  const slot = plotW / months.length;
  const barW = Math.min(22, slot / 3.4);
  months.forEach((m, i) => {
    const cx = padL + slot * i + slot / 2;
    const hInc = (plotH * m.income) / maxV;
    const hSp = (plotH * m.spent) / maxV;
    ctx.fillStyle = '#2f6f4f';
    ctx.fillRect(cx - barW - 2, padT + plotH - hInc, barW, hInc);
    ctx.fillStyle = '#b4552d';
    ctx.fillRect(cx + 2, padT + plotH - hSp, barW, hSp);
    ctx.fillStyle = '#374151'; ctx.textAlign = 'center';
    ctx.fillText(m.label, cx, height - 8);
  });
  // Legend
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2f6f4f'; ctx.fillRect(padL, 0, 10, 10);
  ctx.fillStyle = '#374151'; ctx.fillText('Income', padL + 14, 9);
  ctx.fillStyle = '#b4552d'; ctx.fillRect(padL + 72, 0, 10, 10);
  ctx.fillStyle = '#374151'; ctx.fillText('Spending', padL + 86, 9);
}

// Donut: share of spending per category.
function drawDonut(canvas, slices) {
  const { ctx, width, height } = setupCanvas(canvas, 230);
  const cx = width / 2, cy = height / 2 + 4, r = Math.min(width, height) / 2 - 14;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -Math.PI / 2;
  ctx.clearRect(0, 0, width, height);
  slices.forEach((s) => {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  });
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = '#fffdf8'; ctx.fill();
  ctx.fillStyle = '#1f2937'; ctx.textAlign = 'center';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(money(total), cx, cy - 2);
  ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = '#6b7280';
  ctx.fillText('spent in month', cx, cy + 16);
}

// Line chart: projected savings balance over years.
function drawProjection(canvas, points) {
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const padL = 52, padB = 26, padT = 12, padR = 10;
  const maxV = Math.max(...points.map((p) => p.balance)) * 1.05;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b7280'; ctx.strokeStyle = '#e5e0d5';
  for (let i = 0; i <= 4; i++) {
    const v = (maxV / 4) * i;
    const y = padT + plotH - (plotH * v) / maxV;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(width - padR, y); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText(money(v), padL - 6, y + 4);
  }
  ctx.strokeStyle = '#2f6f4f'; ctx.lineWidth = 2.5; ctx.beginPath();
  points.forEach((p, i) => {
    const x = padL + (plotW * i) / (points.length - 1);
    const y = padT + plotH - (plotH * p.balance) / maxV;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.lineWidth = 1;
  points.forEach((p, i) => {
    const x = padL + (plotW * i) / (points.length - 1);
    const y = padT + plotH - (plotH * p.balance) / maxV;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#2f6f4f'; ctx.fill();
    if (i % 2 === 0 || i === points.length - 1) {
      ctx.fillStyle = '#374151'; ctx.textAlign = 'center';
      ctx.fillText('Yr ' + p.year, x, height - 8);
    }
  });
}
