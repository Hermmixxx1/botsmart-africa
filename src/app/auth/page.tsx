'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useStore } from '@/store/useStore';
import { useToast } from '@/lib/use-toast';

// Get Supabase credentials from environment
const getSupabaseCredentials = () => {
  // Try window variables first (set by layout)
  let url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || '';
  let key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) || '';
  
  // Fallback to NEXT_PUBLIC_ environment variables
  if (!url) {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  if (!key) {
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  
  return { url, key };
};

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const { setUser } = useStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [credentialsError, setCredentialsError] = useState('');

  // Initialize Supabase client after mount
  useEffect(() => {
    const { url, key } = getSupabaseCredentials();
    
    if (url && key) {
      try {
        const client = createClient(url, key, {
          auth: {
            persistSession: true,
            storageKey: 'supabase-auth',
            autoRefreshToken: true,
          },
        });
        setSupabase(client);
        console.log('Supabase client initialized successfully');
      } catch (err) {
        console.error('Failed to create Supabase client:', err);
        setCredentialsError('Failed to initialize authentication. Please refresh the page.');
      }
    } else {
      console.error('Missing Supabase credentials:', { url: !!url, key: !!key });
      setCredentialsError('Configuration error. Supabase credentials are missing. Please refresh the page.');
    }
  }, []);

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: 'hermixxlame@gmail.com',
    password: 'Admin123456',
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Authentication not ready. Please wait...');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Check if email is confirmed
      if (!data.user?.email_confirmed_at) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and click the confirmation link before signing in.",
          variant: "destructive",
        });
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        full_name: data.user.user_metadata?.full_name,
        avatar_url: data.user.user_metadata?.avatar_url,
      });

      // Redirect to the specified URL
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      console.error('Sign in error:', err);
      // Handle "Failed to fetch" error
      if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Authentication not ready. Please wait...');
      return;
    }

    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      setUser({
        id: data.user!.id,
        email: data.user!.email || '',
        full_name: data.user!.user_metadata?.full_name,
        avatar_url: data.user!.user_metadata?.avatar_url,
      });

      alert('Sign up successful! Please check your email to confirm your account.');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!supabase) {
      setError('Authentication not ready. Please wait...');
      return;
    }

    setError('');
    setResetLoading(true);

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setResetSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for a password reset link",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  if (credentialsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuration Error</CardTitle>
            <CardDescription>{credentialsError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to</h1>
          <h2 className="text-4xl font-bold text-[#1e3a5f]">Botsmart Africa</h2>
          <p className="mt-2 text-gray-600">Southern Africa&apos;s Premier Multi-Vendor Marketplace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      required
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({ ...signInData, password: e.target.value })
                      }
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={signUpData.fullName}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      required
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>

              {/* Password Reset Tab */}
              <TabsContent value="reset">
                {resetSent ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                    <p className="text-muted-foreground mb-4">
                      We've sent a password reset link to <strong>{resetEmail}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Didn't receive it? Check your spam folder or try again.
                    </p>
                    <Button variant="outline" onClick={() => setResetSent(false)}>
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="text-center mb-4">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-[#1e3a5f] hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
