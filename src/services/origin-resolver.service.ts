import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { env } from "../config/env.js";
import {
  OriginTrailResult,
  originTrailResultSchema,
} from "../models/origin-trail.js";
import { ProductLookup } from "../models/product-lookup.js";
import { instructions } from "./rules.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function resolveProductOrigin(
  input: ProductLookup,
): Promise<OriginTrailResult> {
  const response = await openai.responses.parse({
    model: env.OPENAI_MODEL,
    instructions,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Product name: ${input.name}\nBrand: ${input.brand ?? "Unknown"}`,
          },
        ],
      },
    ],
    tools: [
      {
        type: "web_search",
      },
    ],
    text: {
      format: zodTextFormat(
        originTrailResultSchema,
        "origin_trail_result",
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error(
      "OpenAI did not return a valid product provenance result",
    );
  }

  return response.output_parsed;
}
