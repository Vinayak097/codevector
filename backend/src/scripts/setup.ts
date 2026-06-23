import {pool} from '../db.js'

async function setup(){
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products(
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL)`)
    
    await pool.query(`
        
        CREATE INDEX IF NOT EXISTS idx_products_pagination
        ON products(updated_at DESC, id DESC)`)
    
    console.log("setup is done ")

    await pool.end()
}

setup().catch(async e=>{
    console.error(e)
    await pool.end()
})
