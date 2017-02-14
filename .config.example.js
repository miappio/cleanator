
// Declare app level module for Config
var configModule = angular.module('myAngularApp.config', [])

    // from package.json : extract from gulp watch task //value ?
    .constant("appName","/* @echo PACKAGE_JSON_NAME */")
    .constant("appVersion","/* @echo PACKAGE_JSON_VERSION */")

    // from miapp.io
    .constant("miappId","xxxxxx")
    .constant("miappSalt","yyyyy")

    // for your backend
    .constant("appForceOffline", true)
    .constant("appAuthEndpoint", 'http://testmocksite.com/api')

    // from google analytics
    .constant("appGAID","UA-xxxxx");