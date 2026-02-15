'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles[size]}`} onClick={(e) => e.stopPropagation()}>
        {(title || description) && (
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={styles.closeButton}
            >
              <X size={20} />
            </Button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
