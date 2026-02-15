import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/categories - Get categories for a workspace
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    // Validate pagination parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (isNaN(limit) || isNaN(offset)) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // If workspaceId provided, verify membership
    if (workspaceId) {
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Forbidden: Not a member of this workspace' },
          { status: 403 }
        );
      }
    }

    let query = supabase
      .from('categories')
      .select('*')
      .eq('enabled', true)
      .order('sort_order');

    if (workspaceId) {
      query = query.or(`workspace_id.eq.${workspaceId},is_system.eq.true`);
    } else {
      query = query.eq('is_system', true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: categories, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Verify workspace membership if workspaceId provided
    if (body.workspaceId) {
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', body.workspaceId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Forbidden: Not a member of this workspace' },
          { status: 403 }
        );
      }
    }

    const category = {
      workspace_id: body.workspaceId,
      name: body.name,
      code: body.code || body.name.toLowerCase().replace(/\s+/g, '_'),
      icon: body.icon || 'receipt',
      color: body.color || '#6B7280',
      parent_id: body.parentId,
      require_comment: body.requireComment || false,
      max_amount: body.maxAmount,
      tax_rate: body.taxRate,
      sort_order: body.sortOrder || 0,
    };

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
