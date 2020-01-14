var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    vendor: [
      "three",
      "pako",
      "vue",
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
        test: /\.s(c|a)ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              fiber: require('fibers'),
            },
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
              },
            },
          },
        ],
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
