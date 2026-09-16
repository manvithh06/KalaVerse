import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The photographs listed in data/photos.ts. Keep the two in step.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bing.com",
        port: "",
        pathname: "/th/id/OIP.udjXE0aSrnY8WXWN3o9NEAHaJL",
        search: "?w=800&h=991&c=7&rs=1&qlt=90&o=6&pid=ImgAns&rm=2",
      },
      // Each photo asks for its own size, so the query string is not pinned here.
      { protocol: "https", hostname: "th.bing.com", port: "", pathname: "/th/id/**" },
    ],
  },
};

export default nextConfig;
