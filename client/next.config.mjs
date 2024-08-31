/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/chats", permanent: true }];
  },
};

export default nextConfig;
