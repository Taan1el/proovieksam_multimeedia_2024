function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

const MERCH_PLACEHOLDER = './assets/img/shop/merch-placeholder.svg';

/** Tooteleht: ?id=tee-black | tee-green | tee-white | cap | mouse | mug */
const PRODUCT_CATALOG = {
  'tee-black': {
    title: 'NEXUS Tee (Black)',
    price: 29,
    desc: 'Puuvill, NX logo, limiteeritud seeria.',
    images: ['tshirt_mockup_black.jpg', 'tshirt_mockup_green.jpg', 'tshirt_mockup_white.jpg'],
    showSize: true,
    showColor: true,
  },
  'tee-green': {
    title: 'NEXUS Tee (Green)',
    price: 31,
    desc: 'Puuvill, NX logo, limiteeritud seeria.',
    images: ['tshirt_mockup_green.jpg', 'tshirt_mockup_black.jpg', 'tshirt_mockup_white.jpg'],
    showSize: true,
    showColor: true,
  },
  'tee-white': {
    title: 'NEXUS Tee (White)',
    price: 35,
    desc: 'Puuvill, NX logo, limiteeritud seeria.',
    images: ['tshirt_mockup_white.jpg', 'tshirt_mockup_black.jpg', 'tshirt_mockup_green.jpg'],
    showSize: true,
    showColor: true,
  },
  cap: {
    title: 'NEXUS Cap',
    price: 24,
    desc: 'Snapback, NX logo.',
    images: ['cap_mockup.jpg'],
    showSize: false,
    showColor: false,
  },
  mouse: {
    title: 'NEXUS Mouse',
    price: 49,
    desc: 'Optiline sensor, graveeritud logo.',
    images: ['mouse_mockup.jpg'],
    showSize: false,
    showColor: false,
  },
  mug: {
    title: 'NEXUS Mug',
    price: 18,
    desc: '330 ml, keraamika.',
    images: ['mug_mockup.jpg'],
    showSize: false,
    showColor: false,
  },
};

(() => {
  const root = qs('[data-product-page]');
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  let id = params.get('id') || 'tee-black';
  if (!PRODUCT_CATALOG[id]) id = 'tee-black';
  const p = PRODUCT_CATALOG[id];

  document.title = `${p.title} – NEXUS`;

  const titleEl = qs('[data-product-title]');
  const priceEl = qs('[data-product-price]');
  const descEl = qs('[data-product-desc]');
  if (titleEl) titleEl.textContent = p.title;
  if (priceEl) priceEl.textContent = `€${p.price}`;
  if (descEl) descEl.textContent = p.desc;

  const sizeRow = qs('[data-product-size-row]');
  const colorRow = qs('[data-product-color-row]');
  if (sizeRow) sizeRow.hidden = !p.showSize;
  if (colorRow) colorRow.hidden = !p.showColor;

  const main = qs('[data-carousel-main]', root);
  const thumbsRoot = qs('[data-product-thumbs]', root);
  const err = `this.onerror=null;this.src='${MERCH_PLACEHOLDER}'`;
  if (main && p.images && p.images.length) {
    main.innerHTML = p.images
      .map((fn) => `<img src="./assets/img/shop/${fn}" alt="" onerror="${err}" />`)
      .join('');
  }
  if (thumbsRoot && p.images && p.images.length) {
    thumbsRoot.innerHTML = p.images
      .map(
        (fn, i) =>
          `<button type="button" data-car-thumb="${i}"><img src="./assets/img/shop/${fn}" alt="" onerror="${err}" /></button>`
      )
      .join('');
  }
})();

// Mobile nav (works with file:// and http://)
(() => {
  const btn = qs('[data-nav-toggle]');
  const links = qs('[data-nav-links]');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('is-open'));
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => links.classList.remove('is-open'));
  });
})();

// Avalehe meenete slaider (scroll; ulatub ainult [data-merch-slider] sisse)
(() => {
  const root = qs('[data-merch-slider]');
  if (!root) return;
  const track = qs('[data-merch-track]', root);
  if (!track) return;
  const step = () => Math.min(track.clientWidth * 0.85, 320);
  root.querySelector('[data-merch-prev]')?.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  root.querySelector('[data-merch-next]')?.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });
})();

// Meme slider
(() => {
  const slider = qs('[data-slider]');
  if (!slider) return;
  const slides = qs('.slides', slider);
  const items = qsa('.slide', slider);
  let idx = 0;

  function render() {
    slides.style.transform = `translateX(${-idx * 100}%)`;
  }
  qs('[data-prev]', slider)?.addEventListener('click', () => {
    idx = (idx - 1 + items.length) % items.length;
    render();
  });
  qs('[data-next]', slider)?.addEventListener('click', () => {
    idx = (idx + 1) % items.length;
    render();
  });
  render();
})();

