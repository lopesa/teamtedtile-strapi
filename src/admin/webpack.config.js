"use strict";

const path = require("path");

module.exports = (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it
  // Perform customizations to webpack config

  /**
   * Overwrite the dashboard home Component
   */
  // console.log("__dirname", __dirname);
  // config.plugins.push(
  //   new webpack.NormalModuleReplacementPlugin(
  //     /.cache\/admin\/src\/pages\/HomePage\/index\.js/,
  //     path.resolve(__dirname, "components/HomeTTT.tsx")
  //   )
  // );

  // Important: return the modified config
  return config;
};
