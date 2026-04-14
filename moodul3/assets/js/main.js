function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

const MERCH_PLACEHOLDER = './assets/img/shop/merch-placeholder.svg';

const PRODUCT_CATALOG = {
  'tee-black': {
    title: 'NEXUS Tee (Black)',
    price: 29,
    desc: 'Cotton jersey with the core NX mark and a stage-ready finish.',
    images: ['tshirt_mockup_black.jpg', 'tshirt_mockup_green.jpg', 'tshirt_mockup_white.jpg'],
    showSize: true,
    showColor: true,
  },
  'tee-green': {
    title: 'NEXUS Tee (Green)',
    price: 31,
    desc: 'Limited away colorway with the same NX front emblem.',
    images: ['tshirt_mockup_green.jpg', 'tshirt_mockup_black.jpg', 'tshirt_mockup_white.jpg'],
    showSize: true,
    showColor: true,
  },
  'tee-white': {
    title: 'NEXUS Tee (White)',
    price: 35,
    desc: 'Clean alt edition for everyday wear and event days.',
    images: ['tshirt_mockup_white.jpg', 'tshirt_mockup_black.jpg', 'tshirt_mockup_green.jpg'],
    showSize: true,
    showColor: true,
  },
  cap: {
    title: 'NEXUS Cap',
    price: 24,
    desc: 'Snapback cap with embroidered NX branding.',
    images: ['cap_mockup.jpg'],
    showSize: false,
    showColor: false,
  },
  mouse: {
    title: 'NEXUS Mouse',
    price: 49,
    desc: 'Precision mouse with NX branding for the full setup.',
    images: ['mouse_mockup.jpg'],
    showSize: false,
    showColor: false,
  },
  mug: {
    title: 'NEXUS Mug',
    price: 18,
    desc: '330 ml ceramic mug for the desk or stream room.',
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
  const product = PRODUCT_CATALOG[id];

  document.title = `${product.title} - NEXUS`;

  const titleEl = qs('[data-product-title]');
  const priceEl = qs('[data-product-price]');
  const descEl = qs('[data-product-desc]');
  if (titleEl) titleEl.textContent = product.title;
  if (priceEl) priceEl.textContent = `EUR ${product.price}`;
  if (descEl) descEl.textContent = product.desc;

  const sizeRow = qs('[data-product-size-row]');
  const colorRow = qs('[data-product-color-row]');
  if (sizeRow) sizeRow.hidden = !product.showSize;
  if (colorRow) colorRow.hidden = !product.showColor;

  const main = qs('[data-carousel-main]', root);
  const thumbsRoot = qs('[data-product-thumbs]', root);
  const err = `this.onerror=null;this.src='${MERCH_PLACEHOLDER}'`;

  if (main && product.images.length) {
    main.innerHTML = product.images
      .map((file) => `<img src="./assets/img/shop/${file}" alt="" onerror="${err}">`)
      .join('');
  }

  if (thumbsRoot && product.images.length) {
    thumbsRoot.innerHTML = product.images
      .map((file, index) => `<button type="button" data-car-thumb="${index}"><img src="./assets/img/shop/${file}" alt="" onerror="${err}"></button>`)
      .join('');
  }
})();

(() => {
  const btn = qs('[data-nav-toggle]');
  const links = qs('[data-nav-links]');
  if (!btn || !links) return;

  btn.addEventListener('click', () => links.classList.toggle('is-open'));
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => links.classList.remove('is-open'));
  });
})();

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
    name: el.getAttribute('data-name') || '',
  }));

  let activeCat = 'all';

  function apply() {
    const maxPrice = Number(price?.value || 9999);
    const filtered = cards.filter((card) =>
      (activeCat === 'all' || card.category === activeCat) && card.price <= maxPrice
    );

    cards.forEach((card) => { card.el.style.display = 'none'; });
    filtered.forEach((card) => { card.el.style.display = ''; });

    const mode = sort?.value || 'name';
    filtered.sort((a, b) => {
      if (mode === 'price-asc') return a.price - b.price;
      if (mode === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    filtered.forEach((card) => grid.appendChild(card.el));
  }

  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
    activeCat = chip.getAttribute('data-chip') || 'all';
    apply();
  }));

  sort?.addEventListener('change', apply);
  price?.addEventListener('input', () => {
    const label = qs('[data-price-label]');
    if (label) label.textContent = `<= EUR ${price.value}`;
    syncPriceRangeFill();
    apply();
  });

  syncPriceRangeFill();
  apply();
})();

