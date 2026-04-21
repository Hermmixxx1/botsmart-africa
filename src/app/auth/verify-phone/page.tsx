'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Phone, Timer } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useToast } from '@/lib/use-toast';

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

async function fetchConfig(): Promise<SupabaseConfig | null> {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }
  return null;
}

function VerifyPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const phone = searchParams.get('phone') || '';
  const token = searchParams.get('token') || '';
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Initialize Supabase
  useEffect(() => {
    async function initSupabase() {
      const config = await fetchConfig();
      if (config?.supabaseUrl && config?.supabaseAnonKey) {
        const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
        setSupabase(client);
      }
    }
    initSupabase();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Authentication not ready. Please wait...');
      return;
    }
    
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        throw error;
      }

      setVerified(true);
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been verified successfully.",
      });

      setTimeout(() => {
        router.push('/auth?verified=true');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!supabase) return;
    
    setResendLoading(true);
    setCountdown(60);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;

      toast({
        title: "Code Sent",
        description: "A new verification code has been sent.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to resend code.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone Verified!</h3>
              <p className="text-muted-foreground">Redirecting you...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Verify Your Phone</h1>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code sent to <strong>{phone}</strong>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Verification
            </CardTitle>
            <CardDescription>
              We sent an SMS with a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Timer className="h-4 w-4" />
                  Resend code in {countdown}s
                </p>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/auth" className="text-sm text-[#1e3a5f] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyPhoneContent />
    </Suspense>
  );
}
