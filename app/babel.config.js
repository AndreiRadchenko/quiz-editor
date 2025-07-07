module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Make sure Reanimated plugin is LAST in the list
      'react-native-reanimated/plugin',
    ],
  };
};
