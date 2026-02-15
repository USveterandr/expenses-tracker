import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/reports - List user's expense reports
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
      .from('expense_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create a new expense report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Get expenses to include in report
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .in('id', body.expenseIds || [])
      .eq('user_id', user.id);

    if (expensesError) {
      return NextResponse.json(
        { error: 'Failed to fetch expenses' },
        { status: 500 }
      );
    }

    // Validate that all requested expense IDs were found
    if (body.expenseIds?.length && expenses?.length !== body.expenseIds.length) {
      return NextResponse.json(
        { error: 'Some expenses not found or not accessible' },
        { status: 400 }
      );
    }

    const totalAmount = expenses?.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0) || 0;

    const report = {
      title: body.title,
      description: body.description,
      user_id: user.id,
      user_email: profile?.email || user.email!,
      user_display_name: profile?.display_name || 'Unknown',
      workspace_id: body.workspaceId,
      expense_ids: body.expenseIds || [],
      expense_count: body.expenseIds?.length || 0,
      total_amount: totalAmount,
      currency: body.currency || 'USD',
      status: 'draft',
    };

    const { data: newReport, error } = await supabase
      .from('expense_reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update expenses to link them to this report
    if (body.expenseIds?.length > 0) {
      await supabase
        .from('expenses')
        .update({ 
          report_id: newReport.id,
          report_name: body.title,
          status: 'reported'
        })
        .in('id', body.expenseIds);
    }

    return NextResponse.json({ report: newReport }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
