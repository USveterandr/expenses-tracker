import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/expenses - List user's expenses
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: expenses, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate pagination parameters
    const validatedLimit = Math.min(Math.max(parseInt(body.limit) || 50, 1), 100);
    const validatedOffset = Math.max(parseInt(body.offset) || 0, 0);
    
    if (isNaN(validatedLimit) || isNaN(validatedOffset)) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
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
    
    // Get user profile for display info
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single();

    const expense = {
      user_id: user.id,
      user_email: profile?.email || user.email!,
      user_display_name: profile?.display_name || 'Unknown',
      workspace_id: body.workspaceId,
      merchant: body.merchant,
      description: body.description,
      amount: body.amount,
      currency: body.currency || 'USD',
      category_id: body.categoryId,
      category_name: body.categoryName,
      tag_ids: body.tagIds || [],
      tag_names: body.tagNames || [],
      date: body.date,
      has_receipt: body.hasReceipt || false,
      source: body.source || 'manual',
      type: body.type || 'standard',
      mileage: body.mileage,
      attendees: body.attendees || [],
      is_billable: body.isBillable || false,
      is_reimbursable: body.isReimbursable ?? true,
      status: 'unreported',
    };

    const { data: newExpense, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expense: newExpense }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
