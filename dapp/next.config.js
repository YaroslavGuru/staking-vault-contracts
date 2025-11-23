const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Ignore React Native modules that are not needed for web
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@react-native-async-storage\/async-storage$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^pino-pretty$/,
        })
      );
    }

    // Ignore Windows system folders in watch mode
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
        "**/System Volume Information/**",
        "**/node_modules/**",
      ],
    };

    return config;
  },
};

module.exports = nextConfig;

