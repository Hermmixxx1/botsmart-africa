/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

// Global window extensions for Supabase
interface Window {
  __SUPABASE_URL__?: string;
  __SUPABASE_ANON_KEY__?: string;
}
