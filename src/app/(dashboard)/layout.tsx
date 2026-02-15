'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OnboardingGuard } from '@/components/providers/OnboardingGuard';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.main}>
          <Header />
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </OnboardingGuard>
  );
}
