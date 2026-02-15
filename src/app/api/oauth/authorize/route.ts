import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// OAuth Authorization Endpoint
// POST /api/oauth/authorize
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      client_id, 
      redirect_uri, 
      scope, 
      state, 
      response_type 
    } = body;

    // Validate required parameters
    if (!client_id || !redirect_uri || !response_type) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (response_type !== 'code') {
      return NextResponse.json(
        { error: 'unsupported_response_type', error_description: 'Only "code" is supported' },
        { status: 400 }
      );
    }

    const supabase = await createClient(request);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'access_denied', error_description: 'User not authenticated' },
        { status: 401 }
      );
    }

    // TODO: Validate client_id against registered OAuth apps in your database
    // For now, we'll generate a code

    // Generate authorization code
    // In production, you should:
    // 1. Store the code in your database with expiration
    // 2. Link it to the user, client, and scopes
    // 3. Return the code for exchange
    
    const code = generateAuthCode();
    
    // TODO: Store authorization code in database
    // await storeAuthCode({
    //   code,
    //   user_id: user.id,
    //   client_id,
    //   redirect_uri,
    //   scope: scope || 'read',
    //   expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    // });

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

// Simple authorization code generator
function generateAuthCode(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
