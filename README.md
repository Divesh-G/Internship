# Internship — Clothing E-commerce

React frontend + Django REST backend for a clothing e-commerce app. Prices throughout are in **NPR (Nepali Rupees)**.

## Project layout

```
backend/     Django REST API (auth, catalog, cart, orders)
frontend/    React + Vite UI (products, cart, checkout, orders)
postman/     Postman collection + environment documenting every endpoint
```

## Running the backend

### Option A — Docker (recommended for the team)

Every team member runs the same Postgres + backend setup via Docker Compose — no local Postgres install needed, no "works on my machine" config drift.

1. Copy the env template: `cp .env.example .env` (defaults work out of the box).
2. From the repo root: `docker compose up --build`
3. API is at `http://localhost:8000/api/`, admin at `http://localhost:8000/admin/`.
4. Migrations run automatically on container start. Create an admin user:
   `docker compose exec backend python manage.py createsuperuser`
5. Load demo catalog data: `docker compose exec backend python manage.py seed_demo_data`

Postgres data persists in the `postgres_data` Docker volume across restarts. To reset the database: `docker compose down -v`.

### Option B — Local Python venv (no Docker/Postgres installed)

Falls back to SQLite, useful for quickly running the app on a machine without Docker.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt   #first time only 
$env:DB_ENGINE = "sqlite"
python manage.py migrate
python manage.py seed_demo_data #first time only
python manage.py createsuperuser #first time only 
python manage.py runserver
```

`DB_ENGINE=sqlite` is a local-only override in `backend/ecommerce/settings.py` — omit it (or unset it) to use Postgres as configured by `.env`/Docker.

## Running the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. It talks to the API at the URL in `frontend/.env` (`VITE_API_URL`, defaults to `http://localhost:8000/api`). The backend's CORS settings already allow `http://localhost:5173`.

## Database schema

The backend has four Django apps. `users` reuses Django's built-in `auth_user` table (id, username, email, password, first_name, last_name, date_joined) — no custom profile model.

### catalog

| Model | Key fields | Relationships |
|---|---|---|
| `Category` | `name` (unique), `slug` (unique) | has many `Product` |
| `Product` | `name`, `slug` (unique), `description`, `brand`, `price` (decimal), `is_active`, `created_at`/`updated_at` | belongs to `Category`; has many `ProductImage`, `ProductVariant` |
| `ProductImage` | `image`, `alt_text` | belongs to `Product` |
| `ProductVariant` | `sku` (unique), `size` (XS–XXL), `color`, `stock`, `price_override` (nullable, overrides product price) | belongs to `Product`; unique on (`product`, `size`, `color`) |

### cart

| Model | Key fields | Relationships |
|---|---|---|
| `Cart` | `created_at`/`updated_at` | one-to-one with `User` |
| `CartItem` | `quantity` | belongs to `Cart` and a `ProductVariant`; unique on (`cart`, `variant`) |

### orders

| Model | Key fields | Relationships |
|---|---|---|
| `Order` | `status` (pending/paid/shipped/delivered/cancelled), `shipping_address`, `shipping_city`, `shipping_postal_code`, `shipping_country`, `total` (decimal), `created_at`/`updated_at` | belongs to `User`; has many `OrderItem` |
| `OrderItem` | `product_name`, `size`, `color`, `unit_price`, `quantity` — a snapshot of the variant at purchase time | belongs to `Order` and references the `ProductVariant` it was bought from |

### Relationship overview

```
User 1──1 Cart 1──N CartItem N──1 ProductVariant N──1 Product N──1 Category
User 1──N Order 1──N OrderItem N──1 ProductVariant
                                              Product 1──N ProductImage
```

Checkout (`POST /api/orders/`) copies the current cart's items into `OrderItem` snapshots (name/size/color/price at time of purchase) and empties the cart — so later catalog price changes never alter historical orders.

### Demo data

`python manage.py seed_demo_data` (see `backend/apps/catalog/management/commands/seed_demo_data.py`) populates 3 categories and 4 products with variants and realistic NPR pricing (Rs 1,200–4,500), so a fresh database isn't empty. It's idempotent — safe to re-run.

## API documentation (Postman)

The `postman/` folder contains a Postman Collection covering every endpoint with example request payloads and example responses:

- `postman/Ecommerce-Clothing.postman_collection.json`
- `postman/Ecommerce-Local.postman_environment.json`

To use: open Postman → Import → select both files. Run **Auth → Register** or **Auth → Login** first; a test script automatically saves the returned JWT into the environment's `access_token` variable so every subsequent request authenticates automatically.

To turn this into a shared workspace for the frontend/backend teams: in Postman, create a free **Team Workspace**, import these two files into it, then invite teammates by email — everyone sees the same endpoint docs and can add example requests/comments as the API evolves.

### Endpoint summary

| Area | Method & Path | Notes |
|---|---|---|
| Auth | `POST /api/auth/register/` | Create user, returns JWT pair |
| Auth | `POST /api/auth/login/` | Returns JWT pair |
| Auth | `POST /api/auth/refresh/` | Exchange refresh token for new access token |
| Auth | `GET /api/auth/me/` | Current user |
| Catalog | `GET/POST /api/categories/`, `GET /api/categories/{slug}/` | |
| Catalog | `GET/POST /api/products/`, `GET/PATCH/DELETE /api/products/{slug}/` | Supports `?category__slug=`, `?search=`, `?ordering=` |
| Cart | `GET/DELETE /api/cart/` | View or clear current user's cart |
| Cart | `POST /api/cart/items/`, `PATCH/DELETE /api/cart/items/{id}/` | Add/update/remove a line item |
| Orders | `GET/POST /api/orders/` | List orders / checkout (creates order from cart) |
| Orders | `GET /api/orders/{id}/` | Order detail |
| Orders | `PATCH /api/orders/{id}/status/` | Admin-only status update |
