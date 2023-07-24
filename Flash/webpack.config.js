const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const GlobEntries = require('webpack-glob-entries');

const isWatching = process.argv.some((arg) => arg.includes('--watch'));

module.exports = {
  mode: 'production',
  entry: GlobEntries('./src/**/*test*.ts'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  target: 'web',
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
  devtool: "source-map",
  stats: {
    colors: true,
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: !isWatching, // do not delete files not created by webpack while watching
      protectWebpackAssets: false, // allows control over the output directory
      cleanOnceBeforeBuildPatterns: ['**/*', '!index.html'], // specify patterns to delete
    }),
    new CopyPlugin({
      patterns: [{ 
        from: path.resolve(__dirname, 'assets'), 
        to: path.resolve(__dirname, 'dist', 'assets'), // copy to dist/assets
        noErrorOnMissing: true 
      }],
    }),
  ],
  optimization: {
    minimize: false,
  }
};