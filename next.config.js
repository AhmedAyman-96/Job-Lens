/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sql.js"],
    outputFileTracingIncludes: {
      "/api/**/*": ["node_modules/sql.js/dist/sql-wasm.wasm"],
    },
  },
}
module.exports = nextConfig
