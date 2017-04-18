angular
    .module('srvNavigation', [])
    .factory('srvNavigation', function ($log, $timeout, $q) {
        return new srvNavigation($log, $timeout, $q);
    });

var srvNavigation = (function () {
    'use strict';

    function Service($log, $timeout, $q) {
        this.$log = $log;
        this.$timeout = $timeout;
        this.$q = $q;
        this.$rootScope = null;
        this.$state = null;
        this.$ionicHistory = null;
        this.srvAnalytics = null;
        this.initDone = false;
    }

    Service.prototype.init = function ($rootScope, $state, $ionicHistory) {

        var self = this;
        console.log('srvNavigation init');
        if (self.initDone) return;
        self.$rootScope = $rootScope;
        //self.$location = $location;
        self.$state = $state;
        self.$ionicHistory = $ionicHistory;


        self.$rootScope.afterNavigationInitSpinnerShow = function () {
            self.$timeout(function () {
            }, 100);
        };
        self.$rootScope.afterNavigationInitSpinnerHide = function () {
        };

        // Error messages
        self.$rootScope.navErrMsgs = [];
        self.$rootScope.navAddErrorMessage = function (msg) {
            var text = "";
            if (msg.message) text = msg.message;
            else if (msg) text = msg;
            self.$rootScope.navErrMsgs.push(text);
        };

        self.$rootScope.navHiddenWho = false;

        self.$rootScope.navHiddenWhat = true;

        self.$rootScope.navHiddenWhen = true;


        self.$rootScope.navBack = function () {
            //if (history) history.back();
            if (self.$ionicHistory) self.$ionicHistory.goBack();
        };

        self.$rootScope.navGAClick = function (event) {
            // remove from the critical path of loading
            //self.$timeout(self.srvAnalytics.add('EventMLE', 'MLE-' + event), 1100);
        };

        self.$rootScope.navRedirect = function (srvDataContainer, pathToGo, args) {
            //var url = self.$location.url();
            //var path = self.$location.path();
            var myappHasBeenEverLaunched = localStorage.getItem('myappHasBeenEverLaunched');
            if (!myappHasBeenEverLaunched)
                localStorage.setItem('myappHasBeenEverLaunched', true);

            var loggedIn = srvDataContainer ? srvDataContainer.isLoggedIn() : !!myappHasBeenEverLaunched;
            var level = srvDataContainer ? srvDataContainer.getAppFirstInitLevel() : 3;
            var completed = srvDataContainer ? srvDataContainer.isAppFirstInitCompleted() : false;

            console.log('navRedirect : ', pathToGo, loggedIn, level, completed, args);

            self.$rootScope.navHiddenWho = !completed && (level != 0);
            self.$rootScope.navHiddenWhat = !completed && (level != 1);
            self.$rootScope.navHiddenWhen = !completed && (level != 2);

            if (!loggedIn) self.$state.go('login');
            else if (level == 0) self.$state.go('config.couple');
            else if (level == 1 && pathToGo != 'choreDetail')self.$state.go('config.category'); //&& (self.$state.current !== 'config.category' && self.$state.current !== 'config.categorychores')
            else if (level == 2) self.$state.go('config.cal');
            else if (pathToGo) self.$state.go(pathToGo, args);
        };

        self.$rootScope.navDataSync = function (srvDataContainer) {
            var deferred = self.$q.defer();
            if (!srvDataContainer) return self.$q.reject('srvDataContainer needed');

            var setData = function () {
                self.$rootScope.userA = srvDataContainer.getUserA();
                self.$rootScope.couple = srvDataContainer.getCouple();
                self.$rootScope.userB = srvDataContainer.getUserB();
                self.$rootScope.chores = srvDataContainer.getChores();
                self.$rootScope.categories = srvDataContainer.getCategories();
                //self.$rootScope.historics = srvDataContainer.getHistorics(); compute
                deferred.resolve();
            };

            var errFn = function (err) {
                self.$log.error('errFn: ', err);
                srvDataContainer.logout();
                if (self.$rootScope.navRedirect) self.$rootScope.navRedirect(srvDataContainer);
                deferred.reject(err);
            };

            //next
            srvDataContainer.login()
                .then(function () {
                    srvDataContainer.sync()
                        .catch(function (err) {
                            self.$log.log('Maybe a first sync failed because we need to check remote before ?');
                            return srvDataContainer.sync();
                        })
                        .catch(errFn)
                        .then(setData);
                })
                .catch(errFn);

            return deferred.promise;
        };

        self.$rootScope.navRedirect(null, 'dashboard-user');//, {'userId': 'a'});
        //self.$rootScope.navRedirect(null, 'login');
        self.initDone = true;
    };

    return Service;
})();

