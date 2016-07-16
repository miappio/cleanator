'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};


// Services

angular.module('a4p.services', [])

.factory('srvLocalStorage', function () {

    var LocalStorage = a4p.LocalStorageFactory(window.localStorage);
    return new LocalStorage();

});
