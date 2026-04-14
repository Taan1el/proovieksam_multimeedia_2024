# Module 4 documentation

**Student:** Taaniel Vananurm  
**Group:** MM-23  
**Project:** NEXUS esports site

## Chosen variant

For module 4 I chose the **Custom Backend** variant from the exam brief.

The PDF allows two different directions:
- CMS
- Custom Backend

I continued with the custom backend route because I already had the full static site from module 3 and it was more logical to translate that design into real backend views, add an admin side, and connect the contact form and product data to stored records.

## Language choice

I built the backend with **Node.js and JavaScript**, using **Express** for routing and **EJS** for server-rendered views.

Why I chose this stack:
- JavaScript is already used in the frontend part of the project, so one language is enough for both sides.
- Express is lightweight and fast to set up for public pages, admin pages, forms, and routing.
- EJS made it simple to turn the module 3 HTML structure into backend views without rebuilding the whole design from zero.
- The stack is easy to run locally and does not need a heavy server setup for a project of this size.

Advantages:
- quick development
- simple routing and form handling
- easy to keep the module 3 frontend and module 4 backend visually similar
- easy local setup for the examiner

Disadvantages:
- this project uses a lightweight file-based storage solution, so it is not as scalable as a full SQL setup
- Node.js and Express do not give as much built-in structure as some larger frameworks
- for a bigger production shop I would prefer a stronger database layer and stricter validation

## Database structure

The backend stores data in `moodul4/backend/db.json`.

This file acts as the data dump for the project and contains:

- `products`
  - `id`
  - `created_at`
  - `name`
  - `description`
  - `price`
  - `category`
  - `sizes`
  - `colors`
- `product_images`
  - `id`
  - `product_id`
  - `path`
- `contacts`
  - `id`
  - `created_at`
  - `name`
  - `email`
  - `message`
- `_nextId`
  - counters for new rows

The product and image split makes it possible to store multiple images for one product, which was required for the product detail view.

## Translation of module 3 into backend views

The static pages from module 3 were translated into backend views:

- `index.html` -> `/`
- `shop.html` -> `/shop`
- `product.html` -> `/product/:id`
- `contact.html` -> `/contact`

The backend keeps the same visual identity:
- same logo and color direction
- same esports landing-page style
- same store and product-detail structure
- same contact page idea

This means module 4 follows the brief requirement to translate the module 3 HTML, CSS, and JS into views that the backend uses.

## Public side

The public side contains:

- `/` home page
- `/shop` product listing
- `/product/:id` product detail page
- `/contact` contact form page
- `/api/contact` JSON endpoint for form submissions from the static module 3 version

The product page supports:
- multiple product images
- product name
- description
- sizes
- colors

## Admin side

The admin side includes the required logic and views:

- login
- product list
- add product form
- edit product form
- delete product action
- contact message view

The product forms support the required fields from the PDF:
- product name
- product description
- product images
- product sizes
- product colors

Additional data such as category and price are also included because they are useful for the store page.

## Contact form

The contact form works in the backend version.

When a user submits the form:
- the request is validated
- the message is saved into `db.json`
- the saved messages are visible in the admin area at `/admin/contacts`

So the form is not only visual - it actually stores usable data for the site administrator.

## Assets and product images

The backend copies and serves local assets from the project itself:
- product images are available in `moodul4/backend/public/catalog/`
- team images are available in `moodul4/backend/public/team/`
- game logos are available in `moodul4/backend/public/games/`
- the site logo is available in `moodul4/backend/public/nexus_logo.svg`

This keeps the backend self-contained and easy to run after installation.

## Install and testing

The installation guide is in:
- `moodul4/installijuhend.txt`

The Git repository link is included in:
- `moodul4/git-link.txt`

Routes that can be checked quickly in the browser:
- `/`
- `/shop`
- `/product/1`
- `/contact`
- `/admin/login`
- `/admin/products`
- `/admin/contacts`

## Final note

This module follows the **Custom Backend** branch of the exam brief:
- custom backend language chosen and explained
- data structure included
- module 3 translated into backend views
- admin logic created
- product add/edit/delete supported
- contact form works
- install guide included
- Git link included
