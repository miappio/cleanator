angular.module('myAngularApp.views.chore', [])

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $stateProvider
            .state('config.category', {
                url: '/category',
                cache: false,
                views: {
                    'config-category': {
                        templateUrl: 'views/chore/categoryAll.html',
                        controller: 'CategoryCtrl'
                    }
                }
            })
            .state('config.categoryChores', {
                url: '/categorychores/:categoryId',
                cache: false,
                views: {
                    'config-category': {
                        templateUrl: 'views/chore/categoryChores.html',
                        controller: 'CategoryChoresCtrl'
                    }
                }
            })
            .state('categoryDetail', {
                url: '/category/:categoryId',
                templateUrl: 'views/chore/categoryDetail.html',
                controller: 'CategoryDetailCtrl'
            })
            .state('choreDetail', {
                url: '/chore/:choreId',
                templateUrl: 'views/chore/choreDetail.html',
                controller: 'ChoresDetailCtrl'
            });


    })

    .controller('ChoresCtrl', function ($scope, $timeout, $stateParams, srvData, srvConfig) {

        $scope.getDateText = function (dateText) {
            var dateT = null;
            if (!dateText) return dateT;

            var date = new Date(dateText);
            dateT = '' + padInteger(date.getDate(), 2) + '/' + padInteger(date.getMonth(), 2) + '/' + padInteger(date.getFullYear(), 4) + ' ' + padInteger(date.getHours(), 2) + ':' + padInteger(date.getMinutes(), 2);
            return dateT;
        };

        function padInteger(num, size) {
            if (!size) size = 10;
            var s = "000000000" + num;
            return s.substr(s.length - size);
        }

        $scope.choreInit = function () {
        };

        $scope.choreInitSpinnerStopped = false;
        $scope.afterNavigationInitSpinnerShow = function () {
            $scope.navInit();
            if (!$scope.isAppLogin()) return;

            $timeout(function () {
                if (!$scope.isAppLogin()) return;

                $scope.choreDataSync();
            }, 200);
        };

        // Synchronise DB
        $scope.choreDataSync = function () {
            //srvData.sync()
            //.then(function(msg){
            $scope.choreDataBind();
            //})
            //.catch(function(msg){
            //	$scope.choreErrMessage = msg;
            //	$scope.choreDataBind();
            //});

        };

        $scope.saveAllChores = function () {
            console.log('all saved');
        };

        $scope.choreSaveJeton = false;
        $scope.saveChore = function (chore, reBindData) {
            if (chore && !$scope.choreSaveJeton) {
                //$scope.safeApply(function(){
                $scope.choreSaveJeton = true;
                //chore[$scope.choreCols.percentAB] = chorePercent;


                srvData.Chore.set(chore)
                    .then(function (res) {
                        $scope.choreSaveJeton = false;
                        $scope.choreResetEditModal();
                        console.log('saved');

                        // is it an add ? -> refresh chore list $scope.chores ?
                        if (reBindData === true) $scope.choreDataSync();
                    })
                    .catch(function (err) {
                        $scope.choreSaveJeton = false;
                        $scope.choreResetEditModal();
                        $scope.navAddErrorMessage(err);
                    });
                //});
            }
        };

        $scope.choreAddChore = function (category) {

            $scope.choreToEdit = {};
            $scope.choreToEdit[$scope.choreCols.category] = category;
            $scope.choreToEdit[$scope.choreCols.percentAB] = 50;
            $scope.choreToEdit[$scope.choreCols.timeInMn] = 5;
            $scope.choreToEdit[$scope.choreCols.frequencyDays] = 3;
            $scope.choreToEdit[$scope.choreCols.priority] = 5;
            $scope.choreToEdit[$scope.choreCols.priorityComputed] = 5;

            // synchronise right thumbs
            var thumb = $scope.categories[0];
            //$scope.choreToEdit[$scope.choreCols.choreDescriptionCat] = thumb.categoryName;
            $scope.thumbChoreObj = thumb;

            $scope.thumbCategoryObj = $scope.categories[0];
            for (var i = 0; i < $scope.categories.length; i++) {
                var t2 = $scope.categories[i];
                if (t2.categoryName == category) {
                    $scope.thumbCategoryObj = t2;
                    break;
                }
            }

        };

        $scope.choreAddCategory = function () {

        };

        $scope.choreDelete = function (chore, reBindData) {
            srvData.Chore.remove(chore).then(function (msg) {
                // is it an add ? -> refresh chore list $scope.chores ?
                if (reBindData === true) $scope.choreDataSync();
            }).catch(function (msg) {
                //$scope.choreErrMessage = msg;
                $scope.navAddErrorMessage(msg);
            });
        };

        $scope.choreTogglePriority = function (chore) {
            if (!chore) return;

            var prio = chore[$scope.choreCols.priority];
            if (prio == 1) prio = 5;
            else prio = 1;

            chore[$scope.choreCols.priority] = prio;
        };

        $scope.choreResetEditModal = function () {
            $scope.choreToEdit = null;
        };

        $scope.choreShowLastHistoricDate = function (chore, previousValue) {

            //if (!dateH) return 'na';
            //var str = getDateText(dateH);
            //return str;
            if (!chore) return previousValue ? previousValue : 'na';
            var choreId = chore._id;
            if (!choreId) return previousValue ? previousValue : 'na';
            //var lastDate = srvData.getDateOfLastChoreDoneByType($scope.dashboardHistoricsDone, choreId);
            var lastDate = chore[$scope.choreCols.lastTimeDone];
            var str = getDateText(lastDate);
            return str;
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            //if ($scope.modal) $scope.modal.remove();
        });
        // Execute action on chore state
        $scope.$on('chore.added', function () {
            // Execute action
            console.log('chore.added');
        });
        $scope.$on('chore.changed', function () {
            // Execute action
            console.log('chore.changed');
            $scope.choreDataSync();
        });

        // Initialization
        if ($scope.navRedirect) $scope.navRedirect();

    })

    .controller('ChoresListCtrl', function ($scope, $ionicListDelegate, srvData, srvConfig) {

        $scope.showDelete = false;
        $scope.showReorder = false;
        $scope.canSwipe = true;

        $scope.choreDeactivate = function (chore) {
            chore.desactivate = true;
            //TODO desactive children ChoresCtrl
            srvData.Chore.set(chore).finally(function () {
                // close buttons
                $ionicListDelegate.closeOptionButtons();
                $scope.apply();
            });
        };
        $scope.choreActivate = function (chore) {
            chore.desactivate = false;
            //TODO active children ChoresCtrl
            srvData.Chore.set(chore).finally(function () {
                // close buttons
                $ionicListDelegate.closeOptionButtons();
                $scope.apply();
            });
        };

        $scope.choreDelete = function (chore) {
            //chore.desactivate = true;
            //TODO desactive children ChoresCtrl
            srvData.Chore.set(chore).finally(function () {
                // close buttons
                //$ionicListDelegate.closeOptionButtons();
            });
        };
        $scope.choreReorderItem = function (chore, fromIndex, toIndex) {
            //chore.desactivate = true;
            //srvData.Chore.set(chore).finally(function(){
            // close buttons
            //$ionicListDelegate.closeOptionButtons();
            //});
        };

    })

    .controller('ChoresDetailCtrl', function ($scope, $timeout, $stateParams, srvData, srvConfig) {

        $scope.choreId = $stateParams.choreId;
        $scope.choreToEdit = {};

        $scope.choreFindDetail = function () {
            var self = this;
            srvData.Chore.findOneById($scope.choreId).then(function (chore) {
                $scope.choreToEdit = chore;
                $scope.choresDetailSyncroThumb();

                // retrieve UserAffinity
                if (typeof $scope.choreToEdit[$scope.choreCols.AUserAffinity] === 'undefined' || typeof $scope.choreToEdit[$scope.choreCols.BUserAffinity] === 'undefined') {
                    var per = $scope.choreToEdit[$scope.choreCols.percentAB];
                    $scope.choreToEdit[$scope.choreCols.AUserAffinity] = per;
                    $scope.choreToEdit[$scope.choreCols.BUserAffinity] = 100 - per;
                }

            });
        };

        $scope.choreSaveDetail = function () {
            var self = this;
            $scope.choreDetailComputeAffinity(
                $scope.choreToEdit[$scope.choreCols.AUserAffinity],
                $scope.choreToEdit[$scope.choreCols.BUserAffinity]
            );

            srvData.Chore.set($scope.choreToEdit)
                .then(function (res) {
                    console.log('saved');
                })
                .catch(function (err) {
                    console.log('pb :' + err);
                });
        };

        $scope.choreRemove = function (choreToRemove) {
            srvData.Chore.remove(choreToRemove)
                .then(function (msg) {

                })
                .catch(function (err) {
                    alert(err);
                });
        };

        $scope.thumbCategoryObj = null;
        $scope.choresDetailSyncroThumb = function () {
            if (!$scope.choreToEdit || !$scope.categories) return;

            var category = $scope.choreToEdit[$scope.choreCols.category];
            $scope.thumbCategoryObj = $scope.categories[0];
            for (var i = 0; i < $scope.categories.length; i++) {
                var t2 = $scope.categories[i];
                if (t2.categoryName == category) {
                    $scope.thumbCategoryObj = t2;
                    break;
                }
            }

        };

        $scope.choreSetThumb = function (thumbObj) {
            if (!thumbObj || !thumbObj[$scope.categoryCols.name] || !$scope.choreToEdit) return;
            $scope.choreToEdit[$scope.choreCols.choreDescriptionCat] = thumbObj[$scope.categoryCols.name];
        };

        $scope.choreCategorySetThumb = function (thumbObj) {
            if (!thumbObj || !thumbObj[$scope.categoryCols.name] || !$scope.choreToEdit) return;
            $scope.choreToEdit[$scope.choreCols.category] = thumbObj[$scope.categoryCols.name];
        };

        $scope.choreDetailComputeAffinity = function (AUserAffinity, BUserAffinity) {
            var total = (AUserAffinity && BUserAffinity) ? (parseInt(AUserAffinity) + parseInt(BUserAffinity)) : 0;
            var percent = (total && total > 0) ? (parseInt(AUserAffinity) * 100 / total) : 50;
            $scope.choreToEdit[$scope.choreCols.percentAB] = Math.round(percent);
        };

        // Initialization
        $scope.choreFindDetail();

    })

    .controller('CategoryListCtrl', function ($scope, $log, $window, $ionicListDelegate, $ionicHistory, srvData, srvConfig) {

        $scope.showDelete = false;
        $scope.showReorder = false;
        $scope.canSwipe = true;
        $scope.categoryFilter = {group: "choreCategory"};

        var done = $window.localStorage.getItem('catFirstSwipeNotDone');
        $scope.catFirstSwipeNotDone = (!done && $scope.navAppInitLevel() <= 2) ? true : false;

        $scope.catDeactivate = function (category) {
            $ionicHistory.clearCache();
            category.desactivate = true;

            //Desactive children Chores
            srvData.Category.applyToLinkedChores(category, function (eachChore) {
                eachChore.desactivate = true;
                srvData.Chore.set(eachChore);
            });

            // Save category
            srvData.Category.set(category)
                .then(function () {
                    // close buttons
                    $ionicListDelegate.closeOptionButtons();
                    $scope.$emit("category.changed");
                })
                .catch(function (err) {
                    $log.error(err);
                });
        };
        $scope.catActivate = function (category) {
            $ionicHistory.clearCache();
            category.desactivate = false;
            //Active children Chores
            srvData.Category.applyToLinkedChores(category, function (eachChore) {
                eachChore.desactivate = false;
                srvData.Chore.set(eachChore);
            });
            srvData.Category.set(category)
                .then(function () {
                    // close buttons
                    $ionicListDelegate.closeOptionButtons();
                    $scope.$emit("category.changed");
                })
                .catch(function (err) {
                    $log.error(err);
                });
        };

        $scope.catFirstSwipeDone = function () {
            $scope.catFirstSwipeNotDone = false;
            $window.localStorage.setItem('catFirstSwipeNotDone', $scope.catFirstSwipeNotDone);
        };


    })

    .controller('CategoryCtrl', function ($scope, $q, $timeout, $stateParams, $ionicHistory, srvDataContainer, srvConfig) {

        // Indicators
        $scope.categoryIndicators = {};

        // Init
        $scope.categoryInit = function () {
            $ionicHistory.nextViewOptions({
                disableBack: false
            });
        };

        $scope.categoryInitSpinnerStopped = false;
        $scope.categoryErrMessage = "";
        $scope.categoryStopSpinnerWithMessage = function (msg) {
            $scope.categoryErrMessage = msg;
            $scope.categoryInitSpinnerStopped = true;
        };

        $scope.afterNavigationInitSpinnerShow = function () {
            $scope.navInit();
            $timeout(function () {
                if (srvConfig.isLoggedIn()) {
                    $scope.categoryDataSync();
                }
                else {
                    $scope.categoryStopSpinnerWithMessage();
                }
            }, 200);
        };

        // Synchronise DB
        $scope.categoryDataSync = function () {
            var self = this;
            var deferred = $q.defer();
            $scope.navDataSync().then(function (msg) {
                $scope.categoryStopSpinnerWithMessage(msg);

                //indicators
                $scope.categoryIndicators = srvDataContainer.computeIndicators();

                deferred.resolve();
            });

            return deferred.promise;
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            //if ($scope.modal) $scope.modal.remove();
        });
        // Execute action on chore state
        $scope.$on('chore.added', function () {
            // Execute action
            console.log('chore.added');
        });
        // Execute action on chore state
        $scope.$on('category.changed', function () {
            // Execute action
            console.log('category.changed');
            $scope.categoryDataSync();
        });

        //------------------
        // Initialization
        $scope.categoryInit();
        if ($scope.navRedirect) $scope.navRedirect();


    })

    .controller('CategoryChoresCtrl', function ($scope, $q, $timeout, $stateParams, $ionicHistory, gettextCatalog, srvDataContainer, srvData, srvConfig) {

        $scope.categoryChoresCategoryId = "";
        $scope.categoryChoresCategoryName = "";
        $scope.categoryChoresCategoryThumb = "";
        $scope.categoryChores = [];

        $scope.categoryChoresFilter = {};
        $scope.categoryChoresFilter[$scope.choreCols.category] = 'empty';
        $scope.categoryChoresInit = function () {

            $scope.categoryChoresCategoryId = $stateParams.categoryId;
            $scope.categoryChoresFilter[$scope.choreCols.category] = $stateParams.categoryId;
            $scope.categoryChoresCategoryName = srvDataContainer.getChoreCategoryName($stateParams.categoryId);
            $scope.categoryChoresCategoryThumb = srvDataContainer.getChoreCategoryThumbPath($stateParams.categoryId);
            //srvDataContainer.find

            $scope.categoryChores = [];
            var i = 0;
            for (; ($scope.chores) && (i < $scope.chores.length); i++) {
                var chore = $scope.chores[i];
                if (chore[$scope.choreCols.category] == $scope.categoryChoresCategoryId)
                    $scope.categoryChores.push(chore);
            }
        };


        $scope.categoryChoresChoreAdd = function (categoryId) {
            var newItemName = gettextCatalog.getString("New Item");

            var choreToAdd = {};
            choreToAdd[$scope.choreCols.name] = newItemName;
            choreToAdd[$scope.choreCols.category] = categoryId;
            choreToAdd[$scope.choreCols.percentAB] = 50;
            choreToAdd[$scope.choreCols.timeInMn] = 5;
            choreToAdd[$scope.choreCols.frequencyDays] = 1;
            choreToAdd[$scope.choreCols.priority] = 5;
            choreToAdd[$scope.choreCols.priorityComputed] = 5;

            srvData.Chore.set(choreToAdd).then(function (choreAdded) {
                $scope.navRedirect("/chore/" + choreAdded._id);
            });

        };


        //------------------
        // Initialization
        if (!$scope.chores && $scope.navRedirect) $scope.navRedirect("/config/category");
        else if ($scope.navRedirect) $scope.navRedirect();

        $scope.categoryChoresInit();
    })
;
