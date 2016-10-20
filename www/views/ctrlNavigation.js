

function ctrlNavigation(  $scope,$log,$location,$state, $anchorScroll,$timeout,$q,
                          $ionicHistory,$ionicScrollDelegate,
                          srvAnalytics, srvDataContainer, srvData, srvConfig) {
  'use strict';

  //NO factory pattern:  $scope.srvDataContainer = srvDataContainer;
  //NO $scope.srvConfig = srvConfig;
  $scope.Math = window.Math;
  //this.$log = $log;

  // apply utility
  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  // spinner : TODO override in each controller
  $scope.afterNavigationInitSpinnerShow = function() {
    $scope.navInit();
    $timeout(function() {},100);
  };
  $scope.afterNavigationInitSpinnerHide = function() {
  };

  // Error messages
  $scope.navErrMsgs = [];
  $scope.navAddErrorMessage = function(msg){
    var text = "";
    if (msg.message) text = msg.message;
    else if (msg) text = msg;
    $scope.navErrMsgs.push(text);
  };

  $scope.navInitDone = false;
  $scope.navInit = function() {
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
  $scope.navRedirect = function(pathToGo) {
    var url = $location.url();
    var path = $location.path();
    var loggedIn = srvConfig.isLoggedIn();
    var level = srvConfig.getAppFirstInitLevel();

    $scope.navHiddenWho = !srvConfig.isAppFirstInitCompleted() && srvConfig.getAppFirstInitLevel() !== 0;
    $scope.navHiddenWhat = !srvConfig.isAppFirstInitCompleted() && srvConfig.getAppFirstInitLevel() !== 1;
    $scope.navHiddenWhen = !srvConfig.isAppFirstInitCompleted() && srvConfig.getAppFirstInitLevel() !== 2;

    //empty cache : $state.go($state.currentState, {}, {reload:true})
    //if (!loggedIn) $state.go('login', {}, {reload:true});//$location.path('/login');//$state.go('login');
    //else if (level === 0) $state.go('config.couple', {}, {reload:true});//$location.path('/config/couple');
    //else if (level === 1 && url.indexOf("category") < 0) $state.go('config.category', {}, {reload:true});//$location.path('/config/category');
    if (!loggedIn) $location.path('/login');
    //else if (level === 0) $location.path('/config/couple');
    //else if (level === 2 && url.indexOf("category") < 0) $location.path('/config/category');
    else if (pathToGo) $location.path(pathToGo);
  };


  $scope.navBack = function(){
    //if (history) history.back();
    if ($ionicHistory) $ionicHistory.goBack();
  };


  $scope.navGAClick = function(event) {
    // remove from the critical path of loading
    $timeout(srvAnalytics.add('EventMLE', 'MLE-'+event),1100);
  };

  $scope.navAppInitLevel = function() {
    return srvConfig.getAppFirstInitLevel();
  };
  $scope.navSetAppInitLevel = function(level) {
    return srvConfig.setAppFirstInitLevel(level);
  };

  // Lang
  //$scope.navigLangs = [
  //                    {title:'English', code:'en_US'},
  //                    {title:'Français', code:'fr_FR'}
  //                    //{title:'Espagnol', code:'es_ES'}
  //                    ];
  //$scope.navigLang = $scope.navigLangs[0];
  $scope.navigLangs = srvConfig.getConfigLangs();
  $scope.navigLang = srvConfig.getConfigLang();
  $scope.navChangeLang = function(lang) {
    srvConfig.setConfigLang(lang);
  };



  // All Data
  $scope.userA = null;
  $scope.couple = null;
  $scope.userB = null;
  $scope.chores = null;
  $scope.categories = null;
  $scope.userCols = srvData.User.columns;
  $scope.coupleCols = srvData.Couple.columns;
  $scope.historicCols = srvData.Historic.columns;
  $scope.choreCols = srvData.Chore.columns;
  $scope.categoryCols = srvData.Category.columns;
  $scope.profil = [
      {id:"g1",img:"img/profil/girl01.jpg"},
      {id:"b1",img:"img/profil/boy01.jpg"},
      {id:"g2",img:"img/profil/girl02.jpg"},
      {id:"b2",img:"img/profil/boy02.jpg"},
      {id:"g3",img:"img/profil/girl03.jpg"},
      {id:"b3",img:"img/profil/boy03.jpg"}];
  //$scope.userAprofilNb = 0;
  //$scope.userBprofilNb = 3;


  $scope.navDataSync = function() {
    var self = this;
    var deferred = $q.defer();
    var errMessage = null;
    if (srvDataContainer) {
      srvDataContainer.sync()
          .catch(function(err){
            $log.log('Maybe a first sync failed because we need to check remote before');
            $log.error(err);
            //errMessage = err;
            return srvDataContainer.sync();
          })
          .catch(function(err){
            errMessage = err;
          })
          .finally(function(){
            $scope.userA = srvDataContainer.getUserA();
            $scope.couple = srvDataContainer.getCouple();
            $scope.userB = srvDataContainer.getUserB();
            $scope.chores = srvDataContainer.getChores();
            $scope.categories = srvDataContainer.getCategories();
            //$scope.historics = srvDataContainer.getHistorics();
            deferred.resolve(errMessage);
          });
    }

    return deferred.promise;
  };



  //--------------------
  // INITIALIZATION
  // TODO done by kids :
  //$scope.navInit();
	//if ($scope.navRedirect) $scope.navRedirect();


}

angular.module('crtl.Navigation', []).controller('ctrlNavigation', ctrlNavigation);
