'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Users, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SellerProfile {
  id: string;
  user_id: string;
  seller_type: string;
  status: string;
  business_name: string | null;
  registration_number: string | null;
  tax_id: string | null;
  bank_account_name: string;
  rejection_reason: string | null;
  created_at: string;
  auth_user?: {
    email: string;
    raw_user_meta_data: {
      full_name: string;
    };
  };
}

export default function AdminSellersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchSellers();
  }, [filterStatus]);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
  };

  const fetchSellers = async () => {
    try {
      const url = filterStatus === 'all'
        ? '/api/sellers/admin'
        : `/api/sellers/admin?status=${filterStatus}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerId: string) => {
    if (!confirm('Are you sure you want to approve this seller?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/sellers/admin/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve seller');
      }

      alert('Seller approved successfully!');
      fetchSellers();
      setSelectedSeller(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve seller');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSeller) return;

    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/sellers/admin/${selectedSeller.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject seller');
      }

      alert('Seller rejected successfully!');
      setRejectionReason('');
      setSelectedSeller(null);
      fetchSellers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reject seller');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Seller Management</h1>
          <p className="text-muted-foreground">
            Review and manage seller applications
          </p>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All Sellers
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({sellers.filter(s => s.status === 'pending').length})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
              >
                Approved ({sellers.filter(s => s.status === 'approved').length})
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected ({sellers.filter(s => s.status === 'rejected').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sellers List */}
        {sellers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No sellers found</h2>
              <p className="text-muted-foreground">
                {filterStatus === 'all'
                  ? 'No sellers have registered yet'
                  : `No sellers with status: ${filterStatus}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sellers.map((seller) => (
              <Card key={seller.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {seller.seller_type === 'business' ? (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold text-lg">
                          {seller.business_name || 'Individual Seller'}
                        </h3>
                        <Badge className={getStatusColor(seller.status)}>
                          {getStatusIcon(seller.status)}
                          {seller.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {seller.auth_user?.email}
                        {seller.auth_user?.raw_user_meta_data?.full_name &&
                          ` • ${seller.auth_user.raw_user_meta_data.full_name}`}
                      </p>

                      {seller.seller_type === 'business' && (
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="font-medium">Registration Number</p>
                            <p className="text-muted-foreground">{seller.registration_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Tax ID</p>
                            <p className="text-muted-foreground">{seller.tax_id || 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      <div className="text-sm mb-4">
                        <p className="font-medium">Bank Account</p>
                        <p className="text-muted-foreground">
                          {seller.bank_account_name}
                        </p>
                      </div>

                      {seller.rejection_reason && (
                        <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg mb-4">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {seller.rejection_reason}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Applied on {new Date(seller.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {seller.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedSeller(seller)}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(seller.id)}
                          disabled={processing}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Reject Seller Application</CardTitle>
              <CardDescription>
                Please provide a reason for rejecting this seller
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">
                  {selectedSeller.business_name || 'Individual Seller'}
                </p>
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSeller(null);
                    setRejectionReason('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
