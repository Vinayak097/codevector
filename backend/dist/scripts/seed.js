"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 5000;
const categories = [
    "Electronics",
    "Books",
    "Fashion",
    "Sports",
    "Home",
];
async function seed() {
    const start = Date.now();
    try {
        console.log("Clearing existing data...");
        await db_1.pool.query("TRUNCATE TABLE products RESTART IDENTITY");
        let counter = 1;
        for (let offset = 0; offset < TOTAL_PRODUCTS; offset += BATCH_SIZE) {
            const products = [];
            for (let j = 0; j < BATCH_SIZE; j++) {
                const createdAt = new Date(Date.now() -
                    Math.floor(Math.random() *
                        365 *
                        24 *
                        60 *
                        60 *
                        1000));
                const updatedAt = new Date(createdAt.getTime() +
                    Math.floor(Math.random() *
                        (Date.now() - createdAt.getTime())));
                products.push({
                    name: `Product ${counter}`,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    price: Math.floor(Math.random() * 5000) + 100,
                    created_at: createdAt,
                    updated_at: updatedAt,
                });
                counter++;
            }
            const values = [];
            const placeholders = [];
            products.forEach((product, index) => {
                const base = index * 5;
                placeholders.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5})`);
                values.push(product.name, product.category, product.price, product.created_at, product.updated_at);
            });
            await db_1.pool.query(`
        INSERT INTO products
        (
          name,
          category,
          price,
          created_at,
          updated_at
        )
        VALUES
        ${placeholders.join(",")}
        `, values);
            console.log(`Inserted ${Math.min(offset + BATCH_SIZE, TOTAL_PRODUCTS)}/${TOTAL_PRODUCTS}`);
        }
        const result = await db_1.pool.query("SELECT COUNT(*) FROM products");
        console.log(`Seed completed. Total rows: ${result.rows[0].count}`);
        console.log(`Time Taken: ${(Date.now() - start) / 1000}s`);
    }
    catch (error) {
        console.error("Seed failed:", error);
        console.error("seed error ", error?.message);
    }
    finally {
        await db_1.pool.end();
    }
}
seed();
//# sourceMappingURL=seed.js.map