const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = env => ({
    entry: './src/index.ts',
    mode: "development",
    module: {
        rules: [
            {
                test: /\.ts$/, // Testet auf TypeScript-Dateien
                use: [
                    {
                        loader: "ts-loader"
                    }
                ],
                exclude: /node_modules/,
            },
            {test:/\.css$/, use:'css-loader'},
            {test: /\.(png|jpe?g|gif|webp)$/i, use:'file-loader'},
        ]
    },
    devtool: "cheap-source-map",
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle-[fullhash].js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/', // Wichtig: Root-Path setzen
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html"
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, '/'),
        },
        compress: true,
        historyApiFallback: {
            rewrites: [
                { from: /^\/[^.]*$/, to: '/index.html' }, // Nur "clean URLs" an index.html umleiten
            ],
        },
        proxy: {
            '/api': 'http://localhost:8080',
        },
        port: 4200,
    },
})