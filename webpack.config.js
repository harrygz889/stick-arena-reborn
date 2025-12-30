const path = require("path");

module.exports = {
  entry: "./client/ts/game.ts", // Entry point (your main TypeScript file)
  output: {
    filename: "bundle.js", // Single bundled output file
    path: path.resolve(__dirname, "client"), // Output directory (e.g., "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader", // Transpile TypeScript to JavaScript
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // Automatically resolve .ts and .js extensions
  },
  mode: "development", // Use "production" for production builds
};
