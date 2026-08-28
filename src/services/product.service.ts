import { supabase } from "../config/supabase.js";
import type { OriginTrailResult } from "../models/origin-trail.js";

export async function findProduct(
  name: string,
  brand?: string,
) {
  let query = supabase
    .from("products")
    .select(`
      *,
      product_sources (*),
      product_origins (
        *,
        product_sources (*)
      ),
      product_identifiers (*)
    `)
    .ilike("name", name);

  if (brand) {
    query = query.ilike("brand", brand);
  }

  const { data, error } = await query
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to find product: ${error.message}`,
    );
  }

  return data;
}

export async function saveProduct(
  result: OriginTrailResult,
) {
  const now = new Date().toISOString();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: result.product.name,
      brand: result.product.brand,

      brand_hq_country:
        result.brand.headquarters?.country ?? null,
      brand_hq_state_region:
        result.brand.headquarters?.stateRegion ?? null,
      brand_hq_city_town:
        result.brand.headquarters?.cityTown ?? null,

      parent_company: result.parentCompany.name,
      parent_hq_country:
        result.parentCompany.headquarters?.country ?? null,
      parent_hq_state_region:
        result.parentCompany.headquarters?.stateRegion ?? null,
      parent_hq_city_town:
        result.parentCompany.headquarters?.cityTown ?? null,

      parent_company_confidence:
        result.parentCompany.confidence,

      notes: result.notes,

      checked_at: now,
    })
    .select()
    .single();

  if (productError) {
    throw new Error(
      `Unable to save product: ${productError.message}`,
    );
  }

  /*
   * Brand and parent-company sources describe the product generally,
   * so they are attached directly to the product rather than to a
   * specific origin.
   */
  const productSources = [
    ...result.brand.sources.map((source) => ({
      product_id: product.id,
      product_origin_id: null,
      section: "brand",
      title: source.title,
      url: source.url,
      source_type: source.sourceType,
    })),

    ...result.parentCompany.sources.map((source) => ({
      product_id: product.id,
      product_origin_id: null,
      section: "parent_company",
      title: source.title,
      url: source.url,
      source_type: source.sourceType,
    })),
  ];

  if (productSources.length > 0) {
    const { error: sourcesError } = await supabase
      .from("product_sources")
      .insert(productSources);

    if (sourcesError) {
      throw new Error(
        `Unable to save product sources: ${sourcesError.message}`,
      );
    }
  }

  /*
   * Each manufacturing or growing origin gets its own database row.
   *
   * We save them one at a time because we need the generated origin ID
   * before we can attach that origin's sources.
   */
  for (const origin of result.production.origins) {
    const { data: savedOrigin, error: originError } =
      await supabase
        .from("product_origins")
        .insert({
          product_id: product.id,
          origin_type: origin.type,
          producer: origin.producer,

          country: origin.location?.country ?? null,
          state_region: origin.location?.stateRegion ?? null,
          city_town: origin.location?.cityTown ?? null,

          market: origin.market,
          confidence: origin.confidence,

          checked_at: now,
        })
        .select()
        .single();

    if (originError) {
      throw new Error(
        `Unable to save product origin: ${originError.message}`,
      );
    }

    if (origin.sources.length === 0) {
      continue;
    }

    const originSources = origin.sources.map((source) => ({
      product_id: product.id,
      product_origin_id: savedOrigin.id,
      section: "production",
      title: source.title,
      url: source.url,
      source_type: source.sourceType,
    }));

    const { error: originSourcesError } = await supabase
      .from("product_sources")
      .insert(originSources);

    if (originSourcesError) {
      throw new Error(
        `Unable to save product origin sources: ${originSourcesError.message}`,
      );
    }
  }

  return product;
}
