"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
const product_service_1 = require("../services/product.service");
async function getProducts(req, res) {
    try {
        const limit = Number(req.query.limit) || 20;
        const category = typeof req.query.category === "string"
            ? req.query.category
            : undefined;
        const cursorUpdatedAt = typeof req.query.cursorUpdatedAt === "string"
            ? req.query.cursorUpdatedAt
            : undefined;
        const cursorId = typeof req.query.cursorId === "string"
            ? Number(req.query.cursorId)
            : undefined;
        const params = {
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
        const result = await (0, product_service_1.getProductsService)(params);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}
//# sourceMappingURL=product.controller.js.map