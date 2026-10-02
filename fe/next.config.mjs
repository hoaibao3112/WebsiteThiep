/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google.com https://*.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' https: data: blob: res.cloudinary.com;
  font-src 'self' https://fonts.gstatic.com data:;
  media-src 'self' https: data: blob: res.cloudinary.com;
  connect-src 'self' https: wss:;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig = {
  transpilePackages: ["framer-motion"],
  async rewrites() {
    const backendOrigin =
      process.env.BACKEND_ORIGIN ||
      process.env.BACKEND_INTERNAL_URL ||
      "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
