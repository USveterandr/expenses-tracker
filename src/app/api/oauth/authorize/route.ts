import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAuthCode } from '@/lib/utils/oauth';

export const runtime = 'edge';

/**
 * OAuth Authorization Endpoint
 * POST /api/oauth/authorize
 * 
 * This endpoint handles the authorization request from OAuth clients.
 * It validates the client, generates an authorization code, and stores it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      client_id, 
      redirect_uri, 
      scope, 
      state, 
      response_type,
      code_challenge,
      code_challenge_method
    } = body;

    // Validate required parameters
    if (!client_id || !redirect_uri || !response_type) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters: client_id, redirect_uri, response_type' },
        { status: 400 }
      );
    }

    if (response_type !== 'code') {
      return NextResponse.json(
        { error: 'unsupported_response_type', error_description: 'Only "code" response type is supported' },
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
        { error: 'invalid_client', error_description: 'Invalid or inactive client' },
        { status: 400 }
      );
    }

    // Validate redirect_uri matches one of the registered URIs
    if (!client.redirect_uris.includes(redirect_uri)) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'access_denied', error_description: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Validate scopes
    const requestedScopes = scope ? scope.split(' ') : ['read'];
    const validScopes = client.scopes || ['read'];
    
    // Filter to only allow valid scopes
    const approvedScopes = requestedScopes.filter((s: string) => validScopes.includes(s));
    
    if (approvedScopes.length === 0) {
      return NextResponse.json(
        { error: 'invalid_scope', error_description: 'No valid scopes requested' },
        { status: 400 }
      );
    }

    // Generate authorization code
    const code = generateAuthCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code in database
    const { error: storeError } = await supabase
      .from('oauth_authorization_codes')
      .insert({
        code,
        client_id,
        user_id: user.id,
        redirect_uri,
        scopes: approvedScopes,
        code_challenge: code_challenge || null,
        code_challenge_method: code_challenge_method || null,
        expires_at: expiresAt.toISOString(),
      });

    if (storeError) {
      console.error('Failed to store authorization code:', storeError);
      return NextResponse.json(
        { error: 'server_error', error_description: 'Failed to create authorization code' },
        { status: 500 }
      );
    }

    // Record the grant (upsert to track user's approved apps)
    await supabase
      .from('oauth_grants')
      .upsert({
        client_id,
        user_id: user.id,
        scopes: approvedScopes,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'client_id,user_id'
      });

    return NextResponse.json({ 
      code,
      state: state || undefined
    });

  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
