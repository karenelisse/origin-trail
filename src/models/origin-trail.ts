import { z } from "zod";

export const locationSchema = z.object({
  country: z.string().nullable(),
  stateRegion: z.string().nullable(),
  cityTown: z.string().nullable(),
});

export const confidenceSchema = z.enum(["high", "medium", "low", "unknown"]);

export const originTrailResultSchema = z.object({
  product: z.object({
    name: z.string(),
    brand: z.string().nullable(),
  }),
  production: z.object({
    manufacturer: z.string().nullable(),
    manufacturingLocation: locationSchema.nullable(),
    growingLocation: locationSchema.nullable(),
    confidence: confidenceSchema,
  }),
  brand: z.object({
    name: z.string().nullable(),
    headquarters: locationSchema.nullable(),
  }),
  parentCompany: z.object({
    name: z.string().nullable(),
    headquarters: locationSchema.nullable(),
    confidence: confidenceSchema,
  }),
  notes: z.array(z.string()),
});

export type OriginTrailResult = z.infer<typeof originTrailResultSchema>;
