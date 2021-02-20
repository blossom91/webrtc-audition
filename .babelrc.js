module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: 3,
                targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
                },
            },
        ],
        '@babel/preset-react',
    ],
    plugins: [
        '@babel/plugin-transform-modules-commonjs',
        ['@babel/plugin-proposal-decorators', {legacy: true}],
        ['@babel/plugin-proposal-class-properties'],
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-optional-chaining',
        [
            'import',
            {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: 'css', // `style: true` 会加载 less 文件
            },
        ],
    ],
};
