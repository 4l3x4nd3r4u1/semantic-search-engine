/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: 'stream-browserify' // Usa directamente el nombre del paquete
      };
    }
    return config;
  },
};

export default nextConfig;
