
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client"; 
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
  
  // Transform Supabase user to our User type with a simpler approach
  const mapSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null;
    
    let userRole = 'user';
    
    try {
      console.log("Checking roles for user:", supabaseUser.id);
      
      // First check if user has admin or super_admin role in user_roles
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();
      
      if (roleError) {
        console.error('Error checking user role:', roleError);
      }
      
      // Then check if user is a venue admin
      const { data: venueAdminData, error: venueError } = await supabase
        .from('venue_admins')
        .select('id')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();
      
      if (venueError) {
        console.error('Error checking venue admin status:', venueError);
      }

      // Set the appropriate role based on the results
      if (userRoleData?.role === 'super_admin') {
        userRole = 'super_admin';
        console.log("User has super_admin role");
      } else if (userRoleData?.role === 'admin') {
        userRole = 'admin';
        console.log("User has admin role");
      } else if (venueAdminData) {
        userRole = 'admin'; // Treat venue admins as admins for UI purposes
        console.log("User is a venue admin, setting role to admin");
      }
      
      console.log("Final determined role:", userRole);
    } catch (error) {
      console.error('Error checking user role:', error);
    }
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: userRole as 'user' | 'admin' | 'super_admin'
    };
  };
  
  // Initialize auth state from Supabase
  useEffect(() => {
    console.log("Initializing auth state");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Transform Supabase user to our User type
          const userInfo = await mapSupabaseUser(currentSession.user);
          console.log("User info after mapping:", userInfo);
          setUser(userInfo);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session exists" : "No session");
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Transform Supabase user to our User type
        const userInfo = await mapSupabaseUser(currentSession.user);
        console.log("Initial user info:", userInfo);
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
    console.log("Login attempt for email:", email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      console.log("Login successful, data:", data);
      toast({
        title: "Login successful",
        description: `Welcome back${data.user ? ', ' + (data.user.user_metadata?.name || data.user.email?.split('@')[0] || '') : ''}!`,
      });
    } catch (error: any) {
      console.error("Login error details:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function using Supabase
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    console.log("Signup attempt for:", email);
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
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup successful, data:", data);
    } catch (error: any) {
      console.error("Signup error details:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function using Supabase
  const logout = async () => {
    try {
      console.log("Attempting logout");
      await supabase.auth.signOut();
      console.log("Logout successful");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
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
