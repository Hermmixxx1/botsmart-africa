'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Palette, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/use-toast';

interface SiteSettings {
  store_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  contact_email: string;
  contact_phone: string;
  social_media: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  platform_fee_percentage: string;
  shipping_policy: string;
  return_policy: string;
  privacy_policy: string;
  terms_of_service: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    store_name: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#1e3a5f',
    secondary_color: '#ffffff',
    accent_color: '#000000',
    font_family: 'Inter',
    contact_email: '',
    contact_phone: '',
    social_media: {},
    platform_fee_percentage: '10',
    shipping_policy: '',
    return_policy: '',
    privacy_policy: '',
    terms_of_service: '',
  });

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/super">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground">
            Configure your store settings, appearance, and policies
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Basic information about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    placeholder="My Store"
                  />
                </div>

                <div>
                  <Label htmlFor="platform_fee_percentage">Platform Fee (%)</Label>
                  <Input
                    id="platform_fee_percentage"
                    type="number"
                    step="0.01"
                    value={settings.platform_fee_percentage}
                    onChange={(e) => setSettings({ ...settings, platform_fee_percentage: e.target.value })}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage charged to sellers on each sale
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize your store's visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={settings.favicon_url}
                    onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>

                <div>
                  <Label htmlFor="font_family">Font Family</Label>
                  <Input
                    id="font_family"
                    value={settings.font_family}
                    onChange={(e) => setSettings({ ...settings, font_family: e.target.value })}
                    placeholder="Inter"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
                <CardDescription>Choose your store's color scheme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent_color"
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.accent_color}
                      onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for highlights and emphasis
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How customers can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Your social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.social_media?.facebook || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      social_media: { ...settings.social_media, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.social_media?.twitter || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      social_media: { ...settings.social_media, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/yourstore"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.social_media?.instagram || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      social_media: { ...settings.social_media, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.social_media?.linkedin || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      social_media: { ...settings.social_media, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/company/yourstore"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Policies</CardTitle>
                <CardDescription>Define your store's policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shipping_policy">Shipping Policy</Label>
                  <Textarea
                    id="shipping_policy"
                    value={settings.shipping_policy}
                    onChange={(e) => setSettings({ ...settings, shipping_policy: e.target.value })}
                    rows={6}
                    placeholder="Enter your shipping policy..."
                  />
                </div>

                <div>
                  <Label htmlFor="return_policy">Return Policy</Label>
                  <Textarea
                    id="return_policy"
                    value={settings.return_policy}
                    onChange={(e) => setSettings({ ...settings, return_policy: e.target.value })}
                    rows={6}
                    placeholder="Enter your return policy..."
                  />
                </div>

                <div>
                  <Label htmlFor="privacy_policy">Privacy Policy</Label>
                  <Textarea
                    id="privacy_policy"
                    value={settings.privacy_policy}
                    onChange={(e) => setSettings({ ...settings, privacy_policy: e.target.value })}
                    rows={6}
                    placeholder="Enter your privacy policy..."
                  />
                </div>

                <div>
                  <Label htmlFor="terms_of_service">Terms of Service</Label>
                  <Textarea
                    id="terms_of_service"
                    value={settings.terms_of_service}
                    onChange={(e) => setSettings({ ...settings, terms_of_service: e.target.value })}
                    rows={6}
                    placeholder="Enter your terms of service..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
