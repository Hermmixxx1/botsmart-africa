'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ClaimAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);

  useEffect(() => {
    checkUserAndClaim();
  }, []);

  const checkUserAndClaim = async () => {
    try {
      // Get current user from session
      const userRes = await fetch('/api/auth/check-session');
      const userData = await userRes.json();
      
      if (!userData.user) {
        router.push('/auth?redirect=/claim-admin');
        return;
      }
      
      setUser(userData.user);

      // Check if already an admin
      const adminRes = await fetch('/api/auth/check-admin');
      const adminData = await adminRes.json();
      
      if (adminData.isAdmin) {
        // Already an admin, redirect to admin panel
        router.push('/admin');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResult({ success: false, message: 'Failed to check admin status' });
      setLoading(false);
    }
  };

  const handleClaimAdmin = async () => {
    setClaiming(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/claim-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: 'You are now an admin! Redirecting...' });
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setResult({ success: false, message: data.error || 'Failed to claim admin' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Something went wrong. Please try again.' });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Claim Admin Access</CardTitle>
            <CardDescription className="text-white/70">
              You&apos;re logged in as <span className="font-semibold text-white">{user?.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {result && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                result.success 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="text-sm">{result.message}</span>
              </div>
            )}

            <p className="text-white/80 text-center mb-6">
              Your account exists but isn&apos;t registered as an admin. Click below to claim admin access.
            </p>

            <Button
              onClick={handleClaimAdmin}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {claiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming Admin...
                </>
              ) : (
                'Claim Admin Access'
              )}
            </Button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                After claiming admin, you&apos;ll be redirected to{' '}
                <Link href="/admin" className="text-purple-400 hover:underline">
                  /admin
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
