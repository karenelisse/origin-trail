export const PRODUCT_INACTIVE_REASONS = [
  "duplicate",
  "merged",
  "acquired",
  "discontinued",
  "replaced",
  "invalid",
  "other",
] as const;

export type ProductInactiveReason =
  (typeof PRODUCT_INACTIVE_REASONS)[number];

export type ProductOriginType =
  | "manufacturing"
  | "growing";

export type ProductConfidence =
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type ProductSourceType =
  | "official_company"
  | "manufacturer"
  | "government"
  | "retailer"
  | "news"
  | "other";

export interface ProductSource {
  id: string;
  product_id: string;
  product_origin_id: string | null;

  section: string;
  title: string | null;
  url: string;
  source_type: ProductSourceType;

  created_at: string;
}

export interface ProductOrigin {
  id: string;
  product_id: string;

  origin_type: ProductOriginType;
  producer: string | null;

  country: string | null;
  state_region: string | null;
  city_town: string | null;

  market: string | null;
  confidence: ProductConfidence;

  created_at: string;
  updated_at: string;
  checked_at: string;

  product_sources?: ProductSource[];
}

export interface ProductIdentifier {
  id: string;
  product_id: string;

  identifier_type: string;
  value: string;
  market: string | null;

  created_at: string;
}

export interface Product {
  id: string;

  name: string;
  brand: string | null;

  brand_hq_country: string | null;
  brand_hq_state_region: string | null;
  brand_hq_city_town: string | null;

  parent_company: string | null;
  parent_hq_country: string | null;
  parent_hq_state_region: string | null;
  parent_hq_city_town: string | null;
  parent_company_confidence: ProductConfidence;

  notes: string[];

  created_at: string;
  updated_at: string;
  checked_at: string;

  inactive_at: string | null;
  inactive_reason: ProductInactiveReason | null;
  inactive_notes: string | null;
  merged_into_product_id: string | null;
}

export interface ProductWithRelations extends Product {
  product_sources: ProductSource[];
  product_origins: ProductOrigin[];
  product_identifiers: ProductIdentifier[];
}

export interface InactivateProductOptions {
  reason: ProductInactiveReason;
  notes?: string;
  mergedIntoProductId?: string;
}
