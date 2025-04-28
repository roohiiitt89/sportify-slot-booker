
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SignIn: React.FC = () => {
  const { login, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setShowVerification(false);
    
    try {
      await login(values.email, values.password);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle "Email not confirmed" error specifically
      if (error.message && error.message.includes("Email not confirmed")) {
        setShowVerification(true);
        setVerificationEmail(values.email);
        setAuthError("Your email has not been confirmed. Please check your inbox for a verification link or request a new one.");
      } else {
        setAuthError(error.message || "Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend verification",
        description: error.message || "Could not send verification email. Please try again."
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
    }
  };

  const handleFacebookSignIn = async () => {
    toast({
      title: "Feature coming soon",
      description: "Facebook sign in will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 pt-28 pb-16 flex justify-center">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your Sportify Slots account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {authError && (
                  <Alert variant={showVerification ? "default" : "destructive"} className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{showVerification ? "Email Verification Required" : "Sign In Failed"}</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                    
                    {showVerification && verificationEmail && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={handleResendVerification}
                      >
                        Resend verification email
                      </Button>
                    )}
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="you@example.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-sports-blue hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-sports-navy hover:bg-sports-navy/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                  >
                    Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleFacebookSignIn}
                  >
                    Facebook
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-sports-green hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
