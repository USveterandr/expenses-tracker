'use client';

import { create } from 'zustand';
import { User, UserPreferences } from '@/types';
import { createClient } from '@/lib/supabase/client-browser';

interface SignupResult {
  requiresEmailConfirmation: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

const supabase = createClient();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const user: User = {
        uid: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
        preferences: profile.preferences as UserPreferences,
        workspaceIds: [],
        activeWorkspaceId: null,
        status: profile.status,
        role: profile.role,
        onboardingCompleted: profile.onboarding_completed,
        lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : new Date(),
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      };

      // Fetch user's workspaces
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', authUser.id)
        .eq('status', 'active');

      user.workspaceIds = memberships?.map((m) => m.workspace_id) || [];
      user.activeWorkspaceId = user.workspaceIds[0] || null;

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      // Fetch full user data
      await useAuthStore.getState().fetchUser();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (data: SignupData): Promise<SignupResult> => {
    set({ isLoading: true });
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: `${data.firstName} ${data.lastName}`,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      // Check if email confirmation is required
      // If session is null, user needs to confirm email
      const requiresEmailConfirmation = !authData.session;

      if (authData.session) {
        // User is confirmed and logged in automatically
        // Profile is created automatically by database trigger
        // Update profile with full name if needed
        await supabase.from('profiles').update({
          display_name: `${data.firstName} ${data.lastName}`,
          first_name: data.firstName,
          last_name: data.lastName,
        }).eq('id', authData.user.id);

        // Create default workspace for user
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .insert({
            name: data.companyName || `${data.firstName}'s Workspace`,
            type: data.companyName ? 'corporate' : 'personal',
            owner_id: authData.user.id,
            owner_email: data.email,
          })
          .select()
          .single();

        if (workspaceError) {
          throw workspaceError;
        }

        // Add user as workspace member
        const { error: memberError } = await supabase.from('workspace_members').insert({
          workspace_id: workspace.id,
          user_id: authData.user.id,
          email: data.email,
          display_name: `${data.firstName} ${data.lastName}`,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
        });

        if (memberError) {
          // Rollback: delete created workspace if member creation fails
          await supabase.from('workspaces').delete().eq('id', workspace.id);
          throw memberError;
        }

        // Fetch full user data
        await useAuthStore.getState().fetchUser();
      }

      set({ isLoading: false });
      return { requiresEmailConfirmation: !requiresEmailConfirmation };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }

    set({ isLoading: false });
  },

  resendConfirmationEmail: async (email: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },
}));
