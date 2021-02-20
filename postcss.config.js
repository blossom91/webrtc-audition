const pr2remPlugin = require('postcss-plugin-pr2rem');

const pr2remConfig = {
    rootValue: 300,
    unitPrecision: 5,
    propWhiteList: [],
    propBlackList: [],
    selectorBlackList: [],
    ignoreIdentifier: '00',
    replace: true,
    mediaQuery: false,
    minPixelValue: 0,
};

module.exports = {
    ident: 'postcss',
    plugins: [
        require('postcss-preset-env')({
            browsers: [
                '> 1%',
                'last 2 versions',
                'Firefox ESR',
                'Opera 12.1',
                'not ie <= 8',
                'Android >= 4.0',
                'iOS 7',
            ],
        }),
        pr2remPlugin(pr2remConfig),
    ],
};
