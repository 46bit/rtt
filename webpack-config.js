const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin');
const webpack = require('webpack');
const nodeModules = require('webpack-node-externals');

const NODE_ENV = process.env.NODE_ENV || 'development';

let cfg = {
  target: 'node',
  mode: NODE_ENV,
  entry: {
    main: ['./src/main.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  devtool: 'source-map',
  externals: ['chokidar'],
  stats: {
    modules: false
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false
  },
  performance: {
    hints: false
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              reportFiles: [/(?<!\.test)\.ts/]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({NODE_ENV})
  ]
};

if (process.env.ENABLE_WATCH === 'true') {
  cfg.watch = true;
}

cfg.externals.push(nodeModules({whitelist: []}));

module.exports = cfg;
