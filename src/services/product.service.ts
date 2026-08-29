import { supabase } from "../config/supabase.js";
import type { OriginTrailResult } from "../models/origin-trail.js";
import type {
  InactivateProductOptions,
  ProductWithRelations,
} from "../models/product.js";

export async function findProduct(
  name: string,
  brand?: string,
): Promise<ProductWithRelations | null> {
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
    .ilike("name", name)
    .is("inactive_at", null);

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

  return data as ProductWithRelations | null;
}

export async function saveProduct(
  result: OriginTrailResult,
  existingProductId?: string,
) {
  const now = new Date().toISOString();

  const productData = {
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

    updated_at: now,
    checked_at: now,
  };

  let product;

  if (existingProductId) {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", existingProductId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Unable to update product: ${error.message}`,
      );
    }

    product = data;

    const { error: sourcesDeleteError } = await supabase
      .from("product_sources")
      .delete()
      .eq("product_id", product.id);

    if (sourcesDeleteError) {
      throw new Error(
        `Unable to remove old product sources: ${sourcesDeleteError.message}`,
      );
    }

    const { error: originsDeleteError } = await supabase
      .from("product_origins")
      .delete()
      .eq("product_id", product.id);

    if (originsDeleteError) {
      throw new Error(
        `Unable to remove old product origins: ${originsDeleteError.message}`,
      );
    }
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Unable to save product: ${error.message}`,
      );
    }

    product = data;
  }

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

  for (const origin of result.production.origins) {
    const { data: savedOrigin, error: originError } =
      await supabase
        .from("product_origins")
        .insert({
          product_id: product.id,
          origin_type: origin.type,
          producer: origin.producer,

          country: origin.location?.country ?? null,
          state_region:
            origin.location?.stateRegion ?? null,
          city_town:
            origin.location?.cityTown ?? null,

          market: origin.market,
          confidence: origin.confidence,

          updated_at: now,
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

export async function inactivateProduct(
  productId: string,
  options: InactivateProductOptions,
) {
  const requiresMergeTarget =
    options.reason === "duplicate" ||
    options.reason === "merged";

  if (requiresMergeTarget && !options.mergedIntoProductId) {
    throw new Error(
      `A canonical product is required when marking a product as ${options.reason}`,
    );
  }

  if (
    options.mergedIntoProductId &&
    options.mergedIntoProductId === productId
  ) {
    throw new Error(
      "A product cannot be merged into itself",
    );
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update({
      inactive_at: now,
      inactive_reason: options.reason,
      inactive_notes: options.notes ?? null,
      merged_into_product_id:
        options.mergedIntoProductId ?? null,
      updated_at: now,
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Unable to mark product inactive: ${error.message}`,
    );
  }

  return data;
}

export async function reactivateProduct(
  productId: string,
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update({
      inactive_at: null,
      inactive_reason: null,
      inactive_notes: null,
      merged_into_product_id: null,
      updated_at: now,
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Unable to reactivate product: ${error.message}`,
    );
  }

  return data;
}
