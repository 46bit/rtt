const path = require('path');
const webpack = require('webpack');
const nodeModules = require('webpack-node-externals');

const NODE_ENV = process.env.NODE_ENV || 'development';

let cfg = {
  target: 'web',
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
  stats: {
    modules: false
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false
  },
  performance: {
    hints: "warning"
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

module.exports = cfg;
