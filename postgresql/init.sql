-- @block
CREATE EXTENSION pgcrypto;

-- @block
CREATE TABLE IF NOT EXISTS public.guild_settings (
      guild_id TEXT NOT NULL,
      log_channel_id TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT 'en',
      force_locale BOOLEAN DEFAULT FALSE
);