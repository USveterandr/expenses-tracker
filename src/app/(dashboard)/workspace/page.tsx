'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  Settings, 
  CreditCard, 
  FileText, 
  Plus,
  MoreVertical,
  Search,
  Mail,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';
import styles from './page.module.css';

const supabase = createClient();

interface WorkspaceMember {
  id: string;
  email: string;
  display_name: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited';
  joined_at: string;
}

interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team' | 'corporate';
  owner_id: string;
  plan: 'free' | 'collect' | 'control';
  member_count: number;
  settings: {
    defaultCurrency: string;
    defaultCategory: string;
  };
}

export default function WorkspacePage() {
  const { user } = useAuthStore();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchWorkspaceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchWorkspaceData = async () => {
    setIsLoading(true);
    try {
      // Fetch workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user?.uid)
        .single();

      if (workspaceError && workspaceError.code !== 'PGRST116') {
        throw workspaceError;
      }

      // If no workspace found, use mock data for now
      const mockWorkspace: Workspace = workspaceData || {
        id: '1',
        name: user?.displayName ? `${user.displayName}'s Workspace` : 'My Workspace',
        type: 'personal',
        owner_id: user?.uid || '',
        plan: 'free',
        member_count: 1,
        settings: {
          defaultCurrency: 'USD',
          defaultCategory: 'uncategorized'
        }
      };

      setWorkspace(mockWorkspace);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', mockWorkspace.id);

      if (membersError) throw membersError;

      const mockMembers: WorkspaceMember[] = membersData || [
        {
          id: user?.uid || '1',
          email: user?.email || '',
          display_name: user?.displayName || 'You',
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        }
      ];

      setMembers(mockMembers);
    } catch (err) {
      console.error('Error fetching workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} className={styles.ownerIcon} />;
      case 'admin':
        return <Shield size={16} className={styles.adminIcon} />;
      default:
        return <User size={16} className={styles.memberIcon} />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
      owner: 'primary',
      admin: 'warning',
      member: 'default'
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  const filteredMembers = members.filter(member =>
    member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.workspaceIcon}>
            <Building2 size={32} />
          </div>
          <div>
            <h1 className={styles.title}>{workspace?.name}</h1>
            <div className={styles.meta}>
              <Badge variant="default">{workspace?.type}</Badge>
              <span className={styles.separator}>•</span>
              <span className={styles.memberCount}>{members.length} members</span>
              <span className={styles.separator}>•</span>
              <Badge variant="primary">{workspace?.plan} plan</Badge>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" icon={<Settings size={18} />}>
            Settings
          </Button>
          <Button icon={<Plus size={18} />}>Invite Member</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
              <Users size={24} />
            </div>
            <div>
              <p className={styles.statValue}>{members.length}</p>
              <p className={styles.statLabel}>Team Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-success-100)', color: 'var(--color-success-600)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <p className={styles.statValue}>{workspace?.settings.defaultCurrency}</p>
              <p className={styles.statLabel}>Currency</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-warning-100)', color: 'var(--color-warning-600)' }}>
              <FileText size={24} />
            </div>
            <div>
              <p className={styles.statValue}>Active</p>
              <p className={styles.statLabel}>Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'members' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className={styles.overviewGrid}>
          <Card className={styles.overviewCard}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.actionList}>
                <Link href="/workspace/members" className={styles.actionItem}>
                  <div className={styles.actionIcon}>
                    <Users size={20} />
                  </div>
                  <div className={styles.actionInfo}>
                    <span className={styles.actionTitle}>Manage Members</span>
                    <span className={styles.actionDesc}>Add or remove team members</span>
                  </div>
                </Link>
                <Link href="/settings" className={styles.actionItem}>
                  <div className={styles.actionIcon}>
                    <Settings size={20} />
                  </div>
                  <div className={styles.actionInfo}>
                    <span className={styles.actionTitle}>Workspace Settings</span>
                    <span className={styles.actionDesc}>Configure policies and preferences</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.overviewCard}>
            <CardHeader>
              <CardTitle>Recent Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.memberPreviewList}>
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className={styles.memberPreview}>
                    <div className={styles.memberAvatar}>
                      {member.display_name.charAt(0)}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.display_name}</span>
                      {getRoleBadge(member.role)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <Card>
          <CardHeader className={styles.membersHeader}>
            <CardTitle>Workspace Members</CardTitle>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.membersList}>
              {filteredMembers.map((member) => (
                <div key={member.id} className={styles.memberRow}>
                  <div className={styles.memberAvatar}>
                    {member.display_name.charAt(0)}
                  </div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberNameRow}>
                      <span className={styles.memberName}>{member.display_name}</span>
                      {getRoleIcon(member.role)}
                    </div>
                    <div className={styles.memberEmail}>
                      <Mail size={14} />
                      {member.email}
                    </div>
                  </div>
                  <div className={styles.memberActions}>
                    {getRoleBadge(member.role)}
                    <button className={styles.moreButton}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div>
                  <h4 className={styles.settingTitle}>Workspace Name</h4>
                  <p className={styles.settingValue}>{workspace?.name}</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className={styles.settingItem}>
                <div>
                  <h4 className={styles.settingTitle}>Default Currency</h4>
                  <p className={styles.settingValue}>{workspace?.settings.defaultCurrency}</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className={styles.settingItem}>
                <div>
                  <h4 className={styles.settingTitle}>Plan</h4>
                  <p className={styles.settingValue}>{workspace?.plan}</p>
                </div>
                <Button variant="outline" size="sm">Upgrade</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
