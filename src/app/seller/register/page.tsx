'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/lib/use-toast';

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingSeller, setExistingSeller] = useState<any>(null);
  const [error, setError] = useState('');
  const [sellerType, setSellerType] = useState<'individual' | 'business'>('individual');

  const [formData, setFormData] = useState({
    business_name: '',
    registration_number: '',
    tax_id: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_routing_number: '',
  });

  useEffect(() => {
    checkAuthAndSellerStatus();
  }, []);

  const checkAuthAndSellerStatus = async () => {
    setChecking(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth?redirect=/seller/register');
        return;
      }

      // Check if user already has a seller profile
      const response = await fetch('/api/sellers');
      if (response.ok) {
        const data = await response.json();
        if (data.seller) {
          setExistingSeller(data.seller);
        }
      }
    } catch (err) {
      console.error('Error checking seller status:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_type: sellerType,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Registration Submitted',
        description: 'Your seller application has been submitted.',
      });
      router.push('/seller/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Registration failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking your status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show existing seller status
  if (existingSeller) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                You're Already a Seller
              </CardTitle>
              <CardDescription>
                You already have a seller account registered with us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Your Seller Status</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    existingSeller.status === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : existingSeller.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {existingSeller.status.charAt(0).toUpperCase() + existingSeller.status.slice(1)}
                  </span>
                </div>
                {existingSeller.status === 'pending' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Your account is under review. We'll notify you once approved.
                  </p>
                )}
                {existingSeller.status === 'rejected' && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">Reason: {existingSeller.rejection_reason || 'No reason provided'}</p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => setExistingSeller(null)}
                    >
                      Register Again
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/seller/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Shop</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Become a Seller</h1>
          <p className="text-muted-foreground">
            Start selling on Botsmart Africa and reach customers across 12 Southern African countries
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seller Registration</CardTitle>
            <CardDescription>
              Choose your seller type and fill in the required information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={sellerType} onValueChange={(v) => setSellerType(v as 'individual' | 'business')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual">
                  <User className="mr-2 h-4 w-4" />
                  Individual
                </TabsTrigger>
                <TabsTrigger value="business">
                  <Building2 className="mr-2 h-4 w-4" />
                  Business
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {sellerType === 'business' && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Business Information
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        required
                        value={formData.business_name}
                        onChange={(e) =>
                          setFormData({ ...formData, business_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Registration Number *</Label>
                      <Input
                        id="registration_number"
                        required
                        value={formData.registration_number}
                        onChange={(e) =>
                          setFormData({ ...formData, registration_number: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) =>
                          setFormData({ ...formData, tax_id: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold">Bank Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Holder Name *</Label>
                    <Input
                      id="bank_account_name"
                      required
                      value={formData.bank_account_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_account_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">Account Number *</Label>
                    <Input
                      id="bank_account_number"
                      required
                      value={formData.bank_account_number}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_account_number: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_routing_number">Routing Number *</Label>
                    <Input
                      id="bank_routing_number"
                      required
                      value={formData.bank_routing_number}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_routing_number: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Platform Fee & Payouts</p>
                      <p className="text-sm text-muted-foreground">
                        Botsmart Africa charges a 10% platform fee on each sale. The remaining 90%
                        will be paid out to your bank account. Business sellers require
                        admin approval before they can start selling.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Register as Seller'}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
