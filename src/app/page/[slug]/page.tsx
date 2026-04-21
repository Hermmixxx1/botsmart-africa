import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabase } from '@/storage/database/supabase-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  const client = getSupabase();
  
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || `${page.title} - Botsmart Africa`,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">{page.title}</h1>
        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}
