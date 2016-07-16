
// Declare app level module which depends on filters, and services
var configModule = angular.module('cleanatorWebsite.config', [])

// from package.json
.value("appName","icl")
.value("appVersion","15.12.20")
.constant("appServerUrlLocal","http://localhost:9000/todoc")
.constant("appServerUrlRemote", "https://xxxx.com/todoc")

.constant("appGAID","UA-63329886-6");