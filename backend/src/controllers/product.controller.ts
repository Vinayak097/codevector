import { Request, Response } from "express";
import { getProductsService } from "../services/product.service";

export async function getProducts(
  req: Request,
  res: Response
) {
  try {
    const limit = Number(req.query.limit) || 20;

    const category =
      typeof req.query.category === "string"
        ? req.query.category
        : undefined;

    const cursorUpdatedAt =
      typeof req.query.cursorUpdatedAt === "string"
        ? req.query.cursorUpdatedAt
        : undefined;

    const cursorId =
      typeof req.query.cursorId === "string"
        ? Number(req.query.cursorId)
        : undefined;

    const params: Parameters<typeof getProductsService>[0] = {
      limit,
    };

    if (category !== undefined) {
      params.category = category;
    }

    if (cursorUpdatedAt !== undefined) {
      params.cursorUpdatedAt = cursorUpdatedAt;
    }

    if (cursorId !== undefined) {
      params.cursorId = cursorId;
    }

    const result = await getProductsService(params);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
