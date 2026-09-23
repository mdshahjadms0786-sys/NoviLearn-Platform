const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  transpilePackages: [
    "@novilearn/types",
    "@novilearn/shared",
    "@novilearn/design-tokens",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-slot"],
  },
};

module.exports = nextConfig;
