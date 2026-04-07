'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getCurrentUser } from '@/lib/auth';
import { useRouter, useParams } from 'next/navigation';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
}

export default function AdminPageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const isNew = !pageId || pageId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<Page>({
    id: '',
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
  });

  useEffect(() => {
    checkAuth();
    if (!isNew) {
      fetchPage();
    }
  }, [pageId]);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
  };

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data.page);
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = isNew ? '/api/admin/pages' : `/api/admin/pages/${pageId}`;
      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save page');
      }

      alert('Page saved successfully!');
      if (isNew) {
        router.push('/admin/pages');
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setPage({ ...page, title: value, slug: generateSlug(value) });
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2">
              <Link href="/admin/pages">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pages
              </Link>
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">
              {isNew ? 'Create New Page' : 'Edit Page'}
            </h1>
          </div>
          <div className="flex gap-2">
            {!isNew && page.is_published && (
              <Button variant="outline" asChild>
                <Link href={`/page/${page.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Page'}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                value={page.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Page"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={page.slug}
                onChange={(e) => setPage({ ...page, slug: e.target.value })}
                placeholder="my-page"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                The URL will be: /page/{page.slug}
              </p>
            </div>

            <div>
              <Label htmlFor="content">Page Content *</Label>
              <Textarea
                id="content"
                value={page.content}
                onChange={(e) => setPage({ ...page, content: e.target.value })}
                rows={15}
                placeholder="Enter your page content..."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports HTML formatting
              </p>
            </div>

            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={page.meta_title || ''}
                onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                placeholder="My Page - My Store"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Title shown in search results
              </p>
            </div>

            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={page.meta_description || ''}
                onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                rows={3}
                placeholder="A brief description of your page..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Description shown in search results
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={page.is_published}
                onCheckedChange={(checked) => setPage({ ...page, is_published: checked })}
              />
              <Label htmlFor="is_published">Publish this page</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
