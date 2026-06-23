import express from "express";

import { getProducts } from "./controllers/product.controller";

const app = express();

app.use(express.json());

app.get("/products", getProducts);
app.get("/",(req,res)=>{
    res.send("hello")
})

app.listen(3000, () => {
  console.log("Server running");
});