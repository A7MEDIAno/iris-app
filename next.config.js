/** @type {import('next').NextConfig} */
const nextConfig = {
  // LEGG TIL DENNE - Viktig for SaaS
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Bør fikses på sikt
  },
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Bør fikses på sikt
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // LEGG TIL DETTE - Forhindrer caching av API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig