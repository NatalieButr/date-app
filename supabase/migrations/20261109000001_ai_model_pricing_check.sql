-- Add CHECK constraint to enforce only known tiers can be inserted.
-- Separate migration because 20261109000000 was already applied locally.
ALTER TABLE ai_model_pricing
  ADD CONSTRAINT ai_model_pricing_tier_check CHECK (tier IN ('smart', 'fast'));
