export async function resolveProductOrigin(
  input: ProductLookup,
): Promise<OriginTrailResult> {
  console.log("1. Looking for existing product");

  const existingProduct = await findProduct(
    input.name,
    input.brand,
  );

  console.log(
    "2. Existing product:",
    existingProduct?.id ?? "none",
  );

  if (
    existingProduct &&
    isProductFresh(existingProduct)
  ) {
    console.log("3. Fresh cache hit");

    return mapProductToOriginTrailResult(existingProduct);
  }

  console.log("3. Cache miss or stale. Calling OpenAI");

  const response = await openai.responses.parse({
    model: env.OPENAI_MODEL,
    instructions,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Product name: ${input.name}\nBrand: ${
              input.brand ?? "Unknown"
            }`,
          },
        ],
      },
    ],
    tools: [{ type: "web_search" }],
    text: {
      format: zodTextFormat(
        originTrailResultSchema,
        "origin_trail_result",
      ),
    },
  });

  console.log("4. OpenAI response received");

  if (!response.output_parsed) {
    throw new Error(
      "OpenAI did not return a valid product origin result",
    );
  }

  console.log(
    "5. Saving product",
    existingProduct?.id ?? "new",
  );

  await saveProduct(
    response.output_parsed,
    existingProduct?.id,
  );

  console.log("6. Product saved");

  return response.output_parsed;
}
