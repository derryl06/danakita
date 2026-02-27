/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Menentukan jalur dasar aplikasi agar sesuai dengan nama repository GitHub (danakita)
  basePath: process.env.NODE_ENV === 'production' ? '/danakita' : '',
  // Memastikan semua link diakhiri dengan slash (penting untuk GitHub Pages)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
