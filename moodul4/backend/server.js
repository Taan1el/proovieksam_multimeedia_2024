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

const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
}));

const upload = multer({ dest: path.join(__dirname, 'public', 'uploads') });

// Public
app.get('/', (req, res) => res.redirect('/shop'));

app.get('/shop', (req, res) => {
  let products = db.allProducts().map((p) => ({
    ...p,
    thumb: db.getProductImages(p.id)[0]?.path || null,
  }));

  const cat = String(req.query.category || 'all').toLowerCase();
  const sort = String(req.query.sort || 'name');
  const maxPrice = Number(req.query.maxPrice || 9999);

  if (cat !== 'all') {
    products = products.filter((p) => String(p.category || '').toLowerCase() === cat);
  }
  products = products.filter((p) => Number(p.price) <= maxPrice);

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
  if (!name) errors.name = 'Nimi on kohustuslik';
  if (!email || !email.includes('@')) errors.email = 'Kehtiv e-post on kohustuslik';
  if (!message || message.length < 10) errors.message = 'Sõnum peab olema vähemalt 10 tähemärki';
  return { name, email, message, errors };
}

app.post('/contact', (req, res) => {
  const { name, email, message, errors } = validateContactBody(req.body);
  if (Object.keys(errors).length) return res.status(400).render('contact', { ok: false, user: req.session.user, errors });

  db.insertContact({ name, email, message });
  res.redirect('/contact?ok=1');
});

app.post('/api/contact', (req, res) => {
  const { name, email, message, errors } = validateContactBody(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });
  db.insertContact({ name, email, message });
  res.json({ ok: true });
});

// Auth
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
  res.status(401).render('admin/login', { error: 'Vale e-post või parool' });
});
app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/shop'));
});

// Admin products CRUD
app.get('/admin/products', requireAuth, (req, res) => {
  const products = db.allProducts();
  res.render('admin/products/index', { products, user: req.session.user });
});

app.get('/admin/products/create', requireAuth, (req, res) => {
  res.render('admin/products/form', { product: null, images: [], errors: {}, user: req.session.user });
});

app.post('/admin/products', requireAuth, upload.array('images', 6), (req, res) => {
  const { name, description, price, category, sizes, colors } = req.body;
  const errors = {};
  if (!name?.trim()) errors.name = 'Nimi on kohustuslik';
  if (!description?.trim()) errors.description = 'Kirjeldus on kohustuslik';
  if (!price || Number(price) <= 0) errors.price = 'Hind peab olema suurem kui 0';
  if (!category?.trim()) errors.category = 'Kategooria on kohustuslik';

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

  for (const f of (req.files || [])) {
    db.addImage(product.id, '/uploads/' + path.basename(f.path));
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
  if (!name?.trim()) errors.name = 'Nimi on kohustuslik';
  if (!description?.trim()) errors.description = 'Kirjeldus on kohustuslik';
  if (!price || Number(price) <= 0) errors.price = 'Hind peab olema suurem kui 0';
  if (!category?.trim()) errors.category = 'Kategooria on kohustuslik';

  if (Object.keys(errors).length) {
    const images = db.getProductImages(product.id);
    return res.status(400).render('admin/products/form', { product: { ...product, ...req.body }, images, errors, user: req.session.user });
  }

  db.updateProduct(product.id, {
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    sizes: (sizes || '').trim(),
    colors: (colors || '').trim(),
  });

  for (const f of (req.files || [])) {
    db.addImage(product.id, '/uploads/' + path.basename(f.path));
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

