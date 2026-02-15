'use client';

import Link from 'next/link';
import { 
  User, 
  Palette, 
  CreditCard, 
  Shield, 
  Bell, 
  Globe,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './page.module.css';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      {
        icon: User,
        title: 'Profile',
        description: 'Manage your personal information and profile photo',
        href: '/settings/profile',
        color: 'var(--color-primary-500)',
      },
      {
        icon: Shield,
        title: 'Security',
        description: 'Update password, enable 2FA, manage sessions',
        href: '/settings/security',
        color: 'var(--color-success-500)',
      },
      {
        icon: Bell,
        title: 'Notifications',
        description: 'Configure email and push notification preferences',
        href: '/settings/notifications',
        color: 'var(--color-warning-500)',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        icon: Palette,
        title: 'Appearance',
        description: 'Customize theme, colors, and display preferences',
        href: '/settings/appearance',
        color: 'var(--color-info-500)',
      },
      {
        icon: Globe,
        title: 'Language & Region',
        description: 'Set language, timezone, and date format',
        href: '/settings/preferences',
        color: 'var(--color-primary-500)',
      },
      {
        icon: CreditCard,
        title: 'Payment Methods',
        description: 'Manage your payment methods and billing information',
        href: '/settings/payment',
        color: 'var(--color-success-500)',
      },
    ],
  },
  {
    title: 'Workspace',
    items: [
      {
        icon: Building2,
        title: 'Workspace Settings',
        description: 'Manage workspace name, logo, and settings',
        href: '/workspace',
        color: 'var(--color-primary-600)',
      },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account and preferences</p>
        </div>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user.displayName || 'User'}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Groups */}
      <div className={styles.settingsGrid}>
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.settingsGroup}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            <Card>
              <CardContent className={styles.groupContent}>
                {group.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <Link 
                      key={itemIndex} 
                      href={item.href} 
                      className={styles.settingsItem}
                    >
                      <div 
                        className={styles.itemIcon}
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <p className={styles.itemDescription}>{item.description}</p>
                      </div>
                      <ChevronRight size={20} className={styles.itemArrow} />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className={styles.footer}>
        <p className={styles.version}>ExpenseFlow v1.0.0</p>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Help Center</a>
          <span className={styles.footerSeparator}>•</span>
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          <span className={styles.footerSeparator}>•</span>
          <a href="#" className={styles.footerLink}>Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
