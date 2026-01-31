-- Intel Briefing System Tables
-- Created: 2026-01-31 (night shift)

-- Raw items from all sources
CREATE TABLE IF NOT EXISTS intel_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,           -- 'twitter', 'hackernews', 'rss', etc.
  source_id TEXT,                 -- Original item ID (URL hash for RSS)
  url TEXT,
  title TEXT,
  content TEXT,                   -- Full text or summary
  author TEXT,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',    -- Source-specific data
  processed BOOLEAN DEFAULT FALSE,
  relevance_score INTEGER,        -- 0-100, set by processing
  topics TEXT[],                  -- AI-assigned topics
  UNIQUE(source, source_id)
);

-- Processed summaries for delivery
CREATE TABLE IF NOT EXISTS intel_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date DATE NOT NULL,
  summary_type TEXT NOT NULL,     -- 'daily', 'weekly', 'alert'
  content TEXT NOT NULL,          -- Markdown summary
  item_ids UUID[],                -- References to intel_items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  delivery_channel TEXT           -- 'telegram', 'signal', etc.
);

-- Source configuration
CREATE TABLE IF NOT EXISTS intel_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,      -- 'rss', 'apify', 'api', 'scraper'
  config JSONB NOT NULL,          -- URLs, actor IDs, etc.
  schedule TEXT,                  -- Cron expression or 'manual'
  enabled BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 50,    -- Higher = more important (0-100)
  topics TEXT[],                  -- Default topics for this source
  last_run TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keyword/topic alerts (immediate notifications)
CREATE TABLE IF NOT EXISTS intel_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  keywords TEXT[],                -- Trigger words (OR logic)
  topics TEXT[],                  -- Topic matches
  min_score INTEGER DEFAULT 70,   -- Minimum relevance
  delivery TEXT DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_intel_items_source ON intel_items(source);
CREATE INDEX IF NOT EXISTS idx_intel_items_processed ON intel_items(processed);
CREATE INDEX IF NOT EXISTS idx_intel_items_collected ON intel_items(collected_at);
CREATE INDEX IF NOT EXISTS idx_intel_items_published ON intel_items(published_at);
CREATE INDEX IF NOT EXISTS idx_intel_items_score ON intel_items(relevance_score);
CREATE INDEX IF NOT EXISTS idx_intel_summaries_date ON intel_summaries(summary_date);
CREATE INDEX IF NOT EXISTS idx_intel_sources_enabled ON intel_sources(enabled);

-- Insert initial RSS sources (verified working as of 2026-01-30)
INSERT INTO intel_sources (name, source_type, config, schedule, priority, topics, enabled) VALUES
  -- Verified working
  ('Hacker News', 'rss', '{"url": "https://news.ycombinator.com/rss"}', '0 */4 * * *', 80, ARRAY['tech', 'ai'], true),
  ('TechCrunch', 'rss', '{"url": "https://techcrunch.com/feed/"}', '0 */4 * * *', 70, ARRAY['tech', 'funding'], true),
  ('Crunchbase News', 'rss', '{"url": "https://news.crunchbase.com/feed/"}', '0 */6 * * *', 75, ARRAY['funding', 'startups'], true),
  ('Simon Willison', 'rss', '{"url": "https://simonwillison.net/atom/everything/"}', '0 */6 * * *', 85, ARRAY['ai', 'tech'], true),
  ('The Verge AI', 'rss', '{"url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"}', '0 */4 * * *', 65, ARRAY['ai', 'tech'], true),
  ('Ars Technica AI', 'rss', '{"url": "https://feeds.arstechnica.com/arstechnica/technology-lab"}', '0 */4 * * *', 70, ARRAY['ai', 'tech'], true),
  ('Wired AI', 'rss', '{"url": "https://www.wired.com/feed/tag/ai/latest/rss"}', '0 */4 * * *', 65, ARRAY['ai', 'tech'], true),
  ('VentureBeat AI', 'rss', '{"url": "https://venturebeat.com/category/ai/feed/"}', '0 */4 * * *', 70, ARRAY['ai', 'tech'], true),
  ('Stratechery', 'rss', '{"url": "https://stratechery.com/feed/"}', '0 8 * * *', 90, ARRAY['tech', 'thought-leadership'], true),
  ('Benedict Evans', 'rss', '{"url": "https://www.ben-evans.com/benedictevans?format=rss"}', '0 8 * * *', 85, ARRAY['tech', 'thought-leadership'], true),
  
  -- Disabled (404 as of 2026-01-30, need updated URLs)
  ('a16z', 'rss', '{"url": "https://a16z.com/feed/", "note": "needs updated URL"}', '0 8 * * *', 85, ARRAY['ai', 'tech', 'thought-leadership'], false),
  ('Anthropic Blog', 'rss', '{"url": "https://www.anthropic.com/feed.xml", "note": "needs updated URL"}', '0 8 * * *', 90, ARRAY['ai', 'thought-leadership'], false),
  ('OpenAI Blog', 'rss', '{"url": "https://openai.com/blog/rss/", "note": "needs updated URL"}', '0 8 * * *', 90, ARRAY['ai'], false)
ON CONFLICT (name) DO NOTHING;

-- Insert initial alerts
INSERT INTO intel_alerts (name, keywords, topics, min_score, delivery) VALUES
  ('Sovereign Compute', ARRAY['sovereign compute', 'local ai', 'on-premise ai', 'edge ai', 'private llm'], NULL, 60, 'immediate'),
  ('LATAM Funding', ARRAY['colombia funding', 'latam startup', 'mexican fintech', 'latin america venture'], ARRAY['latam', 'funding'], 65, 'daily'),
  ('NM Policy', ARRAY['new mexico', 'nm legislature', 'santa fe', 'albuquerque'], ARRAY['policy'], 60, 'daily'),
  ('DOE Energy', ARRAY['department of energy', 'doe grant', 'clean energy', 'energy storage'], ARRAY['policy', 'funding'], 70, 'daily')
ON CONFLICT DO NOTHING;

-- RLS policies (public read for now, restrict later)
ALTER TABLE intel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_alerts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on intel_items" ON intel_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on intel_summaries" ON intel_summaries
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on intel_sources" ON intel_sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on intel_alerts" ON intel_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anon read on summaries (for potential web UI later)
CREATE POLICY "Anon read on intel_summaries" ON intel_summaries
  FOR SELECT TO anon USING (true);
