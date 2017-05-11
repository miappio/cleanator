var configModule = configModule || null;

if (!configModule) {

    // Declare app level module for Config
    configModule = angular
        .module('myAngularApp.config', [])

        // from package.json : extract from gulp config task
        .constant("appName", "cleanator")
        .constant("appVersion", "17.4.19")

        // from miapp.io
        .constant("miappId", "59136b2075a64b02bc31689b")
        .constant("miappSalt", "demo")

        // for backend
        .constant('demoMode', false)

        // from google analytics
        .constant("appGAID", "UA-xxxxx");
}