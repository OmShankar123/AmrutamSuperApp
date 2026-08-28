module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@env': './env',
          },
        },
      ],
      [
        'react-native-unistyles/plugin',
        {
          root: 'src',
        },
      ],
      ...(isProduction ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
      'react-native-worklets/plugin',
    ],
  };
};
