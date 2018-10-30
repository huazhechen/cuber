var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    vendor: [
      "three",
      "vue",
      "whammy",
      "vue-property-decorator",
      "vuetify",
      "vuetify/dist/vuetify.css",
      "typeface-roboto",
      "material-design-icons/iconfont/material-icons.css"
    ]
  },
  output: {
    path: path.join(__dirname, "./dist/"),
    filename: "dll.js",
    library: "dll_library"
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js"
    },
    extensions: ["*", ".js", ".ts", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.html?$/,
        loader: "text-loader"
      },
      {
        test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        loader: "url-loader"
      }
    ]
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, "./dist/", "manifest.json"),
      name: "dll_library",
      context: __dirname
    })
  ]
};
