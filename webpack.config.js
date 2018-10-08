var path = require("path");
var webpack = require("webpack");

module.exports = (env, argv) => ({
    entry: "./src/main.ts",
    output: {
        path: path.resolve(__dirname, "./dist"),
        publicPath: "/dist/",
        filename: "main.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["vue-style-loader", "css-loader"]
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
    devtool: argv.mode === 'production' ? "" : "#cheap-module-eval-source-map",
    plugins: [
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./dist/manifest.json')
        })
    ]
});
