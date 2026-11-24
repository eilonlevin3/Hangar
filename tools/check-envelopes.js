/* Sanity check for the aircraft data: every aircraft and model must have its cruise point and its
 * max-speed point inside its own modeled flight envelope, and basic figures must be consistent.
 * Run from the repo root:  node tools/check-envelopes.js   (exit code 1 if anything is wrong)
 */
const fs = require('fs');
const path = require('path');
global.window = global;
global.localStorage = { getItem: () => null, setItem() {} };
const root = path.join(__dirname, '..');
for (const f of ['data.js', 'variants.js', 'drone-variants.js', 'variant-perf.js', 'units.js', 'envelope.js']) {
  const file = path.join(root, 'js', f);
  if (fs.existsSync(file)) eval(fs.readFileSync(file, 'utf8'));
}
const H = window.HANGAR, U = H.units;

// Same expansion as app.js
const list = [];
for (const a of H.aircraft) {
  const vs = (H.variants || {})[a.id];
  if (!vs) { list.push(a); continue; }
  for (const v of vs) { const perf = (H.variantPerf || {})[a.id + '-' + v.key] || {}; const o = Object.assign({}, a, v, perf, { id: a.id + '-' + v.key, name: v.name || v.variant }); o.est = Object.assign({}, a.est, v.est, perf.est); list.push(o); }
}

const cats = new Set(H.categories.map(c => c.id));
let bad = 0;
const say = (a, msg) => { bad++; console.log(`${a.id.padEnd(16)} ${msg}`); };
for (const a of list) {
  for (const c of a.cats) if (!cats.has(c)) say(a, `unknown category ${c}`);
  if (!a.vmax || !a.ceiling) { say(a, 'missing vmax or ceiling'); continue; }
  const m = H.envelope.model(a);
  if (!m) { say(a, 'no envelope'); continue; }
  if (a.cruise) {
    const h = a.cruiseAlt || Math.min(m.hAero * 0.8, 11000);
    const at = m.at(h);
    if (!at) say(a, `cruise altitude ${h} m is above the envelope top ${Math.round(m.hAero)} m`);
    else if (a.cruise < at.lo * 0.999 || a.cruise > at.hi * 1.001) say(a, `cruise ${a.cruise} km/h at ${h} m is outside ${Math.round(at.lo)}–${Math.round(at.hi)} km/h`);
    if (a.cruise > a.vmax) say(a, `cruise ${a.cruise} > vmax ${a.vmax}`);
  }
  const at = m.at(m.max.h);
  if (at && (a.vmax < at.lo)) say(a, `max speed point left of the stall line (${Math.round(at.lo)} km/h at ${m.max.h} m)`);
  if (a.vstall && a.vstall >= a.vmax) say(a, `stall ${a.vstall} >= vmax ${a.vmax}`);
  if (a.vmaxSL && a.vmaxSL > a.vmax) say(a, `vmaxSL ${a.vmaxSL} > vmax ${a.vmax}`);
  if (a.empty && a.mtow && a.empty > a.mtow) say(a, `empty ${a.empty} > mtow ${a.mtow}`);
  if (a.cruiseAlt && a.cruiseAlt > a.ceiling) say(a, `cruiseAlt ${a.cruiseAlt} > ceiling ${a.ceiling}`);
}
const byCat = {};
for (const a of H.aircraft) byCat[a.cats[0]] = (byCat[a.cats[0]] || 0) + 1;
console.log(`\n${list.length} aircraft/models checked, ${bad} problem(s). Families per category:`, JSON.stringify(byCat));
process.exit(bad ? 1 : 0);
