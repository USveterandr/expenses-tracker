import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/reports/[id] - Get a specific report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: report, error } = await supabase
      .from('expense_reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get associated expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('report_id', id)
      .order('date', { ascending: false });

    return NextResponse.json({ report, expenses });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/[id] - Update a report
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from('expense_reports')
      .select('id, expense_ids, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updateData: Record<string, string | undefined> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }
    }

    const { data: updatedReport, error } = await supabase
      .from('expense_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('expense_reports')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Unlink expenses from this report
    await supabase
      .from('expenses')
      .update({ 
        report_id: null,
        report_name: null,
        status: 'unreported'
      })
      .eq('report_id', id);

    const { error } = await supabase
      .from('expense_reports')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
