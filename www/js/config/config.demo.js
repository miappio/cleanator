var configModule = configModule || null;

if (!configModule) {

    // Declare app level module for Config
    configModule = angular
        .module('myAngularApp.config', [])

        // from package.json : extract from gulp config task
        .constant("appName", "cleanator")
        .constant("appVersion", "17.4.14")

        // from miapp.io
        .constant("miappId", "demo")
        .constant("miappSalt", "demo")

        // for backend
        .constant('demoMode', true)

        // from google analytics
        .constant("appGAID", "UA-xxxxx");
}