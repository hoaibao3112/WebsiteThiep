/** @type {import('next').NextConfig} */
// Backend origin cho CSP — cấu hình qua env var, tránh hardcode domain production
const backendCspOrigin = process.env.NEXT_PUBLIC_BACKEND_CSP_ORIGIN ||
  process.env.BACKEND_ORIGIN ||
  "https://websitethiep.onrender.com";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google.com https://*.googleapis.com https://accounts.google.com https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
  img-src 'self' https: data: blob: res.cloudinary.com https://*.googleusercontent.com https://*.google.com;
  font-src 'self' https://fonts.gstatic.com data:;
  media-src 'self' https: data: blob: res.cloudinary.com;
  connect-src 'self' https: wss: https://accounts.google.com ${backendCspOrigin};
  frame-src 'self' https://accounts.google.com https://*.google.com https://www.google.com https://recaptcha.google.com https://*.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://maps.google.com https://www.google.com/maps;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig = {
  transpilePackages: ["framer-motion"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
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
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
