"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../db.js");
async function setup() {
    await db_js_1.pool.query(`
        CREATE TABLE IF NOT EXISTS products(
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL)`);
    await db_js_1.pool.query(`
        
        CREATE INDEX IF NOT EXISTS idx_products_pagination
        ON products(updated_at DESC, id DESC)`);
    console.log("setup is done ");
    await db_js_1.pool.end();
}
setup().catch(async (e) => {
    console.error(e);
    await db_js_1.pool.end();
});
//# sourceMappingURL=setup.js.map