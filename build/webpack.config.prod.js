/* eslint-disable */
const os = require('os');
const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HappyPack = require('happypack');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length * 2,
});
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./project.config');

const prodConfig = {
    devtool: false,
    performance: {
        maxAssetSize: 1024 * 1024,
        maxEntrypointSize: 1024 * 1024,
    },
    output: {
        filename: `js/[name].[chunkhash:8].js`,
        chunkFilename: `js/chunks/[name].[chunkhash:8].js`,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules\/(?!(@baidu\/(eop)-[^/]*)\/).*/,
                loader: 'happypack/loader?id=babel',
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, 'happypack/loader?id=styles'],
            },
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.ico$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 25000,
                            name: `images/[name].[hash:8].[ext]`,
                        },
                    },
                ],
            },
        ],
    },
    optimization: {
        // noEmitOnErrors: true,
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: 5,
            maxAsyncRequests: 12, // for HTTP2
            minChunks: 5,
            cacheGroups: {},
        },
        minimize: true,
        minimizer: [
            // js 压缩处理
            new TerserPlugin({
                parallel: true, // 开启多核并行处理压缩，加快速度
                terserOptions: {
                    sourceMap: true,
                    // compress: {
                    //     drop_debugger: true,
                    //     drop_console: true,
                    //     // pure_funcs: ['console.log'],
                    //     global_defs: {
                    //         '@alert': 'console.log',
                    //     },
                    //     passes: 2,
                    // }, // 不显示警告信息
                    output: {
                        beautify: true,
                    },
                },
            }),
            // css 压缩处理
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css\.*(?!.*map)/g,
                cssProcessorOptions: {
                    safe: true,
                    autoprefixer: false,
                    discardComments: {
                        removeAll: true,
                    },
                },
            }),
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        // 保持缓存
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'sha256',
            hashDigest: 'hex',
            hashDigestLength: 20,
        }),
        new HappyPack({
            id: 'babel',
            threadPool: happyThreadPool,
            loaders: [
                {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                },
            ],
        }),
        new HappyPack({
            id: 'styles',
            threads: os.cpus().length,
            loaders: [
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        localIdentName: '[local]',
                        importLoaders: 2,
                        minimize: true,
                    },
                },
                'postcss-loader',
                'less-loader',
            ],
        }),
        new MiniCssExtractPlugin({
            filename: `styles/[name].[contenthash:8].css`,
            chunkFilename: `styles/chunks/[name].[contenthash:8].css`,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
        }),
    ],
};

const webpackConfig = merge(baseWebpackConfig, prodConfig);

// 开启后会在build完成后自动打开localhost:8888页面，显示所有生成文件的大小与依赖包含情况
if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

let entryForNode = _.cloneDeep(baseWebpackConfig.entry);
entryForNode = Object.keys(entryForNode).reduce((pre, cur) => {
    pre[cur] = entryForNode[cur].slice(entryForNode[cur].indexOf('babel-polyfill') + 1);
    return pre;
}, {});

module.exports = webpackConfig;
