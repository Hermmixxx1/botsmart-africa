import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  env: {
    COZE_SUPABASE_URL: process.env.COZE_SUPABASE_URL,
    COZE_SUPABASE_ANON_KEY: process.env.COZE_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
