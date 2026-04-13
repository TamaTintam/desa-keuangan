/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Ini sudah benar!
    
    // Optional: Tetap boleh tambahkan domains untuk dokumentasi
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
