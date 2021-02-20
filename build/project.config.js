const path = require('path');

const config = {
    dev: {
        assetsPublicPath: '/',
        env: 'development',
        proxyTable: {
            // 本地开发接口代理 demo:
            // '/api/**': {
            //     target: 'http://localhost:5000',
            //     changeOrigin: true,
            //     secure: false
            // }
        },
        host: '0.0.0.0', // 如果设置了process.env.HOST，则优先使用process.env.HOST
        port: 8080, // 如果设置了process.env.PORT, 则优先使用process.env.PORT. 如果配置的端口被占用，会自动分配一个空闲的新端口
        autoOpenBrowser: false, // 自动打开浏览器
        errorOverlay: true, // 是否显示错误
        notifyOnErrors: true, // 控制台输出友好的提示
        quiet: true, // 关掉webpack输出到控制台的log
    },

    build: {
        assetsPublicPath: '/',
        env: 'production',
        assetsRoot: path.resolve(__dirname, '../output'),
        // 是否启动打包后的文件大小分析模块
        bundleAnalyzerReport: process.env.NODE_ANALYZE,
    },
};

module.exports = config;
