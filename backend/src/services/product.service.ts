import { pool } from "../db";
interface GetProductsParams {
  limit: number;
  category?: string;
  cursorUpdatedAt?: string;
  cursorId?: number;
}

export async function getProductsService({
  limit,
  category,
  cursorUpdatedAt,
  cursorId,
}: GetProductsParams) {
  const values: unknown[] = [];
  const conditions: string[] = [];

  let paramIndex = 1;

  if (category) {
    conditions.push(`category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }

  if (cursorUpdatedAt && cursorId) {
    conditions.push(`
      (
        updated_at < $${paramIndex}
        OR
        (
          updated_at = $${paramIndex}
          AND id < $${paramIndex + 1}
        )
      )
    `);

    values.push(cursorUpdatedAt);
    values.push(cursorId);

    paramIndex += 2;
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  values.push(limit);

  const query = `
    SELECT *
    FROM products
    ${whereClause}
    ORDER BY updated_at DESC, id DESC
    LIMIT $${paramIndex}
  `;

  const result = await pool.query(query, values);

  const products = result.rows;

  let nextCursor = null;

  if (products.length > 0) {
    const lastProduct = products[products.length - 1];

    nextCursor = {
      updatedAt: lastProduct.updated_at,
      id: lastProduct.id,
    };
  }

  return {
    products,
    nextCursor,
  };
}





