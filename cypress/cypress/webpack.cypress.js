module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './app.ts',
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      fs: false,
      child_process: false,
      readline: false,
      dgram: false,
      dns: false,
      net: false,
      tls: false,
      path: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.feature$/,
        use: [
          {
            loader: '@badeball/cypress-cucumber-preprocessor/webpack',
          },
        ],
      },
    ],
  },
}
