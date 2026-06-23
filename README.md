# Product Pagination Demo

A small Express + PostgreSQL project that demonstrates cursor pagination over a large products table, with a static frontend served by the backend.

## Requirements

- Node.js 18+
- PostgreSQL

## Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` from `backend/.env.example` and set `DATABASE_URL` for your local PostgreSQL database.

3. Create the table and indexes:

   ```bash
   npm run setup
   ```

4. Seed products:

   ```bash
   npm run seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open http://localhost:3000 in your browser.

## API

`GET /products?limit=20&category=Books&cursorUpdatedAt=...&cursorId=...`

Returns:

```json
{
  "products": [],
  "nextCursor": null
}
```

Use `nextCursor.updatedAt` and `nextCursor.id` as the next request cursor.
