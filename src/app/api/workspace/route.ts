import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/workspace - Get user's workspaces
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workspaces where user is owner
    const { data: ownedWorkspaces, error: ownedError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .eq('status', 'active');

    if (ownedError) {
      return NextResponse.json({ error: ownedError.message }, { status: 500 });
    }

    // Get workspaces where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    const memberWorkspaceIds = memberships?.map((m: { workspace_id: string }) => m.workspace_id) || [];
    
    let memberWorkspaces: unknown[] = [];
    if (memberWorkspaceIds.length > 0) {
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', memberWorkspaceIds)
        .eq('status', 'active');
      memberWorkspaces = workspaces || [];
    }

    const allWorkspaces = [...(ownedWorkspaces || []), ...memberWorkspaces];
    
    // Remove duplicates
    const uniqueWorkspaces = allWorkspaces.filter((workspace, index, self) =>
      index === self.findIndex((w) => w.id === workspace.id)
    );

    return NextResponse.json({ workspaces: uniqueWorkspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/workspace - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    const workspace = {
      name: body.name,
      description: body.description,
      logo_url: body.logoUrl,
      type: body.type || 'personal',
      owner_id: user.id,
      owner_email: profile?.email || user.email!,
      plan: 'free',
      status: 'active',
    };

    const { data: newWorkspace, error } = await supabase
      .from('workspaces')
      .insert(workspace)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add owner as a workspace member
    await supabase.from('workspace_members').insert({
      workspace_id: newWorkspace.id,
      user_id: user.id,
      email: profile?.email || user.email!,
      display_name: profile?.email?.split('@')[0] || 'Owner',
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    });

    return NextResponse.json({ workspace: newWorkspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
