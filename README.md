# Multimeedia proovieksam 2024

**Õpilane:** Taaniel Vananurm  
**Rühm:** MM-23  
**Tiim / bränd:** NEXUS (e-spordi võistkond)

---

## 1. Vastavus juhendile (I–IV moodul)

### I moodul (disain – Figma)

| Juhendis nõutud | Kus / märkus |
|-----------------|----------------|
| Logo / nimi / embleem | NEXUS + NX embleem avalehel (`index.html`, sektsioon „Identiteet“) |
| 4 alamlehte (mõte) | Avaleht, E-pood, Detail, Kontakt → `moodul3/*.html` |
| Menüü, footer | Nav + jalus (kontakt, e-post) |
| Avaleht: hero bänner | Suur pilt: `assets/img/hero-mockup.jpg` + tekst |
| Tiim: tutvustused + **pildid** | `assets/img/team-1.jpg` … `team-5.jpg` (kui puuduvad, initsiaalid) |
| Mängude nimekiri | Sektsioon **Võistlusmängud** (`#voistlusmangud`) |
| Viimaste võistluste tulemused | Tabelid (mängugraafik + liigaseis) |
| **Populaarsete meenete slaider** | Horisontaalne slaider + nooled (`#meened`) |
| Kavandi mõõdud (1920 / 375) | Responsiivne CSS; mobiilimenüü |
| Font + värvid | Syne / DM Sans; värvitabel embleemi juures |

**Moodul 1 väljund:** `moodul1/` – Figma `.fig`, kaustad `export pildid/`, `kasutatud assetid/` (täida esitamisel).

### II moodul (tootefotod jms)

**Juhend:** embleem + 3 värvi T-särki, hiir, müts, kruus; trükikõlblik logo; zip **`moodul2`**.  
**Väljund:** `moodul2/raw`, `used_files`, `print`, `final_renders`.

### III moodul (HTML / CSS / JS)

| Juhendis nõutud | Täitmine |
|-----------------|----------|
| Vastab kavandile | NEXUS kujundus (`nexus.css`, `pages.css`) |
| **Lingitavad lingid** | Kõik navi lingid töötavad; partialite `fetch` puudub (`file://` OK) |
| Semantiline, seadmetundlik | `lang="et"`, landmarkid; `@media` mobiilile |
| E-shop: meened, hinnad, **kategooria + filtrid + sort** | `shop.html` + `main.js` |
| Detail: **karussell**, nimi, kirjeldus, suurus/värv | `product.html` |
| Kontaktivorm | `contact.html` (+ backend Moodul 4) |

**Väljund:** `moodul3/` (zip nimega `moodul3`).

### IV moodul – **Custom backend** (mitte CMS)

| Juhendis nõutud | Täitmine |
|-----------------|----------|
| Keele valik + põhjendus (≈ pool lk) | `moodul4/dokumentatsioon/dokumentatsioon.md` |
| Andmebaasi struktuur (+ dump / migratsioon kui vaja) | `db.json` + kirjeldus dokumentatsioonis |
| Moodul 3 HTML/CSS/JS **vaadetena** | Express + EJS (`moodul4/backend/views/`) |
| Admin: **login**, toodete **CRUD**, väljad (nimi, kirjeldus, pildid, suurused, värvid) | `/admin/*` |
| Kontaktivorm **päriselt** | `POST /contact`, `POST /api/contact` → `contacts` |
| Installatsioonijuhend + tarkvara nimekiri | `moodul4/installijuhend.txt` + see README |
| Git + **link tekstifailina zipis** | `moodul4/git-link.txt` *(täida URL-iga)* |
| Väljund zip **`moodul4`** | `moodul4/backend`, dokumentatsioon, juhend, git-link |

**Moodul 4 kaust:**

| Fail / kaust | Sisu |
|--------------|------|
| `backend/` | Lähtekood (`server.js`, `src/db.js`, vaated, `db.json`) |
| `dokumentatsioon/dokumentatsioon.md` | Põhidokumentatsioon (soovitatav lugemine) |
| `dokumentatsioon/dokumentatsioon.docx` | Wordi variant (kui esitad) |
| `installijuhend.txt` | Paigaldus ja URL-id |
| `git-link.txt` | Git repositooriumi URL |

---

## 2. Kiirkäivitus

### Moodul 3 (staatiline)

Ava `moodul3/index.html` või:

```bash
cd moodul3
npx --yes serve -l 5173
```

### Moodul 4 (Node)

```bash
cd moodul4/backend
npm install
copy .env.example .env
npm run dev
```

Brauser: **http://localhost:3005** (vt `.env`).


Avalik leht: **[https://Taan1el.github.io/proovieksam_multimeedia_2024/](https://Taan1el.github.io/proovieksam_multimeedia_2024/)** (pärast esimest edukat deploy’t).

1. **GitHub →** repo **[proovieksam_multimeedia_2024](https://github.com/Taan1el/proovieksam_multimeedia_2024)** → **Settings** → **Pages**.
2. **Build and deployment** → **Source**: vali **GitHub Actions** (mitte `Deploy from a branch`).
3. Pushi `main` harule — workflow `.github/workflows/deploy-github-pages.yml` laadib üles kausta `moodul3/` ja avaldab selle.
4. Oota **Actions** vaates rohelist märki; seejärel ava ülalolev URL.

---

## 3. Pildid (`moodul3/assets/img/`)

### E-poe mockupid (`assets/img/shop/`)

HTML viitab praegu **sinu Moodul 2 failidele** (nimed peavad kattuma):

| Toode | Failid |
|-------|--------|
| T-särgid (must / roheline / valge) | `tshirt_mockup_black.jpg` (või `.png`), `tshirt_mockup_green.*`, `tshirt_mockup_white.*` |
| Müts | `cap_mockup.jpg` või `cap_mockup.png` |
| Hiir | `mouse_mockup.jpg` või `mouse_mockup.png` |
| Kruus | `mug_mockup.jpg` või `mug_mockup.png` |
| Logo (valikuline) | `Logo.png` |



**Tiim:** kui lisad `team-1.jpg` … `team-5.jpg` kausta `assets/img/`, laadivad need; muidu jäävad initsiaalid.

`<img>` kasutab `onerror`-iga `.png` varuvarianti, kui `.jpg` puudub.

---


## 4. Tehnoloogiad (lühidalt)

- **Moodul 3:** HTML5, CSS3, JS (ilma kohustusliku bundlerita).
- **Moodul 4:** Node.js, Express, EJS, express-session, multer, failipõhine **`db.json`** (kerge prototüüp, ilma eraldi SQL serverita).
