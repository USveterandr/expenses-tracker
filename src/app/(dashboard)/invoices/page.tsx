'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Mail,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';
import styles from './page.module.css';

const supabase = createClient();

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

interface Invoice {
  id: string;
  invoice_number: string;
  recipient_name: string;
  recipient_email: string;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
}

const statusColors: Record<InvoiceStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  sent: 'primary',
  viewed: 'warning',
  paid: 'success',
  overdue: 'error',
  cancelled: 'default',
};

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export default function InvoicesPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('issuer_id', user?.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Use mock data if no invoices exist
      const mockInvoices: Invoice[] = data || [
        {
          id: '1',
          invoice_number: 'INV-2026-001',
          recipient_name: 'Acme Corporation',
          recipient_email: 'billing@acme.com',
          total_amount: 3500.00,
          currency: 'USD',
          status: 'paid',
          issue_date: '2026-01-15',
          due_date: '2026-02-15',
          paid_at: '2026-01-20',
        },
        {
          id: '2',
          invoice_number: 'INV-2026-002',
          recipient_name: 'TechStart Inc',
          recipient_email: 'finance@techstart.com',
          total_amount: 2800.00,
          currency: 'USD',
          status: 'sent',
          issue_date: '2026-02-01',
          due_date: '2026-03-01',
          paid_at: null,
        },
        {
          id: '3',
          invoice_number: 'INV-2026-003',
          recipient_name: 'Global Solutions',
          recipient_email: 'accounts@global.com',
          total_amount: 5400.00,
          currency: 'USD',
          status: 'overdue',
          issue_date: '2026-01-01',
          due_date: '2026-01-31',
          paid_at: null,
        },
      ];

      setInvoices(mockInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>Create and manage invoices for your clients</p>
        </div>
        <Link href="/invoices/new">
          <Button icon={<Plus size={18} />}>New Invoice</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
              <FileText size={24} />
            </div>
            <div>
              <p className={styles.statValue}>{formatCurrency(totalInvoiced, 'USD')}</p>
              <p className={styles.statLabel}>Total Invoiced</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-success-100)', color: 'var(--color-success-600)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p className={styles.statValue}>{formatCurrency(totalPaid, 'USD')}</p>
              <p className={styles.statLabel}>Paid</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-warning-100)', color: 'var(--color-warning-600)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p className={styles.statValue}>{formatCurrency(totalInvoiced - totalPaid - totalOverdue, 'USD')}</p>
              <p className={styles.statLabel}>Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-error-100)', color: 'var(--color-error-600)' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className={styles.statValue}>{formatCurrency(totalOverdue, 'USD')}</p>
              <p className={styles.statLabel}>Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={styles.filters}>
        <CardContent className={styles.filtersContent}>
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search invoices..."
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
            {(['draft', 'sent', 'paid', 'overdue'] as InvoiceStatus[]).map((status) => (
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

      {/* Invoices Table */}
      <Card>
        <CardContent className={styles.tableContent}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.colInvoice}>Invoice</div>
              <div className={styles.colClient}>Client</div>
              <div className={styles.colAmount}>Amount</div>
              <div className={styles.colStatus}>Status</div>
              <div className={styles.colDate}>Due Date</div>
              <div className={styles.colActions}></div>
            </div>

            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className={styles.tableRow}>
                  <div className={styles.colInvoice}>
                    <div className={styles.invoiceInfo}>
                      <FileText size={18} className={styles.invoiceIcon} />
                      <div>
                        <p className={styles.invoiceNumber}>{invoice.invoice_number}</p>
                        <p className={styles.invoiceDate}>Issued {formatDate(invoice.issue_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.colClient}>
                    <p className={styles.clientName}>{invoice.recipient_name}</p>
                    <p className={styles.clientEmail}>{invoice.recipient_email}</p>
                  </div>

                  <div className={styles.colAmount}>
                    <p className={styles.amount}>
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </p>
                  </div>

                  <div className={styles.colStatus}>
                    <Badge variant={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>

                  <div className={styles.colDate}>
                    <p className={styles.dueDate}>{formatDate(invoice.due_date)}</p>
                  </div>

                  <div className={styles.colActions}>
                    <button className={styles.actionButton} title="View">
                      <Eye size={18} />
                    </button>
                    <button className={styles.actionButton} title="Download">
                      <Download size={18} />
                    </button>
                    <button className={styles.actionButton} title="Send">
                      <Mail size={18} />
                    </button>
                    <button className={styles.actionButton} title="More">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <FileText size={48} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No invoices found</h3>
                <p className={styles.emptyText}>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Create your first invoice to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/invoices/new">
                    <Button icon={<Plus size={18} />}>Create Invoice</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
