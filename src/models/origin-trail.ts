import { z } from "zod";

export const nullableStringSchema = z
  .string()
  .transform((value) => {
    const trimmed = value.trim();
    const normalized = trimmed.toLowerCase();

    if (
      trimmed === "" ||
      normalized === "null" ||
      normalized === "/null" ||
      normalized === "unknown"
    ) {
      return null;
    }

    return trimmed;
  })
  .nullable();

export const locationSchema = z.object({
  country: nullableStringSchema,
  stateRegion: nullableStringSchema,
  cityTown: nullableStringSchema,
});

export const confidenceSchema = z.enum([
  "high",
  "medium",
  "low",
  "unknown",
]);

export const sourceTypeSchema = z.enum([
  "official_company",
  "manufacturer",
  "government",
  "retailer",
  "news",
  "other",
]);

export const sourceSchema = z.object({
  title: nullableStringSchema,
  url: z.string(),
  sourceType: sourceTypeSchema,
});

export const originTrailResultSchema = z.object({
  product: z.object({
    name: z.string(),
    brand: nullableStringSchema,
  }),

  production: z.object({
    manufacturer: nullableStringSchema,
    manufacturingLocation: locationSchema.nullable(),
    growingLocation: locationSchema.nullable(),
    confidence: confidenceSchema,
    sources: z.array(sourceSchema),
  }),

  brand: z.object({
    name: nullableStringSchema,
    headquarters: locationSchema.nullable(),
    sources: z.array(sourceSchema),
  }),

  parentCompany: z.object({
    name: nullableStringSchema,
    headquarters: locationSchema.nullable(),
    confidence: confidenceSchema,
    sources: z.array(sourceSchema),
  }),

  notes: z.array(z.string()),
});

export type OriginTrailResult = z.infer<
  typeof originTrailResultSchema
>;
