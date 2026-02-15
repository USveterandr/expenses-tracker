'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './Header.module.css';

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.menuButton}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {showSearch ? (
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search expenses, reports..."
              className={styles.searchInput}
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={styles.searchButton}
            onClick={() => setShowSearch(true)}
          >
            <Search size={20} />
            <span>Search...</span>
          </Button>
        )}
      </div>

      <div className={styles.right}>
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>

        <Link href="/settings/profile" className={styles.profile}>
          <div className={styles.avatar}>
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.displayName} className={styles.avatarImage} width={32} height={32} />
            ) : (
              <span className={styles.avatarInitials}>{getInitials()}</span>
            )}
          </div>
          <span className={styles.profileName}>
            {isAuthenticated && user ? user.displayName : 'Guest'}
          </span>
        </Link>
      </div>
    </header>
  );
}
