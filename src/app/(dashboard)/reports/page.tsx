'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Filter, Search, Eye, FileText, MoreVertical, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';
import styles from './page.module.css';

const supabase = createClient();

type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing' | 'reimbursed' | 'closed';

interface ExpenseReport {
  id: string;
  title: string;
  description: string;
  expense_count: number;
  total_amount: number;
  currency: string;
  status: ReportStatus;
  submitted_at: string | null;
  approved_at: string | null;
  user_display_name: string;
  created_at: string;
}

const statusColors: Record<ReportStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  submitted: 'warning',
  approved: 'success',
  rejected: 'error',
  processing: 'info',
  reimbursed: 'primary',
  closed: 'default',
};

const statusLabels: Record<ReportStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  processing: 'Processing',
  reimbursed: 'Reimbursed',
  closed: 'Closed',
};

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'my' | 'approval' | 'all'>('my');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('expense_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'my' && user) {
        query = query.eq('user_id', user.uid);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setReports(data || []);
    } catch (err: unknown) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Expense Reports</h1>
          <p className={styles.subtitle}>Manage and track your expense reports</p>
        </div>
        <Link href="/reports/new">
          <Button icon={<Plus size={18} />}>New Report</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'my' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Reports
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'approval' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('approval')}
        >
          Awaiting Approval
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Reports
        </button>
      </div>

      {/* Filters */}
      <Card className={styles.filters}>
        <CardContent className={styles.filtersContent}>
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <Button variant="outline" icon={<Filter size={18} />}>
              Filters
            </Button>
          </div>

          <div className={styles.chips}>
            <button
              className={`${styles.chip} ${statusFilter === 'all' ? styles.activeChip : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            {(['draft', 'submitted', 'approved', 'rejected', 'reimbursed'] as ReportStatus[]).map((status) => (
              <button
                key={status}
                className={`${styles.chip} ${statusFilter === status ? styles.activeChip : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className={styles.errorCard}>
          <CardContent className={styles.errorContent}>
            <p className={styles.errorText}>{error}</p>
            <Button variant="outline" onClick={fetchReports}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card className={styles.loadingCard}>
          <CardContent className={styles.loadingContent}>
            <div className={styles.spinner} />
            <p>Loading reports...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Reports List */}
          {filteredReports.length > 0 ? (
            <div className={styles.reportGrid}>
              {filteredReports.map((report) => (
                <Card key={report.id} className={styles.reportCard}>
                  <CardContent className={styles.reportCardContent}>
                    <div className={styles.reportHeader}>
                      <div className={styles.reportIconWrapper}>
                        <FileText size={20} className={styles.reportIcon} />
                      </div>
                      <Badge variant={statusColors[report.status]}>
                        {statusLabels[report.status]}
                      </Badge>
                    </div>

                    <h3 className={styles.reportTitle}>{report.title}</h3>
                    {report.description && (
                      <p className={styles.reportDescription}>{report.description}</p>
                    )}

                    <div className={styles.reportStats}>
                      <div className={styles.stat}>
                        <DollarSign size={16} />
                        <span className={styles.statValue}>
                          {formatCurrency(report.total_amount, report.currency)}
                        </span>
                      </div>
                      <div className={styles.stat}>
                        <FileText size={16} />
                        <span>{report.expense_count} expenses</span>
                      </div>
                    </div>

                    <div className={styles.reportMeta}>
                      <div className={styles.metaItem}>
                        <User size={14} />
                        <span>{report.user_display_name}</span>
                      </div>
                      {report.submitted_at && (
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>Submitted {formatDate(report.submitted_at)}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.reportActions}>
                      <Link href={`/reports/${report.id}`} className={styles.viewLink}>
                        <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                          View
                        </Button>
                      </Link>
                      {report.status === 'draft' && (
                        <Button size="sm">Submit</Button>
                      )}
                      <button className={styles.moreButton}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className={styles.emptyState}>
              <CardContent className={styles.emptyContent}>
                <FileText size={48} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No reports found</h3>
                <p className={styles.emptyText}>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters to see more results'
                    : 'Create your first expense report to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/reports/new">
                    <Button icon={<Plus size={18} />}>Create Report</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
