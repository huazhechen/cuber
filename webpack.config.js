var path = require("path");
var webpack = require("webpack");

module.exports = (env, argv) => ({
  entry: {
    "index.js": "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/dist/",
    filename: "[name]",
    globalObject: "this"
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
              fiber: require("fibers")
            },
            options: {
              implementation: require("sass"),
              sassOptions: {
                fiber: require("fibers")
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.(html|svg)?$/,
        loader: "text-loader"
      },
      {
        test: /.(png|woff(2)?|eot|ttf)(\?[a-z0-9=\.]+)?$/,
        loader: "url-loader"
      }
    ]
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js"
    },
    extensions: ["*", ".js", ".ts", ".json"]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    disableHostCheck: true
  },
  performance: {
    hints: false
  },
  devtool: argv.mode === "production" ? "" : "#cheap-module-eval-source-map"
});
