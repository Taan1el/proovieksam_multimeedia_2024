# Module 4 - documentation

**Student:** Taaniel Vananurm  
**Group:** MM-23  
**Project:** NEXUS team site + store + contact backend

**Guide reference:** `MULTIMEEDIA EKSAM 2024.pdf`

## 1. Language choice

The backend is built with **Node.js (JavaScript)** because:
- Express makes it simple to build public routes, admin routes and form handling
- EJS fits well for translating the static Module 3 layouts into server-rendered views
- one language is used on both frontend and backend

## 2. Data model

Main data file: `moodul4/backend/db.json`

Collections:
- `products` - `id`, `created_at`, `name`, `description`, `price`, `category`, `sizes`, `colors`
- `product_images` - `id`, `product_id`, `path`
- `contacts` - `id`, `created_at`, `name`, `email`, `message`
- `_nextId` - counters for new records

The project uses a lightweight file-based JSON database instead of a separate SQL server.

## 3. Relation to Module 3

Module 3 static pages were translated into backend views:
- `index.html` -> `GET /`
- `shop.html` -> `GET /shop`
- `product.html` -> `GET /product/:id`
- `contact.html` -> `GET /contact` and `POST /contact`

The same visual direction is preserved:
- esports landing page
- store layout
- product detail page
- contact form

## 4. Public routes

- `/` - home page
- `/shop` - catalog with filter and sorting query parameters
- `/product/:id` - single product page with image gallery
- `/contact` - contact form
- `/api/contact` - JSON endpoint for contact submissions

## 5. Admin routes

- `/admin/login` - login page
- `/admin/logout` - logout action
- `/admin/products` - product list
- `/admin/products/new` - add product
- `/admin/products/:id/edit` - edit product
- `/admin/products/:id/delete` - delete product
- `/admin/contacts` - saved contact messages

## 6. Contact storage

Contact messages are stored in `db.json` using the `contacts` collection.  
Each message gets:
- `id`
- `created_at`
- `name`
- `email`
- `message`

## 7. Notes about assets

The backend uses local project assets:
- product images copied into `moodul4/backend/public/catalog/`
- team player cards copied into `moodul4/backend/public/team/`
- logo copied into `moodul4/backend/public/nexus_logo.svg`

This keeps the backend self-contained and ready to run after install.

## 8. Install

See:
- `moodul4/installijuhend.txt`
- root `README.md`
