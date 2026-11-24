/* Bombardier family models (same format as HANGAR.variants in variants.js; `est` inline = figure is an
 * estimate, shown with a tappable * and this explanation). Researched 2026-11-24 from published specs.
 * Each family's base object in data.js holds the figures of its `popular` model.
 */
(function () {
  const V = window.HANGAR.variants = window.HANGAR.variants || {};
  const stallWL = 'Estimated: no published clean stall speed. Scaled from the family’s main model by wing loading (stall speed grows with the square root of weight per wing area).';

  V.crj = [
    { key: '200', variant: 'CRJ100/200', wiki: 'Bombardier_CRJ100/200', first: 1991, intro: 1992, built: 1021, status: 'Active',
      pax: 50, paxNote: '50 seats', len: 26.77, span: 21.21, height: 6.22, wing: 54, empty: 13835, mtow: 24041, payload: 6124, fuel: 6489,
      engine: 'GE CF34-3B1 turbofan', thrust: 41, vmax: 860, cruise: 786, vstall: 205, ceiling: 12497, range: 3148, takeoff: 1918, landing: 1479, cost: 24,
      est: { vstall: 'Estimated: lighter wing loading than the CRJ900, but no leading-edge slats, so about the same stall speed.' },
      blurb: 'The original 50-seater.',
      note: 'The jet that started the regional-jet boom in the 1990s: a stretched Challenger business jet with 50 seats. Over 1,000 built.' },
    { key: '700', variant: 'CRJ700', first: 1999, intro: 2001, built: 340,
      pax: 78, paxNote: '66–78 seats', len: 32.3, span: 23.2, height: 7.6, wing: 70.6, empty: 19730, mtow: 34019, payload: 8527, fuel: 8888,
      engine: 'GE CF34-8C1 turbofan', thrust: 61.3, vmax: 876, cruise: 829, vstall: 203, range: 3045, takeoff: 1564, landing: 1478, cost: 41,
      est: { vstall: stallWL },
      blurb: 'New wing with slats, 70 seats.',
      note: 'A new, bigger wing with slats and a longer cabin with a lowered floor so passengers can stand up straight.' },
    { key: '900', variant: 'CRJ900', popular: true, popLabel: 'most flown today', blurb: 'The most flown CRJ today, 76–90 seats.',
      note: 'Another stretch of the CRJ700. The most common CRJ still flying with airlines today.' },
    { key: '1000', variant: 'CRJ1000', first: 2009, intro: 2010, built: 64,
      pax: 104, paxNote: '97–104 seats', len: 39.1, span: 26.2, height: 7.5, wing: 77.4, empty: 23188, mtow: 41640,
      engine: 'GE CF34-8C5A1 turbofan', thrust: 63.4, vmax: 870, vstall: 220, range: 3004, takeoff: 2120, landing: 1750, cost: 50,
      est: { vstall: stallWL },
      blurb: 'The longest CRJ, 100 seats.',
      note: 'The longest CRJ, with 100 seats. Few were built; Mitsubishi bought the CRJ programme in 2020 and ended production.' }
  ];

  V.dash8 = [
    { key: '100', variant: 'Dash 8-100', first: 1983, intro: 1984, built: 299, status: 'Active',
      pax: 39, paxNote: '37–39 seats', len: 22.25, span: 25.89, height: 7.49, wing: 54.35, empty: 10250, mtow: 15650, payload: 4000, fuel: 2577,
      engine: 'Pratt & Whitney Canada PW120A turboprop', power: 1491, vmax: 500, vmaxAlt: 4600, cruise: 450, cruiseAlt: 4600, vstall: 150, ceiling: 7620,
      range: 1889, takeoff: 942, landing: 780, cost: 15,
      est: { vstall: 'Estimated: about 81 kt clean, from its light wing loading; it was built for short, rough airstrips.' },
      blurb: 'The original 37-seater.',
      note: 'The first Dash 8, from de Havilland Canada, built to fly from short airstrips. Bombardier bought de Havilland in 1992.' },
    { key: '200', variant: 'Dash 8-200', first: 1994, intro: 1995, built: 105,
      pax: 39, paxNote: '37–39 seats', len: 22.25, span: 25.89, height: 7.49, wing: 54.35, empty: 10477, mtow: 16466, payload: 3900, fuel: 2577,
      engine: 'Pratt & Whitney Canada PW123C turboprop', power: 1603, vmax: 537, vmaxAlt: 4600, cruise: 500, cruiseAlt: 4600, vstall: 154, ceiling: 7620,
      range: 1713, takeoff: 1000, landing: 780, cost: 17,
      est: { vstall: stallWL },
      blurb: 'Same size, stronger engines.',
      note: 'The -100 airframe with stronger engines: about 30 km/h faster.' },
    { key: '300', variant: 'Dash 8-300', first: 1987, intro: 1989, built: 267,
      pax: 56, paxNote: '50–56 seats', len: 25.68, span: 27.43, height: 7.49, wing: 56.21, empty: 11793, mtow: 19505, payload: 5500, fuel: 2577,
      engine: 'Pratt & Whitney Canada PW123 turboprop', power: 1775, vmax: 528, vmaxAlt: 4600, cruise: 500, cruiseAlt: 4600, vstall: 165, ceiling: 7620,
      range: 1711, takeoff: 1085, landing: 1040, cost: 17,
      est: { vstall: stallWL },
      blurb: 'Stretched to 50 seats.',
      note: 'Stretched by 3.4 m with a longer wing, for 50 seats.' },
    { key: '400', variant: 'Q400', popular: true, blurb: 'The fast 78–90 seater, most built.',
      note: 'A much bigger, faster redesign. The most built Dash 8 and the one you are most likely to fly on.' }
  ];

  V.a220 = [
    { key: '100', variant: 'A220-100 (CS100)', first: 2013, intro: 2016, built: 100,
      pax: 135, paxNote: '100–120 typical, 135 max', len: 35, empty: 35220, mtow: 63100, payload: 15100,
      vstall: 195, range: 6390, takeoff: 1463, landing: 1356, cost: 81,
      est: { vstall: stallWL },
      blurb: 'The shorter original CSeries.',
      note: 'The first CSeries, designed by Bombardier. It flies from short or steep-approach airports such as London City.' },
    { key: '300', variant: 'A220-300 (CS300)', popular: true, blurb: 'The longer, more popular one.',
      note: 'The longer version and by far the more ordered one. Airbus took over the CSeries in 2018 and renamed it A220.' }
  ];

  V.global = [
    { key: 'express', variant: 'Global Express / XRS', wiki: 'Bombardier_Global_Express', first: 1996, intro: 1999, built: 450,
      len: 30.3, span: 28.65, height: 7.57, wing: 94.95, empty: 22906, mtow: 44452, payload: 2600, fuel: 20094,
      engine: 'Rolls-Royce BR710 turbofan', thrust: 65.6, vmax: 950, cruise: 870, vstall: 170, range: 11390, takeoff: 1774, landing: 814, cost: 50,
      est: { vstall: stallWL },
      blurb: 'The first Global, 1999.',
      note: 'Bombardier’s first ultra-long-range jet, built to rival the Gulfstream V.' },
    { key: '6500', variant: 'Global 6500', wiki: 'Bombardier_Global_Express', first: 2018, intro: 2019, built: null,
      len: 30.7, span: 28.65, height: 7.7, wing: 94.95, empty: 23000, mtow: 45132, payload: 2600, fuel: 20185,
      engine: 'Rolls-Royce Pearl 15 turbofan', thrust: 67.4, vmax: 950, cruise: 904, vstall: 172, range: 12223, takeoff: 1878, landing: 670, cost: 56,
      est: { vstall: stallWL, empty: 'Estimated: about the same as the Global 6000 it replaced.' },
      blurb: 'Updated Express: new engines and wing.',
      note: 'The updated Global Express family (after the Global 5000 and 6000), with new Rolls-Royce engines and a reshaped wing.' },
    { key: '7500', variant: 'Global 7500', popular: true, popLabel: 'flagship', blurb: 'The flagship, four cabin zones.',
      note: 'A new, larger aircraft with four cabin rooms. The most delivered new Global today.' },
    { key: '8000', variant: 'Global 8000', first: 2021, intro: 2025, built: null,
      mtow: 52390, vmax: 1009, range: 14816, cost: 78,
      blurb: 'The fastest, Mach 0.95.',
      note: 'An upgraded 7500 cleared to fly at Mach 0.95, the fastest civil aircraft since Concorde. A test aircraft touched Mach 1.015 in 2021.' }
  ];

  V.challenger3 = [
    { key: '300', variant: 'Challenger 300', first: 2001, intro: 2004, built: 450,
      empty: 10600, mtow: 17622, engine: 'Honeywell HTF7000 turbofan', thrust: 30.4, range: 5741, takeoff: 1494, vstall: 172, cost: 22,
      est: { vstall: stallWL },
      blurb: 'The original, 2004.', note: 'Bombardier’s first clean-sheet super mid-size jet.' },
    { key: '350', variant: 'Challenger 350', popular: true, blurb: 'More thrust and range, most built.',
      note: 'More powerful engines, winglets and a higher weight than the 300. The best-selling version.' },
    { key: '3500', variant: 'Challenger 3500', first: 2021, intro: 2022, built: null, range: 6297, cost: 27,
      blurb: 'New cabin, auto-throttle.', note: 'A refreshed 350 with a quieter cabin, auto-throttle and a little more range.', envNote: 'Same airframe and engines as the Challenger 350, so the same modeled envelope.' }
  ];

  V.challenger6 = [
    { key: '600', variant: 'Challenger 600', first: 1978, intro: 1980, built: 85, status: 'Limited',
      empty: 9800, mtow: 16330, fuel: 7200, engine: 'Lycoming ALF 502L turbofan', thrust: 33.4,
      vmax: 850, cruise: 800, vstall: 172, ceiling: 12497, range: 5900, takeoff: 1600, landing: 900, cost: 10,
      est: { vstall: stallWL, range: 'Estimated: about 3,200 nm with reserves, from period figures.' },
      blurb: 'The 1978 original.', note: 'Designed by Canadair from an idea by Learjet’s founder Bill Lear. Its engines were weak, so later models switched to GE engines.' },
    { key: '604', variant: 'Challenger 604/605', first: 1995, intro: 1996, built: 650,
      mtow: 21863, range: 7550, takeoff: 1780, landing: 719, cost: 26,
      blurb: 'GE engines, more fuel.', note: 'More fuel and stronger GE engines; the 605 (2006) added bigger windows and a new cockpit.' },
    { key: '650', variant: 'Challenger 650', popular: true, blurb: 'The current model.',
      note: 'The current model, with a redesigned cabin and a little more thrust for take-off.' }
  ];

  V.learjet = [
    { key: '35', variant: 'Learjet 35/36', wiki: 'Learjet_35', first: 1973, intro: 1974, built: 738, status: 'Limited',
      pax: 8, paxNote: '6–8 passengers', len: 14.83, span: 12.04, height: 3.73, wing: 23.53, empty: 4590, mtow: 8300, payload: 1100, fuel: 3600,
      engine: 'Garrett TFE731-2 turbofan', thrust: 15.6, vmax: 872, cruise: 774, vstall: 185, ceiling: 13716, range: 4070, takeoff: 1287, landing: 935, cost: 4,
      est: { vstall: stallWL },
      blurb: 'The classic, most built.',
      note: 'The classic Learjet of the 1970s and 80s, still used for air ambulance and target-towing work.' },
    { key: '45', variant: 'Learjet 45', popular: true, blurb: 'The all-new 1990s Learjet.',
      note: 'The first all-new Learjet under Bombardier, with a cabin you can almost stand in.' },
    { key: '60', variant: 'Learjet 60', wiki: 'Learjet_60', first: 1990, intro: 1993, built: 435,
      pax: 8, paxNote: '6–8 passengers', len: 17.88, span: 13.34, height: 4.47, wing: 24.6, empty: 6600, mtow: 10660, payload: 1000, fuel: 3600,
      engine: 'Pratt & Whitney Canada PW305A turbofan', thrust: 20.5, vmax: 859, cruise: 839, vstall: 200, range: 4450, takeoff: 1660, landing: 1036, cost: 13,
      est: { vstall: stallWL },
      blurb: 'Longer range, small wing.', note: 'A stretched Learjet 55 with more powerful engines: fast and long-legged, but needs a long runway.' },
    { key: '75', variant: 'Learjet 75', first: 2012, intro: 2013, built: 150,
      span: 15.51, wing: 31, empty: 6250, engine: 'Honeywell TFE731-40BR turbofan', thrust: 17.2, vmax: 861, vstall: 175,
      range: 3778, takeoff: 1353, cost: 13.8,
      est: { vstall: stallWL },
      blurb: 'The last Learjet, winglets.', note: 'The last Learjet: winglets, a new cockpit and stronger engines. Production ended in 2022.' }
  ];

  V.cl415 = [
    { key: '215', variant: 'CL-215', wiki: 'Canadair_CL-215', first: 1967, intro: 1969, built: 125, status: 'Limited',
      empty: 12220, mtow: 19731, payload: 5455, engine: 'Pratt & Whitney R-2800 radial piston engine', power: 1566,
      vmax: 290, vmaxAlt: 1500, cruise: 265, cruiseAlt: 1500, vstall: 125, ceiling: 3000, range: 2094, takeoff: 800, landing: 670, cost: 10,
      est: { vstall: 'Estimated: about the same as the CL-415, same wing and similar weight.', ceiling: 'Estimated: piston engines without turbochargers; it works low over fires anyway.' },
      blurb: 'The piston-engined original.', note: 'The original water bomber with two big radial piston engines.' },
    { key: '415', variant: 'CL-415', popular: true, blurb: 'Turboprops, more water.',
      note: 'Turboprop engines, more water and a modern cockpit. Flown in Canada, Greece, Italy, France, Spain and Croatia.' }
  ];
})();
