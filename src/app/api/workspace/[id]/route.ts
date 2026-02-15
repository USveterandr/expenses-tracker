import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/workspace/[id] - Get workspace details
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

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get workspace members
    const { data: members } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', id)
      .eq('status', 'active');

    // Get workspace categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .or(`workspace_id.eq.${id},is_system.eq.true`)
      .eq('enabled', true)
      .order('sort_order');

    return NextResponse.json({ workspace, members, categories });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/[id] - Update workspace
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

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', id)
      .single();

    const isAuthorized = workspace?.owner_id === user.id || 
      membership?.role === 'admin' || 
      membership?.role === 'owner';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, string | object | null | undefined> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logoUrl !== undefined) updateData.logo_url = body.logoUrl;
    if (body.settings !== undefined) updateData.settings = body.settings;
    if (body.approvalWorkflow !== undefined) updateData.approval_workflow = body.approvalWorkflow;

    const { data: updatedWorkspace, error } = await supabase
      .from('workspaces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspace: updatedWorkspace });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