(() => {
  const imgs = qsa('[data-carousel-main] img');
  if (!imgs.length) return;

  const thumbs = qsa('[data-car-thumb]');
  let idx = 0;
  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    imgs.forEach((img, imageIndex) => img.classList.toggle('is-active', imageIndex === idx));
  }

  qs('[data-car-prev]')?.addEventListener('click', () => show(idx - 1));
  qs('[data-car-next]')?.addEventListener('click', () => show(idx + 1));
  thumbs.forEach((thumb, imageIndex) => thumb.addEventListener('click', () => show(imageIndex)));
  show(0);
})();

(() => {
  const root = qs('[data-product-detail]');
  if (!root) return;

  function makeExclusive(sel) {
    const opts = qsa(sel, root);
    opts.forEach((opt) => opt.addEventListener('click', () => {
      opts.forEach((item) => item.classList.remove('active'));
      opt.classList.add('active');
    }));
  }

  makeExclusive('[data-size]');
  makeExclusive('[data-color]');
})();

(() => {
  const form = qs('[data-contact]');
  if (!form) return;

  const status = qs('[data-status]', form);
  const apiUrl = form.getAttribute('data-contact-api');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    qsa('[data-error]', form).forEach((el) => { el.textContent = ''; });

    const name = qs('[name=name]', form).value.trim();
    const email = qs('[name=email]', form).value.trim();
    const message = qs('[name=message]', form).value.trim();
    let ok = true;

    if (!name) {
      qs('[data-error=name]', form).textContent = 'Name is required';
      ok = false;
    }
    if (!email || !email.includes('@')) {
      qs('[data-error=email]', form).textContent = 'Valid e-mail is required';
      ok = false;
    }
    if (!message || message.length < 10) {
      qs('[data-error=message]', form).textContent = 'Message must be at least 10 characters';
      ok = false;
    }

    if (!ok) return;

    if (apiUrl && window.location.protocol !== 'file:') {
      if (status) status.textContent = 'Sending...';
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.ok) {
          if (status) status.textContent = 'Thanks! Your message was sent.';
          form.reset();
          return;
        }

        if (status) status.textContent = data.errors ? 'Please check the form fields.' : 'Thanks! We will be in touch soon.';
        form.reset();
        return;
      } catch {
        if (status) status.textContent = 'Thanks! We will be in touch soon.';
        form.reset();
        return;
      }
    }

    if (status) status.textContent = 'Thanks! We will be in touch soon.';
    form.reset();
  });
})();

// Scroll reveal animations
(() => {
  const selectors = [
    '.nx-section h2',
    '.section-label',
    '.section-heading',
    '.section-copy',
    '.player-card',
    '.merch-card',
    '.merch-card--slide',
    '.games-table-wrap',
    '.game-title-list li',
    '.game-pill',
    '.stat',
    '.identity-grid',
    '.identity-card',
    '.emblem-card',
    '.palette-card',
    '.record-card',
    '.hero-stack-card',
    '[data-product]',
    '.card.form',
    '.card.toolbar',
    '.shop-toolbar',
    '.carousel-viewport',
    '.swatch-row',
    '.swatch',
  ];

  const els = qsa(selectors.join(','));
  if (!els.length) return;

  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = el.parentElement
          ? Array.from(el.parentElement.children).filter((c) => c.style.opacity === '0')
          : [];
        const idx = siblings.indexOf(el);
        const delay = Math.min(Math.max(idx, 0) * 90, 450);
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
  );

  els.forEach((el) => observer.observe(el));
})();
