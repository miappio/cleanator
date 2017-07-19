var configModule = configModule || null;

if (!configModule) {

    // Declare app level module for Config
    configModule = angular
        .module('myAngularApp.config', [])

        // from package.json : extract from gulp config task
        .constant("appName", "/* @echo PACKAGE_JSON_NAME */")
        .constant("appVersion", "/* @echo PACKAGE_JSON_VERSION */")

        // from miapp.io
        .constant("miappId", "demo")
        .constant("miappSalt", "demo")

        // for backend
        .constant('demoMode', true)
        .constant('demoHost', 'http://localhost:3000/api')

        // from google analytics
        .constant("appGAID", "UA-xxxxx");
}