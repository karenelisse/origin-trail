import express from "express";
import { env } from "./config/env.js";
import { productsRouter } from "./routes/products.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);

app.listen(env.PORT, () => {
  console.log(
    `Origin Trail running on http://localhost:${env.PORT}`,
  );
});
