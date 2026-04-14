import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { db, ensureSchema, ensureAdmin } from './src/db.js';
import { requireAuth } from './src/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');
const catalogDir = path.join(publicDir, 'catalog');
const teamDir = path.join(publicDir, 'team');

const FEATURE_ORDER = [
  'NEXUS Tee (Black)',
  'NEXUS Tee (Green)',
  'NEXUS Cap',
  'NEXUS Mouse',
  'NEXUS Mug',
  'NEXUS Tee (White)',
];

const TEAM_PLAYERS = [
  { image: '/team/team-1.png', alt: 'Marten Kask player portrait' },
  { image: '/team/team-2.png', alt: 'Laura Pold player portrait' },
  { image: '/team/team-3.png', alt: 'Andres Vaher player portrait' },
  { image: '/team/team-4.png', alt: 'Kati Roos player portrait' },
  { image: '/team/team-5.png', alt: 'Tonis Laan player portrait' },
];

const GAMES = [
  { logo: '/games/ea-sports-fc.svg', title: 'EA SPORTS FC', copy: 'Fast tempo, pressure play and set-piece discipline.' },
  { logo: '/games/rocket-league.svg', title: 'Rocket League', copy: 'Mechanical reads, rotations and aerial control.' },
  { logo: '/games/counter-strike-2.svg', title: 'Counter-Strike 2', copy: 'Default structure, site hits and clutch-heavy executes.' },
  { logo: '/games/valorant.svg', title: 'Valorant', copy: 'Utility layering, map control and late-round composure.' },
];

const RECENT_MATCHES = [
  { date: '10.09.2024', opponent: 'ALPHA FC', venue: 'Home', score: '3 - 1', result: 'WIN' },
  { date: '18.09.2024', opponent: 'Storm United', venue: 'Away', score: '1 - 2', result: 'LOSS' },
  { date: '25.09.2024', opponent: 'Vega Sports', venue: 'Home', score: '2 - 2', result: 'DRAW' },
  { date: '02.10.2024', opponent: 'Titan XI', venue: 'Home', score: '4 - 0', result: 'WIN' },
  { date: '15.10.2024', opponent: 'Nordex FC', venue: 'Away', score: '2 - 1', result: 'WIN' },
];

const STANDINGS = [
  { rank: 1, team: 'NEXUS', played: 12, wins: 8, draws: 2, losses: 2, points: 26, highlight: true },
  { rank: 2, team: 'Titan XI', played: 12, wins: 7, draws: 1, losses: 4, points: 22 },
  { rank: 3, team: 'Nordex FC', played: 12, wins: 6, draws: 3, losses: 3, points: 21 },
  { rank: 4, team: 'ALPHA FC', played: 12, wins: 5, draws: 2, losses: 5, points: 17 },
  { rank: 5, team: 'Storm United', played: 12, wins: 3, draws: 2, losses: 7, points: 11 },
];

const FEATURED_MATCH = {
  title: 'NEXUS vs TITAN XI',
  copy: 'Prime division playoff night. Map pool locked, jersey drop live, stream opens at 19:30.',
  meta: ['18 OCT', 'TALLINN STAGE', '19:30 EET'],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfMissing(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath) || fs.existsSync(targetPath)) return;
  fs.copyFileSync(sourcePath, targetPath);
}

function ensurePublicAssets() {
  ensureDir(publicDir);
  ensureDir(uploadDir);
  ensureDir(catalogDir);
  ensureDir(teamDir);

  const catalogSource = path.join(projectRoot, 'moodul2', 'used_files');
  [
    'cap_mockup.jpg',
    'mouse_mockup.jpg',
    'mug_mockup.jpg',
    'tshirt_mockup_black.jpg',
    'tshirt_mockup_green.jpg',
    'tshirt_mockup_white.jpg',
  ].forEach((file) => {
    copyIfMissing(path.join(catalogSource, file), path.join(catalogDir, file));
  });

  const teamSource = path.join(projectRoot, 'moodul3', 'assets', 'img', 'team');
  ['team-1.svg', 'team-2.svg', 'team-3.svg', 'team-4.svg', 'team-5.svg', 'team-1.png', 'team-2.png', 'team-3.png', 'team-4.png', 'team-5.png'].forEach((file) => {
    copyIfMissing(path.join(teamSource, file), path.join(teamDir, file));
  });
}

function buildCatalogProducts() {
  const products = db.allProducts().map((product) => ({
    ...product,
    images: db.getProductImages(product.id),
  }));

  products.sort((a, b) => {
    const aIdx = FEATURE_ORDER.indexOf(a.name);
    const bIdx = FEATURE_ORDER.indexOf(b.name);
    const safeA = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx;
    const safeB = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx;
    return safeA - safeB;
  });

  return products.map((product) => ({
    ...product,
    thumb: product.images[0]?.path || null,
  }));
}

ensurePublicAssets();
ensureSchema();
ensureAdmin();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
}));

const upload = multer({ dest: uploadDir });

