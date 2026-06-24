import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { getProducts } from "./controllers/product.controller";

const app = express();
app.use(cors())
app.use(express.json());

app.get("/products", getProducts);

app.get("/",(req,res)=>{
    res.send("hello")
})

app.listen(8000, () => {
  console.log("Server running");
});