-- OAuth Server Tables
-- Add these to your Supabase SQL Editor

-- OAuth Applications table
CREATE TABLE IF NOT EXISTS oauth_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT,
  logo_url TEXT,
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authorization Codes table
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL REFERENCES oauth_apps(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scopes TEXT[] NOT NULL,
  code_challenge TEXT,
  code_challenge_method TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access Tokens table
CREATE TABLE IF NOT EXISTS oauth_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL REFERENCES oauth_apps(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  access_token_id UUID REFERENCES oauth_access_tokens(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES oauth_apps(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User OAuth Grants (to track which apps users have authorized)
CREATE TABLE IF NOT EXISTS oauth_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES oauth_apps(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes TEXT[] NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_apps_client_id ON oauth_apps(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_owner_id ON oauth_apps(owner_id);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_expires ON oauth_authorization_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_token ON oauth_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_token ON oauth_refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_oauth_grants_user ON oauth_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_grants_client ON oauth_grants(client_id);

-- Enable RLS
ALTER TABLE oauth_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- OAuth Apps: Owners can manage their apps, public can view active apps
CREATE POLICY "Users can manage their own OAuth apps"
  ON oauth_apps
  FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Public can view active OAuth apps"
  ON oauth_apps
  FOR SELECT
  USING (is_active = true);

-- Authorization Codes: Only the client app and user can access
CREATE POLICY "Users can view their own authorization codes"
  ON oauth_authorization_codes
  FOR SELECT
  USING (user_id = auth.uid());

-- Access Tokens: Only the user can view their tokens
CREATE POLICY "Users can view their own access tokens"
  ON oauth_access_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- Refresh Tokens: Only the user can view their tokens
CREATE POLICY "Users can view their own refresh tokens"
  ON oauth_refresh_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- Grants: Users can manage their own grants
CREATE POLICY "Users can manage their own OAuth grants"
  ON oauth_grants
  FOR ALL
  USING (user_id = auth.uid());

-- Function to clean up expired authorization codes
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_authorization_codes
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to generate client credentials
CREATE OR REPLACE FUNCTION generate_oauth_client_credentials()
RETURNS TABLE(client_id TEXT, client_secret TEXT) AS $$
DECLARE
  new_client_id TEXT;
  new_client_secret TEXT;
BEGIN
  -- Generate random client_id (32 chars)
  new_client_id := encode(gen_random_bytes(16), 'hex');
  
  -- Generate random client_secret (64 chars)
  new_client_secret := encode(gen_random_bytes(32), 'hex');
  
  RETURN QUERY SELECT new_client_id, new_client_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
