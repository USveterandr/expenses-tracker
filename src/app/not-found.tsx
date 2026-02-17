import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <FileQuestion size={48} className={styles.icon} />
        </div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/">
            <Button icon={<ArrowLeft size={18} />}>
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
