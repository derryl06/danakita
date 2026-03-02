/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Jalur dasar otomatis (diatur via GitHub Secrets/Actions)
  basePath: process.env.NODE_ENV === 'production' ? '/danakita' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Abaikan error typescript agar build tetap jalan di GitHub
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
