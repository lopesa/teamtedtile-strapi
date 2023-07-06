"use strict";

const path = require("path");
// const tsc = require("tsc");
// const typescript = require("typescript");

module.exports = (config, webpack) => {
  // Note: we provide webpack above so you should not `require` it
  // Perform customizations to webpack config

  /**
   * Overwrite the dashboard home Component
   */

  // config.plugins.push(
  //   new webpack.NormalModuleReplacementPlugin(
  //     /.cache\/admin\/src\/pages\/HomePage\/index\.js/,
  //     path.resolve(__dirname, "components/HomeTTT.js")
  //   )
  // );

  config.plugins.push(
    new webpack.DefinePlugin({
      //All your custom ENVs that you want to use in frontend
      CUSTOM_VARIABLES: {
        STRAPI_ADMIN_BACKEND_URL: JSON.stringify(process.env.STRAPI_ADMIN_BACKEND_URL)
      },
    })
  );

  // Important: return the modified config
  return config;
};
