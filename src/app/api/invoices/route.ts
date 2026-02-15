import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/invoices - List user's invoices
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
      .from('invoices')
      .select('*')
      .eq('issuer_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (workspaceId) {
      query = query.eq('issuer_workspace_id', workspaceId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.recipientName || !body.recipientEmail || !body.invoiceNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientName, recipientEmail, invoiceNumber' },
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
    
    // Get user profile
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

    const invoice = {
      issuer_id: user.id,
      issuer_workspace_id: body.workspaceId,
      issuer_name: profile?.display_name || '',
      issuer_email: profile?.email || user.email!,
      issuer_address: body.issuerAddress,
      issuer_logo: body.issuerLogo,
      recipient_name: body.recipientName,
      recipient_email: body.recipientEmail,
      recipient_address: body.recipientAddress,
      recipient_phone: body.recipientPhone,
      invoice_number: body.invoiceNumber,
      purchase_order_number: body.purchaseOrderNumber,
      issue_date: body.issueDate,
      due_date: body.dueDate,
      currency: body.currency || 'USD',
      line_items: body.lineItems || [],
      subtotal: body.subtotal || 0,
      tax_total: body.taxTotal || 0,
      discount_amount: body.discountAmount || 0,
      discount_type: body.discountType,
      total_amount: body.totalAmount || 0,
      notes: body.notes,
      terms: body.terms,
      status: 'draft',
    };

    const { data: newInvoice, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
