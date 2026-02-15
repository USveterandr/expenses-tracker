'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client-browser';
import { useAuthStore } from '@/lib/stores/authStore';
import styles from './page.module.css';

const supabase = createClient();

export default function ScanPage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  interface OCRResult {
    id: string;
    merchant: string;
    date: string;
    amount: string;
    category: string;
    confidence: number;
    status: string;
  }

  const [results, setResults] = useState<OCRResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processReceipts = async () => {
    if (uploadedFiles.length === 0 || !user) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.uid}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);

        // Create receipt record
        const { data: receipt, error: receiptError } = await supabase
          .from('receipts')
          .insert({
            user_id: user.uid,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            original_url: publicUrl,
            ocr_status: 'processing',
          })
          .select()
          .single();

        if (receiptError) throw receiptError;

        // Simulate OCR processing (in real app, this would be done by a server function)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock OCR result
        const mockResult = {
          id: receipt.id,
          merchant: ['Starbucks', 'Uber', 'Amazon', 'Whole Foods', 'Shell'][Math.floor(Math.random() * 5)],
          date: new Date().toISOString().split('T')[0],
          amount: (Math.random() * 100 + 10).toFixed(2),
          category: ['Meals', 'Transportation', 'Office Supplies', 'Software'][Math.floor(Math.random() * 4)],
          confidence: 0.85 + Math.random() * 0.14,
          status: 'completed',
        };

        // Update receipt with OCR data
        await supabase
          .from('receipts')
          .update({
            ocr_status: 'completed',
            ocr_extracted_data: mockResult,
            confidence: mockResult.confidence,
          })
          .eq('id', receipt.id);

        setResults(prev => [...prev, mockResult]);
        setProcessingProgress(((i + 1) / uploadedFiles.length) * 100);
      }

      setUploadedFiles([]);
    } catch (err: unknown) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process receipts';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Scan Receipt</h1>
          <p className={styles.subtitle}>Upload receipts to automatically extract expense data</p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Upload Area */}
        <Card className={styles.uploadCard}>
          <CardContent className={styles.uploadContent}>
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${uploadedFiles.length > 0 ? styles.hasFiles : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileSelect}
                className={styles.hiddenInput}
              />
              
              {uploadedFiles.length === 0 ? (
                <>
                  <div className={styles.uploadIcon}>
                    <Camera size={48} />
                  </div>
                  <h3 className={styles.uploadTitle}>Drop receipts here</h3>
                  <p className={styles.uploadSubtitle}>
                    or click to browse files
                  </p>
                  <p className={styles.uploadHint}>
                    Supports: JPG, PNG, PDF (max 10MB)
                  </p>
                </>
              ) : (
                <div className={styles.filesList} onClick={(e) => e.stopPropagation()}>
                  <h3 className={styles.filesTitle}>
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                  </h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <FileImage size={20} className={styles.fileIcon} />
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className={styles.uploadActions}>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload size={18} />
                  Add More
                </Button>
                <Button
                  onClick={processReceipts}
                  loading={isProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Processing... {Math.round(processingProgress)}%
                    </>
                  ) : (
                    <>
                      Process {uploadedFiles.length} Receipt{uploadedFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Progress */}
        {isProcessing && (
          <Card className={styles.progressCard}>
            <CardContent>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <p className={styles.progressText}>
                Processing {uploadedFiles.length} receipt{uploadedFiles.length !== 1 ? 's' : ''}...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className={styles.resultsTitle}>
                <CheckCircle size={24} className={styles.successIcon} />
                Successfully Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.resultsList}>
                {results.map((result, index) => (
                  <div key={index} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultMerchant}>{result.merchant}</span>
                      <span className={styles.resultAmount}>${result.amount}</span>
                    </div>
                    <div className={styles.resultDetails}>
                      <span className={styles.resultDate}>{result.date}</span>
                      <span className={styles.resultCategory}>{result.category}</span>
                      <span className={styles.resultConfidence}>
                        {Math.round(result.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.resultsActions}>
                <Button variant="outline" onClick={() => setResults([])}>
                  Clear Results
                </Button>
                <Button>
                  Create Expenses
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className={styles.tipsCard}>
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={styles.tipsList}>
              <li>Ensure the receipt is well-lit and in focus</li>
              <li>Include all corners and edges of the receipt</li>
              <li>Avoid glare and shadows on the receipt</li>
              <li>For long receipts, take multiple photos if needed</li>
              <li>PDF files should be clear and not scanned at an angle</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
