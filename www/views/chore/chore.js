angular.module('myAngularApp.views.chore', [])

    .config(function ($stateProvider) {

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
            .state('categoryChores', {
                url: '/categorychores/:categoryId',
                cache: false,
                templateUrl: 'views/chore/categoryChores.html',
                controller: 'CategoryChoresCtrl'
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

    .controller('ChoresDetailCtrl', function ($scope, $timeout, $stateParams, srvData, srvDataContainer) {

        $scope.choreId = $stateParams.choreId;
        $scope.choreToEdit = {};
        $scope.nextChoreToEdit = {};

        $scope.choreFindDetail = function () {
            var self = this;
            $scope.choreToEdit = {};
            $scope.nextChoreToEdit = {};
            if (!$scope.choreId) return;

            srvData.Chore.findOneById($scope.choreId)
                .then(function (chore) {
                    $scope.choreToEdit = chore;
                    $scope.choresDetailSyncroThumb();

                    // retrieve UserAffinity
                    if (typeof $scope.choreToEdit[$scope.choreCols.AUserAffinity] === 'undefined' || typeof $scope.choreToEdit[$scope.choreCols.BUserAffinity] === 'undefined') {
                        var per = $scope.choreToEdit[$scope.choreCols.percentAB];
                        $scope.choreToEdit[$scope.choreCols.AUserAffinity] = per;
                        $scope.choreToEdit[$scope.choreCols.BUserAffinity] = 100 - per;
                    }


                    var category = $scope.choreToEdit[$scope.choreCols.category];
                    var i = 0;
                    var foundChore = false;
                    delete $scope.nextChoreToEdit;
                    for (; ($scope.chores) && (i < $scope.chores.length) && (!$scope.nextChoreToEdit); i++) {
                        var c = $scope.chores[i];
                        if (foundChore && c[$scope.choreCols.category] === category)
                            $scope.nextChoreToEdit = c;

                        if (c._id === $scope.choreToEdit._id) {
                            // next in the category
                            foundChore = true;
                        }
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
                    $scope.choreFindDetail();
                })
                .catch(function (err) {
                    console.log('pb :' + err);
                    $scope.choreFindDetail();
                });
        };

        $scope.choreRemove = function (choreToRemove) {
            srvData.Chore.remove(choreToRemove)
                .then(function (msg) {

                    $scope.choreFindDetail();

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

        $scope.categoryInitSpinnerStopped = false;
        $scope.categoryErrMessage = "";
        $scope.categoryStopSpinnerWithMessage = function (msg) {
            $scope.categoryErrMessage = msg;
            $scope.categoryInitSpinnerStopped = true;
        };

        $scope.afterNavigationInitSpinnerShow = function () {
            $timeout(function () {
                // if (srvConfig.isLoggedIn()) {
                $scope.categoryDataSync();
                // }
                // else {
                //     $scope.categoryStopSpinnerWithMessage();
                // }
            }, 500);
        };


        // Init
        $scope.categoryInit = function () {
            //  $ionicHistory.nextViewOptions({
            //      disableBack: false
            //  });
            console.log('categoryInit');
        };

        // Synchronise DB
        $scope.categoryDataSync = function () {
            var self = this;
            var deferred = $q.defer();
            $scope.navDataSync(srvDataContainer)
                .then(function () {
                    //indicators
                    $scope.categoryIndicators = srvDataContainer.computeIndicators();
                    $scope.categoryStopSpinnerWithMessage();
                    deferred.resolve();
                })
                .catch(function (err) {
                    $scope.categoryStopSpinnerWithMessage(err);
                    deferred.reject(err);
                });

            return deferred.promise;
        };

        //Cleanup the modal when we're done with it!
        //$scope.$on('$destroy', function () {
        //if ($scope.modal) $scope.modal.remove();
        //});
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
        //if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);
        $scope.categoryInit();


    })

    .controller('CategoryChoresCtrl', function ($scope, $q, $timeout, $stateParams, $ionicHistory, gettextCatalog, srvDataContainer, srvData, srvConfig) {

        $scope.categoryChoresCategoryId = "";
        $scope.categoryChoresCategoryName = "";
        $scope.categoryChoresCategoryThumb = "";
        $scope.categoryChores = [];

        $scope.categoryChoresFilter = {};
        $scope.categoryChoresFilter[$scope.choreCols.category] = 'empty';
        $scope.categoryChoresInit = function () {

            console.log('categoryChoresInit');
            $scope.categoryChoresCategoryId = $stateParams.categoryId;
            $scope.categoryChoresFilter[$scope.choreCols.category] = $stateParams.categoryId;
            $scope.categoryChoresCategoryName = srvDataContainer.getChoreCategoryName($stateParams.categoryId);
            $scope.categoryChoresCategoryThumb = srvDataContainer.getChoreCategoryThumbPath($stateParams.categoryId);

            $scope.categoryChores = [];
            $timeout(function () {
                var i = 0;
                for (; ($scope.chores) && (i < $scope.chores.length); i++) {
                    var chore = $scope.chores[i];
                    if (chore[$scope.choreCols.category] == $scope.categoryChoresCategoryId)
                        $scope.categoryChores.push(chore);
                }
                console.log('categoryChoresInit :', $scope.categoryChores.length);
            }, 200);
        };



        $scope.categoryChoreDataSync = function () {
            $timeout(function () {
                $scope.navDataSync(srvDataContainer)
                    .then(function (msg) {
                        //return $scope.dashboardDataBind();
                        $scope.categoryChoresInit();
                        $scope.$broadcast('scroll.refreshComplete');
                    })
                    .catch(function (err) {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
            }, 200);
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

            srvData.Chore.set(choreToAdd)
                .then(function (choreAdded) {
                    $scope.chores.push(choreAdded);
                    $scope.navRedirect(srvDataContainer, 'choreDetail', {'choreId': choreAdded._id});
                });

        };


        //------------------
        // Initialization
        //if (!$scope.chores && $scope.navRedirect) $scope.navRedirect(srvDataContainer, 'config.category');
        //else if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);

        $scope.categoryChoresInit();
    })
;
