import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/expenses/[id] - Get a specific expense
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

    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses/[id] - Update an expense
export async function PATCH(
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

    const body = await request.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const updateData: Record<string, string | number | boolean | string[] | undefined> = {};
    if (body.merchant !== undefined) updateData.merchant = body.merchant;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.categoryId !== undefined) {
      updateData.category_id = body.categoryId;
      updateData.category_name = body.categoryName;
    }
    if (body.tagIds !== undefined) {
      updateData.tag_ids = body.tagIds;
      updateData.tag_names = body.tagNames;
    }
    if (body.date !== undefined) updateData.date = body.date;
    if (body.hasReceipt !== undefined) updateData.has_receipt = body.hasReceipt;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.mileage !== undefined) updateData.mileage = body.mileage;
    if (body.attendees !== undefined) updateData.attendees = body.attendees;
    if (body.isBillable !== undefined) updateData.is_billable = body.isBillable;
    if (body.isReimbursable !== undefined) updateData.is_reimbursable = body.isReimbursable;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.reportId !== undefined) {
      updateData.report_id = body.reportId;
      updateData.report_name = body.reportName;
    }

    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ expense: updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
