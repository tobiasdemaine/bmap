cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-autostart.AutoStart",
      "file": "plugins/cordova-plugin-autostart/www/auto-start.js",
      "pluginId": "cordova-plugin-autostart",
      "clobbers": [
        "cordova.plugins.autoStart"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-autostart": "2.3.0",
    "cordova-plugin-whitelist": "1.3.3"
  };
});