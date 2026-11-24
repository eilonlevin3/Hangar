/* Per-model flight figures, merged over HANGAR.variants (keyed '<family>-<key>').
 * est[field] = why that number is an assumption rather than a published figure; the app shows a *
 * next to it that opens this text. envNote = a sentence shown under the model's flight envelope.
 * hoverAlt (m) = STOVL jets: can hover up to this height, so the envelope starts at zero speed there.
 * Researched 2026-11-24 from published specs (manufacturers, Wikipedia spec boxes). Where a model has
 * no published figure it is estimated from the closest model by simple physics, as each note says.
 */
(function () {
  const H = window.HANGAR;
  const sq = (x) => Math.round(x);
  const stall = (from, how) => `Estimated: no published clean stall speed for this model. Scaled from the ${from} ${how || 'by the square root of the weight ratio (same wing), because stall speed rises with weight'}.`;
  const cft = (mach) => `Estimated: this model flies with conformal fuel tanks, which add drag. Published top speeds are for the clean F-16C; about Mach ${mach} at altitude is assumed.`;
  const heavier = (from) => `Estimated: heavier than the ${from} with a similar engine, so a somewhat lower figure is assumed (spare thrust shrinks as weight grows).`;
  const same = (from, what) => `Same ${what || 'airframe, wing, engine and limits'} as the ${from}, so its envelope is nearly identical. This model differs in electronics and equipment, not in how high or fast it flies.`;
  const eagleSL = 'Assumed the same Mach 1.2 sea-level limit as the other Eagles.';
  const dsi = 'Estimated: China publishes no figures. A fixed bump (DSI) inlet usually limits a fighter to about Mach 1.8 at altitude.';

  H.variantPerf = {
    /* F-16: base F-16C Block 50: 19.2 t max, stall about 220 km/h, Mach 2.0, 50,000 ft */
    'f16-a': { vstall: sq(220 * Math.sqrt(16057 / 19187)), climb: 250,
      est: { vstall: stall('F-16C'), climb: 'Estimated: lighter but with the weaker F100-PW-200, so about the same thrust-to-weight as the F-16C. Published figures only say “over 50,000 ft/min” for every version.' } },
    'f16-i': { vmax: 1700, vmaxSL: 1400, vstall: sq(220 * Math.sqrt(21772 / 19187)), ceiling: 14500, climb: 220,
      est: { vmax: cft('1.6'), vmaxSL: 'Estimated: conformal tanks and extra weight; assumed a little below the clean F-16’s Mach 1.2 at sea level.', vstall: stall('F-16C'), ceiling: heavier('F-16C'), climb: heavier('F-16C') } },
    'f16-e': { vmax: 1910, vmaxSL: 1450, vstall: sq(220 * Math.sqrt(21800 / 19187)), ceiling: 15240, climb: 250,
      est: { vmax: cft('1.8'), vmaxSL: 'Estimated: conformal tanks add drag; assumed just under Mach 1.2.', vstall: stall('F-16C'), ceiling: 'Estimated: heavier, but the GE F110-132 gives about 10% more thrust, so the F-16’s 50,000 ft ceiling is assumed.', climb: 'Estimated: the extra thrust roughly offsets the extra weight.' } },
    'f16-v': { vstall: sq(220 * Math.sqrt(20000 / 19187)),
      est: { vstall: stall('F-16C', 'for a slightly heavier typical weight (new radar and structure)') }, envNote: same('F-16C') },

    /* F-15: base F-15C: 30.8 t, Mach 2.5, 65,000 ft */
    'f15-a': { vstall: sq(210 * Math.sqrt(25400 / 30845)), ceiling: 19800,
      est: { vstall: stall('F-15C') } },
    'f15-e': { vstall: sq(210 * Math.sqrt(36700 / 30845)), ceiling: 18200, vmaxSL: 1450,
      est: { vstall: stall('F-15C'), vmaxSL: eagleSL },
      envNote: 'Published: Mach 2.5 and 60,000 ft (18.2 km), lower than the lighter F-15C’s 65,000 ft.' },
    'f15-i': { vstall: sq(210 * Math.sqrt(36700 / 30845)), ceiling: 18200, vmaxSL: 1450,
      est: { vstall: stall('F-15C'), vmaxSL: eagleSL, ceiling: 'Assumed the same as the F-15E it is based on.' } },
    'f15-j': { envNote: same('F-15C', 'airframe and engines') },
    'f15-ex': { vstall: sq(210 * Math.sqrt(36700 / 30845)), ceiling: 18200, vmaxSL: 1450,
      est: { vstall: stall('F-15C'), ceiling: 'Estimated: Boeing quotes Mach 2.5 but no ceiling; assumed the same as the F-15E airframe it shares.', vmaxSL: eagleSL } },

    /* F-35: base F-35A: Mach 1.6, 50,000 ft, 9 g */
    'f35-b': { gmax: 7, hoverAlt: 1500, landing: 0, vtol: true, vstall: 250,
      est: { vstall: 'Estimated: wing-borne minimum speed a little above the F-35A’s (heavier for its wing). Below about 1,500 m it can also hover on its lift fan; that height is also an estimate and depends on weight and temperature.' },
      envNote: 'Published: Mach 1.6, 50,000 ft and a 7 g limit. Near the ground it can hover, so its envelope starts at zero speed at low altitude.' },
    'f35-c': { gmax: 7.5, vstall: sq(240 * Math.sqrt((31800 / 62.1) / (29900 / 42.7))),
      est: { vstall: stall('F-35A', 'by the square root of the wing-loading ratio: the C’s 45% bigger wing lets it fly slower, which carrier landings need') },
      envNote: 'Published: Mach 1.6, 50,000 ft and a 7.5 g limit. Its bigger wing gives it the lowest minimum speed of the three.' },
    'f35-i': { envNote: same('F-35A') },

    /* F/A-18: base F/A-18E: Mach 1.8, 50,000 ft */
    'fa18ef-ab': { vstall: sq(230 * Math.sqrt((23400 / 37.16) / (29937 / 46.45))), ceiling: 15240, gmax: 7.5,
      est: { vstall: stall('Super Hornet', 'by the square root of the wing-loading ratio (smaller wing, lighter jet)') } },
    'fa18ef-cd': { vstall: sq(230 * Math.sqrt((23541 / 37.16) / (29937 / 46.45))), ceiling: 15240, gmax: 7.5,
      est: { vstall: stall('Super Hornet', 'by the square root of the wing-loading ratio (smaller wing, lighter jet)') } },
    'fa18ef-f': { envNote: same('F/A-18E', 'airframe and engines') },
    'fa18ef-g': { vmax: 1800, climb: 200,
      est: { vmax: 'Estimated: Boeing quotes Mach 1.8 for the clean jet; the Growler normally flies with large jamming pods, so a lower practical top speed is assumed.', climb: 'Estimated: the pods add drag and weight.' } },

    /* Flanker: base Su-27S: Mach 2.35, 19,000 m */
    'su27-su30': { vstall: 200,
      est: { vstall: 'Estimated: heavier than the Su-27, but canards and thrust vectoring let it fly under control at very low speed; about 200 km/h assumed.' } },
    'su27-su33': { vmax: 2300, vstall: 200, ceiling: 17000, climb: 246,
      est: { vstall: 'Estimated from its published carrier approach speed (about 240 km/h, typically 1.2 times the stall speed).' } },
    'su27-su35': { vstall: 210, climb: 280,
      est: { vstall: 'Estimated: thrust vectoring allows very low controlled speeds; a little above the Su-30MKI because it has no canards.' } },
    'su27-j11': { envNote: same('Su-27S', 'airframe and similar-thrust engines') },
    'su27-j16': { vmax: 2120, ceiling: 17300, vstall: 225,
      est: { vmax: 'Estimated: China publishes no figures; assumed the same as the Su-30MKK/MKI it was developed from (Mach 2.0).', ceiling: 'Estimated: assumed the same as the Su-30 family.', vstall: stall('Su-27S', 'for its heavier weight, without thrust vectoring') } },

    /* MiG-29: base 9.12: Mach 2.25, 18,000 m */
    'mig29-ub': { ceiling: 17500,
      est: { ceiling: 'Estimated: slightly heavier two-seat nose; assumed a little below the single-seater.' } },
    'mig29-k': { vmax: 2200, ceiling: 17500, vstall: 210,
      est: { vstall: stall('MiG-29', 'by wing loading: the K has a larger wing (about 43 m²) and bigger flaps for carrier approaches') } },
    'mig29-35': { ceiling: 17500, vstall: 225,
      est: { vstall: stall('MiG-29', 'for its heavier weight, partly offset by a larger wing') } },

    /* J-10 */
    'j10-a': { vmax: 2205,
      envNote: 'The J-10A has an adjustable inlet; later models use a fixed bump (DSI) inlet that limits top speed somewhat.' },
    'j10-b': { vmax: 1910, est: { vmax: dsi } },
    'j10-c': { vmax: 1910, est: { vmax: dsi } },
    'j10-ce': { vmax: 1910, est: { vmax: 'Estimated: assumed the same as the J-10C. ' + dsi } },

    /* Typhoon: same airframe and engines in every tranche */
    'typhoon-t1': { envNote: same('later Tranches', 'airframe and EJ200 engines') },
    'typhoon-t2': { envNote: same('other Tranches', 'airframe and EJ200 engines') },
    'typhoon-t3': { envNote: same('earlier Tranches', 'airframe and EJ200 engines') },

    /* Rafale: base Rafale C */
    'rafale-b': { envNote: same('Rafale C', 'airframe and engines (about 300 kg heavier)') },
    'rafale-m': { vstall: 185, est: { vstall: 'Estimated from its published carrier approach speed (about 120 kt, 220 km/h, typically 1.2 times the stall speed).' },
      envNote: 'Published: same Mach 1.8 and ceiling as the Rafale C; a little heavier, with landing gear and hook for carriers.' },

    /* Mirage 2000: base 2000-5 (M53-P2) */
    'm2000-c': { ceiling: 16460, climb: 250,
      est: { climb: 'Estimated: early 2000Cs had the weaker M53-5 engine; climb scaled down by thrust (about 8% less).' } },
    'm2000-b': { ceiling: 16460, est: { ceiling: 'Estimated: assumed the same as the 2000C it trains pilots for.' } },
    'm2000-n': { vmaxSL: 1110, ceiling: 15240, vstall: 220,
      est: { ceiling: 'Estimated: heavier two-seat strike version built for low level; assumed below the fighters.', vstall: stall('Mirage 2000-5', 'for its heavier weight') },
      envNote: 'Built for very low, fast penetration: published low-level speed about 1,110 km/h (Mach 0.9).' },
    'm2000-9': { envNote: same('Mirage 2000-5', 'airframe and engine') }
  };
})();
