/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    // domains: ["lh3.googleusercontent.com", "vercel.com"],
    remotePatterns: [
      // Google
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      // Discord
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "**",
      },
      // UploadThing
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default config;
