import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateToken } from '@/lib/utils/oauth';

export const runtime = 'edge';

/**
 * OAuth Token Endpoint
 * POST /api/oauth/token
 * 
 * This endpoint exchanges authorization codes for access tokens.
 * Supports authorization_code grant type.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      grant_type, 
      code, 
      redirect_uri, 
      client_id, 
      client_secret,
      code_verifier
    } = body;

    // Validate required parameters
    if (!grant_type) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing grant_type' },
        { status: 400 }
      );
    }

    if (grant_type !== 'authorization_code') {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Only authorization_code is supported' },
        { status: 400 }
      );
    }

    if (!code || !redirect_uri || !client_id) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters: code, redirect_uri, client_id' },
        { status: 400 }
      );
    }

    const supabase = await createClient(request);

    // Validate OAuth client
    const { data: client, error: clientError } = await supabase
      .from('oauth_apps')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Invalid client_id' },
        { status: 401 }
      );
    }

    // Validate client secret
    if (client.client_secret !== client_secret) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client authentication failed' },
        { status: 401 }
      );
    }

    // Validate redirect_uri
    if (!client.redirect_uris.includes(redirect_uri)) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
        { status: 400 }
      );
    }

    // Get and validate authorization code
    const { data: authCode, error: codeError } = await supabase
      .from('oauth_authorization_codes')
      .select('*')
      .eq('code', code)
      .eq('client_id', client_id)
      .eq('redirect_uri', redirect_uri)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (codeError || !authCode) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' },
        { status: 400 }
      );
    }

    // Validate PKCE if code_challenge was provided
    if (authCode.code_challenge && code_verifier) {
      const encoder = new TextEncoder();
      const data = encoder.encode(code_verifier);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedChallenge = btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      if (computedChallenge !== authCode.code_challenge) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid code_verifier' },
          { status: 400 }
        );
      }
    }

    // Mark authorization code as used
    await supabase
      .from('oauth_authorization_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', authCode.id);

    // Generate tokens
    const accessToken = generateToken(32);
    const refreshToken = generateToken(32);
    const accessTokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days

    // Store access token
    const { data: accessTokenRecord, error: tokenError } = await supabase
      .from('oauth_access_tokens')
      .insert({
        token: accessToken,
        client_id,
        user_id: authCode.user_id,
        scopes: authCode.scopes,
        expires_at: accessTokenExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Failed to store access token:', tokenError);
      return NextResponse.json(
        { error: 'server_error', error_description: 'Failed to create access token' },
        { status: 500 }
      );
    }

    // Store refresh token
    await supabase
      .from('oauth_refresh_tokens')
      .insert({
        token: refreshToken,
        access_token_id: accessTokenRecord.id,
        client_id,
        user_id: authCode.user_id,
        scopes: authCode.scopes,
        expires_at: refreshTokenExpiresAt.toISOString(),
      });

    // Return tokens
    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scopes.join(' '),
    });

  } catch (error) {
    console.error('OAuth token error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
