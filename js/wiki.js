/* Photos and intro text from Wikipedia / Wikimedia Commons (CORS via origin=*).
 * Results are cached in localStorage for 14 days. */
(function () {
  const H = window.HANGAR;
  const API = 'https://en.wikipedia.org/w/api.php';
  const TTL = 14 * 24 * 3600 * 1000;
  const mem = new Map();

  function cacheGet(key) {
    if (mem.has(key)) return mem.get(key);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (Date.now() - o.t > TTL) return null;
      mem.set(key, o.d);
      return o.d;
    } catch (e) { return null; }
  }
  function cacheSet(key, d) {
    mem.set(key, d);
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); }
    catch (e) {
      // Storage full: drop old gallery entries and retry once.
      try {
        Object.keys(localStorage).filter(k => k.startsWith('hangar-gal:')).forEach(k => localStorage.removeItem(k));
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), d }));
      } catch (e2) {}
    }
  }

  async function query(params) {
    const url = API + '?' + new URLSearchParams(Object.assign({ format: 'json', formatversion: '2', origin: '*' }, params));
    const r = await fetch(url);
    if (!r.ok) throw new Error('Wikipedia ' + r.status);
    return r.json();
  }

  // Map each requested title to the page that answered it (normalised + redirects).
  function resolver(q) {
    const norm = {}, redir = {};
    (q.normalized || []).forEach(x => { norm[x.from] = x.to; });
    (q.redirects || []).forEach(x => { redir[x.from] = x.to; });
    return t => { let s = norm[t] || t; s = redir[s] || s; return s; };
  }

  const stripHtml = s => (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  const BAD = /(\.svg|logo|flag|map|diagram|icon|emblem|insignia|roundel|seal|badge|patch|chart|drawing|3[- ]?view|silhouette|schematic|blueprint|graph|commons-|wiki|symbol|coat[_ ]of|crest|signature|portrait|stamp|coin|cutaway|outline|line[_ ]art|layout|seatmap|seat[_ ]map|ogg|webm|tif$|\.gif)/i;

  const W = {
    /* Grid thumbnails for many titles at once. Returns {wikiTitle: url}. */
    async thumbs(titles, size) {
      size = size || 500;
      const key = 'hangar-thumbs-' + size;
      const cached = cacheGet(key) || {};
      const missing = titles.filter(t => !(t in cached));
      for (let i = 0; i < missing.length; i += 50) {
        const batch = missing.slice(i, i + 50);
        try {
          const data = await query({ action: 'query', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(size), redirects: '1', titles: batch.map(t => t.replace(/_/g, ' ')).join('|') });
          const q = data.query || {};
          const res = resolver(q);
          const byTitle = {};
          (q.pages || []).forEach(p => { if (p.thumbnail) byTitle[p.title] = p.thumbnail.source; });
          batch.forEach(t => { cached[t] = byTitle[res(t.replace(/_/g, ' '))] || null; });
        } catch (e) { console.warn('[Hangar] thumbs failed', e); }
      }
      if (missing.length) cacheSet(key, cached);
      return cached;
    },

    /* Lead image, intro text and page URL for one article. */
    async info(title) {
      const key = 'hangar-info:' + title;
      const c = cacheGet(key);
      if (c) return c;
      const data = await query({ action: 'query', prop: 'pageimages|extracts|info', piprop: 'thumbnail|name', pithumbsize: '1280', exintro: '1', explaintext: '1', exsentences: '4', inprop: 'url', redirects: '1', titles: title.replace(/_/g, ' ') });
      const p = (data.query && data.query.pages && data.query.pages[0]) || {};
      const d = { image: p.thumbnail ? p.thumbnail.source : null, imageName: p.pageimage || null, extract: p.extract || '', url: p.fullurl || ('https://en.wikipedia.org/wiki/' + title) };
      cacheSet(key, d);
      return d;
    },

    /* Photo gallery from the article's images, with credit and licence. */
    async gallery(title) {
      const key = 'hangar-gal:' + title;
      const c = cacheGet(key);
      if (c) return c;
      const data = await query({ action: 'query', generator: 'images', gimlimit: 'max', redirects: '1', titles: title.replace(/_/g, ' '), prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1280', iiextmetadatafilter: 'Artist|LicenseShortName|ImageDescription' });
      const pages = (data.query && data.query.pages) || [];
      const list = [];
      pages.forEach(p => {
        const ii = p.imageinfo && p.imageinfo[0];
        if (!ii) return;
        if (!/jpe?g|webp/.test(ii.mime || '')) return;
        if (BAD.test(p.title)) return;
        if ((ii.width || 0) < 800 || (ii.height || 0) < 450) return;
        const m = ii.extmetadata || {};
        list.push({
          name: p.title.replace(/^File:/, ''),
          src: ii.thumburl || ii.url,
          page: ii.descriptionurl,
          w: ii.thumbwidth || ii.width, h: ii.thumbheight || ii.height,
          artist: stripHtml(m.Artist && m.Artist.value).slice(0, 120),
          license: stripHtml(m.LicenseShortName && m.LicenseShortName.value),
          caption: stripHtml(m.ImageDescription && m.ImageDescription.value).slice(0, 200)
        });
      });
      const out = list.slice(0, 40);
      cacheSet(key, out);
      return out;
    },

    /* One named Commons file, in the gallery's format (for aircraft with their own photo). */
    async file(name) {
      const key = 'hangar-file:' + name;
      const c = cacheGet(key);
      if (c) return c;
      const data = await query({ action: 'query', titles: 'File:' + name, prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1280', iiextmetadatafilter: 'Artist|LicenseShortName|ImageDescription' });
      const p = (data.query && data.query.pages && data.query.pages[0]) || {};
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii) return null;
      const m = ii.extmetadata || {};
      const d = { name, src: ii.thumburl || ii.url, page: ii.descriptionurl, w: ii.thumbwidth || ii.width, h: ii.thumbheight || ii.height,
        artist: stripHtml(m.Artist && m.Artist.value).slice(0, 120), license: stripHtml(m.LicenseShortName && m.LicenseShortName.value),
        caption: stripHtml(m.ImageDescription && m.ImageDescription.value).slice(0, 200) };
      cacheSet(key, d);
      return d;
    },

    /* A Commons file at a given width (redirects to the image). */
    filePath(name, width) {
      return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(name.replace(/ /g, '_')) + '?width=' + width;
    },

    /* A smaller version of a Commons thumbnail URL. */
    resize(url, width) {
      if (!url) return url;
      return url.replace(/\/(\d+)px-([^/]+)$/, '/' + width + 'px-$2');
    }
  };

  H.wiki = W;
})();
