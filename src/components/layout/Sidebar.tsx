'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Receipt,
  FileText,
  Camera,
  MessageSquare,
  Building2,
  Settings,
  BarChart3,
  ChevronDown,
  Plus,
  LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navigation = [
  { name: 'Inbox', href: '/inbox', icon: Home },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Scan Receipt', href: '/scan', icon: Camera },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Workspace', href: '/workspace', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/inbox" className={styles.logo}>
          <span className={styles.logoIcon}>💰</span>
          <span className={styles.logoText}>ExpenseFlow</span>
        </Link>
      </div>

      <div className={styles.newButton}>
        <Link href="/expenses/new" className={styles.newExpenseBtn}>
          <Plus size={20} />
          New Expense
        </Link>
      </div>

      <nav className={styles.nav}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.workspace}>
        <button className={styles.workspaceButton}>
          <div className={styles.workspaceIcon}>A</div>
          <div className={styles.workspaceInfo}>
            <span className={styles.workspaceName}>Acme Corp</span>
            <span className={styles.workspacePlan}>Pro Plan</span>
          </div>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className={styles.footer}>
        <button className={styles.logoutButton}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
