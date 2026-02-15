import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/bills - List workspace bills
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

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    // Verify workspace membership
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

    let query = supabase
      .from('bills')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bills, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bills });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create a new bill
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    if (!body.vendorName || !body.totalAmount || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: vendorName, totalAmount, dueDate' },
        { status: 400 }
      );
    }

    // Verify workspace membership
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

    const bill = {
      workspace_id: body.workspaceId,
      uploaded_by_id: user.id,
      vendor_name: body.vendorName,
      vendor_email: body.vendorEmail,
      vendor_address: body.vendorAddress,
      bill_number: body.billNumber,
      issue_date: body.issueDate,
      due_date: body.dueDate,
      currency: body.currency || 'USD',
      total_amount: body.totalAmount,
      line_items: body.lineItems || [],
      attachment_url: body.attachmentUrl,
      status: 'pending',
    };

    const { data: newBill, error } = await supabase
      .from('bills')
      .insert(bill)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bill: newBill }, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
