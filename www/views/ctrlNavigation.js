function ctrlNavigation($scope, $log, $location, $timeout, $q, $ionicHistory,
                        srvAnalytics, srvDataContainer) {
    'use strict';


    $scope.afterNavigationInitSpinnerShow = function () {
        $scope.navInit();
        $timeout(function () {
        }, 100);
    };
    $scope.afterNavigationInitSpinnerHide = function () {
    };

    // Error messages
    $scope.navErrMsgs = [];
    $scope.navAddErrorMessage = function (msg) {
        var text = "";
        if (msg.message) text = msg.message;
        else if (msg) text = msg;
        $scope.navErrMsgs.push(text);
    };

    $scope.navInitDone = false;
    $scope.navInit = function () {
        if (!$scope.navInitDone) {

            // $ionicHistory.clearHistory();
            // $ionicHistory.clearCache();
            // $ionicHistory.nextViewOptions({
            //   disableBack: true
            // });


            // $timeout(function(){
            //     ionicMaterialInk.displayEffect();
            //     ionicMaterialMotion.ripple();
            // },0);

            $scope.navInitDone = true;
        }
    };

    $scope.navHiddenWho = false;

    $scope.navHiddenWhat = true;

    $scope.navHiddenWhen = true;

    $scope.logout = function () {
        srvDataContainer.logout();
        if ($scope.navRedirect) $scope.navRedirect();
    };

    $scope.navRedirect = function (pathToGo) {
        var url = $location.url();
        var path = $location.path();
        var loggedIn = srvDataContainer.isLoggedIn();
        var level = srvDataContainer.getAppFirstInitLevel();

        $scope.navHiddenWho = !srvDataContainer.isAppFirstInitCompleted() && srvDataContainer.getAppFirstInitLevel() !== 0;
        $scope.navHiddenWhat = !srvDataContainer.isAppFirstInitCompleted() && srvDataContainer.getAppFirstInitLevel() !== 1;
        $scope.navHiddenWhen = !srvDataContainer.isAppFirstInitCompleted() && srvDataContainer.getAppFirstInitLevel() !== 2;

        //empty cache : $state.go($state.currentState, {}, {reload:true})
        //if (!loggedIn) $state.go('login', {}, {reload:true});//$location.path('/login');//$state.go('login');
        //else if (level === 0) $state.go('config.couple', {}, {reload:true});//$location.path('/config/couple');
        //else if (level === 1 && url.indexOf("category") < 0) $state.go('config.category', {}, {reload:true});//$location.path('/config/category');
        if (!loggedIn) $location.path('/login');
        //else if (level === 0) $location.path('/config/couple');
        //else if (level === 2 && url.indexOf("category") < 0) $location.path('/config/category');
        else if (pathToGo) $location.path(pathToGo);
    };

    $scope.navBack = function () {
        //if (history) history.back();
        if ($ionicHistory) $ionicHistory.goBack();
    };

    $scope.navGAClick = function (event) {
        // remove from the critical path of loading
        $timeout(srvAnalytics.add('EventMLE', 'MLE-' + event), 1100);
    };

    $scope.navAppInitLevel = function () {
        return srvDataContainer.getAppFirstInitLevel();
    };

    $scope.navSetAppInitLevel = function (level) {
        return srvDataContainer.setAppFirstInitLevel(level);
    };

    $scope.navAppOnlineLevel = function () {
        return srvDataContainer.isCordovaOnline ? 'o' : 'n';
    }

    /**
     * [{title:'English', code:'en_US'},{title:'Français', code:'fr_FR'}, {title:'Espagnol', code:'es_ES'}];
     */
    $scope.navigLangs = srvDataContainer.getConfigLangs();

    $scope.navigLang = srvDataContainer.getConfigLang();

    $scope.navChangeLang = function (lang) {
        srvDataContainer.setConfigLang(lang);
    };

    //$scope.Math = window.Math;
    $scope.navMathRound = function (val) {
        var ret = val;
        if (window.Math) ret = window.Math.round(val);
        return ret;
    };


    // All Data needed in Navigation RootScope
    $scope.userA = null;
    $scope.couple = null;
    $scope.userB = null;
    $scope.chores = null;
    $scope.categories = null;
    $scope.userCols = srvDataContainer.userCols;
    $scope.coupleCols = srvDataContainer.coupleCols;
    $scope.historicCols = srvDataContainer.historicCols;
    $scope.choreCols = srvDataContainer.choreCols;
    $scope.categoryCols = srvDataContainer.categoryCols;
    $scope.navProfils = [
        {id: 'g1', img: './img/profil/girl01.jpg'},
        {id: 'b1', img: './img/profil/boy01.jpg'},
        {id: 'g2', img: './img/profil/girl02.jpg'},
        {id: 'b2', img: './img/profil/boy02.jpg'},
        {id: 'g3', img: './img/profil/girl03.jpg'},
        {id: 'b3', img: './img/profil/boy03.jpg'}];
    //$scope.userAprofilNb = 0;
    //$scope.userBprofilNb = 3;

    $scope.navDataSync = function () {
        var self = this;
        var deferred = $q.defer();
        if (srvDataContainer) {
            //var next;
            //if (!srvDataContainer.isLoggedIn())
            //    next = srvDataContainer.login();
            //else
            //    next = srvDataContainer.sync();

            var setData = function() {
                $scope.userA = srvDataContainer.getUserA();
                $scope.couple = srvDataContainer.getCouple();
                $scope.userB = srvDataContainer.getUserB();
                $scope.chores = srvDataContainer.getChores();
                $scope.categories = srvDataContainer.getCategories();
                //$scope.historics = srvDataContainer.getHistorics();
                deferred.resolve();
            };

            var errFn = function (err) {
                $log.error(err);
                $scope.logout();
                deferred.reject(err);
            };

            //next
            srvDataContainer.login()
                .then(function(){
                    srvDataContainer.sync()
                        .catch(function (err) {
                            $log.log('Maybe a first sync failed because we need to check remote before ?');
                            return srvDataContainer.sync();
                        })
                        .catch(errFn)
                        .finally(setData);
                })
                .catch(errFn);
        }

        return deferred.promise;
    };

}

angular.module('crtl.Navigation', []).controller('ctrlNavigation', ctrlNavigation);
