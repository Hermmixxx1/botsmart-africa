'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, Mail, Phone, ArrowLeft, Eye, EyeOff, Shield, Users, Store } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useStore } from '@/store/useStore';
import { useToast } from '@/lib/use-toast';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const type = searchParams.get('type');
  const { setUser } = useStore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');
  const [supabase, setSupabase] = useState<any>(null);
  const [credentialsError, setCredentialsError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth/check-session');
        const data = await res.json();
        
        if (data.user) {
          // User is already logged in, redirect based on admin status
          const adminCheck = await fetch('/api/auth/check-admin');
          const adminData = await adminCheck.json();
          
          if (adminData.isAdmin) {
            router.push('/admin');
          } else {
            router.push(redirect);
          }
        }
      } catch (e) {
        // Continue to login form
      }
    }
    
    checkExistingSession();
  }, []);

  // Initialize Supabase on mount
  useEffect(() => {
    async function initSupabase() {
      try {
        // First try NEXT_PUBLIC_ vars, then fall back to COZE_ vars
        let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
        let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;
        
        // If not available, try fetching from config API
        if (!url || !key) {
          try {
            const response = await fetch('/api/config', { 
              credentials: 'include',
              cache: 'no-store'
            });
            if (response.ok) {
              const config = await response.json();
              url = url || config.supabaseUrl;
              key = key || config.supabaseAnonKey;
            }
          } catch (e) {
            console.log('Config API not available');
          }
        }
        
        if (url && key) {
          setSupabaseUrl(url);
          setSupabaseAnonKey(key);
          const client = createClient(url, key, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
            },
          });
          setSupabase(client);
        } else {
          console.error('Missing Supabase credentials');
          setCredentialsError('Supabase credentials not configured. Please check environment variables.');
        }
      } catch (err) {
        console.error('Failed to init Supabase:', err);
        setCredentialsError('Failed to initialize authentication');
      }
    }
    
    initSupabase();
  }, []);

  // Check for email confirmation
  useEffect(() => {
    if (supabase && type === 'confirmation') {
      handleEmailCallback();
    }
  }, [supabase, type]);

  const handleEmailCallback = async () => {
    if (!supabase) return;
    setVerificationLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data.session?.user?.email_confirmed_at) {
        setEmailVerified(true);
        toast({
          title: "Email Verified!",
          description: "Your email has been verified successfully.",
        });
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          full_name: data.session.user.user_metadata?.full_name,
          avatar_url: data.session.user.user_metadata?.avatar_url,
        });
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Could not verify email.",
        variant: "destructive",
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!supabase || !pendingEmail) return;
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      });
      if (error) throw error;
      toast({
        title: "Email Sent",
        description: "A new confirmation email has been sent.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to resend email.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '', phone: '', confirmPassword: '' });
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
      if (signInError) throw Error(signInError.message);

      if (!data.user?.email_confirmed_at) {
        setEmailNotVerified(true);
        setPendingEmail(signInData.email);
        toast({
          title: "Email Not Verified",
          description: "Please check your email and click the confirmation link.",
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

      // Check if user is admin and redirect accordingly
      try {
        const adminCheck = await fetch('/api/auth/check-admin');
        const adminData = await adminCheck.json();
        
        if (adminData.isAdmin) {
          router.push('/admin');
        } else {
          router.push(redirect);
        }
      } catch {
        router.push(redirect);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
            phone: signUpData.phone,
          },
        },
      });
      if (signUpError) throw Error(signUpError.message);

      if (!data.user?.email_confirmed_at) {
        setEmailNotVerified(true);
        setPendingEmail(signUpData.email);
        toast({
          title: "Account Created!",
          description: "Please check your email to confirm your account.",
        });
      } else {
        setUser({
          id: data.user!.id,
          email: data.user!.email || '',
          full_name: data.user!.user_metadata?.full_name,
          avatar_url: data.user!.user_metadata?.avatar_url,
        });
        router.push(redirect);
        router.refresh();
      }
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
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
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

  // Error State
  if (credentialsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Configuration Error</CardTitle>
            <CardDescription>{credentialsError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading States
  if (verificationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Verifying...</h3>
            <p className="text-muted-foreground">Please wait while we verify your email.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-400">Email Verified!</h3>
            <p className="text-muted-foreground">Redirecting you to the app...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Loading...</h3>
            <p className="text-muted-foreground">Setting up authentication</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Botsmart Africa</h1>
            <p className="text-muted-foreground">Southern Africa&apos;s Premier Multi-Vendor Marketplace</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          {/* Email Verification Alert */}
          {emailNotVerified && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Email Verification Required</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      We&apos;ve sent a confirmation email to <strong>{pendingEmail}</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                        className="border-yellow-300"
                      >
                        {resendLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Resend Email'
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEmailNotVerified(false);
                          setPendingEmail('');
                          setError('');
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Auth Card */}
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">Account</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Tabs defaultValue={type || 'signin'} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="reset">Reset</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Smith"
                        required
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+27 XX XXX XXXX"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{' '}
                      <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                  </form>
                </TabsContent>

                {/* Reset Password Tab */}
                <TabsContent value="reset">
                  {resetSent ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Check Your Email</h3>
                      <p className="text-muted-foreground mb-4">
                        We&apos;ve sent a password reset link to <strong>{resetEmail}</strong>
                      </p>
                      <Button variant="outline" onClick={() => setResetSent(false)}>
                        Try Different Email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      {error && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                      )}
                      <div className="text-center mb-4">
                        <p className="text-muted-foreground text-sm">
                          Enter your email and we&apos;ll send you a link to reset your password.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
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

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-card/50 rounded-xl p-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Secure</p>
              <p className="text-xs text-muted-foreground">SSL Protected</p>
            </div>
            <div className="bg-card/50 rounded-xl p-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Store className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">Multi-Vendor</p>
              <p className="text-xs text-muted-foreground">12 Countries</p>
            </div>
            <div className="bg-card/50 rounded-xl p-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Join Us</p>
              <p className="text-xs text-muted-foreground">Become a Seller</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              &larr; Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
