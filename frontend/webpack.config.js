const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const envPath = path.resolve(__dirname, '.env');
const envFile = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const env = {
  EXPO_PUBLIC_SUPABASE_URL: envFile.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: envFile.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

const envDefinitions = Object.entries(env).reduce((defs, [key, value]) => {
  defs[`process.env.${key}`] = JSON.stringify(value);
  return defs;
}, {});

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'process/browser': require.resolve('process/browser')
    },
    fallback: {
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new webpack.DefinePlugin(envDefinitions)
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    hot: true,
    historyApiFallback: true,
    allowedHosts: 'all'
  }
};
