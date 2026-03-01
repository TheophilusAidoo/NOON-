/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Prevents 500 when external image fetch fails (network/DNS)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.amazonaws.com', pathname: '/**' },
      // GIF support (Giphy, Imgur, Tenor, etc.)
      { protocol: 'https', hostname: 'media.giphy.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.giphy.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.tenor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.tenor.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  // Proxy API requests to backend - avoids CORS and Network Error when backend runs on :5000
  async rewrites() {
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
