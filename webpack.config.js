const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = () => ({
  entry: {
    index: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "./",
    filename: "[name].[chunkhash].js",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.s(c|a)ss$/,
        use: [
          "vue-style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              fiber: require("fibers"),
            },
            options: {
              implementation: require("sass"),
              sassOptions: {
                fiber: require("fibers"),
              },
            },
          },
        ],
      },
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
        loader: "url-loader",
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
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "template.html",
      filename: "index.html",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
      },
    }),
    new WorkboxPlugin.GenerateSW({
      // https://developers.google.cn/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW?hl=zh_cn#GenerateSW
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      ignoreURLParametersMatching: [/./],
      directoryIndex: "./index.html",
      runtimeCaching: [
        {
          urlPattern: /./,
          handler: "NetworkFirst",
          options: {
            cacheName: "all",
          },
        },
      ],
    }),
    new CopyWebpackPlugin([
      {
        from: __dirname + "/resource/",
        to: __dirname + "/dist/",
        ignore: ["*.html"],
      },
    ]),
  ],
  devtool: "",
});
