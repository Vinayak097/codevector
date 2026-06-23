"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./controllers/product.controller");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/products", product_controller_1.getProducts);
app.get("/", (req, res) => {
    res.send("hello");
});
app.listen(3000, () => {
    console.log("Server running");
});
//# sourceMappingURL=index.js.map