app.get('/', (req, res) => {
  const products = buildCatalogProducts();
  res.render('home', {
    user: req.session.user,
    featuredProducts: products.slice(0, 4),
    players: TEAM_PLAYERS,
    games: GAMES,
    recentMatches: RECENT_MATCHES,
    standings: STANDINGS,
    featuredMatch: FEATURED_MATCH,
  });
});

app.get('/shop', (req, res) => {
  let products = buildCatalogProducts();

  const category = String(req.query.category || 'all').toLowerCase();
  const sort = String(req.query.sort || 'name');
  const maxPrice = Number(req.query.maxPrice || 9999);

  if (category !== 'all') {
    products = products.filter((product) => String(product.category || '').toLowerCase() === category);
  }
  products = products.filter((product) => Number(product.price) <= maxPrice);

  if (sort === 'price-asc') products.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sort === 'price-desc') products.sort((a, b) => Number(b.price) - Number(a.price));
  else products.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  res.render('shop', { products, user: req.session.user, query: req.query });
});

app.get('/product/:id', (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).send('Not found');
  const images = db.getProductImages(product.id);
  res.render('product', { product, images, user: req.session.user });
});

app.get('/contact', (req, res) => {
  res.render('contact', { ok: req.query.ok, user: req.session.user, errors: {} });
});

function validateContactBody(body) {
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();
  const errors = {};
  if (!name) errors.name = 'Name is required';
  if (!email || !email.includes('@')) errors.email = 'Valid e-mail is required';
  if (!message || message.length < 10) errors.message = 'Message must be at least 10 characters';
  return { name, email, message, errors };
}

app.post('/contact', (req, res) => {
  const { name, email, message, errors } = validateContactBody(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).render('contact', { ok: false, user: req.session.user, errors });
  }

  db.insertContact({ name, email, message });
  res.redirect('/contact?ok=1');
});

app.post('/api/contact', (req, res) => {
  const { name, email, message, errors } = validateContactBody(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });
  db.insertContact({ name, email, message });
  res.json({ ok: true });
});

app.get('/admin/login', (req, res) => res.render('admin/login', { error: null }));
app.post('/admin/login', (req, res) => {
  const email = (req.body.email || '').trim();
  const password = (req.body.password || '').trim();
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPassword) {
    req.session.user = { email };
    return res.redirect('/admin/products');
  }

  res.status(401).render('admin/login', { error: 'Wrong e-mail or password' });
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/admin/products', requireAuth, (req, res) => {
  const products = buildCatalogProducts();
  res.render('admin/products/index', { products, user: req.session.user });
});

app.get('/admin/products/create', requireAuth, (req, res) => {
  res.render('admin/products/form', { product: null, images: [], errors: {}, user: req.session.user });
});

app.post('/admin/products', requireAuth, upload.array('images', 6), (req, res) => {
  const { name, description, price, category, sizes, colors } = req.body;
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required';
  if (!description?.trim()) errors.description = 'Description is required';
  if (!price || Number(price) <= 0) errors.price = 'Price must be greater than 0';
  if (!category?.trim()) errors.category = 'Category is required';

  if (Object.keys(errors).length) {
    return res.status(400).render('admin/products/form', { product: req.body, images: [], errors, user: req.session.user });
  }

  const product = db.insertProduct({
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    sizes: (sizes || '').trim(),
    colors: (colors || '').trim(),
  });

  for (const file of (req.files || [])) {
    db.addImage(product.id, '/uploads/' + path.basename(file.path));
  }

  res.redirect('/admin/products');
});

app.get('/admin/products/:id/edit', requireAuth, (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).send('Not found');
  const images = db.getProductImages(product.id);
  res.render('admin/products/form', { product, images, errors: {}, user: req.session.user });
});

app.post('/admin/products/:id', requireAuth, upload.array('images', 6), (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).send('Not found');

  const { name, description, price, category, sizes, colors } = req.body;
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required';
  if (!description?.trim()) errors.description = 'Description is required';
  if (!price || Number(price) <= 0) errors.price = 'Price must be greater than 0';
  if (!category?.trim()) errors.category = 'Category is required';

  if (Object.keys(errors).length) {
    const images = db.getProductImages(product.id);
    return res.status(400).render('admin/products/form', {
      product: { ...product, ...req.body },
      images,
      errors,
      user: req.session.user,
    });
  }

  db.updateProduct(product.id, {
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    sizes: (sizes || '').trim(),
    colors: (colors || '').trim(),
  });

  for (const file of (req.files || [])) {
    db.addImage(product.id, '/uploads/' + path.basename(file.path));
  }

  res.redirect('/admin/products');
});

app.post('/admin/products/:id/delete', requireAuth, (req, res) => {
  db.deleteProduct(req.params.id);
  res.redirect('/admin/products');
});

app.get('/admin/contacts', requireAuth, (req, res) => {
  const contacts = db.allContacts();
  res.render('admin/contacts', { contacts, user: req.session.user });
});

const port = Number(process.env.PORT || 3005);
app.listen(port, () => {
  console.log(`Moodul4 running on http://localhost:${port}`);
  console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@example.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
});
