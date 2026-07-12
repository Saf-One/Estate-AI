-- ============================================================
-- AI Real Estate Listings - Database Schema
-- Run in Supabase SQL editor or via psql
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- trigram for fast fuzzy text search

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AGENTS (real estate agents, can be reviewed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  bio TEXT,
  agency TEXT,
  average_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'lease')),
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'commercial', 'land', 'villa', 'studio')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  price NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_period TEXT CHECK (price_period IN ('monthly', 'yearly', NULL)),

  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms NUMERIC(3,1) NOT NULL DEFAULT 0,
  area_sqft INTEGER NOT NULL DEFAULT 0,
  lot_size_sqft INTEGER,
  year_built INTEGER,
  floors INTEGER DEFAULT 1,
  parking_spaces INTEGER DEFAULT 0,

  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  neighborhood TEXT,

  -- Geolocation (lat/lng powering the map)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  amenities TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  floor_plan_urls TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- AI-generated metadata
  ai_tags TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  duplicate_of UUID REFERENCES public.listings(id),

  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Geospatial index for fast map bounding-box queries
CREATE INDEX IF NOT EXISTS idx_listings_geo ON public.listings (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings (property_type, listing_type);
-- Trigram index for fast substring search on title/address
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON public.listings USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_city_trgm ON public.listings USING gin (city gin_trgm_ops);

-- ============================================================
-- REVIEWS (star-rated, on listings or agents)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT review_target_check CHECK (
    (listing_id IS NOT NULL AND agent_id IS NULL) OR
    (listing_id IS NULL AND agent_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.reviews (listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent ON public.reviews (agent_id);

-- ============================================================
-- BOOKMARKS (favourite listings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks (user_id);

-- ============================================================
-- SAVED SEARCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches (user_id);

-- ============================================================
-- INQUIRIES (lead forms -> CRM/email)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON public.inquiries (listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles: users see all, edit own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Agents: public read, admin write
CREATE POLICY "agents_select" ON public.agents FOR SELECT USING (true);
CREATE POLICY "agents_admin_all" ON public.agents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Listings: published visible to all; drafts/archive only to owner/admin; full CRUD for admin
CREATE POLICY "listings_select_published" ON public.listings
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "listings_admin_insert" ON public.listings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "listings_admin_update" ON public.listings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "listings_admin_delete" ON public.listings FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews: public read, authenticated users create their own
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: owner only
CREATE POLICY "bookmarks_select" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Saved searches: owner only
CREATE POLICY "saved_searches_select" ON public.saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_searches_insert" ON public.saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_searches_delete" ON public.saved_searches FOR DELETE USING (auth.uid() = user_id);

-- Inquiries: anyone can submit; submitter/admin can view
CREATE POLICY "inquiries_insert" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_select" ON public.inquiries FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "inquiries_admin_update" ON public.inquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- FUNCTIONS: keep derived rating aggregates in sync
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalc_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.listings l
    SET average_rating = COALESCE((SELECT AVG(rating) FROM public.reviews r WHERE r.listing_id = OLD.listing_id), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.listing_id = OLD.listing_id)
    WHERE l.id = OLD.listing_id;
    RETURN OLD;
  ELSE
    UPDATE public.listings l
    SET average_rating = COALESCE((SELECT AVG(rating) FROM public.reviews r WHERE r.listing_id = NEW.listing_id), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.listing_id = NEW.listing_id)
    WHERE l.id = NEW.listing_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_reviews_listing ON public.reviews;
CREATE TRIGGER trg_reviews_listing
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_listing_rating();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Helper RPC: increment view count (atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_listing_view(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings SET view_count = view_count + 1 WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