// Shop filters (pure frontend demo)
(() => {
  const grid = qs('[data-products]');
  if (!grid) return;

  const chips = qsa('[data-chip]');
  const sort = qs('[data-sort]');
  const price = qs('[data-price]');

  function syncPriceRangeFill() {
    if (!price) return;
    const min = Number(price.getAttribute('min') ?? 0);
    const max = Number(price.getAttribute('max') ?? 100);
    const val = Number(price.value);
    const pct = max <= min ? 100 : ((val - min) / (max - min)) * 100;
    price.style.setProperty('--range-fill', `${pct}%`);
  }

  const cards = qsa('[data-product]', grid).map((el) => ({
    el,
    category: el.getAttribute('data-category'),
    price: Number(el.getAttribute('data-price') || 0),
    name: el.getAttribute('data-name') || ''
  }));

  let activeCat = 'all';
  function apply() {
    const maxPrice = Number(price?.value || 9999);
    const filtered = cards.filter(c =>
      (activeCat === 'all' || c.category === activeCat) &&
      c.price <= maxPrice
    );

    // hide/show
    cards.forEach(c => c.el.style.display = 'none');
    filtered.forEach(c => c.el.style.display = '');

    // sort within DOM (only visible ones)
    const mode = sort?.value || 'name';
    filtered.sort((a, b) => {
      if (mode === 'price-asc') return a.price - b.price;
      if (mode === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    filtered.forEach(c => grid.appendChild(c.el));
  }

  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    ch.classList.add('active');
    activeCat = ch.getAttribute('data-chip') || 'all';
    apply();
  }));
  sort?.addEventListener('change', apply);
  price?.addEventListener('input', () => {
    const label = qs('[data-price-label]');
    if (label) label.textContent = `≤ €${price.value}`;
    syncPriceRangeFill();
    apply();
  });
  syncPriceRangeFill();
  apply();
})();

// Product detail image carousel (Moodul 3 static)
(() => {
  const imgs = qsa('[data-carousel-main] img');
  if (!imgs.length) return;
  const thumbs = qsa('[data-car-thumb]');
  let idx = 0;
  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    imgs.forEach((el, j) => el.classList.toggle('is-active', j === idx));
  }
  qs('[data-car-prev]')?.addEventListener('click', () => show(idx - 1));
  qs('[data-car-next]')?.addEventListener('click', () => show(idx + 1));
  thumbs.forEach((btn, j) => btn.addEventListener('click', () => show(j)));
  show(0);
})();

// Product detail options (demo)
(() => {
  const root = qs('[data-product-detail]');
  if (!root) return;
  function makeExclusive(sel) {
    const opts = qsa(sel, root);
    opts.forEach(o => o.addEventListener('click', () => {
      opts.forEach(x => x.classList.remove('active'));
      o.classList.add('active');
    }));
  }
  makeExclusive('[data-size]');
  makeExclusive('[data-color]');
})();

// Contact form: validatsioon; kui on data-contact-api ja http, proovi POST; muidu edukas teade
(() => {
  const form = qs('[data-contact]');
  if (!form) return;
  const status = qs('[data-status]', form);
  const apiUrl = form.getAttribute('data-contact-api');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    qsa('[data-error]', form).forEach(x => x.textContent = '');

    const name = qs('[name=name]', form).value.trim();
    const email = qs('[name=email]', form).value.trim();
    const msg = qs('[name=message]', form).value.trim();
    let ok = true;

    if (!name) { qs('[data-error=name]', form).textContent = 'Nimi on kohustuslik'; ok = false; }
    if (!email || !email.includes('@')) { qs('[data-error=email]', form).textContent = 'Kehtiv e-post on kohustuslik'; ok = false; }
    if (!msg || msg.length < 10) { qs('[data-error=message]', form).textContent = 'Sõnum peab olema vähemalt 10 tähemärki'; ok = false; }

    if (!ok) return;

    if (apiUrl && window.location.protocol !== 'file:') {
      if (status) status.textContent = 'Saadan…';
      try {
        const r = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message: msg }),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.ok) {
          if (status) status.textContent = 'Aitäh! Sõnum on kätte saadud.';
          form.reset();
          return;
        }
        if (status) status.textContent = data.errors ? 'Kontrolli välju.' : 'Aitäh! Võtame peagi ühendust.';
        form.reset();
        return;
      } catch {
        if (status) status.textContent = 'Aitäh! Võtame peagi ühendust.';
        form.reset();
        return;
      }
    }

    if (status) status.textContent = 'Aitäh! Võtame peagi ühendust.';
    form.reset();
  });
})();
