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

    // Set entry point to ./src/main and include necessary files for hot load
    entry: __dirname + "/server.js",

    // This will not actually create a bundle.js file in ./build. It is used
    // by the dev server for dynamic hot loading.
    output: {
        libraryTarget: "assign",
        library: "module.exports",
        path: __dirname,
        filename: "server-build.js"
    },

    target: 'node',

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
            }
        ]
    },

    // Automatically transform files with these extensions
    resolve: {
        extensions: ['.js', '.jsx', 'json']
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ]
}
