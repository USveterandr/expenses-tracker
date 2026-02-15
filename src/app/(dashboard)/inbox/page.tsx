'use client';

import Link from 'next/link';
import { Camera, Plus, FileText, BarChart3, CheckCircle, AlertTriangle, MessageSquare, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import styles from './page.module.css';

const quickActions = [
  { name: 'Scan Receipt', icon: Camera, href: '/scan', color: '#10b981' },
  { name: 'New Expense', icon: Plus, href: '/expenses/new', color: '#3b82f6' },
  { name: 'New Report', icon: FileText, href: '/reports/new', color: '#8b5cf6' },
  { name: 'View Stats', icon: BarChart3, href: '/analytics', color: '#f59e0b' },
];

const pendingActions = [
  { type: 'warning', message: '3 Expenses need receipts', icon: AlertTriangle },
  { type: 'info', message: '2 Reports awaiting your approval', icon: CheckCircle },
  { type: 'success', message: '1 Report reimbursed ($456.78)', icon: DollarSign },
  { type: 'chat', message: 'New comment on "Q4 Travel Report"', icon: MessageSquare },
];

const recentActivity = [
  { date: 'Today', items: [
    { type: 'expense', text: '$23.50 at Uber - Transportation', time: '2 hours ago' },
    { type: 'scan', text: 'Receipt scanned: Starbucks $4.85', time: '4 hours ago' },
  ]},
  { date: 'Yesterday', items: [
    { type: 'approval', text: 'Report "Client Lunch" approved', time: '3:45 PM' },
    { type: 'chat', text: 'Sarah commented on expense #1234', time: '2:30 PM' },
    { type: 'expense', text: '$89.00 at Amazon - Office Supplies', time: '11:20 AM' },
  ]},
];

export default function InboxPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inbox</h1>
        <p className={styles.subtitle}>Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={styles.actionCard}
              style={{ '--action-color': action.color } as React.CSSProperties}
            >
              <div className={styles.actionIcon} style={{ backgroundColor: `${action.color}20`, color: action.color }}>
                <action.icon size={24} />
              </div>
              <span className={styles.actionName}>{action.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.grid}>
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.pendingList}>
              {pendingActions.map((action, index) => (
                <div key={index} className={styles.pendingItem}>
                  <action.icon
                    size={20}
                    className={styles.pendingIcon}
                    style={{
                      color: action.type === 'warning' ? '#f59e0b' :
                             action.type === 'success' ? '#10b981' :
                             action.type === 'chat' ? '#8b5cf6' : '#3b82f6'
                    }}
                  />
                  <span className={styles.pendingText}>{action.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* This Month's Spending */}
        <Card>
          <CardHeader>
            <CardTitle>This Month&apos;s Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.spendingCard}>
              <div className={styles.spendingAmount}>$2,456.78</div>
              <div className={styles.spendingProgress}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '78%' }} />
                </div>
                <span className={styles.progressLabel}>78% of budget</span>
              </div>
              <div className={styles.spendingTrend}>
                <Badge variant="success">+12% vs last month</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <Card>
          <CardContent>
            <div className={styles.activityList}>
              {recentActivity.map((group) => (
                <div key={group.date} className={styles.activityGroup}>
                  <h3 className={styles.activityDate}>{group.date}</h3>
                  {group.items.map((item, index) => (
                    <div key={index} className={styles.activityItem}>
                      <span className={styles.activityText}>{item.text}</span>
                      <span className={styles.activityTime}>{item.time}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <Link href="/expenses" className={styles.viewAll}>
              View All Activity →
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
