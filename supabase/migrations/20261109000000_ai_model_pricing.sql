-- Stores AI model pricing (USD per 1M tokens) so rates can be updated without a redeploy.
-- Anthropic and Voyage prices are seeded from the constants in pricing.ts.
CREATE TABLE ai_model_pricing (
  tier                 text        PRIMARY KEY,
  input_per_mtk        numeric(10, 4) NOT NULL,
  output_per_mtk       numeric(10, 4) NOT NULL,
  cache_write_per_mtk  numeric(10, 4) NOT NULL,
  cache_read_per_mtk   numeric(10, 4) NOT NULL,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Only the service role (admin client) needs to read/write this table.
ALTER TABLE ai_model_pricing ENABLE ROW LEVEL SECURITY;

-- Seed with values from pricing.ts (smart = claude-sonnet, fast = claude-haiku).
INSERT INTO ai_model_pricing (tier, input_per_mtk, output_per_mtk, cache_write_per_mtk, cache_read_per_mtk) VALUES
  ('smart',  3.0,  15.0,  3.75, 0.3),
  ('fast',   0.8,   4.0,  1.0,  0.08);
