'use client';

import { ReactNode, MouseEvent } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  iconPosition = 'left'
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className={styles.spinner} />}
      {!loading && icon && iconPosition === 'left' && (
        <span className={styles.iconLeft}>{icon}</span>
      )}
      <span className={styles.content}>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={styles.iconRight}>{icon}</span>
      )}
    </button>
  );
}
