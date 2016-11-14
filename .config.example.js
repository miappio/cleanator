
// Declare app level module for Config
var configModule = angular.module('myAngularApp.config', [])

    // from package.json : extract from gulp watch task //value ?
    .constant("appName","/* @echo PACKAGE_JSON_NAME */")
    .constant("appVersion","/* @echo PACKAGE_JSON_VERSION */")

    // from miapp.io
    .constant("miappId","xxxxxx")
    .constant("miappSalt","yyyyy")

    // for your ... ?
    .constant("appForceOffline", true)
    .constant("appAuthEndpoint", "https://xxxx")
    .constant("appCouchDBEndpoint", "https://yyyy")

    // from google analytics
    .constant("appGAID","UA-xxxxx");