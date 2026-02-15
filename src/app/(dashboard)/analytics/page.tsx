'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  PieChart,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';
import styles from './page.module.css';

const supabase = createClient();

interface AnalyticsData {
  totalSpend: number;
  totalExpenses: number;
  totalReports: number;
  pendingReimbursement: number;
  spendChange: number;
  expensesChange: number;
  categoryBreakdown: { name: string; amount: number; color: string }[];
  monthlyData: { month: string; amount: number }[];
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch expenses for analytics
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.uid)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Calculate analytics
      const totalSpend = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      const totalExpenses = expenses?.length || 0;
      
      // Category breakdown
      const categories: Record<string, number> = {};
      expenses?.forEach(exp => {
        const category = exp.category_name || 'Uncategorized';
        categories[category] = (categories[category] || 0) + (exp.amount || 0);
      });

      const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const categoryBreakdown = Object.entries(categories)
        .map(([name, amount], index) => ({
          name,
          amount,
          color: categoryColors[index % categoryColors.length]
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

      // Mock data for demonstration
      const mockAnalytics: AnalyticsData = {
        totalSpend,
        totalExpenses,
        totalReports: 3,
        pendingReimbursement: 1234.56,
        spendChange: 12.5,
        expensesChange: -5.2,
        categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [
          { name: 'Meals & Entertainment', amount: 1245.50, color: '#3B82F6' },
          { name: 'Transportation', amount: 890.25, color: '#10B981' },
          { name: 'Office Supplies', amount: 567.80, color: '#F59E0B' },
          { name: 'Software', amount: 450.00, color: '#8B5CF6' },
          { name: 'Travel', amount: 2345.00, color: '#EF4444' },
        ],
        monthlyData: [
          { month: 'Jan', amount: 2100 },
          { month: 'Feb', amount: 3400 },
          { month: 'Mar', amount: 2800 },
          { month: 'Apr', amount: 4100 },
          { month: 'May', amount: 3200 },
          { month: 'Jun', amount: 4567 },
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxMonthlyAmount = Math.max(...(analytics?.monthlyData.map(d => d.amount) || [1]));

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Track your spending and financial insights</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.timeFilter}>
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                className={`${styles.timeButton} ${timeRange === range ? styles.activeTimeButton : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" icon={<Download size={18} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
                <DollarSign size={24} />
              </div>
              <div className={`${styles.changeBadge} ${analytics?.spendChange && analytics.spendChange > 0 ? styles.positive : styles.negative}`}>
                {analytics?.spendChange && analytics.spendChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(analytics?.spendChange || 0)}%
              </div>
            </div>
            <p className={styles.statValue}>{formatCurrency(analytics?.totalSpend || 0)}</p>
            <p className={styles.statLabel}>Total Spend</p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-success-100)', color: 'var(--color-success-600)' }}>
                <FileText size={24} />
              </div>
              <div className={`${styles.changeBadge} ${analytics?.expensesChange && analytics.expensesChange > 0 ? styles.positive : styles.negative}`}>
                {analytics?.expensesChange && analytics.expensesChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(analytics?.expensesChange || 0)}%
              </div>
            </div>
            <p className={styles.statValue}>{analytics?.totalExpenses || 0}</p>
            <p className={styles.statLabel}>Total Expenses</p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-warning-100)', color: 'var(--color-warning-600)' }}>
                <PieChart size={24} />
              </div>
            </div>
            <p className={styles.statValue}>{analytics?.totalReports || 0}</p>
            <p className={styles.statLabel}>Reports</p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: 'var(--color-info-100)', color: 'var(--color-info-600)' }}>
                <Calendar size={24} />
              </div>
            </div>
            <p className={styles.statValue}>{formatCurrency(analytics?.pendingReimbursement || 0)}</p>
            <p className={styles.statLabel}>Pending Reimbursement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        {/* Spending Chart */}
        <Card className={styles.chartCard}>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chart}>
              {analytics?.monthlyData.map((data, index) => (
                <div key={index} className={styles.barContainer}>
                  <div className={styles.barWrapper}>
                    <div 
                      className={styles.bar}
                      style={{ 
                        height: `${(data.amount / maxMonthlyAmount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={styles.barLabel}>{data.month}</span>
                  <span className={styles.barValue}>{formatCurrency(data.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className={styles.chartCard}>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.categoryList}>
              {analytics?.categoryBreakdown.map((category, index) => (
                <div key={index} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <div 
                      className={styles.categoryDot}
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={styles.categoryName}>{category.name}</span>
                  </div>
                  <div className={styles.categoryAmount}>
                    <span className={styles.amount}>{formatCurrency(category.amount)}</span>
                    <div 
                      className={styles.progressBar}
                      style={{ 
                        width: `${(category.amount / (analytics?.totalSpend || 1)) * 100}%`,
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className={styles.activityHeader}>
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="outline" size="sm" icon={<Filter size={16} />}>
            Filter
          </Button>
        </CardHeader>
        <CardContent>
          <div className={styles.activityList}>
            {[
              { action: 'Expense added', detail: 'Starbucks - $12.50', time: '2 hours ago', type: 'expense' },
              { action: 'Report submitted', detail: 'Q4 Travel Report', time: '5 hours ago', type: 'report' },
              { action: 'Receipt scanned', detail: 'Uber receipt processed', time: '1 day ago', type: 'scan' },
              { action: 'Report approved', detail: 'NYC Business Trip', time: '2 days ago', type: 'approved' },
            ].map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                  {activity.type === 'expense' && <DollarSign size={16} />}
                  {activity.type === 'report' && <FileText size={16} />}
                  {activity.type === 'scan' && <PieChart size={16} />}
                  {activity.type === 'approved' && <TrendingUp size={16} />}
                </div>
                <div className={styles.activityInfo}>
                  <p className={styles.activityAction}>{activity.action}</p>
                  <p className={styles.activityDetail}>{activity.detail}</p>
                </div>
                <span className={styles.activityTime}>{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
