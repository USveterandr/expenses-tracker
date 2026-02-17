import { Loader2 } from 'lucide-react';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <Loader2 size={48} className={styles.icon} />
      </div>
      <p className={styles.text}>Loading...</p>
    </div>
  );
}
