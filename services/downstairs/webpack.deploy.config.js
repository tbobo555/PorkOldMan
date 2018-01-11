let path = require('path');
let webpack = require('webpack');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');

// Phaser webpack config
let phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
let phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
let pixi = path.join(phaserModule, 'build/custom/pixi.js');
let p2 = path.join(phaserModule, 'build/custom/p2.js');

let definePlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false'))
});

module.exports = {
    entry: {
        app: [
            "babel-polyfill",
            path.resolve(__dirname, "index.js")
        ]
    },
    output: {
        pathinfo: true,
        path: path.resolve(__dirname, "../downstairs.deploy/assets/js/"),
        publicPath: "./assets/js/",
        filename: "downstairs.js"
    },
    plugins: [
        definePlugin,
        new CleanWebpackPlugin(["../downstairs.deploy/assets/js/"]),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: true,
            },
            output: {
                comments: false
            }
        }),
        new HtmlWebpackPlugin({
            filename: '../../downstairs.html',
            template: './src/index.html',
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                html5: true,
                minifyCSS: true,
                minifyJS: true,
                minifyURLs: true,
                removeComments: true,
                removeEmptyAttributes: true
            },
            hash: true
        })
    ],
    module: {
        rules: [
            { test: /\.js$/, use: ["babel-loader"], include: path.join(__dirname, "src") },
            { test: /pixi\.js/, use: ["expose-loader?PIXI"] },
            { test: /phaser-split\.js$/, use: ["expose-loader?Phaser"] },
            { test: /p2\.js/, use: ["expose-loader?p2"] },
            { test: /\.css$/, use: [ 'style-loader', 'css-loader']},
            { test: /\.(png|jpg|gif|json)$/, use: [{loader: 'file-loader', options: { outputPath: "../img/" }}] }
        ]
    },
    node: {
        fs: "empty",
        net: "empty",
        tls: "empty"
    },
    resolve: {
        alias: {
            "phaser": phaser,
            "pixi": pixi,
            "p2": p2
        }
    }
};
