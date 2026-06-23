"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const items = Array.from({ length: 100 }, (_, index) => {
    const number = index + 1;
    return {
        slug: `item-${number}`,
        title: `Item ${number}`,
        body: `Seeded item ${number} for testing pagination.`,
    };
});
async function seed() {
    const client = await db_1.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_items_created_at_id
      ON items (created_at DESC, id DESC)
    `);
        await client.query(`
        INSERT INTO items (slug, title, body)
        SELECT *
        FROM UNNEST($1::text[], $2::text[], $3::text[])
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            body = EXCLUDED.body
      `, [
            items.map((item) => item.slug),
            items.map((item) => item.title),
            items.map((item) => item.body),
        ]);
        await client.query('COMMIT');
        console.log(`Seeded ${items.length} items`);
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
        await db_1.pool.end();
    }
}
seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map