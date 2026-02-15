'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className={`${styles.container} ${className}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={`${styles.inputWrapper} ${error ? styles.error : ''}`}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            className={`${styles.input} ${icon ? styles.withIcon : ''}`}
            {...props}
          />
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
