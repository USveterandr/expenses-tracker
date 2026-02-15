'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Filter, Search, MoreHorizontal, Receipt, Calendar, ArrowUpDown, Download, Wallet, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { exportToCSV } from '@/lib/utils/export';
import { toast } from 'sonner';
import styles from './page.module.css';

// Mock expenses data
const mockExpenses = [
  {
    id: 'exp_1',
    date: '2026-02-10',
    merchant: 'Starbucks',
    description: 'Coffee meeting',
    amount: 4.85,
    currency: 'USD',
    category: 'Meals & Dining',
    categoryColor: '#FF6B35',
    status: 'unreported',
    hasReceipt: true,
  },
  {
    id: 'exp_2',
    date: '2026-02-09',
    merchant: 'Uber',
    description: 'Airport transfer',
    amount: 45.50,
    currency: 'USD',
    category: 'Transportation',
    categoryColor: '#4ECDC4',
    status: 'reported',
    hasReceipt: true,
  },
  {
    id: 'exp_3',
    date: '2026-02-08',
    merchant: 'Hilton Hotel',
    description: 'Business trip accommodation',
    amount: 189.00,
    currency: 'USD',
    category: 'Lodging',
    categoryColor: '#45B7D1',
    status: 'submitted',
    hasReceipt: true,
  },
  {
    id: 'exp_4',
    date: '2026-02-07',
    merchant: 'Delta Airlines',
    description: 'Flight to NYC',
    amount: 378.00,
    currency: 'USD',
    category: 'Flights',
    categoryColor: '#96CEB4',
    status: 'approved',
    hasReceipt: true,
  },
  {
    id: 'exp_5',
    date: '2026-02-06',
    merchant: 'Amazon',
    description: 'Office supplies',
    amount: 89.99,
    currency: 'USD',
    category: 'Office Supplies',
    categoryColor: '#FFEAA7',
    status: 'unreported',
    hasReceipt: false,
  },
  {
    id: 'exp_6',
    date: '2026-02-05',
    merchant: 'Client Dinner',
    description: 'Business dinner with ABC Corp',
    amount: 145.00,
    currency: 'USD',
    category: 'Meals & Dining',
    categoryColor: '#FF6B35',
    status: 'reimbursed',
    hasReceipt: true,
  },
];

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  unreported: 'default',
  reported: 'info',
  submitted: 'warning',
  approved: 'success',
  rejected: 'error',
  reimbursed: 'primary',
};

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Summary Calculations
  const totalSpend = mockExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = mockExpenses
    .filter(e => e.status === 'submitted')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const approvedAmount = mockExpenses
    .filter(e => e.status === 'approved' || e.status === 'reimbursed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleExport = () => {
    exportToCSV(mockExpenses, 'my_expenses');
    toast.success('Expense report exported successfully');
  };

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesSearch =
      expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Expenses</h1>
          <p className={styles.subtitle}>Manage and track your expenses</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" icon={<Download size={18} />} onClick={handleExport}>
            Export CSV
          </Button>
          <Link href="/scan">
            <Button variant="outline">📷 Scan Receipt</Button>
          </Link>
          <Link href="/expenses/new">
            <Button icon={<Plus size={18} />}>New Expense</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <CardContent className={styles.summaryCardContent}>
            <div className={`${styles.summaryIcon} ${styles.totalIcon}`}><Wallet size={24} /></div>
            <div>
              <p className={styles.summaryLabel}>Total Spend</p>
              <p className={styles.summaryValue}>$ {totalSpend.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={styles.summaryCard}>
          <CardContent className={styles.summaryCardContent}>
            <div className={`${styles.summaryIcon} ${styles.pendingIcon}`}><Clock size={24} /></div>
            <div>
              <p className={styles.summaryLabel}>Pending Approval</p>
              <p className={styles.summaryValue}>$ {pendingAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={styles.summaryCard}>
          <CardContent className={styles.summaryCardContent}>
            <div className={`${styles.summaryIcon} ${styles.settledIcon}`}><CheckCircle size={24} /></div>
            <div>
              <p className={styles.summaryLabel}>Settled</p>
              <p className={styles.summaryValue}>$ {approvedAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={styles.filters}>
        <CardContent>
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Status</option>
              <option value="unreported">Unreported</option>
              <option value="reported">Reported</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="reimbursed">Reimbursed</option>
            </select>
            <Button variant="outline" icon={<Filter size={18} />}>
              Filters
            </Button>
          </div>

          {/* Status Chips */}
          <div className={styles.chips}>
            {['All', 'Unreported', 'Reported', 'Submitted', 'Approved', 'Reimbursed'].map((status) => (
              <button
                key={status}
                className={`${styles.chip} ${statusFilter === status.toLowerCase() ? styles.activeChip : ''}`}
                onClick={() => setStatusFilter(status.toLowerCase())}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardContent className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>
                  <button className={styles.sortButton}>
                    Date <ArrowUpDown size={14} />
                  </button>
                </th>
                <th>Merchant</th>
                <th>Description</th>
                <th>Category</th>
                <th>
                  <button className={styles.sortButton}>
                    Amount <ArrowUpDown size={14} />
                  </button>
                </th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <div className={styles.receiptCell}>
                      {expense.hasReceipt ? (
                        <div className={styles.receiptIcon}>
                          <Receipt size={16} />
                        </div>
                      ) : (
                        <div className={styles.noReceipt}>-</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <Calendar size={14} className={styles.calendarIcon} />
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td>
                    <Link href={`/expenses/${expense.id}`} className={styles.merchant}>
                      {expense.merchant}
                    </Link>
                  </td>
                  <td className={styles.description}>{expense.description}</td>
                  <td>
                    <span
                      className={styles.category}
                      style={{ backgroundColor: `${expense.categoryColor}20`, color: expense.categoryColor }}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className={styles.amount}>
                    {expense.currency} {expense.amount.toFixed(2)}
                  </td>
                  <td>
                    <Badge variant={statusColors[expense.status]}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <button className={styles.moreButton}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExpenses.length === 0 && (
            <div className={styles.emptyState}>
              <p>No expenses found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          Showing {filteredExpenses.length} of {mockExpenses.length} expenses
        </span>
        <div className={styles.paginationButtons}>
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
