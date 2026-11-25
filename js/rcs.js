/* Estimated radar cross section (RCS) for every aircraft, in m² (head-on, X-band radar).
 * Real RCS figures are almost never published: they change hugely with viewing angle, radar
 * frequency and what hangs under the wings. So every value here is an estimate with a * note:
 *  - KNOWN: widely reported public estimates (stealth aircraft, famous types).
 *  - Everything else: a rough figure from size and type (k × span², k per category).
 * Owner, 2026-11-25. Loaded after the data files and before app.js.
 */
(function () {
  const H = window.HANGAR;

  const PUB = 'Widely reported public estimate; the real figure is classified or unpublished.';
  const KNOWN = {
    f22: [0.0001, 'Public estimates are around 0.0001 m², about the size of a marble. ' + PUB],
    f35: [0.005, 'Public estimates range from about 0.001 to 0.005 m², roughly a golf ball. ' + PUB],
    b2: [0.001, 'Public estimates range from 0.0001 to 0.1 m². ' + PUB],
    f117: [0.003, 'The most commonly quoted figure is about 0.003 m². ' + PUB],
    su57: [0.5, 'Public estimates range from about 0.1 to 1 m². Russia has not published one.'],
    j20: [0.05, 'Public estimates range from about 0.01 to 0.5 m². China has not published one.'],
    rq170: [0.01, 'Rough guess for a stealth flying wing; nothing has been published.'],
    mq20: [0.1, 'Rough guess: designed with an internal weapons bay and shaped inlet to cut its radar signature.'],
    d21: [0.1, 'Rough guess: small, with radar-absorbing materials and shaping from the Blackbird work.'],
    sr71: [10, 'Often quoted around 10 m² head-on: far smaller than other aircraft its size, thanks to early shaping and radar-absorbing paint. Rough figure.'],
    a12: [10, 'Assumed similar to the SR-71 (often quoted around 10 m²). Rough figure.'],
    yf12: [10, 'Assumed similar to the SR-71 (often quoted around 10 m²). Rough figure.'],
    b1: [1, 'Often quoted around 1 m², about a hundredth of the B-52\'s. ' + PUB],
    b52: [100, 'Often quoted around 100 m². ' + PUB],
    tu95: [150, 'Rough estimate: a huge airframe with eight big propellers, among the largest radar returns of any aircraft.'],
    tu160: [15, 'Often quoted around 15 m². ' + PUB],
    vulcan: [10, 'Rough estimate: its blended delta shape was reportedly hard to see on radar head-on.'],
    e3: [100, 'Rough estimate: a large airliner airframe plus the big rotating radar dome.'],
    f16: [1.2, 'Commonly cited about 1.2 m² clean and head-on; with weapons and tanks it is several times larger. ' + PUB],
    f15: [10, 'Commonly cited 10–25 m². ' + PUB],
    fa18ef: [1, 'Super Hornet: commonly cited around 1 m², thanks to radar-reduction features. ' + PUB],
    typhoon: [0.5, 'Commonly cited around 0.5 m² head-on (some sources up to 1 m²). ' + PUB],
    rafale: [1, 'Commonly cited around 1 m² head-on. Dassault does not publish it.'],
    gripen: [1, 'Public estimates range from about 0.5 to 1.5 m². ' + PUB],
    su27: [15, 'Commonly cited 10–15 m². ' + PUB],
    mig29: [5, 'Commonly cited 3–5 m². ' + PUB],
    j10: [3, 'Rough public estimate, 1–3 m².'],
    m2000: [2, 'Rough estimate for a small delta fighter, about 1–2 m².'],
    f14: [20, 'Rough estimate for a large swing-wing fighter with big inlets.'],
    f4: [6, 'Commonly cited around 6 m². ' + PUB],
    mig25: [25, 'Rough estimate: large, flat-sided inlets and tails.'],
    f104: [2, 'Rough estimate: tiny frontal area, but no radar-reduction features.']
  };
  const VAR = {  // models that differ from their family
    'fa18ef-ab': [3, 'Legacy Hornet: commonly cited about 1–3 m²; the Super Hornet added radar-reduction features.'],
    'fa18ef-cd': [3, 'Legacy Hornet: commonly cited about 1–3 m²; the Super Hornet added radar-reduction features.'],
    'su27-su35': [3, 'Su-35: claimed about 1–3 m² after radar-reduction work. Rough public estimate.'],
    'mig29-35': [3, 'Rough estimate: some radar-absorbing coatings over the basic MiG-29.']
  };

  const K = { fighter: 0.04, attack: 0.04, bomber: 0.03, recon: 0.03, male: 0.005, smalluav: 0.01,
    private: 0.02, attackheli: 0.03, milheli: 0.03, civilheli: 0.03, trainer: 0.03, warbird: 0.03, skunk: 0.03 };
  const ROUGH = 'Rough estimate from size and type (head-on, X-band radar). Real radar cross sections are rarely published and change hugely with viewing angle, radar frequency and what hangs under the wings.';

  function round2(v) {  // two significant figures
    if (v <= 0) return v;
    const p = Math.pow(10, Math.floor(Math.log10(v)) - 1);
    return Math.round(v / p) * p;
  }

  H.aircraft.forEach(a => {
    a.est = a.est || {};
    const k = KNOWN[a.id];
    if (k) { a.rcs = k[0]; a.est.rcs = k[1]; return; }
    const span = a.span || 0.4;
    const f = K[a.cats[0]] || 0.025;  // airliners, transports, business and regional jets
    a.rcs = Math.max(0.01, round2(f * span * span));  // even a small quadcopter shows about 0.01 m²
    a.est.rcs = ROUGH;
  });
  Object.keys(VAR).forEach(id => {
    const [fam, key] = id.split(/-(.+)/);
    const v = ((H.variants || {})[fam] || []).find(x => x.key === key);
    if (v) { v.rcs = VAR[id][0]; v.est = Object.assign({}, v.est, { rcs: VAR[id][1] }); }
  });

  /* "≈1.2 m² (1 dBsm)" and an everyday comparison. */
  H.rcsText = v => {
    const s = v >= 10 ? Math.round(v).toLocaleString('en-US') : v >= 1 ? (Math.round(v * 10) / 10).toString() : String(round2(v));
    return '≈' + s + ' m² (' + Math.round(10 * Math.log10(v)) + ' dBsm)';
  };
  H.rcsLike = v => v < 0.001 ? 'about an insect' : v < 0.01 ? 'about a golf ball' : v < 0.1 ? 'about a bird' : v < 1 ? 'about a person'
    : v < 10 ? 'about a car' : v < 100 ? 'about a truck' : 'about a barn';
})();
