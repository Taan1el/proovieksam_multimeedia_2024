import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'db.json');

const DEFAULT_PRODUCTS = [
  {
    name: 'NEXUS Tee (Black)',
    description: 'Cotton jersey with the core NX mark and a stage-ready finish.',
    price: 29,
    category: 'tshirt',
    sizes: 'S, M, L, XL',
    colors: 'Black, Green, White',
    images: ['/catalog/tshirt_mockup_black.jpg', '/catalog/tshirt_mockup_green.jpg', '/catalog/tshirt_mockup_white.jpg'],
  },
  {
    name: 'NEXUS Mouse',
    description: 'Precision mouse with NX branding for the full setup.',
    price: 49,
    category: 'mouse',
    sizes: 'Standard',
    colors: 'Black',
    images: ['/catalog/mouse_mockup.jpg'],
  },
  {
    name: 'NEXUS Cap',
    description: 'Snapback cap with embroidered NX branding.',
    price: 24,
    category: 'hat',
    sizes: 'One size',
    colors: 'Black',
    images: ['/catalog/cap_mockup.jpg'],
  },
  {
    name: 'NEXUS Mug',
    description: '330 ml ceramic mug for the desk or stream room.',
    price: 18,
    category: 'mug',
    sizes: '330 ml',
    colors: 'Matte black',
    images: ['/catalog/mug_mockup.jpg'],
  },
  {
    name: 'NEXUS Tee (Green)',
    description: 'Limited away colorway with the same NX front emblem.',
    price: 31,
    category: 'tshirt',
    sizes: 'S, M, L, XL',
    colors: 'Green',
    images: ['/catalog/tshirt_mockup_green.jpg', '/catalog/tshirt_mockup_black.jpg', '/catalog/tshirt_mockup_white.jpg'],
  },
  {
    name: 'NEXUS Tee (White)',
    description: 'Clean alt edition for everyday wear and event days.',
    price: 35,
    category: 'tshirt',
    sizes: 'S, M, L, XL',
    colors: 'White',
    images: ['/catalog/tshirt_mockup_white.jpg', '/catalog/tshirt_mockup_black.jpg', '/catalog/tshirt_mockup_green.jpg'],
  },
];

function emptyDb() {
  return {
    products: [],
    product_images: [],
    contacts: [],
    _nextId: { products: 1, product_images: 1, contacts: 1 },
  };
}

function readDb() {
  if (!fs.existsSync(dbPath)) return emptyDb();
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

function ensureCounters(data) {
  if (!data._nextId) data._nextId = { products: 1, product_images: 1, contacts: 1 };
  data._nextId.products = Math.max(data._nextId.products || 1, ...data.products.map((p) => Number(p.id) + 1), 1);
  data._nextId.product_images = Math.max(data._nextId.product_images || 1, ...data.product_images.map((p) => Number(p.id) + 1), 1);
  data._nextId.contacts = Math.max(data._nextId.contacts || 1, ...data.contacts.map((c) => Number(c.id) + 1), 1);
}

function seedDefaultProducts(data) {
  DEFAULT_PRODUCTS.forEach((seed) => {
    const existing = data.products.find((product) => product.name === seed.name);
    if (existing) {
      existing.description = existing.description || seed.description;
      existing.price = existing.price || seed.price;
      existing.category = existing.category || seed.category;
      existing.sizes = existing.sizes || seed.sizes;
      existing.colors = existing.colors || seed.colors;
      return;
    }

    const id = data._nextId.products++;
    data.products.push({
      id,
      created_at: new Date().toISOString(),
      name: seed.name,
      description: seed.description,
      price: seed.price,
      category: seed.category,
      sizes: seed.sizes,
      colors: seed.colors,
    });
  });
}

function seedDefaultImages(data) {
  DEFAULT_PRODUCTS.forEach((seed) => {
    const product = data.products.find((item) => item.name === seed.name);
    if (!product) return;

    const existingPaths = new Set(
      data.product_images
        .filter((image) => String(image.product_id) === String(product.id))
        .map((image) => image.path)
    );

    seed.images.forEach((imagePath) => {
      if (existingPaths.has(imagePath)) return;
      data.product_images.push({
        id: data._nextId.product_images++,
        product_id: Number(product.id),
        path: imagePath,
      });
    });
  });
}

export const db = {
  allProducts() {
    const data = readDb();
    return [...data.products].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  getProduct(id) {
    const data = readDb();
    return data.products.find((product) => String(product.id) === String(id)) || null;
  },
  getProductImages(productId) {
    const data = readDb();
    return data.product_images
      .filter((image) => String(image.product_id) === String(productId))
      .sort((a, b) => a.id - b.id);
  },
  insertProduct(product) {
    const data = readDb();
    const id = data._nextId.products++;
    const row = { id, created_at: new Date().toISOString(), ...product };
    data.products.push(row);
    writeDb(data);
    return row;
  },
  updateProduct(id, patch) {
    const data = readDb();
    const idx = data.products.findIndex((product) => String(product.id) === String(id));
    if (idx === -1) return null;
    data.products[idx] = { ...data.products[idx], ...patch };
    writeDb(data);
    return data.products[idx];
  },
  deleteProduct(id) {
    const data = readDb();
    data.products = data.products.filter((product) => String(product.id) !== String(id));
    data.product_images = data.product_images.filter((image) => String(image.product_id) !== String(id));
    writeDb(data);
    return true;
  },
  addImage(productId, imagePath) {
    const data = readDb();
    const id = data._nextId.product_images++;
    data.product_images.push({ id, product_id: Number(productId), path: imagePath });
    writeDb(data);
    return id;
  },
  allContacts() {
    const data = readDb();
    return [...data.contacts].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  insertContact(contact) {
    const data = readDb();
    const id = data._nextId.contacts++;
    data.contacts.push({ id, created_at: new Date().toISOString(), ...contact });
    writeDb(data);
    return id;
  },
};

export function ensureSchema() {
  const data = readDb();
  ensureCounters(data);
  seedDefaultProducts(data);
  seedDefaultImages(data);
  ensureCounters(data);
  writeDb(data);
}

export function ensureAdmin() {
  return true;
}
