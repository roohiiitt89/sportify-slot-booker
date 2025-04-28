
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient"; 
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Define user type
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Function to fetch user roles from the database
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error fetching user roles:", error);
        return null;
      }
      
      return roles;
    } catch (err) {
      console.error("Error in fetchUserRoles:", err);
      return null;
    }
  };

  // Helper function to map Supabase user to our User type
  const mapSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    // Fetch user roles from database
    const roles = await fetchUserRoles(supabaseUser.id);
    
    // Determine the highest privilege role
    let highestRole: 'user' | 'admin' | 'super_admin' = 'user';
    
    if (roles && roles.length > 0) {
      if (roles.some(r => r.role === 'super_admin')) {
        highestRole = 'super_admin';
      } else if (roles.some(r => r.role === 'admin')) {
        highestRole = 'admin';
      }
    }
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: highestRole
    };
  };
  
  // Initialize auth state from Supabase
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Transform Supabase user to our User type
          const userInfo = await mapSupabaseUser(currentSession.user);
          setUser(userInfo);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Transform Supabase user to our User type
        const userInfo = await mapSupabaseUser(currentSession.user);
        setUser(userInfo);
      }
      
      setIsLoading(false);
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function using Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: `Welcome back${data.user ? ', ' + (data.user.user_metadata?.name || data.user.email?.split('@')[0] || '') : ''}!`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function using Supabase
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'user'
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function using Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "Could not log you out. Please try again.",
      });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoggedIn: !!user, 
        isLoading, 
        login, 
        signup, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
