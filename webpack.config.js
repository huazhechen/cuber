/* eslint-disable */
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => ({
  entry: {
    index: "./src/index.ts",
  },
  devtool: argv.mode === "production" ? false : "eval-cheap-module-source-map",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].[chunkhash].js",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.(html|svg)?$/,
        loader: "text-loader",
      },
      {
        test: /.(png|woff(2)?|eot|ttf)(\?[a-z0-9=\.]+)?$/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
    },
    extensions: ["*", ".js", ".ts", ".json"],
  },
  performance: {
    hints: false,
  },
  optimization: {
    minimize: argv.mode === "production",
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
        parallel: true,
      }),
    ],
    splitChunks: {
      chunks: "initial",
      name: "vendor",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: "./resource/icon.png",
      filename: "index.html",
      template: "./resource/index.html",
    }),
    new CleanWebpackPlugin({
      dry: argv.mode !== "production",
    }),
  ],
});
