'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';

export default function SellerRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
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

      router.push('/seller/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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

                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold">Bank Account Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Where should we send your payouts?
                  </p>
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
                  <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Platform Fee & Payouts</p>
                      <p className="text-sm text-muted-foreground">
                        ShopHub charges a 10% platform fee on each sale. The remaining 90%
                        will be paid out to your bank account. Business sellers require
                        admin approval before they can start selling.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
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
