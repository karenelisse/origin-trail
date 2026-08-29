import type { OriginTrailResult } from "../models/origin-trail.js";
import type {
  ProductOrigin,
  ProductSource,
  ProductWithRelations,
} from "../models/product.js";

function mapLocation(
  country: string | null,
  stateRegion: string | null,
  cityTown: string | null,
) {
  if (!country && !stateRegion && !cityTown) {
    return null;
  }

  return {
    country,
    stateRegion,
    cityTown,
  };
}

function mapSource(source: ProductSource) {
  return {
    title: source.title,
    url: source.url,
    sourceType: source.source_type,
  };
}

function mapOrigin(origin: ProductOrigin) {
  return {
    type: origin.origin_type,
    producer: origin.producer,
    location: mapLocation(
      origin.country,
      origin.state_region,
      origin.city_town,
    ),
    market: origin.market,
    confidence: origin.confidence,
    sources: (origin.product_sources ?? []).map(mapSource),
  };
}

export function mapProductToOriginTrailResult(
  product: ProductWithRelations,
): OriginTrailResult {
  const brandSources = product.product_sources
    .filter(
      (source) =>
        source.product_origin_id === null &&
        source.section === "brand",
    )
    .map(mapSource);

  const parentCompanySources = product.product_sources
    .filter(
      (source) =>
        source.product_origin_id === null &&
        source.section === "parent_company",
    )
    .map(mapSource);

  return {
    product: {
      name: product.name,
      brand: product.brand,
    },

    production: {
      origins: product.product_origins.map(mapOrigin),
    },

    brand: {
      name: product.brand,
      headquarters: mapLocation(
        product.brand_hq_country,
        product.brand_hq_state_region,
        product.brand_hq_city_town,
      ),
      sources: brandSources,
    },

    parentCompany: {
      name: product.parent_company,
      headquarters: mapLocation(
        product.parent_hq_country,
        product.parent_hq_state_region,
        product.parent_hq_city_town,
      ),
      confidence: product.parent_company_confidence,
      sources: parentCompanySources,
    },

    notes: product.notes ?? [],
  };
}
