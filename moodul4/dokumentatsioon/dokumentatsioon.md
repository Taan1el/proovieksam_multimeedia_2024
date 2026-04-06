# Moodul 4 – dokumentatsioon (custom backend)

**Õpilane:** Taaniel Vananurm · **Rühm:** MM-23  
**Projekt:** NEXUS tiimileht + e-pood + kontakt.

**Viide juhendile:** *MULTIMEEDIA EKSAM 2024* (IV osa: Custom Backend). Juhendifail on repositooriumis: `docs/MULTIMEEDIA EKSAM 2024.pdf`.

**Eesmärk:** Täita juhendi **kohandatud backend** haru nõuded (keele põhjendus, andmebaas/struktuur, Moodul 3 vaadete tõlgendus, admin CRUD, töötav kontakt, installijuhend, Git).

---

## 1. Keele valik (lühike põhjendus)

**Node.js (JavaScript)** valiti, sest:

- **Express** võimaldab kiiresti luua marsruudid (avalik pood, admin, API).
- **EJS** mallid sobivad Moodul 3 HTML-lehtede struktuuri kandmiseks serveripoolele.
- Üks keel (JS) kliendi ja serveri vahel vähendab kontekstivahetust prototüübis.

**Andmesalvestus:** kerge **failipõhine** `db.json` (JSON-fail kettal), mitte relatsiooniline andmebaas – prototüüp on lihtne ja ei vaja Windowsis C++ kompileeritud SQLite mooduleid. Struktuur on kirjeldatud allpool kui **andmemudel**.

---

## 2. Andmebaasi struktuur (andmemudel)

**Fail:** `moodul4/backend/db.json`

| Kogum | Väljad |
|-------|--------|
| `products` | `id`, `created_at`, `name`, `description`, `price`, `category`, `sizes`, `colors` |
| `product_images` | `id`, `product_id`, `path` (nt `/uploads/filename`) |
| `contacts` | `id`, `created_at`, `name`, `email`, `message` |
| `_nextId` | autonumbrid uute kirjete jaoks |

---

## 3. Moodul 3 vaadete tõlgendamine backendis

| Moodul 3 (staatiline) | Backend (Express + EJS) |
|------------------------|-------------------------|
| `index.html` – tiim, tulemused, meened | Ei ole 1:1 kopeeritud; backend suunab `/` → `/shop` (e-pood kui sisu keskmes) |
| `shop.html` – e-pood, filtrid | `GET /shop` – päringuparameetrid: `category`, `sort`, `maxPrice` |
| `product.html` – detail, karussell | `GET /product/:id` – toode + `product_images` massiiv, mallis karussell |
| `contact.html` – vorm | `GET /contact` + `POST /contact` (vorm); `POST /api/contact` (JSON, nt Moodul 3 + `fetch`) |

---

## 4. Admin

- **Login / logout:** `/admin/login`, sessioon `express-session` (saladus `.env` → `SESSION_SECRET`).
- **Toodete CRUD:** `/admin/products` (lisamine, muutmine, kustutamine, piltide üleslaadimine).
- **Kontaktid:** `/admin/contacts` – loeb `contacts` kirjeid.

---

## 5. Kontaktide salvestus

`insertContact()` lisab `contacts` massiivi uue kirje väljadega `id`, `created_at`, `name`, `email`, `message`. Salvestus toimub `db.json` faili uuesti kirjutamise teel.

---

## 6. Vastavus eksami nõuetele (custom backend – kokkuvõte)

| Nõue | Täitmine |
|------|----------|
| Keele põhjendus | § 1 |
| Andmebaasi / andmemudel | § 2 (`db.json`) |
| Moodul 3 ja backendi seos | § 3 |
| Admin login | § 4 |
| Toodete lisamine / muutmine / kustutamine | § 4, admin marsruudid |
| Kontaktivorm (päriselt salvestab) | `POST /contact`, `POST /api/contact`, `contacts` |
| Installijuhend + tarkvara | `moodul4/installijuhend.txt`, juur `README.md` |
| Git link | `moodul4/git-link.txt` *(õpilane täidab)* |

---

## 7. Install

Vaata `moodul4/installijuhend.txt` ja repositooriumi juurkausta **`README.md`** (ainus README).
