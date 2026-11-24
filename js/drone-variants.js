/* Drone models (same format as HANGAR.variants in variants.js; `est` inline = figure is an estimate,
 * shown with a tappable * and this explanation). Researched 2026-11-24 from published specs.
 */
(function () {
  const V = window.HANGAR.variants = window.HANGAR.variants || {};
  const slSame = 'Estimated: slightly below its published top speed.';

  V.mq9 = [
    { key: 'a', variant: 'MQ-9A Reaper', popular: true, blurb: 'The standard Reaper.',
      note: 'The standard US Air Force Reaper: about 27 hours empty, 14 hours fully armed.' },
    { key: 'er', variant: 'MQ-9A Extended Range', first: 2015, intro: 2016, mtow: 5310, endurance: 33, vstall: 125,
      est: { vstall: 'Estimated: heavier with wing fuel pods, so slightly faster stall (square root of the weight ratio).' },
      blurb: 'Extra fuel pods, about 33 h.',
      note: 'Adds fuel pods under the wings and a stronger landing gear for about 33 hours of flight.' },
    { key: 'b', variant: 'MQ-9B SkyGuardian', first: 2016, intro: 2023, span: 24, mtow: 5670, endurance: 40, ceiling: 12200, vmax: 388, vstall: 115,
      est: { vstall: 'Estimated: heavier, but a 4 m longer wing; assumed slightly lower than the MQ-9A.', vmax: 'Estimated: General Atomics quotes about 210 kt.' },
      blurb: 'Longer wing, 40 h, certified for civil airspace.',
      note: 'A longer wing, 40-hour endurance and a design certified to fly in normal air traffic. The UK flies it as the Protector.' }
  ];

  V.mq1 = [
    { key: 'a', variant: 'RQ-1A Predator', intro: 1995, mtow: 950, payload: 0, status: 'Retired', blurb: 'Unarmed reconnaissance original.',
      note: 'The original, unarmed reconnaissance version.' },
    { key: 'b', variant: 'MQ-1B Predator', popular: true, intro: 2001, blurb: 'Armed with Hellfire missiles.',
      note: 'Armed with two Hellfire missiles; the version that changed warfare.' }
  ];

  V.rq4 = [
    { key: 'a', variant: 'RQ-4A (Block 10)', first: 1998, intro: 2001, span: 35.4, mtow: 11600, endurance: 32, status: 'Retired',
      blurb: 'The first Global Hawks.', note: 'The original, smaller Global Hawk.' },
    { key: 'b', variant: 'RQ-4B (Block 30/40)', popular: true, blurb: 'Bigger wing, more payload.',
      note: 'A wider wing and 50% more payload than the RQ-4A.' },
    { key: 'triton', variant: 'MQ-4C Triton', wiki: 'Northrop_Grumman_MQ-4C_Triton', first: 2013, intro: 2018, role: 'Maritime surveillance drone',
      mtow: 14628, vmax: 575, cruise: 530, cruiseAlt: 15000, ceiling: 17000, endurance: 24, vstall: 185,
      est: { cruise: 'Estimated: below its published top speed.', vstall: 'Estimated: heavier than the RQ-4B; square root of the weight ratio.' },
      blurb: 'Navy version that dives to look at ships.',
      note: 'Strengthened against ice and hail so it can descend through cloud to identify ships, then climb back up.' }
  ];

  V.tb2 = [
    { key: 'tb2', variant: 'TB2', popular: true, blurb: 'The standard TB2.', note: 'The version exported to more than 30 countries.' },
    { key: 'tb2t', variant: 'TB2T-AI', first: 2023, intro: 2024, ceiling: 9144,
      blurb: 'Turbocharged engine, flies higher.', note: 'A turbocharged engine raises the ceiling to about 30,000 ft, plus AI-based autonomy.' },
    { key: 'tb3', variant: 'TB3 (naval)', wiki: 'Baykar_Bayraktar_TB3', first: 2023, intro: 2024, role: 'Carrier-based armed drone',
      len: 8.35, span: 14, mtow: 1600, payload: 280, engine: 'TEI PD170 turbodiesel', power: 125,
      vmax: 300, vmaxSL: 280, cruise: 230, cruiseAlt: 6000, vstall: 100, ceiling: 10973, endurance: 24,
      est: { vstall: 'Estimated: heavier than the TB2; square root of the weight ratio.', cruise: 'Estimated: typical cruise for its class.', vmaxSL: slSame },
      blurb: 'Folding wings, flies from a ship.', note: 'Folding wings for the short deck of the Turkish ship TCG Anadolu.' }
  ];

  V.heron = [
    { key: 'h1', variant: 'Heron 1', popular: true, blurb: 'The standard Heron.', note: 'The standard Heron, flown by more than 20 countries.' },
    { key: 'mk2', variant: 'Heron Mk II', first: 2019, intro: 2021, mtow: 1430, engine: 'Rotax 915 iS turbocharged piston engine', power: 104,
      vmax: 260, vmaxSL: 240, ceiling: 10670, endurance: 45, vstall: 105,
      est: { vstall: 'Estimated: heavier than the Heron 1; square root of the weight ratio.', vmaxSL: slSame },
      blurb: 'Stronger engine, faster, higher.', note: 'A stronger engine makes it faster and lets it fly higher, near 35,000 ft.' }
  ];

  V.hermes450 = [
    { key: '450', variant: 'Hermes 450', popular: true, blurb: 'The Israeli original.', note: 'The Israeli Air Force workhorse.' },
    { key: 'wk', variant: 'Watchkeeper WK450', wiki: 'Thales_Watchkeeper_WK450', maker: 'Thales UK / Elbit Systems', country: 'UK / Israel', first: 2008, intro: 2014, built: 54, status: 'Limited',
      mtow: 485, endurance: 16, ceiling: 4900,
      blurb: 'British Army version.', note: 'Built for the British Army with automatic take-off and landing and a radar that sees through cloud.' }
  ];

  V.hermes900 = [
    { key: '900', variant: 'Hermes 900', popular: true, blurb: 'The standard Hermes 900.', note: 'The standard version (“Kochav” in the Israeli Air Force).' },
    { key: 'starliner', variant: 'Hermes 900 StarLiner', first: 2018, intro: 2020, mtow: 1600, payload: 450, vstall: 78,
      est: { vstall: 'Estimated: heavier than the standard Hermes 900; square root of the weight ratio, kept below its loiter speed.' },
      blurb: 'Certified to share airspace with airliners.', note: 'Built to civil airworthiness standards with collision avoidance, so it can fly in normal air traffic (Switzerland flies it).' },
    { key: 'hfe', variant: 'Hermes 900 HFE', first: 2021, intro: 2022, engine: 'Heavy-fuel piston engine', power: 134, endurance: 30, ceiling: 9100, vmax: 230, vmaxSL: 210,
      est: { power: 'Estimated: about 180 hp, as reported.', endurance: 'Estimated from reported figures.', vmax: 'Estimated: slightly faster with the stronger engine.', vmaxSL: slSame },
      blurb: 'Runs on jet fuel.', note: 'A heavy-fuel engine that burns jet fuel, easier to supply for armies than aviation petrol.' }
  ];

  V.wingloong2 = [
    { key: '1', variant: 'Wing Loong I', wiki: 'CAIG_Wing_Loong', first: 2007, intro: 2011, len: 9, span: 14, height: 2.8, empty: 900, mtow: 1100, payload: 200,
      engine: 'Rotax 914 turbocharged piston engine', power: 75, vmax: 280, vmaxSL: 260, cruise: 180, cruiseAlt: 4000, vstall: 100, ceiling: 5000, range: 4000, endurance: 20,
      est: { vstall: 'Estimated: no published stall speed; similar to the Predator.', cruise: 'Estimated: typical cruise for its class.', vmaxSL: slSame },
      blurb: 'The original, Predator-sized.', note: 'The first Wing Loong, close in size to the Predator.' },
    { key: '2', variant: 'Wing Loong II', popular: true, blurb: 'Bigger, turboprop, Reaper-class.', note: 'Reaper-class, with a turboprop engine.' },
    { key: '3', variant: 'Wing Loong 3', first: 2023, intro: 2024, span: 24, mtow: 6200, payload: 2300, endurance: 40, range: 10000, vstall: 145,
      est: { vstall: 'Estimated: heavier but with a longer wing than the Wing Loong II.', endurance: 'Reported by the maker; not independently confirmed.' },
      blurb: 'Intercontinental range.', note: 'A much bigger wing for 40-hour, 10,000 km flights.' }
  ];
  V.mq1c = [
    { key: 'c', variant: 'MQ-1C Gray Eagle', popular: true, blurb: 'The standard Army version.', note: 'The US Army’s standard version.' },
    { key: 'er', variant: 'Gray Eagle ER', first: 2013, intro: 2018, mtow: 1900, endurance: 42, vstall: 120,
      est: { vstall: 'Estimated: heavier with extra fuel; square root of the weight ratio.' },
      blurb: 'Extended range, about 42 h.', note: 'Extra fuel and a lighter, more efficient engine for about 42 hours aloft.' }
  ];

  V.shahed136 = [
    { key: '136', variant: 'Shahed 136', popular: true, blurb: 'The Iranian original.', note: 'The Iranian original, with a small piston engine.' },
    { key: 'geran2', variant: 'Geran-2 (Russian-built)', country: 'Russia (Iranian design)', maker: 'Alabuga (Russia)', intro: 2022,
      blurb: 'Built in Russia in large numbers.', note: 'The Shahed 136 built under licence in Russia, now in large numbers and with improved navigation.' },
    { key: '238', variant: 'Shahed 238 (jet)', first: 2023, intro: 2024, engine: 'Small turbojet', power: undefined, thrust: 1.5,
      vmax: 550, vmaxSL: 520, cruise: 450, cruiseAlt: 3000, vstall: 150, ceiling: 9000, range: 1500,
      est: { vmax: 'Estimated: reported speeds vary from 500 to 600 km/h.', vmaxSL: 'Estimated: slightly below its top speed.', cruise: 'Estimated.', vstall: 'Estimated: much faster wing loading with the jet; no published figure.', ceiling: 'Estimated: no published ceiling.', range: 'Estimated: the jet burns more fuel than the piston version.', thrust: 'Estimated.' },
      blurb: 'Jet version, three times faster.', note: 'A jet-powered version, much faster and harder to shoot down with guns, but shorter range.' }
  ];

  V.lancet = [
    { key: 'l1', variant: 'Lancet-1', mtow: 5, payload: 1, endurance: 0.5, range: 40,
      blurb: 'Smaller version.', note: 'The smaller version with a 1 kg warhead.' },
    { key: 'l3', variant: 'Lancet-3', popular: true, blurb: 'The main version.', note: 'The main version with a 3 kg warhead.' }
  ];

  V.switchblade = [
    { key: '300', variant: 'Switchblade 300', first: 2011, intro: 2012, len: 0.6, span: 0.7, mtow: 2.5,
      vmax: 160, vmaxSL: 160, cruise: 101, endurance: 0.25, range: 10, vstall: 50,
      est: { vstall: 'Estimated: no published figure; fired from a tube and never lands.' },
      blurb: 'Backpack size, 15 minutes.', note: 'Small enough for a backpack, for nearby targets.' },
    { key: '600', variant: 'Switchblade 600', popular: true, blurb: 'Anti-armour, 40 minutes.', note: 'Larger, with an anti-tank warhead and 40 minutes of flight.' }
  ];

  V.harop = [
    { key: 'harpy', variant: 'IAI Harpy', wiki: 'IAI_Harpy', first: 1989, intro: 1990, len: 2.7, span: 2.1, mtow: 135, payload: 32,
      vmax: 185, vmaxSL: 185, cruise: 160, endurance: 2, range: 500,
      est: { endurance: 'Estimated: reported loiter time.', cruise: 'Estimated.' },
      blurb: 'The original radar hunter.', note: 'The predecessor: homes in on enemy radar signals with no camera and no operator in the loop.' },
    { key: 'harop', variant: 'Harop', popular: true, blurb: 'Adds a camera and operator control.', note: 'Adds a camera so an operator can choose targets or call off the attack.' }
  ];

  V.scaneagle = [
    { key: 'se', variant: 'ScanEagle', popular: true, blurb: 'The standard ScanEagle.', note: 'The standard version, flown from ships and land.' },
    { key: 'se3', variant: 'ScanEagle 3', first: 2014, intro: 2018, mtow: 36, payload: 6.8, endurance: 18, vstall: 75,
      est: { vstall: 'Estimated: heavier; square root of the weight ratio.' },
      blurb: 'Bigger, heavy-fuel engine.', note: 'Larger, with a heavy-fuel engine and room for more sensors.' }
  ];

  V.rq11 = [
    { key: 'a', variant: 'RQ-11A', intro: 2003, blurb: 'Analogue video link.', note: 'The first version, with an analogue video link.', envNote: 'Same airframe as the RQ-11B; only the radio link differs.' },
    { key: 'b', variant: 'RQ-11B', popular: true, intro: 2006, blurb: 'Digital link, better cameras.', note: 'Digital datalink and a better camera.', envNote: 'Same airframe as the RQ-11A.' }
  ];
})();
