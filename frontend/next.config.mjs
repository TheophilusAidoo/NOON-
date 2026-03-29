/** @type {import('next').NextConfig} */
function getBackendBase() {
  let base =
    process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:5001/api';
  base = base.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  if (!base.startsWith('http')) {
    base = 'http://localhost:5001';
  }
  return base;
}

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
  // Proxy API + Socket.IO to backend (same-origin in browser; avoids baked-in localhost in prod)
  async rewrites() {
    const base = getBackendBase();
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${base}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
