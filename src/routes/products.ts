import { Router } from "express";
import { productLookupSchema } from "../models/product-lookup.js";
import { resolveProductOrigin } from "../services/origin-resolver.service.js";

export const productsRouter = Router();

productsRouter.post("/resolve", async (req, res) => {
  const parsed = productLookupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid product lookup request",
      details: parsed.error.flatten(),
    });
  }

  try {
    const result = await resolveProductOrigin(parsed.data);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to resolve product origin" });
  }
});
