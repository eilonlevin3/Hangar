/* Hangar: browse, detail and compare views. Vanilla JS, hash routing. */
(function () {
  const H = window.HANGAR;
  const U = H.units, W = H.wiki;
  const ALL = H.aircraft;  // one entry per aircraft family (one card each)
  /* Variants (js/variants.js): each copies its family and overrides what differs; page id <family>-<key>. */
  const VARS = [];
  ALL.forEach(a => {
    const vs = (H.variants || {})[a.id];
    if (!vs) return;
    a.vars = vs.map(v => {
      const o = Object.assign({}, a, v, (H.variantPerf || {})[a.id + '-' + v.key], { id: a.id + '-' + v.key, parent: a.id, name: v.name || v.variant });
      delete o.vars; delete o.key;
      return o;
    });
    VARS.push(...a.vars);
  });
  /* Opening a family shows its most common model; DEF maps family id -> that model's id. */
  const DEF = {};
  ALL.forEach(a => { if (a.vars) DEF[a.id] = (a.vars.find(v => v.popular) || a.vars[0]).id; });
  const real = id => DEF[id] || id;
  const TOP = {};
  (H.top || []).forEach((t, i) => { TOP[t.id] = Object.assign({ rank: i + 1 }, t); });
  const BY_ID = Object.fromEntries(ALL.concat(VARS).map(a => [a.id, a]));
  const CAT = Object.fromEntries(H.categories.map(c => [c.id, c]));
  const MAX_CMP = 3;
  const SERIES = ['var(--s1)', 'var(--s2)', 'var(--s3)'];
  const FEATURE = { fighter: 'f22', bomber: 'b2', attack: 'a10', recon: 'sr71', uav: 'mq9', transport: 'c17', narrowbody: 'a320neo', widebody: 'a380', regional: 'atr72', bizjet: 'g650', private: 'sr22', helicopter: 'ah64', trainer: 't38', warbird: 'spitfire', record: 'concorde' };
  const ROUTES = [
    ['London → Paris', 344], ['Tel Aviv → Athens', 1200], ['Tel Aviv → London', 3570], ['London → New York', 5570],
    ['Tel Aviv → New York', 9130], ['Los Angeles → Sydney', 12050], ['Singapore → New York', 15350]
  ];

  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PLANE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>';

  /* ---------- state ---------- */
  const S = { cat: 'all', q: '', sort: 'popular', status: 'all', country: 'all', thumbs: {} };
  let compare = [];
  const cmpOK = id => BY_ID[id] && !BY_ID[id].vars;  // a family (e.g. "F-16") can't be compared, only one of its models
  try { compare = JSON.parse(localStorage.getItem('hangar-compare') || '[]').filter(cmpOK).slice(0, MAX_CMP); } catch (e) {}
  const saveCompare = () => { try { localStorage.setItem('hangar-compare', JSON.stringify(compare)); } catch (e) {} };

  /* ---------- derived numbers ---------- */
  const D = {
    totalThrust: a => a.thrust ? (a.thrustAB || a.thrust) * (a.engN || 1) : null,
    totalPower: a => a.power ? a.power * (a.engN || 1) : null,
    tw: a => a.thrust && a.mtow ? D.totalThrust(a) * 1000 / (a.mtow * 9.80665) : null,
    pw: a => a.power && a.mtow ? D.totalPower(a) / (a.mtow / 1000) : null,
    wingLoad: a => a.wing && a.mtow ? a.mtow / a.wing : null,
    mach: a => a.vmax ? U.mach(a.vmax, a.vmaxAlt !== undefined ? a.vmaxAlt : (a.vmax > 1250 ? 11000 : 8000)) : null,
    bestRange: a => Math.max(a.range || 0, a.ferry || 0) || null,
    endurance: a => a.endurance || (a.range && a.cruise ? a.range / a.cruise : null),
    enduranceEst: a => !a.endurance && !!(a.range && a.cruise)
  };

  /* ---------- small helpers ---------- */
  function catLabel(a) { return CAT[a.cats[0]] ? CAT[a.cats[0]].label : ''; }
  function thumb(a) { return S.thumbs[a.wiki] || null; }
  function imgTag(src, alt) {
    return src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" onload="this.classList.add('ok')" onerror="this.remove()">` : '';
  }
  function crewText(a) {
    if (a.crewNote) return a.crewNote;
    return a.crew === 0 ? 'None' : String(a.crew);
  }
  function runwayText(v, a, kind) {
    if (v === 0) return a.rotor || a.vtol ? 'Vertical' : '—';
    if (v === undefined) return a.carrier ? (kind === 'takeoff' ? 'Catapult' : 'Arrested') : '—';
    return U.fmt(v, 'runway', { step: 10 });
  }
  function cmpLabel(a, on) {
    const what = a.parent ? esc(a.variant) : '';
    return on ? `✓ ${what ? what + ' in' : 'In'} comparison` : `+ Add ${what ? what + ' ' : ''}to compare`;
  }

  /* Estimated figures: a * that opens why (variant-perf.js est[field]). */
  const FIELD = { 'Top speed': 'vmax', 'Top speed (Mach)': 'vmax', 'Top speed at sea level': 'vmaxSL', 'Cruise': 'cruise', 'Cruise speed': 'cruise',
    'Stall speed (clean, est.)': 'vstall', 'Ceiling': 'ceiling', 'Service ceiling': 'ceiling', 'Rate of climb': 'climb', 'g limits': 'gmax', 'Max g': 'gmax',
    'Range': 'range', 'Ferry range': 'ferry', 'Combat radius': 'radius', 'Empty weight': 'empty', 'Max take-off weight': 'mtow', 'Internal fuel': 'fuel',
    'Max payload / weapons': 'payload', 'Thrust per engine': 'thrust', 'Total thrust': 'thrust' };
  function mark(a, label) {
    const f = FIELD[label];
    return a && f && a.est && a.est[f] ? `<button class="est" data-est="${a.id}|${f}" aria-label="Estimated figure: why?">*</button>` : '';
  }

  /* Bottom sheet for the model picker and the * explanations. */
  function openSheet(title, html) {
    let sh = $('#sheet');
    if (!sh) {
      sh = document.createElement('div');
      sh.id = 'sheet'; sh.className = 'sheet';
      sh.innerHTML = '<div class="sheet-back" data-close></div><div class="sheet-box" role="dialog" aria-modal="true"><div class="sheet-head"><h3></h3><button class="sheet-x" data-close aria-label="Close">×</button></div><div class="sheet-body"></div></div>';
      document.body.appendChild(sh);
      sh.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) { sh.hidden = true; return; }
        const pk = e.target.closest('[data-pickid]');
        if (pk) { e.stopPropagation(); toggleCompare(pk.dataset.pickid); syncCmp(); sh.hidden = true; }
      });
    }
    sh.querySelector('h3').textContent = title;
    sh.querySelector('.sheet-body').innerHTML = html;
    sh.hidden = false;
  }
  function openPicker(f) {
    openSheet(`Which ${f.name} model?`, `<p class="muted" style="margin:0 0 10px">Models fly differently, so pick one to compare.</p><div class="vars">${f.vars.map(v => {
      const on = compare.includes(v.id);
      return `<button class="var-row${on ? ' on' : ''}" data-pickid="${v.id}"><span class="var-name">${esc(v.variant)}${v.popular ? ' <small>most common</small>' : ''}</span><span class="var-meta">${on ? 'In comparison · tap to remove' : (v.intro || v.first) + (v.blurb ? ' · ' + esc(v.blurb) : '')}</span><span class="var-go" aria-hidden="true">${on ? '✓' : '+'}</span></button>`;
    }).join('')}</div>`);
  }
  function syncCmp() {
    document.querySelectorAll('[data-cmp]').forEach(b => {
      const id = b.dataset.cmp, on = inCompare(id);
      b.setAttribute('aria-pressed', on);
      if (b.id === 'dcmp') { b.innerHTML = cmpLabel(BY_ID[id], on); b.classList.toggle('on', on); }
      else b.textContent = on ? '✓ Comparing' : '+ Compare';
      const card = b.closest('.card'); if (card) card.classList.toggle('sel', on);
    });
    if (route().name === 'compare') render(true);
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
  }

  const inCompare = id => (BY_ID[id] && BY_ID[id].vars ? BY_ID[id].vars.some(v => compare.includes(v.id)) : compare.includes(id));

  function toggleCompare(id) {
    if (!cmpOK(id)) { if (BY_ID[id]) openPicker(BY_ID[id]); return false; }
    const i = compare.indexOf(id);
    if (i >= 0) compare.splice(i, 1);
    else if (compare.length >= MAX_CMP) { toast('You can compare up to 3 aircraft. Remove one first.'); return false; }
    else compare.push(id);
    saveCompare();
    updateTray();
    updateNav();
    return true;
  }

  /* ---------- header ---------- */
  function updateNav() {
    const r = route().name;
    $('#nav-browse').classList.toggle('on', r === 'browse');
    $('#nav-compare').classList.toggle('on', r === 'compare');
    $('#nav-compare').innerHTML = 'Compare' + (compare.length ? `<span class="pill">${compare.length}</span>` : '');
    document.querySelectorAll('#units button').forEach(b => b.classList.toggle('on', b.dataset.u === U.system));
  }

  function setupHeader() {
    $('#units').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      U.set(b.dataset.u); updateNav(); render(true);
    });
    $('#theme').addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      const next = dark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('hangar-theme', next); } catch (e) {}
    });
  }

  /* ---------- tray ---------- */
  function updateTray() {
    const tray = $('#tray');
    if (!compare.length || route().name === 'compare') { tray.hidden = true; return; }
    tray.hidden = false;
    let items = compare.map((id, i) => {
      const a = BY_ID[id];
      return `<div class="tray-item ph" style="--c:${SERIES[i]}" title="${esc(a.name)}">${PLANE}${imgTag(thumb(a), a.name)}<button data-rm="${id}" aria-label="Remove ${esc(a.name)}">×</button></div>`;
    }).join('');
    for (let i = compare.length; i < MAX_CMP; i++) items += '<div class="tray-slot"></div>';
    tray.innerHTML = `<div class="tray-items">${items}</div>
      <a class="btn primary" href="#/compare">Compare ${compare.length > 1 ? compare.length : ''}</a>
      <button class="link" data-clear>Clear</button>`;
  }

  /* ---------- routing ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [name, arg] = h.split('/');
    if (name === 'a' && BY_ID[arg]) return { name: 'detail', id: real(arg) };
    if (name === 'compare') return { name: 'compare', ids: arg };
    return { name: 'browse' };
  }

  let lastRoute = '';
  function render(keepScroll) {
    const r = route();
    const key = location.hash;
    const view = $('#view');
    if (r.name === 'detail') renderDetail(view, BY_ID[r.id]);
    else if (r.name === 'compare') {
      if (r.ids) {
        const ids = r.ids.split(',').filter(cmpOK).slice(0, MAX_CMP);
        if (ids.length) { compare = ids; saveCompare(); }
      }
      renderCompare(view);
    } else renderBrowse(view);
    if (!keepScroll && key !== lastRoute) window.scrollTo(0, r.name === 'browse' ? (S.scroll || 0) : 0);
    lastRoute = key;
    updateNav(); updateTray();
    const a = r.name === 'detail' ? BY_ID[r.id] : null;
    document.title = a ? a.name + ' · Hangar' : r.name === 'compare' ? 'Compare · Hangar' : 'Hangar · Aircraft explorer';
  }

  /* ================= BROWSE ================= */
  function filtered() {
    const q = S.q.trim().toLowerCase();
    let list = ALL.filter(a => {
      if (S.cat !== 'all' && !a.cats.includes(S.cat)) return false;
      if (S.status !== 'all' && a.status !== S.status) return false;
      if (S.country !== 'all' && !a.country.includes(S.country)) return false;
      if (q) {
        const hay = [a.name, a.variant, a.maker, a.country, a.role, a.engine, a.cats.map(c => CAT[c].label).join(' '), (a.vars || []).map(v => v.variant + ' ' + v.country).join(' ')].join(' ').toLowerCase();
        return q.split(/\s+/).every(w => hay.includes(w));
      }
      return true;
    });
    const by = {
      popular: (a, b) => ((TOP[a.id] || {}).rank || 999) - ((TOP[b.id] || {}).rank || 999) || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      speed: (a, b) => (b.vmax || 0) - (a.vmax || 0),
      range: (a, b) => (D.bestRange(b) || 0) - (D.bestRange(a) || 0),
      ceiling: (a, b) => (b.ceiling || 0) - (a.ceiling || 0),
      mtow: (a, b) => (b.mtow || 0) - (a.mtow || 0),
      newest: (a, b) => (b.first || 0) - (a.first || 0),
      oldest: (a, b) => (a.first || 0) - (b.first || 0),
      pax: (a, b) => (b.pax || 0) - (a.pax || 0)
    }[S.sort];
    return list.sort(by);
  }

  function countries() {
    const set = new Set();
    ALL.forEach(a => a.country.split(' / ').forEach(c => set.add(c)));
    return [...set].sort();
  }

  /* Card stats are narrow: aviation value on one line, metric under it. */
  function two(v, kind, opts) {
    const main = U.fmt(v, kind, Object.assign({ single: true }, opts));
    const full = U.fmt(v, kind, opts);
    const m = full.length > main.length ? full.slice(main.length).trim().replace(/^\(|\)$/g, '') : '';
    return esc(main) + (m ? `<small>${esc(m)}</small>` : '');
  }

  function cardHTML(a) {
    const sel = inCompare(a.id);
    const third = a.pax > 0 ? ['Seats', String(a.pax)] : ['Max weight', U.fmt(a.mtow, 'mass')];
    return `<article class="card${sel ? ' sel' : ''}" data-id="${a.id}">
      <div class="card-img ph">${PLANE}${imgTag(thumb(a), a.name)}${a.status !== 'Active' ? `<span class="badge">${a.status === 'Limited' ? 'Limited service' : 'Retired'}</span>` : ''}${TOP[a.id] ? `<span class="badge rank">#${TOP[a.id].rank} fighter</span>` : ''}</div>
      <button class="cmp-btn" data-cmp="${a.id}" aria-pressed="${sel}">${sel ? '✓ Comparing' : '+ Compare'}</button>
      <div class="card-body">
        <div class="card-cat">${esc(catLabel(a))} · ${esc(a.country)}</div>
        <h3><a href="#/a/${a.id}">${esc(a.name)}</a></h3>
        <div class="card-maker">${esc(a.maker)} · ${a.first}${a.vars ? ` · <b class="nvar">${a.vars.length} variants</b>` : ''}</div>
        <dl class="card-stats">
          <div><dt>Top speed</dt><dd>${two(a.vmax, 'speed', { step: 10 })}</dd></div>
          <div><dt>Range</dt><dd>${two(D.bestRange(a), 'dist', { step: 10 })}</dd></div>
          <div><dt>${third[0]}</dt><dd>${a.pax > 0 ? third[1] : two(a.mtow, 'mass')}</dd></div>
        </dl>
      </div>
    </article>`;
  }

  function renderBrowse(view) {
    const filtering = S.cat !== 'all' || S.q || S.status !== 'all' || S.country !== 'all';
    const heroA = BY_ID[S.cat !== 'all' && FEATURE[S.cat] ? FEATURE[S.cat] : 'concorde'];
    const counts = {};
    H.categories.forEach(c => { counts[c.id] = ALL.filter(a => a.cats.includes(c.id)).length; });
    view.innerHTML = `
      <div class="wrap">
        <section class="hero" id="hero">
          <div class="hero-inner">
            <h1>${S.cat === 'all' ? 'Explore the world\'s aircraft' : esc(CAT[S.cat].label)}</h1>
            <p>${S.cat === 'all' ? `${ALL.length} aircraft from the Spitfire to the F-35: speeds, weights, range, runway needs and modeled flight envelopes. Pick up to three to compare side by side.` : esc(CAT[S.cat].blurb) + ` · ${counts[S.cat]} aircraft`}</p>
            <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input id="q" type="search" placeholder="Search by name, maker, country, role…" value="${esc(S.q)}" autocomplete="off" aria-label="Search aircraft"></label>
          </div>
        </section>
        <nav class="chips" id="chips" aria-label="Categories">
          <button class="chip${S.cat === 'all' ? ' on' : ''}" data-cat="all">All<span class="n">${ALL.length}</span></button>
          ${H.categories.map(c => `<button class="chip${S.cat === c.id ? ' on' : ''}" data-cat="${c.id}">${esc(c.label)}<span class="n">${counts[c.id]}</span></button>`).join('')}
        </nav>
        ${filtering ? '' : `
        <div class="section-title"><h2>Browse by category</h2></div>
        <div class="tiles">${H.categories.map(c => {
          const f = BY_ID[FEATURE[c.id]];
          const src = thumb(f);
          return `<button class="tile" data-cat="${c.id}" data-wiki="${esc(f.wiki)}" style="${src ? `background-image:url('${esc(src)}')` : ''}"><span><b>${esc(c.label)}</b><small>${counts[c.id]} aircraft · ${esc(c.blurb)}</small></span></button>`;
        }).join('')}</div>`}
        <div class="section-title">
          <h2>${filtering ? 'Results' : 'All aircraft'}</h2>
        </div>
        <div class="toolbar">
          <span class="count" id="count"></span>
          <select id="sort" aria-label="Sort">
            ${[['popular', 'Top 10 fighters first'], ['name', 'Name A–Z'], ['speed', 'Fastest'], ['range', 'Longest range'], ['ceiling', 'Highest ceiling'], ['mtow', 'Heaviest'], ['pax', 'Most seats'], ['newest', 'Newest first flight'], ['oldest', 'Oldest first flight']].map(([v, l]) => `<option value="${v}"${S.sort === v ? ' selected' : ''}>${l}</option>`).join('')}
          </select>
          <select id="status" aria-label="Status">
            ${[['all', 'Any status'], ['Active', 'In service'], ['Limited', 'Limited service'], ['Retired', 'Retired']].map(([v, l]) => `<option value="${v}"${S.status === v ? ' selected' : ''}>${l}</option>`).join('')}
          </select>
          <select id="country" aria-label="Country">
            <option value="all">Any country</option>
            ${countries().map(c => `<option${S.country === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
        </div>
        <div class="grid" id="grid" style="margin-top:14px"></div>
      </div>
      ${footer()}`;
    renderGrid();
    setHeroImage(heroA);

    const q = $('#q');
    q.addEventListener('input', () => { S.q = q.value; renderGrid(); });
    q.addEventListener('keydown', e => { if (e.key === 'Enter') q.blur(); });
    $('#sort').addEventListener('change', e => { S.sort = e.target.value; renderGrid(); });
    $('#status').addEventListener('change', e => { S.status = e.target.value; renderGrid(); });
    $('#country').addEventListener('change', e => { S.country = e.target.value; renderGrid(); });
  }

  async function setHeroImage(a) {
    const hero = $('#hero');
    if (!hero) return;
    try {
      const info = await W.info(a.wiki);
      if (info.image && hero.isConnected) {
        hero.style.backgroundImage = `url('${info.image}')`;
        hero.insertAdjacentHTML('beforeend', `<a class="hero-credit" href="#/a/${a.id}">${esc(a.name)}</a>`);
      }
    } catch (e) {}
  }

  function renderGrid() {
    const grid = $('#grid');
    if (!grid) return;
    const list = filtered();
    $('#count').textContent = list.length === 1 ? '1 aircraft' : list.length + ' aircraft';
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<div class="empty">No aircraft match. Try a different search or category.</div>';
  }

  function footer() {
    return `<footer class="foot"><div class="wrap">
      Figures are approximate published values for the variant named on each page and vary with version, load and conditions.
      Flight envelopes are modeled from those figures with the standard atmosphere, not taken from flight manuals.
      Photos and intro text: Wikipedia and Wikimedia Commons contributors; tap a photo for its author and licence.
    </div></footer>`;
  }

  /* ================= DETAIL ================= */
  function renderDetail(view, a) {
    const fam = a.parent ? BY_ID[a.parent] : null;
    const top = TOP[fam ? fam.id : a.id];
    const sel = compare.includes(a.id);
    const mach = D.mach(a);
    const end = D.endurance(a);
    const tiles = [
      ['Top speed', U.fmt(a.vmax, 'speed', { step: 10 }), mach ? U.fmt(mach, 'mach') : ''],
      ['Cruise', a.cruise ? U.fmt(a.cruise, 'speed', { step: 10 }) : '—', a.cruiseAlt ? 'at ' + U.fmt(a.cruiseAlt, 'alt', { step: 100 }) : ''],
      ['Range', U.fmt(a.range || a.radius || a.ferry, 'dist', { step: 10 }), a.range ? (a.ferry ? 'ferry ' + U.fmt(a.ferry, 'dist', { step: 10 }) : '') : a.radius ? 'combat radius' : a.ferry ? 'ferry range' : ''],
      ['Endurance', end ? U.fmt(end, 'hours') : '—', D.enduranceEst(a) ? 'estimated from range ÷ cruise' : ''],
      ['Ceiling', U.fmt(a.ceiling, 'alt', { step: 10 }), ''],
      ['Max take-off weight', U.fmt(a.mtow, 'mass'), a.empty ? 'empty ' + U.fmt(a.empty, 'mass') : ''],
      ['Take-off distance', runwayText(a.takeoff, a, 'takeoff'), a.landing !== undefined ? 'landing ' + runwayText(a.landing, a, 'landing') : ''],
      [a.pax ? 'Seats' : 'Crew', a.pax ? String(a.pax) : crewText(a), a.pax ? 'crew ' + crewText(a) : '']
    ];

    view.innerHTML = `
      <div class="wrap">
        <a class="back" href="#/">← All aircraft</a>
        <section class="d-hero" id="dhero">
          <div class="d-hero-inner">
            <div class="tags">
              ${a.cats.map(c => `<a class="tag" href="#/" data-gocat="${c}">${esc(CAT[c].label)}</a>`).join('')}
              <span class="tag status-${a.status}">${a.status === 'Active' ? 'In service' : a.status === 'Limited' ? 'Limited service' : 'Retired'}</span>
              ${top ? `<span class="tag rank" title="${esc(top.fleetNote || '')}">#${top.rank} most flown fighter · about ${U.fmt(top.fleet, 'count')} in service</span>` : ''}
            </div>
            <h1>${esc(fam ? fam.name : a.name)}</h1>
            ${fam ? `<div class="models" aria-label="Model">${fam.vars.map(v => `<a class="model${v.id === a.id ? ' on' : ''}" href="#/a/${v.id}"${v.id === a.id ? ' aria-current="page"' : ''}>${esc(v.variant)}${v.popular ? ' <small>most common</small>' : ''}</a>`).join('')}</div>` : ''}
            <div class="d-sub">${esc(a.role)} · ${esc(a.maker)} · ${esc(a.country)} · first flight ${a.first}</div>
            <div class="d-actions">
              <button class="btn ghost${sel ? ' on' : ''}" id="dcmp" data-cmp="${a.id}" aria-pressed="${sel}">${cmpLabel(a, sel)}</button>
              <button class="btn ghost" id="dphotos">Photos</button>
              <a class="btn ghost" id="dwiki" href="https://en.wikipedia.org/wiki/${encodeURIComponent(a.wiki)}" target="_blank" rel="noopener">Wikipedia ↗</a>
            </div>
          </div>
        </section>
        <div class="strip" id="strip" aria-label="Photo gallery"></div>
        <p class="strip-note" id="strip-note"></p>

        <dl class="stats">${tiles.map(t => `<div class="stat"><dt>${t[0]}</dt><dd>${t[1]}${t[1] !== '—' ? mark(a, t[0] === 'Range' ? (a.range ? 'Range' : 'Combat radius') : t[0]) : ''}<small>${t[2] || '&nbsp;'}</small></dd></div>`).join('')}</dl>

        <div class="cols">
          <div>
            <section class="panel about">
              <h2>About</h2>
              <p class="sub">Variant shown: ${esc(a.variant)}</p>
              <p id="extract" class="muted">Loading description…</p>
              ${a.note ? `<p class="note">${esc(a.note)}</p>` : ''}
            </section>
            ${variantsHTML(fam || a, a)}
            <section class="panel">
              <h2>Flight envelope</h2>
              <p class="sub">Where it can fly: altitude against true airspeed. Move over the chart to read the speed range at any altitude.</p>
              <div id="env"></div>
              <div class="legend"><span><i class="dot"></i>max speed</span><span><i class="dot hollow"></i>cruise</span><span><i class="dash"></i>speed of sound</span></div>
              ${envNotes([a])}
              <p class="fine">Modeled from published stall speed, top speed and ceiling using the standard atmosphere. An illustration, not a flight-manual chart.</p>
            </section>
            <section class="panel">
              <h2>How it ranks</h2>
              <p class="sub">Percentile among all ${ALL.length} aircraft in Hangar (100 = highest).</p>
              <div class="ranks">${ranksHTML(a)}</div>
            </section>
            <section class="panel">
              <h2>Runway needed</h2>
              <p class="sub">${a.rotor || (a.vtol && !a.takeoff) ? 'Takes off and lands vertically; no runway needed.' : a.vtol ? 'Short take-off, vertical landing.' : 'Distance at maximum weight, against common runway lengths.'}</p>
              ${runwayHTML([{ a, color: 'var(--accent)' }])}
            </section>
            <section class="panel">
              <h2>Could it fly there non-stop?</h2>
              <p class="sub">Great-circle distance against its range, with no wind or reserves.</p>
              ${routesHTML([a])}
            </section>
          </div>
          <div>
            ${specPanel('Performance', [
              ['Top speed', U.fmt(a.vmax, 'speed', { step: 1 }), a.vmaxAlt ? 'at ' + U.fmt(a.vmaxAlt, 'alt', { step: 10 }) : ''],
              ['Top speed (Mach)', mach ? U.fmt(mach, 'mach') : '—'],
              ['Top speed at sea level', a.vmaxSL ? U.fmt(a.vmaxSL, 'speed') : '—'],
              ['Cruise speed', a.cruise ? U.fmt(a.cruise, 'speed') : '—'],
              ['Stall speed (clean, est.)', a.vstall ? U.fmt(a.vstall, 'speed', { step: 5 }) : (a.rotor || a.vtol ? 'Can hover' : '—')],
              ['Service ceiling', U.fmt(a.ceiling, 'alt', { step: 10 })],
              ['Rate of climb', a.climb ? U.fmt(a.climb, 'climb') : '—'],
              ['g limits', a.gmax ? U.fmt(a.gmax, 'g') + (a.gmin ? ' / ' + U.fmt(a.gmin, 'g') : '') : '—']
            ], a)}
            ${specPanel('Range & endurance', [
              ['Range', a.range ? U.fmt(a.range, 'dist') : '—'],
              ['Ferry range', a.ferry ? U.fmt(a.ferry, 'dist') : '—', a.ferry ? 'with extra tanks, no payload' : ''],
              ['Combat radius', a.radius ? U.fmt(a.radius, 'dist') : '—', a.radius ? 'out and back with a mission load' : ''],
              ['Endurance', end ? U.fmt(end, 'hours') : '—', D.enduranceEst(a) ? 'estimated' : '']
            ], a)}
            ${specPanel('Weights & fuel', [
              ['Empty weight', U.fmt(a.empty, 'mass', { exact: true })],
              ['Max take-off weight', U.fmt(a.mtow, 'mass', { exact: true })],
              ['Max payload / weapons', a.payload ? U.fmt(a.payload, 'mass', { exact: true }) : '—'],
              ['Internal fuel', a.fuel ? U.fmt(a.fuel, 'mass', { exact: true }) : '—'],
              ['Wing loading', D.wingLoad(a) ? U.fmt(D.wingLoad(a), 'wingload') : '—', 'at max take-off weight']
            ], a)}
            ${specPanel('Dimensions', [
              ['Length', U.fmt(a.len, 'len')],
              [a.rotor ? 'Main rotor diameter' : 'Wingspan', U.fmt(a.span, 'len')],
              ['Height', U.fmt(a.height, 'len')],
              ['Wing area', a.wing ? U.fmt(a.wing, 'area') : '—']
            ], a)}
            ${specPanel('Powerplant', [
              ['Engines', `${a.engN || 1} × ${esc(a.engine)}`],
              a.thrust ? ['Thrust per engine', U.fmt(a.thrust, 'thrust') + (a.thrustAB ? ' dry' : ''), a.thrustAB ? U.fmt(a.thrustAB, 'thrust') + ' with afterburner' : ''] : ['Power per engine', U.fmt(a.power, 'power')],
              a.thrust ? ['Thrust-to-weight', U.fmt(D.tw(a), 'ratio'), 'at max take-off weight' + (a.thrustAB ? ', with afterburner' : '')] : ['Power-to-weight', D.pw(a) ? U.fmt(D.pw(a), 'pw') : '—', 'at max take-off weight']
            ], a)}
            ${specPanel('Service & production', [
              ['First flight', String(a.first)],
              ['Entered service', String(a.intro)],
              ['Status', a.status === 'Active' ? 'In service' : a.status === 'Limited' ? 'Limited service' : 'Retired'],
              ['Number built', a.built ? U.fmt(a.built, 'count') + (a.status === 'Active' ? '+' : '') : '—'],
              ['Crew', crewText(a)],
              ['Passengers / troops', a.pax ? (a.paxNote || String(a.pax)) : '—'],
              ['Approx. unit cost', a.cost ? U.fmt(a.cost, 'cost') : '—', a.cost ? 'US$, year of purchase varies' : '']
            ], a)}
          </div>
        </div>

        <div class="section-title"><h2>More ${esc(catLabel(a).toLowerCase())}</h2></div>
        <div class="similar">${ALL.filter(x => x.id !== a.id && x.cats.includes(a.cats[0])).slice(0, 12).map(cardHTML).join('')}</div>
      </div>
      ${footer()}`;

    H.envelope.render($('#env'), [{ a, color: 'var(--accent)', label: a.name }]);
    loadDetailMedia(a);
  }

  const ENV_F = [['vmax', 'top speed'], ['vmaxSL', 'sea-level speed'], ['vstall', 'stall speed'], ['ceiling', 'ceiling']];
  function envNotes(list) {
    return list.map(a => {
      const est = ENV_F.filter(([f]) => a.est && a.est[f]);
      const who = list.length > 1 ? `<b>${esc(a.name)}:</b> ` : '';
      const parts = [];
      if (a.envNote) parts.push(esc(a.envNote));
      if (est.length) parts.push('Estimated inputs: ' + est.map(([f, l]) => `${l}<button class="est" data-est="${a.id}|${f}" aria-label="Why estimated">*</button>`).join(', ') + '.');
      return parts.length ? `<p class="env-note">${who}${parts.join(' ')}</p>` : '';
    }).join('');
  }

  function variantsHTML(f, cur) {
    if (!f.vars) return '';
    return `<section class="panel" id="variants">
      <h2>Variants</h2>
      <p class="sub">This page shows the ${esc(cur.variant)}. Tap another model to see its own figures and envelope, and to compare it.</p>
      <div class="vars">${f.vars.map(v => `<a class="var-row${v.id === cur.id ? ' on' : ''}" href="#/a/${v.id}">
        <span class="var-name">${esc(v.variant)}${v.country !== f.country ? ` <small>${esc(v.country)}</small>` : ''}</span>
        <span class="var-meta">${v.intro || v.first}${v.blurb ? ' · ' + esc(v.blurb) : ''}</span>
        <span class="var-go" aria-hidden="true">›</span></a>`).join('')}</div>
    </section>`;
  }

  function specPanel(title, rows, a) {
    return `<section class="panel"><h2>${title}</h2><table class="specs"><tbody>${rows.map(r =>
      `<tr><th>${r[0]}</th><td>${r[1]}${r[1] !== '—' ? mark(a, r[0]) : ''}${r[2] ? `<span class="hint">${r[2]}</span>` : ''}</td></tr>`).join('')}</tbody></table></section>`;
  }

  const RANK_METRICS = [
    ['Top speed', a => a.vmax],
    ['Range', a => D.bestRange(a)],
    ['Ceiling', a => a.ceiling],
    ['Climb rate', a => a.climb],
    ['Max weight', a => a.mtow],
    ['Seats', a => a.pax || null]
  ];
  function ranksHTML(a) {
    return RANK_METRICS.map(([label, f]) => {
      const v = f(a);
      if (!v) return '';
      const vals = ALL.map(f).filter(x => x);
      const below = vals.filter(x => x < v).length;
      const pct = Math.round(below / Math.max(1, vals.length - 1) * 100);
      return `<div class="rank-row"><span>${label}</span><div class="rank-track"><div class="rank-fill" style="width:${Math.max(2, pct)}%"></div></div><b>${pct}</b></div>`;
    }).join('');
  }

  function runwayHTML(items) {
    const vals = items.flatMap(i => [i.a.takeoff, i.a.landing]).filter(v => v > 0);
    if (!vals.length) {
      const allVertical = items.every(i => i.a.rotor || i.a.vtol);
      return `<p class="muted">${allVertical ? 'Vertical take-off and landing.' : 'No published runway figures.'}</p>`;
    }
    const scale = Math.max(4000, ...vals);
    const row = (label, v, it, kind) => {
      const pct = v > 0 ? v / scale * 100 : 0;
      return `<div class="rwy-row"><div class="rwy-label"><span>${label}</span><b>${runwayText(v, it.a, kind)}</b></div>
        <div class="rwy-track"><div class="rwy-fill" style="--c:${it.color};width:${pct}%"></div></div></div>`;
    };
    const multi = items.length > 1;
    let html = '<div class="rwy">';
    items.forEach(it => {
      html += row((multi ? esc(it.a.name) + ': ' : '') + 'Take-off', it.a.takeoff, it, 'takeoff');
      html += row((multi ? esc(it.a.name) + ': ' : '') + 'Landing', it.a.landing, it, 'landing');
    });
    const ticks = [0, scale / 4, scale / 2, scale * 3 / 4, scale].map(v => `<span>${U.fmt(v, 'runway', { step: 100 })}</span>`).join('');
    html += `<div class="rwy-scale">${ticks}</div>`;
    html += `<p class="fine">For scale: a small airfield runway is about ${U.fmt(800, 'runway', { step: 100 })}, a regional airport ${U.fmt(2000, 'runway', { step: 100 })}, a major hub ${U.fmt(3500, 'runway', { step: 100 })} or more.</p></div>`;
    return html;
  }

  function routesHTML(list) {
    const head = list.length > 1 ? `<thead><tr><th>Route</th>${list.map((a, i) => `<th><span class="sw" style="display:inline-block;background:${SERIES[i]}"></span></th>`).join('')}</tr></thead>` : '';
    return `<table class="routes">${head}<tbody>${ROUTES.map(([name, km]) => `<tr><td>${name}<span class="muted"> · ${U.fmt(km, 'dist', { step: 10 })}</span></td>${list.map(a => {
      const r = a.range || (a.radius ? a.radius * 2 : 0);
      if (r >= km) return '<td class="yes" title="Yes">✓</td>';
      if (a.ferry && a.ferry >= km) return '<td class="ferry" title="Only with ferry tanks">ferry</td>';
      return '<td class="no" title="No">✗</td>';
    }).join('')}</tr>`).join('')}</tbody></table>`;
  }

  async function loadDetailMedia(a) {
    const hero = $('#dhero');
    let info = null, gal = [];
    try { info = await W.info(a.wiki); } catch (e) {}
    if (!hero.isConnected) return;
    if (info) {
      if (info.image) hero.insertAdjacentHTML('afterbegin', `<img src="${esc(info.image)}" alt="${esc(a.name)}" onload="this.classList.add('ok')">`);
      $('#extract').textContent = info.extract || '';
      $('#extract').classList.remove('muted');
      if (info.url) $('#dwiki').href = info.url;
    } else {
      $('#extract').textContent = 'Description unavailable offline.';
    }
    try { gal = await W.gallery(a.wiki); } catch (e) {}
    if (!hero.isConnected) return;
    // Lead image first.
    if (info && info.imageName) {
      const i = gal.findIndex(g => g.name.replace(/ /g, '_') === info.imageName.replace(/ /g, '_'));
      if (i > 0) gal.unshift(gal.splice(i, 1)[0]);
    }
    const strip = $('#strip');
    if (!gal.length) {
      $('#strip-note').textContent = info ? 'No extra photos found.' : 'Photos need an internet connection.';
      $('#dphotos').hidden = true;
      return;
    }
    const show = gal.slice(0, 14);
    strip.innerHTML = show.map((g, i) => `<button class="ph" data-lb="${i}" aria-label="Open photo ${i + 1}">${PLANE}<img src="${esc(W.resize(g.src, 330))}" alt="" loading="lazy" onload="this.classList.add('ok')" onerror="this.closest('button').remove()"></button>`).join('') +
      (gal.length > show.length ? `<button class="more" data-lb="${show.length}">+${gal.length - show.length} more</button>` : '');
    $('#strip-note').textContent = `${gal.length} photos from Wikimedia Commons. Tap one to view it full size with its credit.`;
    strip.onclick = e => { const b = e.target.closest('[data-lb]'); if (b) openLightbox(gal, +b.dataset.lb); };
    $('#dphotos').onclick = () => openLightbox(gal, 0);
  }

  /* ================= COMPARE ================= */
  const CMP_GROUPS = [
    ['Performance', [
      ['Top speed', a => a.vmax, 'speed', 'hi'],
      ['Top speed (Mach)', a => D.mach(a), 'mach', 'hi'],
      ['Cruise speed', a => a.cruise, 'speed', 'hi'],
      ['Stall speed (clean, est.)', a => a.vstall === 0 ? 0 : a.vstall, 'speed', 'lo', a => (a.vstall === 0 ? 'Can hover' : null)],
      ['Service ceiling', a => a.ceiling, 'alt', 'hi'],
      ['Rate of climb', a => a.climb, 'climb', 'hi'],
      ['Max g', a => a.gmax, 'g', 'hi']
    ]],
    ['Range & endurance', [
      ['Range', a => a.range, 'dist', 'hi'],
      ['Ferry range', a => a.ferry, 'dist', 'hi'],
      ['Combat radius', a => a.radius, 'dist', 'hi'],
      ['Endurance', a => D.endurance(a), 'hours', 'hi']
    ]],
    ['Runway', [
      ['Take-off distance', a => a.takeoff, 'runway', 'lo', a => (a.takeoff === 0 ? 'Vertical' : a.takeoff === undefined && a.carrier ? 'Catapult' : null)],
      ['Landing distance', a => a.landing, 'runway', 'lo', a => (a.landing === 0 ? 'Vertical' : a.landing === undefined && a.carrier ? 'Arrested' : null)]
    ]],
    ['Weights & fuel', [
      ['Empty weight', a => a.empty, 'mass', null],
      ['Max take-off weight', a => a.mtow, 'mass', null],
      ['Max payload / weapons', a => a.payload, 'mass', 'hi'],
      ['Internal fuel', a => a.fuel, 'mass', null],
      ['Wing loading', a => D.wingLoad(a), 'wingload', null]
    ]],
    ['Dimensions', [
      ['Length', a => a.len, 'len', null],
      ['Wingspan / rotor', a => a.span, 'len', null],
      ['Height', a => a.height, 'len', null],
      ['Wing area', a => a.wing, 'area', null]
    ]],
    ['Powerplant', [
      ['Engines', a => null, null, null, a => `${a.engN || 1} × ${a.engine}`],
      ['Total thrust', a => D.totalThrust(a), 'thrust', 'hi'],
      ['Total power', a => D.totalPower(a), 'power', 'hi'],
      ['Thrust-to-weight', a => D.tw(a), 'ratio', 'hi'],
      ['Power-to-weight', a => D.pw(a), 'pw', 'hi']
    ]],
    ['Capacity & service', [
      ['Crew', a => null, null, null, a => crewText(a)],
      ['Seats / troops', a => a.pax || null, 'count', 'hi'],
      ['First flight', a => a.first, 'year', null],
      ['Status', a => null, null, null, a => (a.status === 'Active' ? 'In service' : a.status === 'Limited' ? 'Limited service' : 'Retired')],
      ['Number built', a => a.built, 'count', 'hi'],
      ['Approx. unit cost', a => a.cost, 'cost', null]
    ]]
  ];

  function renderCompare(view) {
    const list = compare.map(id => BY_ID[id]);
    const n = list.length;
    const cols = Math.min(MAX_CMP, n + (n < MAX_CMP ? 1 : 0));
    const opts = H.categories.map(c => `<optgroup label="${esc(c.label)}">${ALL.filter(a => a.cats[0] === c.id).map(a => (a.vars ? a.vars : [a]).filter(v => !compare.includes(v.id)).map(v => `<option value="${v.id}">${esc(v.parent ? BY_ID[v.parent].name + ' · ' + v.variant : v.name)}</option>`).join('')).join('')}</optgroup>`).join('');
    const addSlot = n < MAX_CMP ? `<div class="cmp-add"><b>Add an aircraft</b><select id="cmp-add" aria-label="Add an aircraft"><option value="">Choose…</option>${opts}</select><a href="#/" class="muted" style="font-size:13px">or browse with photos →</a></div>` : '';
    const head = `<div class="cmp-head" style="grid-template-columns:repeat(${cols}, minmax(0,1fr))">${list.map((a, i) => `
      <div class="cmp-col" style="--c:${SERIES[i]}">
        <button class="cmp-x" data-rm="${a.id}" aria-label="Remove ${esc(a.name)}">×</button>
        <a class="card-img ph" href="#/a/${a.id}">${PLANE}${imgTag(thumb(a), a.name)}</a>
        <div class="body"><h3><a href="#/a/${a.id}">${esc(a.name)}</a></h3><div class="meta">${esc(a.variant)} · ${esc(catLabel(a))}</div></div>
      </div>`).join('')}${addSlot}</div>`;

    if (n === 0) {
      view.innerHTML = `<div class="wrap"><h1 style="margin:22px 0 4px">Compare</h1>${head}
        <div class="cmp-empty"><p>Pick up to three aircraft to put their numbers side by side.</p><a class="btn primary" href="#/">Browse aircraft</a></div></div>`;
      bindAdd();
      return;
    }

    let body = '';
    if (n >= 1) {
      body += `<section class="panel"><h2>Flight envelopes</h2><p class="sub">Altitude against true airspeed, overlaid. Move over the chart to read each aircraft's speed range at that altitude.</p>
        <div id="env"></div>
        <div class="legend">${list.map((a, i) => `<span><i class="sw" style="background:${SERIES[i]}"></i>${esc(a.name)}</span>`).join('')}<span><i class="dot"></i>max speed</span><span><i class="dot hollow"></i>cruise</span><span><i class="dash"></i>speed of sound</span></div>
        ${envNotes(list)}
        <p class="fine">Modeled from published stall speed, top speed and ceiling using the standard atmosphere.</p></section>`;
    }
    CMP_GROUPS.forEach(([title, rows]) => {
      let rh = '';
      rows.forEach(([label, f, kind, better, textF]) => {
        const vals = list.map(a => { const v = f(a); return v === undefined || v === null || Number.isNaN(v) ? null : v; });
        const texts = list.map(a => (textF ? textF(a) : null));
        if (vals.every(v => v === null) && texts.every(t => !t)) return;
        const nums = vals.filter(v => v !== null);
        const max = nums.length ? Math.max(...nums) : 0;
        let best = null;
        if (better && nums.length > 1) {
          const target = better === 'hi' ? max : Math.min(...nums);
          if (nums.filter(v => v === target).length === 1) best = vals.indexOf(target);
        }
        const cells = list.map((a, i) => {
          const v = vals[i], t = texts[i];
          const shown = t && (v === null || v === 0) ? `<span class="txt">${esc(t)}</span>` : v === null ? '<span class="muted">—</span>' : esc(U.fmt(v, kind, kind === 'speed' || kind === 'dist' || kind === 'runway' || kind === 'alt' ? { step: kind === 'runway' ? 10 : 1 } : { exact: true }));
          const bar = v !== null && kind && kind !== 'year' && max > 0 && nums.length > 1 ? `<div class="bar" style="--c:${SERIES[i]};width:${Math.max(2, v / max * 100)}%"></div>` : '';
          return `<div class="cmp-cell${best === i ? ' best' : ''}">${shown}${v !== null ? mark(a, label) : ''}${bar}</div>`;
        }).join('');
        rh += `<div class="cmp-row" style="--n:${n}"><div class="cmp-label">${label}</div>${cells}</div>`;
      });
      if (rh) body += `<section class="cmp-group"><h2>${title}</h2>${rh}</section>`;
    });
    body += `<div class="cols"><section class="panel"><h2>Runway needed</h2><p class="sub">At maximum weight.</p>${runwayHTML(list.map((a, i) => ({ a, color: SERIES[i] })))}</section>
      <section class="panel"><h2>Could they fly there non-stop?</h2><p class="sub">Great-circle distance, no wind or reserves.</p>${routesHTML(list)}</section></div>`;

    view.innerHTML = `<div class="wrap">
      <h1 style="margin:22px 0 4px">Compare</h1>
      ${head}
      <div class="cmp-tools">
        <button class="btn" id="cmp-share">Copy link</button>
        <button class="btn" id="cmp-clear">Clear all</button>
      </div>
      ${body}
    </div>${footer()}`;

    H.envelope.render($('#env'), list.map((a, i) => ({ a, color: SERIES[i], label: a.name })));
    bindAdd();
    $('#cmp-share').onclick = async () => {
      const url = location.href.split('#')[0] + '#/compare/' + compare.join(',');
      try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { toast(url); }
    };
    $('#cmp-clear').onclick = () => { compare = []; saveCompare(); location.hash = '#/compare'; render(); };
  }

  function bindAdd() {
    const sel = $('#cmp-add');
    if (sel) sel.onchange = () => {
      if (!sel.value) return;
      if (!compare.includes(sel.value) && compare.length < MAX_CMP) compare.push(sel.value);
      saveCompare();
      history.replaceState(null, '', '#/compare');
      render(true);
    };
  }

  /* ================= LIGHTBOX ================= */
  const LB = { list: [], i: 0 };
  function openLightbox(list, i) {
    LB.list = list; LB.i = i;
    $('#lb').hidden = false;
    document.body.style.overflow = 'hidden';
    showLb();
  }
  function closeLightbox() { $('#lb').hidden = true; document.body.style.overflow = ''; }
  function showLb() {
    const g = LB.list[LB.i];
    if (!g) return;
    $('#lb-img').src = g.src;
    $('#lb-img').alt = g.caption || g.name;
    const credit = [g.artist, g.license].filter(Boolean).map(esc).join(' · ');
    $('#lb-cap').innerHTML = `${LB.i + 1} / ${LB.list.length}${credit ? ' · ' + credit : ''} · <a href="${esc(g.page)}" target="_blank" rel="noopener">Source on Wikimedia Commons ↗</a>`;
  }
  function stepLb(d) { LB.i = (LB.i + d + LB.list.length) % LB.list.length; showLb(); }
  function setupLightbox() {
    $('#lb-close').onclick = closeLightbox;
    $('#lb-prev').onclick = () => stepLb(-1);
    $('#lb-next').onclick = () => stepLb(1);
    $('#lb-stage').addEventListener('click', e => { if (e.target.id === 'lb-stage') closeLightbox(); });
    document.addEventListener('keydown', e => {
      if ($('#lb').hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
    });
    let x0 = null;
    const st = $('#lb-stage');
    st.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
    });
  }

  /* ================= global clicks ================= */
  function setupClicks() {
    document.addEventListener('click', e => {
      const t = e.target;
      const cmp = t.closest('[data-cmp]');
      if (cmp) {
        e.preventDefault();
        if (toggleCompare(cmp.dataset.cmp)) syncCmp();
        return;
      }
      const est = t.closest('[data-est]');
      if (est) {
        e.preventDefault(); e.stopPropagation();
        const [id, f] = est.dataset.est.split('|');
        const a = BY_ID[id];
        if (a && a.est && a.est[f]) openSheet('* Estimated figure', `<p style="margin:0 0 8px"><b>${esc(a.name)}</b></p><p style="margin:0">${esc(a.est[f])}</p><p class="muted" style="margin:10px 0 0;font-size:13px">Figures without a * are published values (approximate, for the model named).</p>`);
        return;
      }
      const rm = t.closest('[data-rm]');
      if (rm) {
        e.preventDefault();
        toggleCompare(rm.dataset.rm);
        if (route().name === 'compare') history.replaceState(null, '', '#/compare');
        syncCmp();
        return;
      }
      if (t.closest('[data-clear]')) { compare = []; saveCompare(); updateTray(); updateNav(); document.querySelectorAll('.card.sel').forEach(c => c.classList.remove('sel')); syncCmp(); return; }
      const cat = t.closest('[data-cat]');
      if (cat) {
        S.cat = cat.dataset.cat;
        renderBrowse($('#view'));
        const chips = $('#chips');
        if (chips && window.scrollY > chips.offsetTop) window.scrollTo(0, $('#hero').offsetTop + $('#hero').offsetHeight - 50);
        const on = chips && chips.querySelector('.chip.on');
        if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
        return;
      }
      const go = t.closest('[data-gocat]');
      if (go) { S.cat = go.dataset.gocat; S.q = ''; S.scroll = 0; }
    });
  }

  /* ================= boot ================= */
  async function loadThumbs() {
    try {
      S.thumbs = await W.thumbs([...new Set(ALL.concat(VARS).map(a => a.wiki))], 500);
    } catch (e) { return; }
    // Fill in images on the current view without a full re-render.
    document.querySelectorAll('.card[data-id]').forEach(card => {
      const a = BY_ID[card.dataset.id], box = card.querySelector('.card-img');
      if (box && !box.querySelector('img') && thumb(a)) box.insertAdjacentHTML('beforeend', imgTag(thumb(a), a.name));
    });
    document.querySelectorAll('.tile[data-wiki]').forEach(tile => {
      const src = S.thumbs[tile.dataset.wiki];
      if (src) tile.style.backgroundImage = `url('${src}')`;
    });
    updateTray();
    if (route().name === 'compare') render(true);
  }

  window.addEventListener('scroll', () => { if (route().name === 'browse') S.scroll = window.scrollY; }, { passive: true });
  window.addEventListener('hashchange', () => render());
  setupHeader();
  setupLightbox();
  setupClicks();
  render();
  loadThumbs();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
