'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';
import styles from './page.module.css';

const supabase = createClient();

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-update display name if first or last name changes
    if (field === 'firstName' || field === 'lastName') {
      const newFirstName = field === 'firstName' ? value : formData.firstName;
      const newLastName = field === 'lastName' ? value : formData.lastName;
      setFormData(prev => ({
        ...prev,
        [field]: value,
        displayName: `${newFirstName} ${newLastName}`.trim()
      }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.uid);

      if (updateError) throw updateError;

      setSuccessMessage('Profile photo updated successfully');
      fetchUser(); // Refresh user data
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: formData.displayName,
          phone: formData.phone,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.uid);

      if (updateError) throw updateError;

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: formData.displayName,
        }
      });

      if (authError) throw authError;

      setSuccessMessage('Profile updated successfully! Redirecting to settings...');
      
      // Refresh user data
      await fetchUser();
      
      // Wait 1.5 seconds then redirect to settings page
      setTimeout(() => {
        router.push('/settings');
      }, 1500);
      
    } catch (err: unknown) {
      console.error('Update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setErrorMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || '';
    const last = formData.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/settings" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Settings
        </Link>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>Manage your personal information and profile photo</p>
      </div>

      <div className={styles.content}>
        {/* Avatar Section */}
        <Card className={styles.avatarCard}>
          <CardContent className={styles.avatarContent}>
            <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
              {avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt="Profile" 
                  className={styles.avatarImage}
                  width={96}
                  height={96}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {getInitials()}
                </div>
              )}
              <div className={styles.avatarOverlay}>
                <Camera size={24} />
                <span>Change Photo</span>
              </div>
              {isLoading && (
                <div className={styles.avatarLoading}>
                  <Loader2 size={32} className={styles.spinner} />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />
            <p className={styles.avatarHint}>
              Click to upload a new photo. JPG, PNG or GIF. Max 5MB.
            </p>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              {successMessage && (
                <div className={styles.successMessage}>
                  <CheckCircle size={18} />
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className={styles.errorMessage}>
                  {errorMessage}
                </div>
              )}

              <div className={styles.formRow}>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  icon={<User size={18} />}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>

              <Input
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="John Doe"
                icon={<User size={18} />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                disabled
                icon={<Mail size={18} />}
                helperText="Email cannot be changed. Contact support if you need to update it."
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                icon={<Phone size={18} />}
              />

              <div className={styles.formActions}>
                <Button 
                  type="submit" 
                  loading={isSaving}
                  className={`${styles.saveButton} ${successMessage ? styles.saveButtonSuccess : ''}`}
                  disabled={!!successMessage}
                >
                  {successMessage ? (
                    <>
                      <CheckCircle size={18} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
