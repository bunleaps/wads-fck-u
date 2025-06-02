/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        source: "/service/:path*",
        destination: isDev
          ? "http://localhost:5000/service/:path*"
          : "https://e2425-wads-l4ccg6-client.csbihub.id/service/:path*",
      },
    ];
  },
  distDir: "dist",
};

export default nextConfig;
