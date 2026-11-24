/* Modeled flight envelope (altitude vs true airspeed) and its SVG chart.
 * The envelope is an approximation built from published numbers:
 *  - low-speed edge: stall speed rising with altitude as vstall / sqrt(density ratio)
 *  - high-speed edge: max sea-level speed rising to vmax at vmaxAlt, then narrowing to
 *    the ceiling where the two edges meet (the "coffin corner").
 */
(function () {
  const H = window.HANGAR;
  const U = H.units;

  function model(a) {
    if (!a.vmax || !a.ceiling) return null;
    const vs = a.vstall || 0;
    const hover = vs === 0;
    const jet = !!a.thrust;
    const supersonic = a.vmax > 1250;
    const ceiling = a.ceiling;

    const lo = h => {
      if (hover) {
        const hh = 0.6 * ceiling;
        return h <= hh ? 0 : (h - hh) / (ceiling - hh) * 0.35 * a.vmax;
      }
      return vs / Math.sqrt(U.isa(h).sigma);
    };

    // Highest altitude still flyable aerodynamically (matters for rocket planes).
    let hAero = ceiling;
    if (!hover) {
      for (let h = 0; h <= ceiling; h += Math.max(50, ceiling / 400)) {
        if (lo(h) > 0.92 * a.vmax) { hAero = h; break; }
      }
    }
    const ballistic = hAero < ceiling * 0.98;

    let hMax = a.vmaxAlt !== undefined ? a.vmaxAlt : (supersonic ? 11000 : jet ? 8000 : 0.5 * ceiling);
    hMax = Math.min(hMax, 0.85 * hAero);
    let vSL = a.vmaxSL !== undefined ? a.vmaxSL : supersonic ? Math.min(a.vmax, 1470) : jet ? Math.min(a.vmax * 0.95, 670) : a.vmax * 0.88;
    vSL = Math.min(vSL, a.vmax);

    let hKnee = hMax + 0.6 * (hAero - hMax);
    if (a.cruiseAlt && a.cruiseAlt < hAero * 0.97) hKnee = Math.max(hKnee, Math.min(a.cruiseAlt, hAero * 0.97));
    const vc = hover ? 0.4 * a.vmax : Math.min(a.vmax, lo(hAero) * 1.06);

    const hi = h => {
      if (h <= hMax) return hMax <= 0 ? a.vmax : vSL + (a.vmax - vSL) * (h / hMax);
      if (h <= hKnee) return a.vmax;
      const t = (h - hKnee) / Math.max(1, hAero - hKnee);
      return a.vmax - (a.vmax - vc) * t * t;
    };

    const pts = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const h = hAero * i / N;
      const l = lo(h), r = Math.max(hi(h), l);
      pts.push({ h, lo: l, hi: r });
    }
    return {
      pts, hAero, ceiling, ballistic,
      max: { v: a.vmax, h: Math.max(hMax, 0) },
      cruise: a.cruise ? { v: a.cruise, h: a.cruiseAlt || Math.min(hAero * 0.8, 11000) } : null,
      at(h) {
        if (h < 0 || h > hAero) return null;
        const i = Math.min(N - 1, Math.floor(h / hAero * N));
        const p = pts[i], q = pts[i + 1], f = (h - p.h) / ((q.h - p.h) || 1);
        return { lo: p.lo + (q.lo - p.lo) * f, hi: p.hi + (q.hi - p.hi) * f };
      }
    };
  }

  function niceStep(range, target) {
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* series: [{a, color, label}] */
  function render(el, series) {
    const models = series.map(s => Object.assign({ m: model(s.a) }, s)).filter(s => s.m);
    if (!models.length) { el.innerHTML = '<p class="muted">Not enough data to model an envelope.</p>'; return; }

    const W = 680, Hh = 420, ml = 62, mr = 18, mt = 14, mb = 46;
    const pw = W - ml - mr, ph = Hh - mt - mb;

    // Axis ranges in display units.
    const vMaxM = Math.max(...models.map(s => s.a.vmax)) * 1.08;
    const hMaxM = Math.max(...models.map(s => (s.m.ballistic ? s.m.ceiling : s.m.hAero))) * 1.06;
    const vMaxD = U.conv(vMaxM, 'speed'), hMaxD = U.conv(hMaxM, 'alt');
    const vStep = niceStep(vMaxD, 6), hStep = niceStep(hMaxD, 6);
    const vTop = Math.ceil(vMaxD / vStep) * vStep, hTop = Math.ceil(hMaxD / hStep) * hStep;
    const vTopM = vTop / U.conv(1, 'speed'), hTopM = hTop / U.conv(1, 'alt');
    const x = v => ml + v / vTopM * pw;
    const y = h => mt + ph - h / hTopM * ph;

    let g = '';
    // Grid + ticks
    for (let v = 0; v <= vTop + 1e-9; v += vStep) {
      const X = x(v / U.conv(1, 'speed'));
      g += `<line class="grid" x1="${X}" y1="${mt}" x2="${X}" y2="${mt + ph}"/>`;
      g += `<text class="tick" x="${X}" y="${mt + ph + 18}" text-anchor="middle">${U.num(v)}</text>`;
    }
    for (let h = 0; h <= hTop + 1e-9; h += hStep) {
      const Y = y(h / U.conv(1, 'alt'));
      g += `<line class="grid" x1="${ml}" y1="${Y}" x2="${ml + pw}" y2="${Y}"/>`;
      g += `<text class="tick" x="${ml - 8}" y="${Y + 4}" text-anchor="end">${U.num(h)}</text>`;
    }
    g += `<text class="axis-label" x="${ml + pw / 2}" y="${Hh - 6}" text-anchor="middle">True airspeed (${U.unit('speed')})</text>`;
    g += `<text class="axis-label" transform="translate(14 ${mt + ph / 2}) rotate(-90)" text-anchor="middle">Altitude (${U.unit('alt')})</text>`;

    // Mach 1 reference line, only if it falls inside the plot.
    const a0 = U.isa(0).a;
    if (a0 < vTopM) {
      let d = '';
      for (let i = 0; i <= 60; i++) {
        const h = hTopM * i / 60;
        const v = U.isa(h).a;
        d += (i ? 'L' : 'M') + x(v).toFixed(1) + ' ' + y(h).toFixed(1);
      }
      g += `<path class="mach" d="${d}"/>`;
      const hl = Math.min(hTopM * 0.92, 30000);
      g += `<text class="mach-label" x="${x(U.isa(hl).a) + 5}" y="${y(hl) + 4}">Mach 1</text>`;
    }

    // Envelopes
    models.forEach((s, i) => {
      const p = s.m.pts;
      let d = '';
      p.forEach((q, j) => { d += (j ? 'L' : 'M') + x(q.lo).toFixed(1) + ' ' + y(q.h).toFixed(1); });
      for (let j = p.length - 1; j >= 0; j--) d += 'L' + x(p[j].hi).toFixed(1) + ' ' + y(p[j].h).toFixed(1);
      d += 'Z';
      g += `<path class="env" style="--c:${s.color}" d="${d}"/>`;
      if (s.m.ballistic) {
        const top = p[p.length - 1];
        const xv = x((top.lo + top.hi) / 2);
        g += `<line class="ballistic" style="--c:${s.color}" x1="${xv}" y1="${y(top.h)}" x2="${xv}" y2="${y(s.m.ceiling)}"/>`;
        g += `<circle class="mk" style="--c:${s.color}" cx="${xv}" cy="${y(s.m.ceiling)}" r="4.5"/>`;
        g += `<text class="mk-label" x="${xv + 8}" y="${y(s.m.ceiling) + 4}">ballistic peak ${esc(U.fmt(s.m.ceiling, 'alt', { step: 100 }))}</text>`;
      }
    });
    // Markers above all fills
    models.forEach(s => {
      const mx = s.m.max;
      g += `<circle class="mk" style="--c:${s.color}" cx="${x(mx.v)}" cy="${y(mx.h)}" r="5"/>`;
      if (s.m.cruise && s.m.cruise.h <= s.m.hAero) {
        g += `<circle class="mk hollow" style="--c:${s.color}" cx="${x(s.m.cruise.v)}" cy="${y(s.m.cruise.h)}" r="5"/>`;
      }
    });
    if (models.length === 1) {
      const s = models[0];
      g += `<text class="mk-label" x="${x(s.m.max.v) - 8}" y="${y(s.m.max.h) - 9}" text-anchor="end">max speed</text>`;
      if (s.m.cruise && Math.abs(y(s.m.cruise.h) - y(s.m.max.h)) > 14) g += `<text class="mk-label" x="${x(s.m.cruise.v) - 9}" y="${y(s.m.cruise.h) + 4}" text-anchor="end">cruise</text>`;
      g += `<text class="mk-label" x="${x(s.m.pts[s.m.pts.length - 1].hi) + 8}" y="${y(s.m.hAero) + 4}">ceiling</text>`;
    }

    g += `<line class="cross" x1="${ml}" x2="${ml + pw}" y1="0" y2="0" visibility="hidden"/>`;
    g += `<rect class="hit" x="${ml}" y="${mt}" width="${pw}" height="${ph}"/>`;

    el.innerHTML = `<div class="env-wrap"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Modeled flight envelope">${g}</svg><div class="env-tip" hidden></div></div>`;

    const svg = el.querySelector('svg'), tip = el.querySelector('.env-tip'), cross = el.querySelector('.cross');
    const move = ev => {
      const r = svg.getBoundingClientRect();
      const sy = (ev.clientY - r.top) * (Hh / r.height);
      const h = (mt + ph - sy) / ph * hTopM;
      if (h < 0 || h > hTopM) { leave(); return; }
      cross.setAttribute('y1', sy); cross.setAttribute('y2', sy); cross.setAttribute('visibility', 'visible');
      let html = `<div class="tip-h">${U.fmt(h, 'alt', { step: 100 })}</div>`;
      models.forEach(s => {
        const at = s.m.at(h);
        const txt = at ? `${U.fmt(at.lo, 'speed', { step: 5 })} – ${U.fmt(at.hi, 'speed', { step: 5 })}` : (s.m.ballistic && h <= s.m.ceiling ? 'ballistic only' : 'above ceiling');
        html += `<div class="tip-row"><span class="sw" style="background:${s.color}"></span><span class="tip-name">${esc(s.label)}</span><b>${txt}</b></div>`;
      });
      tip.innerHTML = html;
      tip.hidden = false;
      const wrap = el.querySelector('.env-wrap').getBoundingClientRect();
      const px = ev.clientX - wrap.left, py = ev.clientY - wrap.top;
      const tw = tip.offsetWidth;
      tip.style.left = Math.max(4, Math.min(wrap.width - tw - 4, px + (px > wrap.width / 2 ? -tw - 14 : 14))) + 'px';
      tip.style.top = Math.max(4, py - 20) + 'px';
    };
    const leave = () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); };
    const hit = el.querySelector('.hit');
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', leave);
  }

  H.envelope = { model, render };
})();
