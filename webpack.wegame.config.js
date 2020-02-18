var path = require("path");

module.exports = (env, argv) => ({
  entry: {
    "wegame/game.js": "./src/wegame/game.js",
    "wegame.js": "./src/wegame/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name]",
    publicPath: "/dist/",
    globalObject: "this"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
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
