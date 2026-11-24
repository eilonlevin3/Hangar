/* Unit conversion and number formatting. Data is stored metric; the user picks
 * metric, or aviation units (kt, ft, nm, lb) shown with the metric value in parentheses
 * (owner, 2026-11-24: e.g. "35,000 ft (10,668 m)"). Aviation is the default. */
(function () {
  const H = window.HANGAR;
  let system = 'aviation';
  try { system = localStorage.getItem('hangar-units-v2') || 'aviation'; } catch (e) {}

  const nf = (d) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const n0 = nf(0), n1 = nf(1), n2 = nf(2);

  function round(v) {
    const a = Math.abs(v);
    if (a >= 100) return n0.format(v);
    if (a >= 10) return n1.format(v);
    return n2.format(v);
  }

  // kind -> [metric unit, metric factor, imperial unit, imperial factor]
  const KINDS = {
    speed:   ['km/h', 1, 'kt', 1 / 1.852],
    alt:     ['m', 1, 'ft', 3.28084],
    dist:    ['km', 1, 'nm', 1 / 1.852],
    len:     ['m', 1, 'ft', 3.28084],
    runway:  ['m', 1, 'ft', 3.28084],
    area:    ['m²', 1, 'ft²', 10.7639],
    mass:    ['kg', 1, 'lb', 2.20462],
    thrust:  ['kN', 1, 'lbf', 224.809],
    power:   ['kW', 1, 'hp', 1.34102],
    climb:   ['m/s', 1, 'ft/min', 196.85],
    wingload:['kg/m²', 1, 'lb/ft²', 0.204816],
    pw:      ['kW/t', 1, 'hp/1000 lb', 0.60828]
  };

  const U = {
    get system() { return system; },
    set(sys) {
      system = sys;
      try { localStorage.setItem('hangar-units-v2', sys); } catch (e) {}
    },
    unit(kind) {
      const k = KINDS[kind];
      return k ? (system === 'metric' ? k[0] : k[2]) : '';
    },
    conv(v, kind, sys) {
      const k = KINDS[kind];
      if (!k) return v;
      return v * ((sys || system) === 'metric' ? k[1] : k[3]);
    },
    /* Format a metric value in the chosen system. Aviation adds " (metric)" after unit-bearing values;
     * opts.single = aviation value only (narrow places such as chart labels). */
    fmt(v, kind, opts) {
      opts = opts || {};
      if (v === undefined || v === null || Number.isNaN(v)) return '—';
      const one = fmtIn(system, v, kind, opts);
      if (system === 'metric' || opts.single || !KINDS[kind]) return one;
      return one + ' (' + fmtIn('metric', v, kind, opts) + ')';
    },
    num: round
  };

  function fmtIn(system, v, kind, opts) {
    const unit = (k) => (KINDS[k] ? (system === 'metric' ? KINDS[k][0] : KINDS[k][2]) : '');
    const conv = (x, k) => U.conv(x, k, system);
      switch (kind) {
        case 'mass':
          if (system === 'metric' && Math.abs(v) >= 10000 && !opts.exact) return n1.format(v / 1000) + ' t';
          return n0.format(conv(v, kind)) + ' ' + unit(kind);
        case 'cost': return '$' + round(v) + 'M';
        case 'count': return n0.format(v);
        case 'year': return String(v);
        case 'hours':
          if (v < 1) return n0.format(v * 60) + ' min';
          return round(v) + ' h';
        case 'g': return (v > 0 ? '+' : '') + n1.format(v) + ' g';
        case 'ratio': return n2.format(v);
        case 'mach': return 'Mach ' + n2.format(v);
        case 'alt':
        case 'runway':
        case 'dist':
        case 'speed':
          return n0.format(Math.round(conv(v, kind) / (opts.step || 1)) * (opts.step || 1)) + ' ' + unit(kind);
        default:
          return round(conv(v, kind)) + (unit(kind) ? ' ' + unit(kind) : '');
      }
  }

  /* International Standard Atmosphere. h in metres. */
  U.isa = function (h) {
    let T, sigma;
    if (h <= 11000) {
      T = 288.15 - 0.0065 * h;
      sigma = Math.pow(T / 288.15, 4.2559);
    } else if (h <= 20000) {
      T = 216.65;
      sigma = 0.29708 * Math.exp(-(h - 11000) / 6341.6);
    } else {
      T = 216.65 + 0.001 * (h - 20000);
      sigma = 0.29708 * Math.exp(-9000 / 6341.6) * Math.pow(T / 216.65, -35.16);
    }
    const a = Math.sqrt(1.4 * 287.05 * T) * 3.6; // km/h
    return { T, sigma, a };
  };

  /* Mach number of a speed (km/h) at altitude (m). */
  U.mach = (v, h) => v / U.isa(h || 0).a;

  H.units = U;
})();
