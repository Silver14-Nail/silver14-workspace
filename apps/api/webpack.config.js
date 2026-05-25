const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const webpack = require('webpack');
const path = require('path');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'api'),
    filename: 'main.js',
    library: { type: 'commonjs2' },
    clean: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'class-transformer/storage': require.resolve('class-transformer/cjs/storage'),
    },
  },

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^@nestjs\/(microservices|websockets)/,
    }),

    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],

  ignoreWarnings: [
    { module: /typeorm/ },
    { module: /@nestjs/ },
    { module: /express/ },
    { module: /iterare/ },
    { module: /load-esm/ },
    { module: /app-root-path/ },
    { module: /nest-router/ },
    { module: /stripe/ },
  ],
};
