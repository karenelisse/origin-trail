import { z } from "zod";

export const productLookupSchema = z.object({
  name: z.string().trim().min(1),
  brand: z.string().trim().min(1).optional(),
});

export type ProductLookup = z.infer<typeof productLookupSchema>;
