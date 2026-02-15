import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm'
}: CardProps) {
  return (
    <div className={`${styles.card} ${styles[padding]} ${styles[`shadow${shadow}`]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h3 className={`${styles.title} ${className}`}>{children}</h3>;
}

export function CardContent({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}
