// eslint-disable-next-line
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '~core/*': './src/core',
          '~db/*': './src/db',
          '~functions/*': './src/functions',
          '~services/*': './src/services',
          '~types/*': './src/types',
          '~tests/*': './src/tests',
          '~root/*': './src',
        },
      },
    ],
  ],
}
