/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimize server components
    serverComponentsExternalPackages: [],
  },
  
  // Optimize rendering
  poweredByHeader: false,
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Reduce dev server restarts
    webpack: (config) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      return config;
    },
  }),
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Optimize bundle
    swcMinify: true,
    compress: true,
  }),
};

module.exports = nextConfig; 