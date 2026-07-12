// Shared TypeScript types for the listings platform

export type ListingType = "sale" | "rent" | "lease";
export type PropertyType =
  | "house"
  | "apartment"
  | "condo"
  | "townhouse"
  | "commercial"
  | "land"
  | "villa"
  | "studio";
export type ListingStatus = "draft" | "published" | "archived";

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  price: number;
  currency: string;
  price_period: "monthly" | "yearly" | null;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  lot_size_sqft: number | null;
  year_built: number | null;
  floors: number | null;
  parking_spaces: number | null;
  address: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  features: string[];
  image_urls: string[];
  floor_plan_urls: string[];
  video_url: string | null;
  ai_tags: string[];
  ai_summary: string | null;
  duplicate_of: string | null;
  agent_id: string | null;
  owner_id: string | null;
  view_count: number;
  inquiry_count: number;
  bookmark_count: number;
  average_rating: number;
  review_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Fields used when building filter queries
export interface ListingFilters {
  q?: string;
  listing_type?: ListingType;
  property_type?: PropertyType[];
  min_price?: number;
  max_price?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  city?: string;
  amenities?: string[];
  bounds?: { n: number; s: number; e: number; w: number };
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  page?: number;
  per_page?: number;
}

export interface Review {
  id: string;
  user_id: string;
  listing_id: string | null;
  agent_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  agency: string | null;
  average_rating: number;
  review_count: number;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "agent" | "admin";
}

// UI label maps (client-safe, no server imports)
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "For Sale",
  rent: "For Rent",
  lease: "For Lease",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "House",
  apartment: "Apartment",
  condo: "Condo",
  townhouse: "Townhouse",
  commercial: "Commercial",
  land: "Land",
  villa: "Villa",
  studio: "Studio",
};

export const AMENITY_OPTIONS = [
  "Parking",
  "Pool",
  "Gym",
  "Garden",
  "Balcony",
  "Elevator",
  "Air Conditioning",
  "Heating",
  "Furnished",
  "Pet Friendly",
  "Security",
  "Wheelchair Access",
];
