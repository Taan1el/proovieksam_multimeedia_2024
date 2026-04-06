import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'db.json');

function readDb() {
  if (!fs.existsSync(dbPath)) {
    return { products: [], product_images: [], contacts: [], _nextId: { products: 1, product_images: 1, contacts: 1 } };
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  allProducts() {
    const data = readDb();
    return [...data.products].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  getProduct(id) {
    const data = readDb();
    return data.products.find(p => String(p.id) === String(id)) || null;
  },
  getProductImages(productId) {
    const data = readDb();
    return data.product_images.filter(i => String(i.product_id) === String(productId)).sort((a, b) => a.id - b.id);
  },
  insertProduct(p) {
    const data = readDb();
    const id = data._nextId.products++;
    const product = { id, created_at: new Date().toISOString(), ...p };
    data.products.push(product);
    writeDb(data);
    return product;
  },
  updateProduct(id, patch) {
    const data = readDb();
    const idx = data.products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;
    data.products[idx] = { ...data.products[idx], ...patch };
    writeDb(data);
    return data.products[idx];
  },
  deleteProduct(id) {
    const data = readDb();
    data.products = data.products.filter(p => String(p.id) !== String(id));
    data.product_images = data.product_images.filter(i => String(i.product_id) !== String(id));
    writeDb(data);
    return true;
  },
  addImage(productId, pathValue) {
    const data = readDb();
    const id = data._nextId.product_images++;
    data.product_images.push({ id, product_id: Number(productId), path: pathValue });
    writeDb(data);
    return id;
  },
  allContacts() {
    const data = readDb();
    return [...data.contacts].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  insertContact(c) {
    const data = readDb();
    const id = data._nextId.contacts++;
    data.contacts.push({ id, created_at: new Date().toISOString(), ...c });
    writeDb(data);
    return id;
  }
};

function seedProductsIfEmpty(data) {
  if (data.products && data.products.length > 0) return data;
  const seed = [
    {
      name: 'NEXUS Tee (Black)',
      description: 'Puuvill, NX logo, limiteeritud seeria.',
      price: 29,
      category: 'tshirt',
      sizes: 'S, M, L, XL',
      colors: 'Must, Roheline, Valge',
    },
    {
      name: 'NEXUS Mouse',
      description: 'Hiir embleemiga.',
      price: 49,
      category: 'mouse',
      sizes: '—',
      colors: 'Must',
    },
    {
      name: 'NEXUS Cap',
      description: 'Müts brodeeritud logoga.',
      price: 24,
      category: 'hat',
      sizes: 'Üks suurus',
      colors: 'Must',
    },
    {
      name: 'NEXUS Mug',
      description: 'Kruus 330 ml.',
      price: 18,
      category: 'mug',
      sizes: '—',
      colors: 'Must matt',
    },
  ];
  for (const p of seed) {
    const id = data._nextId.products++;
    data.products.push({ id, created_at: new Date().toISOString(), ...p });
  }
  return data;
}

export function ensureSchema() {
  let data = readDb();
  data = seedProductsIfEmpty(data);
  writeDb(data);
}

export function ensureAdmin() {
  // In this standard-level demo, admin is defined via ENV only.
  // This function exists so README matches behavior.
  return true;
}

