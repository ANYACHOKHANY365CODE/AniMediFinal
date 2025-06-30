import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
    error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate the hook into a named function declaration
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export both the hook and the provider
export { useAuth };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();

  const clearAuthState = useCallback(() => {
    console.log('Clearing auth state');
    setUser(null);
    setProfile(null);
        setIsLoading(false);
    if (location.pathname !== '/auth') {
      navigate('/auth', { replace: true });
    }
  }, [navigate, location.pathname]);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      console.log('Profile found:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  const createProfile = useCallback(async (userId: string, name: string, email: string) => {
    try {
      console.log('Creating profile for:', { userId, name, email });
      
      // First check if profile already exists
      const existingProfile = await fetchProfile(userId);
      if (existingProfile) {
        console.log('Profile already exists, returning existing profile');
        return existingProfile;
      }

      const timestamp = new Date().toISOString();
      const newProfile = {
        id: userId,
        name,
        email,
        role: 'pet_owner', // Default role for all users
        created_at: timestamp,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }, [fetchProfile]);

  const handleAuthStateChange = useCallback(async (session: any) => {
    try {
      console.log('Handling auth state change:', session?.user?.id);
      
      if (!session?.user) {
        clearAuthState();
        return;
      }

      // Set user immediately to prevent loops
      setUser(session.user);

      let profileData = await fetchProfile(session.user.id);
        
      // If no profile exists, try to create one
      if (!profileData) {
        try {
          profileData = await createProfile(
            session.user.id, 
            session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
            session.user.email || ''
          );
        } catch (error) {
          console.error('Failed to create profile:', error);
          clearAuthState();
          return;
        }
      }

      if (!profileData) {
        console.log('No valid profile found, clearing auth state');
        clearAuthState();
        return;
      }

      setProfile(profileData);

      // Check if user has any pets
      const { data: pets, error: petsError } = await supabase
          .from('pets')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
          
      if (petsError) {
        console.error('Error checking pets:', petsError);
      }

      // Only navigate if we're on auth or profile-setup
      if (['/auth', '/profile-setup'].includes(location.pathname)) {
        const targetPath = !pets || pets.length === 0 ? '/profile-setup' : '/medicare';
        navigate(targetPath, { replace: true });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error handling auth state:', error);
      clearAuthState();
    }
  }, [clearAuthState, location.pathname, navigate, fetchProfile, createProfile]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('Initializing auth state');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          console.log('No session found, clearing auth state');
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          setIsInitialized(true);
          // Don't navigate here if we are on the reset path
          if (location.pathname !== '/auth' && location.pathname !== '/reset-password') {
            navigate('/auth', { replace: true });
          }
          return;
        }
        
        await handleAuthStateChange(session);
        setIsInitialized(true);
        
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          clearAuthState();
          setIsInitialized(true);
        }
    }
  };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log('Auth event:', event, session);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected, navigating to reset screen.');
        navigate('/reset-password');
        setIsLoading(false);
        return;
      }

      if (session) {
        handleAuthStateChange(session);
      } else {
        // This handles SIGNED_OUT
        clearAuthState();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, clearAuthState, navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      if (!data.user) {
        throw new Error('No user returned after login');
      }

      // The profile will be handled by handleAuthStateChange
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            // is_public is no longer set here
          },
        },
      });
      
      if (error) {
        throw error;
      }
      if (!data.user) {
        throw new Error('Registration succeeded but no user data was returned.');
      }

      // The onAuthStateChange listener will now handle creating the profile
      
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Only responsibility is to call signOut.
    // The onAuthStateChange listener will handle all state and navigation changes.
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      login, 
      register, 
      logout, 
      refreshProfile,
      isLoading,
      error
    }}>
      {isInitialized && children}
    </AuthContext.Provider>
  );
}