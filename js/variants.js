/* Hangar: fighter variants and the "top 10" ranking.
 * HANGAR.variants[familyId] = list of variants. Each variant copies its family's figures and overrides
 * only what differs (same units as data.js). `key` makes the page id `<familyId>-<key>`.
 * A variant with no overrides beyond the text is the family's own representative variant.
 * popular: true = the model a family's page opens on (its most common model).
 * built: null = number not shown (unknown for that variant alone).
 * Figures are approximate published values, like the rest of Hangar.
 */
window.HANGAR = window.HANGAR || {};

/* Ranked roughly by how many are in service worldwide (approx., late 2020s). */
HANGAR.top = [
  { id: 'f16', fleet: 2100 },
  { id: 'su27', fleet: 1500, fleetNote: 'all Flankers, including Chinese J-11/J-16' },
  { id: 'f35', fleet: 1100 },
  { id: 'f15', fleet: 850 },
  { id: 'fa18ef', fleet: 800 },
  { id: 'mig29', fleet: 650 },
  { id: 'j10', fleet: 600 },
  { id: 'typhoon', fleet: 550 },
  { id: 'rafale', fleet: 270 },
  { id: 'm2000', fleet: 270 }
];

HANGAR.variants = {
  f16: [
    { key: 'a', variant: 'F-16A/B (Block 1–20)', first: 1974, intro: 1978, built: null,
      engine: 'Pratt & Whitney F100-PW-200 afterburning turbofan', thrust: 64.9, thrustAB: 106, empty: 7070, mtow: 16057, payload: 5400, cost: 15,
      blurb: 'The original lightweight fighter.',
      note: 'The original lightweight day fighter. Israeli F-16As ("Netz") flew the 1981 raid on the Osirak reactor.' },
    { key: 'c', variant: 'F-16C/D (Block 50/52)', popular: true, intro: 1991, built: null,
      blurb: 'The most produced version.',
      note: 'The most produced version, with a bigger engine choice (GE F110 on Block 50, P&W F100-229 on Block 52) and precision strike gear. The D is the two-seater.' },
    { key: 'i', variant: 'F-16I Sufa', country: 'USA / Israel', first: 2003, intro: 2004, built: 102, crew: 2, wiki: 'General_Dynamics_F-16_Fighting_Falcon_variants',
      role: 'Two-seat long-range strike fighter', engine: 'Pratt & Whitney F100-PW-229 afterburning turbofan', thrust: 79.2, thrustAB: 129.4,
      empty: 9900, mtow: 21772, fuel: 4535, radius: 830, cost: 45,
      blurb: 'Israel’s two-seat long-range version.',
      note: 'Built for the Israeli Air Force: two seats, conformal fuel tanks along the spine for extra range, and Israeli avionics and weapons.' },
    { key: 'e', variant: 'F-16E/F (Block 60) Desert Falcon', country: 'USA / UAE', first: 2003, intro: 2005, built: 80, wiki: 'General_Dynamics_F-16_Fighting_Falcon_variants',
      engine: 'GE F110-GE-132 afterburning turbofan', thrust: 84, thrustAB: 144, empty: 10000, mtow: 21800, fuel: 4535,
      blurb: 'The UAE’s version, first with an AESA radar.',
      note: 'Built for the United Arab Emirates, the first F-16 with an AESA radar, plus conformal fuel tanks and the most powerful F-16 engine.' },
    { key: 'v', variant: 'F-16V (Block 70/72)', first: 2015, intro: 2023, built: null, mtow: 21772, cost: 70, wiki: 'General_Dynamics_F-16_Fighting_Falcon_variants',
      blurb: 'The newest build, with an AESA radar.',
      note: 'The newest build: APG-83 AESA radar, a large centre display and a 12,000-hour airframe. Older jets (Taiwan, Greece) are upgraded to the same standard.' }
  ],

  f15: [
    { key: 'a', variant: 'F-15A/B', status: 'Limited', intro: 1976, built: null,
      engine: 'Pratt & Whitney F100-PW-100 afterburning turbofan', thrust: 65, thrustAB: 106, empty: 12250, mtow: 25400, cost: 28,
      blurb: 'The first Eagles.',
      note: 'The first production Eagles. Israeli F-15As ("Baz") scored the type’s first air-to-air kills in 1979.' },
    { key: 'c', variant: 'F-15C/D', popular: true, first: 1979, intro: 1979, built: null,
      blurb: 'The classic air superiority Eagle.',
      note: 'More internal fuel, conformal tank options and a better radar. The core of the Eagle’s unbeaten air combat record.' },
    { key: 'e', variant: 'F-15E Strike Eagle', wiki: 'McDonnell_Douglas_F-15E_Strike_Eagle', first: 1986, intro: 1989, built: 236, crew: 2, role: 'Two-seat strike fighter',
      engine: 'Pratt & Whitney F100-PW-229 afterburning turbofan', thrust: 79, thrustAB: 129.4, empty: 14300, mtow: 36700, payload: 10400, fuel: 5952,
      range: undefined, radius: 1270, ferry: 3900, cost: 31,
      blurb: 'Two-seat long-range strike version.',
      note: 'Adds a weapons officer, ground-attack radar and conformal fuel tanks, so it strikes deep without giving up air-to-air ability.' },
    { key: 'i', variant: 'F-15I Ra’am', country: 'USA / Israel', wiki: 'McDonnell_Douglas_F-15E_Strike_Eagle', first: 1997, intro: 1998, built: 25, crew: 2, role: 'Two-seat strike fighter',
      engine: 'Pratt & Whitney F100-PW-229 afterburning turbofan', thrust: 79, thrustAB: 129.4, empty: 14300, mtow: 36700, payload: 10400, fuel: 5952,
      range: undefined, radius: 1270, ferry: 3900,
      blurb: 'Israel’s Strike Eagle.',
      note: 'Israel’s version of the Strike Eagle with Israeli electronics and weapons; 25 delivered from 1998, with the newer F-15IA on order.' },
    { key: 'j', variant: 'Mitsubishi F-15J', maker: 'Mitsubishi (licence-built)', country: 'USA / Japan', wiki: 'Mitsubishi_F-15J', first: 1980, intro: 1981, built: 213,
      blurb: 'Japan’s licence-built Eagle.',
      note: 'Japan’s main air defence fighter, mostly built under licence by Mitsubishi.' },
    { key: 'ex', variant: 'F-15EX Eagle II', maker: 'Boeing', wiki: 'Boeing_F-15EX_Eagle_II', first: 2021, intro: 2024, built: null,
      engine: 'GE F110-GE-129 afterburning turbofan', thrust: 76.3, thrustAB: 131, empty: 14500, mtow: 36700, payload: 13400, fuel: 5952, cost: 90,
      blurb: 'The new digital Eagle.',
      note: 'Fly-by-wire controls, a digital cockpit and the heaviest weapons load of any US fighter, about 13 tonnes.' }
  ],

  f35: [
    { key: 'a', variant: 'F-35A', popular: true, blurb: 'Conventional take-off, for air forces.',
      note: 'The air force version with an internal 25 mm cannon. The most numerous F-35.' },
    { key: 'b', variant: 'F-35B', first: 2008, intro: 2015, role: 'Stealth STOVL multirole fighter',
      engine: 'Pratt & Whitney F135-PW-600 with shaft-driven lift fan', empty: 14650, mtow: 27200, fuel: 6125, range: 1670, radius: 935, takeoff: 168, landing: undefined, cost: 109,
      blurb: 'Short take-off, vertical landing.',
      note: 'A lift fan behind the cockpit and a swivelling nozzle let it take off in under 200 m and land vertically, on small carriers and assault ships.' },
    { key: 'c', variant: 'F-35C', first: 2010, intro: 2019, carrier: true, role: 'Stealth carrier-based multirole fighter',
      span: 13.1, wing: 62.1, empty: 15785, mtow: 31800, fuel: 8960, range: 2220, radius: 1240, takeoff: undefined, landing: undefined, cost: 102,
      blurb: 'Carrier version with bigger wings.',
      note: 'Larger folding wings, a stronger landing gear and an arrester hook for catapult carriers.' },
    { key: 'i', variant: 'F-35I Adir', country: 'USA / Israel', intro: 2016, built: null,
      blurb: 'Israel’s F-35A.',
      note: 'Israel’s F-35A with Israeli electronic warfare and weapons. The first F-35 to fly in combat (2018).' }
  ],

  fa18ef: [
    { key: 'ab', variant: 'F/A-18A/B Hornet', maker: 'McDonnell Douglas', wiki: 'McDonnell_Douglas_F/A-18_Hornet', first: 1978, intro: 1983, built: null, status: 'Limited',
      len: 17.1, span: 12.31, height: 4.66, wing: 37.16, empty: 10400, mtow: 23400, payload: 6215, fuel: 4930,
      engine: 'GE F404-GE-400 afterburning turbofan', thrust: 47.2, thrustAB: 71.2, vmax: 1915, ceiling: 15240, climb: 254,
      range: 2000, ferry: 3330, radius: 740, cost: 29,
      blurb: 'The original “legacy” Hornet.',
      note: 'The original Hornet, one jet for both fighter and attack missions (hence F/A).' },
    { key: 'cd', variant: 'F/A-18C/D Hornet', maker: 'McDonnell Douglas', wiki: 'McDonnell_Douglas_F/A-18_Hornet', first: 1986, intro: 1987, built: null,
      len: 17.1, span: 12.31, height: 4.66, wing: 37.16, empty: 10455, mtow: 23541, payload: 6215, fuel: 4930,
      engine: 'GE F404-GE-402 afterburning turbofan', thrust: 49, thrustAB: 79, vmax: 1915, ceiling: 15240, climb: 254,
      range: 2000, ferry: 3330, radius: 740, cost: 29,
      blurb: 'Improved legacy Hornet.',
      note: 'Better radar, night attack gear and engines. Flown by the Blue Angels until 2020 and still by Finland, Switzerland, Spain and others.' },
    { key: 'e', variant: 'F/A-18E Super Hornet', popular: true, blurb: 'Bigger, single-seat Super Hornet.',
      note: 'About 25% larger than the Hornet, with more fuel and two extra weapon stations.' },
    { key: 'f', variant: 'F/A-18F Super Hornet', crew: 2, blurb: 'Two-seat Super Hornet.',
      note: 'Two seats: the back-seater runs sensors and weapons (the jet seen in Top Gun: Maverick).' },
    { key: 'g', variant: 'EA-18G Growler', wiki: 'Boeing_EA-18G_Growler', first: 2006, intro: 2009, built: 172, crew: 2, role: 'Electronic warfare aircraft',
      blurb: 'Electronic warfare version.',
      note: 'Swaps most weapons for jamming pods to blind enemy radars and radios.' }
  ],

  su27: [
    { key: 's', variant: 'Su-27S', popular: true, blurb: 'The original Flanker.',
      note: 'The original single-seat air superiority Flanker.' },
    { key: 'su30', variant: 'Su-30MKI', wiki: 'Sukhoi_Su-30MKI', maker: 'Sukhoi / HAL', country: 'Russia / India', first: 1997, intro: 2002, built: 272, crew: 2,
      role: 'Two-seat multirole fighter', engine: 'Saturn AL-31FP afterburning turbofan with thrust vectoring', thrust: 74.5, thrustAB: 123,
      empty: 18400, mtow: 38800, payload: 8000, fuel: 9640, vmax: 2120, ceiling: 17300, range: 3000, cost: 50,
      blurb: 'India’s two-seat thrust-vectoring Flanker.',
      note: 'The backbone of the Indian Air Force: canards and thrust vectoring for extreme agility, built under licence by HAL.' },
    { key: 'su33', variant: 'Su-33', wiki: 'Sukhoi_Su-33', first: 1987, intro: 1998, built: 35, carrier: true, status: 'Limited', role: 'Carrier-based air superiority fighter',
      empty: 18400, mtow: 33000, takeoff: 105, landing: undefined,
      blurb: 'Carrier Flanker with folding wings.',
      note: 'Folding wings, canards and an arrester hook for the carrier Admiral Kuznetsov. Takes off from a ski-jump.' },
    { key: 'su35', variant: 'Su-35S', wiki: 'Sukhoi_Su-35', first: 2008, intro: 2014, built: null, role: 'Multirole air superiority fighter',
      engine: 'Saturn AL-41F1S afterburning turbofan with thrust vectoring', thrust: 86.3, thrustAB: 142.2,
      empty: 18400, mtow: 34500, payload: 8000, fuel: 11500, vmax: 2400, ceiling: 18000, range: 3600, ferry: 4500, cost: 65,
      blurb: 'The latest Russian Flanker.',
      note: 'Much-modernised Flanker with new engines, thrust vectoring and a passive-array radar, but no canards.' },
    { key: 'j11', variant: 'Shenyang J-11B', wiki: 'Shenyang_J-11', maker: 'Shenyang Aircraft Corporation', country: 'China', first: 2006, intro: 2007, built: null,
      engine: 'Shenyang WS-10A afterburning turbofan', thrust: 76, thrustAB: 132, cost: 30,
      blurb: 'China’s Su-27.',
      note: 'China first licence-built the Su-27, then made its own version with Chinese engines, radar and weapons.' },
    { key: 'j16', variant: 'Shenyang J-16', wiki: 'Shenyang_J-16', maker: 'Shenyang Aircraft Corporation', country: 'China', first: 2011, intro: 2015, built: null, crew: 2,
      role: 'Two-seat strike fighter', engine: 'Shenyang WS-10 afterburning turbofan', thrust: 76, thrustAB: 132, empty: 17700, mtow: 35000, payload: 12000, cost: 60,
      blurb: 'China’s two-seat strike Flanker.',
      note: 'Developed from the Su-30MKK with an AESA radar; one of China’s most numerous modern fighters.' }
  ],

  mig29: [
    { key: '912', variant: 'MiG-29 (9.12)', popular: true, blurb: 'The original Fulcrum.',
      note: 'The original front-line Fulcrum, built for short-range air combat from rough airfields.' },
    { key: 'ub', variant: 'MiG-29UB', first: 1981, intro: 1985, crew: 2, role: 'Two-seat combat trainer', built: null,
      blurb: 'Two-seat trainer.',
      note: 'Two-seat conversion trainer. It has no radar, keeping only the infrared sensor.' },
    { key: 'k', variant: 'MiG-29K/KUB', wiki: 'Mikoyan_MiG-29K', first: 2007, intro: 2010, built: null, carrier: true, role: 'Carrier-based multirole fighter',
      engine: 'Klimov RD-33MK afterburning turbofan', thrust: 53, thrustAB: 88.3, empty: 12700, mtow: 24500, payload: 5500, fuel: 4560, range: 2000, ferry: 3000,
      takeoff: 195, landing: undefined,
      blurb: 'Carrier version for India and Russia.',
      note: 'Folding wings and a strengthened airframe for India’s INS Vikramaditya and Russia’s Kuznetsov. Launches from a ski-jump.' },
    { key: '35', variant: 'MiG-35', wiki: 'Mikoyan_MiG-35', first: 2016, intro: 2019, built: null, status: 'Limited', role: 'Multirole fighter',
      engine: 'Klimov RD-33MKV afterburning turbofan', thrust: 53, thrustAB: 88, empty: 11000, mtow: 24500, payload: 6500, range: 2000, ferry: 3100,
      blurb: 'The latest Fulcrum, few built.',
      note: 'The latest development, with more fuel, a modern radar and a glass cockpit. Only a handful have been built.' }
  ],

  j10: [
    { key: 'a', variant: 'J-10A', first: 1998, intro: 2004, built: null, engine: 'Saturn AL-31FN afterburning turbofan', thrust: 79.4, thrustAB: 122.6,
      blurb: 'The first Chinese J-10.',
      note: 'China’s first home-designed fourth-generation fighter, a delta-canard layout.' },
    { key: 'b', variant: 'J-10B', first: 2008, intro: 2014, built: null,
      blurb: 'New intake and passive-array radar.',
      note: 'A bump-type (DSI) intake without moving parts and a passive electronically scanned radar.' },
    { key: 'c', variant: 'J-10C', popular: true, blurb: 'AESA radar and long-range missiles.',
      note: 'AESA radar and PL-15 long-range missiles; often built with the Chinese WS-10 engine.' },
    { key: 'ce', variant: 'J-10CE', country: 'China / Pakistan', intro: 2022, built: null,
      blurb: 'Export version, flown by Pakistan.',
      note: 'The export J-10C, in service with Pakistan since 2022.' }
  ],

  typhoon: [
    { key: 't1', variant: 'Tranche 1', name: 'Eurofighter Typhoon Tranche 1', intro: 2003, built: 148, blurb: 'The first Typhoons.',
      note: 'The first batch, mainly for air defence. Some are being retired.' },
    { key: 't2', variant: 'Tranche 2', name: 'Eurofighter Typhoon Tranche 2', intro: 2008, built: null, blurb: 'Multirole computers and wiring.',
      note: 'New computers and wiring that let the Typhoon carry ground-attack weapons.' },
    { key: 't3', variant: 'Tranche 3/4', popular: true, name: 'Eurofighter Typhoon Tranche 3/4', intro: 2015, built: null, blurb: 'AESA radar ready, more fuel options.',
      note: 'Prepared for the Captor-E AESA radar and conformal fuel tanks. Germany and Spain are buying more as Tranche 4.' }
  ],

  rafale: [
    { key: 'c', variant: 'Rafale C', popular: true, blurb: 'Single-seat air force version.',
      note: 'Single-seat version for the French Air and Space Force and most export customers.' },
    { key: 'b', variant: 'Rafale B', crew: 2, empty: 10600, blurb: 'Two-seat version.',
      note: 'Two-seat version, used for training and for the French nuclear strike role.' },
    { key: 'm', variant: 'Rafale M', carrier: true, empty: 10600, takeoff: undefined, landing: undefined, intro: 2001, role: 'Carrier-based omnirole fighter',
      blurb: 'Carrier version.',
      note: 'Strengthened landing gear and an arrester hook, launched by catapult from the carrier Charles de Gaulle. India is buying it too.' }
  ],

  m2000: [
    { key: 'c', variant: 'Mirage 2000C', first: 1978, intro: 1984, built: null, engine: 'SNECMA M53-5 afterburning turbofan', thrust: 54, thrustAB: 88,
      blurb: 'The original air defence version.',
      note: 'The original single-seat air defence fighter.' },
    { key: 'b', variant: 'Mirage 2000B', crew: 2, intro: 1984, built: null, blurb: 'Two-seat trainer.',
      note: 'Two-seat conversion trainer.' },
    { key: 'n', variant: 'Mirage 2000N/D', wiki: 'Dassault_Mirage_2000N/2000D', first: 1983, intro: 1988, built: 161, crew: 2, role: 'Two-seat strike aircraft',
      blurb: 'Two-seat ground strike versions.',
      note: 'Two-seat strike versions: the 2000N carried France’s nuclear missile until 2018, the 2000D is the conventional version.' },
    { key: '5', variant: 'Mirage 2000-5', popular: true, blurb: 'Modernised multirole version.',
      note: 'Modernised multirole version with a new radar and a glass cockpit, flown by Taiwan, Greece and Qatar.' },
    { key: '9', variant: 'Mirage 2000-9', country: 'France / UAE', first: 2000, intro: 2003, built: null, blurb: 'The UAE’s most advanced Mirage.',
      note: 'Built for the United Arab Emirates, the most advanced Mirage 2000.' }
  ]
};
