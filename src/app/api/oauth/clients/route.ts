import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateClientId, generateClientSecret } from '@/lib/utils/oauth';

export const runtime = 'edge';

/**
 * GET /api/oauth/clients
 * Get OAuth client information (public info only, for consent screen)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing client_id parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient(request);

    const { data: client, error } = await supabase
      .from('oauth_apps')
      .select('id, name, description, client_id, redirect_uris, scopes, logo_url, website_url, is_verified')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });

  } catch (error) {
    console.error('OAuth client info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oauth/clients
 * Register a new OAuth application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      redirect_uris,
      scopes,
      website_url,
      logo_url,
      privacy_policy_url,
      terms_of_service_url
    } = body;

    // Validation
    if (!name || !redirect_uris || redirect_uris.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, redirect_uris' },
        { status: 400 }
      );
    }

    // Validate redirect URIs
    for (const uri of redirect_uris) {
      try {
        new URL(uri);
      } catch {
        return NextResponse.json(
          { error: `Invalid redirect URI: ${uri}` },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient(request);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate credentials
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();

    // Create OAuth app
    const { data: app, error: insertError } = await supabase
      .from('oauth_apps')
      .insert({
        name,
        description: description || null,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris,
        scopes: scopes || ['read'],
        owner_id: user.id,
        website_url: website_url || null,
        logo_url: logo_url || null,
        privacy_policy_url: privacy_policy_url || null,
        terms_of_service_url: terms_of_service_url || null,
      })
      .select('id, name, description, client_id, redirect_uris, scopes, website_url, logo_url, is_active, is_verified, created_at')
      .single();

    if (insertError) {
      console.error('Failed to create OAuth app:', insertError);
      return NextResponse.json(
        { error: 'Failed to create OAuth application' },
        { status: 500 }
      );
    }

    // Return app info with client_secret (only shown once!)
    return NextResponse.json({
      app: {
        ...app,
        client_secret: clientSecret // Only returned on creation
      },
      message: 'Make sure to save your client secret. It will not be shown again!'
    }, { status: 201 });

  } catch (error) {
    console.error('OAuth client registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
