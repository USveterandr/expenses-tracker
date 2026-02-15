'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import styles from './page.module.css';

const categories = [
  { id: 'meals', name: 'Meals & Dining', color: '#FF6B35' },
  { id: 'transport', name: 'Transportation', color: '#4ECDC4' },
  { id: 'lodging', name: 'Lodging', color: '#45B7D1' },
  { id: 'flights', name: 'Flights', color: '#96CEB4' },
  { id: 'office', name: 'Office Supplies', color: '#FFEAA7' },
  { id: 'software', name: 'Software & Subscriptions', color: '#DDA0DD' },
];

export default function NewExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    billable: false,
    reimbursable: true,
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/expenses');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/expenses" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Expenses
        </Link>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => router.push('/expenses')}>
            Discard
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Save Expense
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          {/* Receipt Upload */}
          <Card className={styles.uploadCard}>
            <CardContent>
              <div className={styles.uploadArea}>
                <div className={styles.uploadIcon}>📷</div>
                <p className={styles.uploadText}>Drop receipt here or click to browse</p>
                <p className={styles.uploadHint}>Supports: JPG, PNG, PDF (max 10MB)</p>
                <div className={styles.uploadButtons}>
                  <Button variant="outline" size="sm" icon={<Upload size={16} />}>
                    Upload File
                  </Button>
                  <Button variant="outline" size="sm" icon={<Camera size={16} />}>
                    Take Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Form */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className={styles.form}>
                <div className={styles.formRow}>
                  <Input
                    label="Merchant *"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    placeholder="e.g., Starbucks, Uber"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.amountGroup}>
                    <Input
                      label="Amount *"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className={styles.currencySelect}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <Input
                    label="Date *"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about this expense..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.billable}
                      onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                    />
                    <span>Billable to client</span>
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.reimbursable}
                      onChange={(e) => setFormData({ ...formData, reimbursable: e.target.checked })}
                    />
                    <span>Reimbursable</span>
                  </label>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        <div className={styles.sidebar}>
          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.aiBox}>
                <div className={styles.aiIcon}>🤖</div>
                <p className={styles.aiText}>
                  Upload a receipt and our AI will automatically extract merchant, amount, date, and suggest a category.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
