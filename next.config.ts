import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,

  // Configuração de headers
  async headers() {
    const headers = [];

    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      });
    }

    return headers;
  },
};

export default config;
