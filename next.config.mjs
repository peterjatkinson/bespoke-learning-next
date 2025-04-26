/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'oaidalleapiprodscus.blob.core.windows.net',
          port: '', // No port specified in your URL
          pathname: '/private/**', // Matches any path that starts with '/private/'
        },
        // Add other remote patterns if you have other external image sources
      ],
      // Alternative using the domains array (less specific than remotePatterns)
      // domains: ['oaidalleapiprodscus.blob.core.windows.net'],
    },
    // Add any other Next.js configurations you might have here
  };
  
  export default nextConfig;
  