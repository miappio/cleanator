var configModule = configModule || null;

if (!configModule) {

    // Declare app level module for Config
    configModule = angular
        .module('myAngularApp.config', [])

        // from package.json : extract from gulp config task
        .constant("appName", "cleanator")
        .constant("appVersion", "17.1.14")

        // from miapp.io
        .constant("miappId", "demo")
        .constant("miappSalt", "demo")

        // for your backend
        .constant("appForceOffline", true)
        .constant("appAuthEndpoint", 'demo.com/api')

        // from google analytics
        .constant("appGAID", "UA-xxxxx");
}