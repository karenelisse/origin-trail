import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { env } from "../config/env.js";
import {
  OriginTrailResult,
  originTrailResultSchema,
} from "../models/origin-trail.js";
import { ProductLookup } from "../models/product-lookup.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function resolveProductOrigin(
  input: ProductLookup,
): Promise<OriginTrailResult> {
  const response = await openai.responses.parse({
    model: env.OPENAI_MODEL,
    instructions: `
You are the product provenance resolver for Origin Trail.

Origin Trail helps consumers understand where products are produced and where the companies behind them are located.

Determine, where reasonably possible:
- Product name
- Brand
- Manufacturer
- Manufacturing location
- Growing location for agricultural products
- Brand headquarters
- Ultimate parent company
- Parent company headquarters

Locations should be as precise as reliable information permits:
1. City or town
2. State, province, territory, or region
3. Country

Do not invent missing information. Return null when a location or company cannot be determined reliably.
Use unknown or low confidence when information is weak.
Do not treat headquarters as a manufacturing location.
Do not treat a barcode prefix as proof of manufacturing origin.
Return factual provenance only; do not make political or purchasing recommendations.
`,
    input: `Product name: ${input.name}\nBrand: ${input.brand ?? "Unknown"}`,
    text: {
      format: zodTextFormat(originTrailResultSchema, "origin_trail_result"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return a valid product result");
  }

  return response.output_parsed;
}
