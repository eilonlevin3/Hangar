# Hangar: instructions for Claude (including the Telegram bot session)

Hangar is the owner's aircraft explorer app: browse aircraft by category with photos, open a detail page
(specs, modeled flight envelope, runway, range), and compare up to three side by side.
Started 2026-11-23.

- Repo: `C:\Repos\Hangar`, GitHub `eilonlevin3/Hangar` (public), branch `main`.
- Live: https://eilonlevin3.github.io/Hangar/ (GitHub Pages from `main`, root). A push to `main` goes live in about a minute.
- No build step, no Node. Vanilla JS with classic `<script>` tags. Python only for the local server.
- Local run: `start.bat` (http://localhost:8770/).

## If you are the Telegram bot

The owner works on this from an iPhone through Telegram. Do this:

1. Read this file and `README.md` before changing anything.
2. The owner writes in short messages, sometimes with typos. Confirm what you understood in one line, then do it.
3. After each change: bump `?v=N` on every asset link in `index.html` that changed, and bump `CACHE` in `sw.js`
   (`hangar-v1` -> `hangar-v2` ...). Without this the iPhone home-screen app keeps showing the old version.
4. Commit and push to `main` (the owner has said this project deploys straight from `main`; no debug branch yet).
   Then reply on Telegram with what changed and the live link. Tell the owner to close and reopen the
   home-screen app (swipe it away) to get the update.
5. Screenshots the owner sends are of the live app on the phone. Phone layout matters: check changes at 390 px width.
6. Walkthroughs for the owner: one screen per message, exact button names, ask for a screenshot back.

### Home-screen setup (send these steps to the owner if asked)

1. On the iPhone open **Safari** (not Chrome) and go to https://eilonlevin3.github.io/Hangar/
2. Tap the **Share** button (square with an arrow, bottom bar).
3. Scroll down and tap **Add to Home Screen**.
4. Leave the name as **Hangar** and tap **Add** (top right).
5. Open Hangar from the home screen. It opens full screen like an app.

## Files

| File | What it is |
|---|---|
| `js/data.js` | The aircraft database (categories + one object per aircraft family). Units in the header comment. |
| `js/variants.js` | `HANGAR.variants` (variants per family; each overrides only what differs, page `#/a/<family>-<key>`) and `HANGAR.top` (the top-10 fighters by fleet size). |
| `js/variant-perf.js` | `HANGAR.variantPerf`: per-model flight figures merged over the variants. `est[field]` = why a figure is an estimate (shown as a tappable *), `envNote` = text under the envelope, `hoverAlt` = STOVL hover height. |
| `js/units.js` | Metric / aviation unit conversion, number formatting, standard atmosphere (ISA). |
| `js/wiki.js` | Photos and intro text from the Wikipedia API (`origin=*`), cached in localStorage 14 days. |
| `js/envelope.js` | Modeled flight envelope and its SVG chart (hover tooltip, Mach 1, 2 and 3 lines where they fall inside the plot). |
| `js/app.js` | Views: browse, detail (`#/a/<id>`), compare (`#/compare` or `#/compare/id1,id2,id3`), lightbox, tray. |
| `css/app.css` | All styles. Colour tokens on `:root`; dark is the default theme (`data-theme`). |
| `js/drone-variants.js` | Drone models (MQ-9A/ER/B, RQ-4/Triton, Hermes 900/StarLiner/HFE...), same format as variants.js with inline `est`. |
| `js/civil-variants.js` | Bombardier family models (CRJ, Dash 8, A220/CSeries, Global, Challenger 300/600, Learjet, CL-215/415). Optional `popLabel` replaces the "most common" tag on the default model (e.g. "flagship"). |
| `tools/check-envelopes.js` | `node tools/check-envelopes.js`: checks every aircraft and model (cruise and max-speed points inside the envelope, basic consistency). **Run it before every push**; it must report 0 problems. |
| `sw.js` | Service worker: network-first app shell. |

## Adding an aircraft

Add an object to `HANGAR.aircraft` in `js/data.js`. Required: `id` (unique, short), `name`, `variant`, `maker`,
`country`, `cats` (category ids; first one is the primary), `role`, `wiki` (exact English Wikipedia article title
with underscores; photos come from it), `first`, `intro`, `status` (`Active` | `Limited` | `Retired`), `vmax`,
`ceiling`, `vstall` (0 for helicopters/VTOL), `mtow`. Fill everything else you can from the Wikipedia specs box.
Use the variant named in `variant` consistently. Check the article title opens on Wikipedia, or the card has no photo.

## Decisions so far

- Figures are approximate published values; the footer and envelope panel say so. Do not present them as exact.
- Flight envelopes are **modeled** (stall speed / sqrt(density ratio) on the left, max speed profile on the right,
  meeting at the ceiling). They are illustrations, not flight-manual data. Keep the wording that says this.
- Photos are not copied into the repo. They load from Wikimedia Commons with author and licence shown in the lightbox.
- Compare holds at most 3 aircraft; series colours are fixed slots (blue, orange, aqua) validated for colour-blind use.
- Dark theme is the default (Chrome's forced dark mode on the laptop greys out a light page).
- Units: "kt / ft" is the default and shows the metric value in parentheses, e.g. "50,000 ft (15,240 m)", "497 kt (920 km/h)" (owner, 2026-11-24, for all fields). "Metric" shows metric only. Saved per device (`hangar-units-v2`). Narrow card stats put the metric value on a second line.
- Fighters: one card per family (F-16, Su-27 Flanker...). A family itself can never be compared: its card's Compare opens a model picker. Opening a family shows its most common model (`popular: true` in variants.js) with a model picker under the title; each model has its own figures, envelope and compare slot (owner, 2026-11-24). The top 10 by fleet size get a "#N fighter" badge and sort first (2026-11-24).

## Ideas not built yet (ask the owner before starting)

- Variants for the other categories (airliners, helicopters...).
- More aircraft (Kfir, Lavi, Boeing 777X, A321XLR, Bell 206, Antonov An-2, Zeppelin...).
- Favourites list, "random aircraft" button, quiz mode.
- Silhouette size comparison (overlay outlines to scale).

- Drones are split into two categories (owner, 2026-11-24): `male` "MALE drones" (medium/high-altitude long-endurance, incl. Global Hawk) and `smalluav` "Smaller drones & quadcopters" (hand-launched, loitering munitions, camera quadcopters). At least 15 in each.
- Drones: the top 20 by popularity get a "#N drone" badge (`HANGAR.topDrones` in variants.js, 2026-11-24).
- Estimates (owner, 2026-11-24): any figure that is assumed rather than published gets a * that opens a sheet explaining the assumption. Keep doing this for new data.
- Bombardier (owner, 2026-11-24): every Bombardier-built family has its own models (`js/civil-variants.js`); searching "Bombardier" lists them all. The CL-415 water bomber sits in "Military transport & tankers" (closest category).
- Header back / home buttons (owner, 2026-11-24): back goes one step back inside the app (depth kept in `history.state.d`), or clears browse filters; home clears filters and goes to the start page. Both are hidden on the unfiltered start page; on narrow phones the "Hangar" word hides while they show.
- iPhone notch (owner, 2026-11-24): the home-screen app draws under the status bar (`black-translucent`), so anything at the top must add `env(safe-area-inset-top)`: the header, sticky chips and the photo viewer's close button do.
- Freighters (owner, 2026-11-24): category `freighter` (777F, A350F). An aircraft whose Wikipedia article is shared with other versions can set `photo` (a Commons file name, used for its card, hero and first gallery photo with credit) and `photoNote` (shown with the photos, e.g. when the photo is of a related version). Status `Development` ("In development") is for aircraft not yet in service; their target figures carry a *.
- Helicopters (owner, 2026-11-24): split into three categories, each with at least 10 of the most popular types: `attackheli` "Attack & scout helicopters", `milheli` "Military transport & utility helicopters" (incl. heavy lift and naval; the V-22 is also here), `civilheli` "Civil & light helicopters" (training, private, air ambulance, offshore). The old `helicopter` id is gone.
