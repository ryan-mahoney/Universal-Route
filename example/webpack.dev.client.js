var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * This is the Webpack configuration file for local development. It contains
 * local-specific configuration such as the React Hot Loader, as well as:
 *
 * - The entry point of the application
 * - Where the output file should be
 * - Which loaders to use on what files to properly transpile the source
 *
 * For more information, see: http://webpack.github.io/docs/configuration.html
 */
module.exports = {

    // efficiently evaluate modules with source maps
    devtool: "cheap-eval-source-map",

    // Set entry point to ./src/main and include necessary files for hot load
    entry: __dirname + "/client.js",

    // This will not actually create a bundle.js file in ./build. It is used
    // by the dev server for dynamic hot loading.
    output: {
        path: __dirname,
        filename: "client-build.js"
    },

    // Transform source code using Babel and React Hot Loader
    module: {
        rules: [
            {
                test: /.jsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            ['es2015', {modules: false}],
                            'stage-2',
                            'stage-0',
                            'react'
                        ],
                        plugins: ['syntax-dynamic-import']
                    }
                }]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({use: 'css-loader'})
            }
       ]
    },

    // Automatically transform files with these extensions
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },

    plugins: [
        new ExtractTextPlugin("client-build.css")
    ]
}
