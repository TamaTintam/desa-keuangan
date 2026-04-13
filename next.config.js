/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Solusi 1: Allow all external images (development)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],

    // Solusi 2: Atau list spesifik domain
    // domains: [
    //   'localhost',
    //   '**.supabase.co',
    //   'www.google.com',
    //   'images.unsplash.com',
    //   'images.alodokter.com',
    //   'cdninstagram.com',
    //   'fbcdn.net',
    //   'pbs.twimg.com',
    // ],
    
    // Solusi 3: Disable optimization untuk semua gambar (paling aman)
    unoptimized: true,
  },
}

module.exports = nextConfig
