angular

    .module('myAngularApp.views.dashboard', [])

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('dashboard-user', {
                url: '/dashboard/user/:userId',
                cache: false,
                templateUrl: 'views/dashboard/dashboardUser.html',
                controller: 'DashboardCtrl'
            })
            .state('dashboard-indicator', {
                url: '/dashboard/indicator/:userId',
                cache: false,
                templateUrl: 'views/dashboard/dashboardIndicator.html',
                controller: 'DashboardIndicatorCtrl'
            });

        $urlRouterProvider.otherwise('/dashboard/user/a');
    })

    .controller('DashboardCtrl', function ($scope, $timeout, $log, $q, $stateParams, $ionicModal, srvDataContainer, srvData, srvConfig, srvArray) {
        'use strict';

        //console.log('DashboardCtrl launched');

        $scope.showDelete = false;
        $scope.showReorder = false;
        $scope.canSwipe = true;

        $scope.dashboardHistorics = [];
        $scope.dashboardSearch = {};
        $scope.dashboardHistoricDisplay = "week";
        $scope.dashboardChoresToAdd = {};
        $scope.dashboardChoresCategoriesToAdd = [];

        $scope.dashboardInit = function () {

            var userId = $stateParams.userId;
            if (!$scope.userA || !$scope.userB) {
                $scope.dashboardSearch.userId = userId;
                return;
            }

            if ($scope.dashboardSearch.userId === $scope.userA._id || $scope.dashboardSearch.userId === $scope.userB._id) {
                return;
            }

            $scope.dashboardSearch.userId = $scope.userA._id;
            if ($scope.userB._id === userId) {
                $scope.dashboardSearch.userId = $scope.userB._id;
            }

        };

        $scope.dashboardGetTextIdentifier = function (text) {

            if (!text) {
                return 'na';
            }

            var map = {
                //'&': '&amp;',
                //'<': '&lt;',
                //'>': '&gt;',
                //'"': '&quot;',
                //"'": '&#039;',
                '&': '',
                '<': '',
                '>': '',
                '"': '',
                "'": '',
                "/": ''
            };

            var str = text.replace(/[&<>/"']/g, function (m) {
                return map[m];
            });

            return str;
        };

        // Spinner - begin
        $scope.dashboardInitSpinnerStopped = false;
        $scope.afterNavigationInitSpinnerShow = function () {
            $scope.dashboardInitSpinnerStopped = false;
            $timeout(function () {
                if (srvConfig.isLoggedIn()) {
                    $scope.navDataSync(srvDataContainer)
                        .then(function (err) {
                            if (err) return $scope.dashboardStopSpinnerWithMessage(err);
                            return $scope.dashboardDataBind();
                        })
                        .then(function (err) {
                            $scope.dashboardInit();
                            return $scope.dashboardStopSpinnerWithMessage(err);
                        })
                        .catch(function (err) {
                            return $scope.dashboardStopSpinnerWithMessage(err);
                        });
                } else {
                    $scope.dashboardStopSpinnerWithMessage();
                    if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);
                }
            }, 1500);
        };
        $scope.dashboardStopSpinnerWithMessage = function (msg) {
            var text = msg || "";
            if (text) $scope.navAddErrorMessage(text);
            $scope.dashboardInitSpinnerStopped = true;
            $scope.$broadcast('scroll.refreshComplete');
            return $q.resolve(text);
        };
        //Spinner - end

        $scope.dashboardShowMore = function () {
            $scope.dashboardShowMoreVar = !$scope.dashboardShowMoreVar;
        };

        // indicators
        $scope.dashboardIndicators = {};
        $scope.dashboardIndicatorsCompute = function () {
            $scope.dashboardIndicators = srvDataContainer.computeIndicators();
        };

        $scope.dashboardDataSync = function () {

            $scope.dashboardInitSpinnerStopped = false;
            return $q(function (resolve, reject) {
                $timeout(function () {
                    $scope.navDataSync(srvDataContainer)
                        .then(function (msg) {
                            return $scope.dashboardDataBind();
                        })
                        .then(function (msg) {
                            $scope.dashboardStopSpinnerWithMessage(msg).then(resolve);
                        })
                        .catch(function (err) {
                            $scope.dashboardStopSpinnerWithMessage(err).then(resolve);
                        });
                });
            }, 1500);
        };

        $scope.dashboardDataBind = function () {
            var deferred = $q.defer();
            var self = this;

            // Computes Chores
            var promises = [];
            $scope.dashboardComputeChoresToAdd();
            promises.push($scope.dashboardComputeHistoricsByWeek());
            //promises.push($scope.dashboardComputeHistoricsDone());
            // execute as promises
            $q.all(promises)
                .then(function (result) {
                    //$scope.dashboardComputeIndicleanators();
                    $scope.dashboardIndicatorsCompute();
                    return deferred.resolve();
                })
                .catch(function (msg) {
                    return deferred.reject(msg);
                });

            return deferred.promise;
        };

        $scope.dashboardComputeChoresToAdd = function () {
            if (!$scope.chores || $scope.chores.length === 0) return;

            //$scope.dashboardChoresToAdd = {'': []};
            //$scope.dashboardChoresCategoriesToAdd = [''];
            //$scope.dashboardChoresToAdd[''] = [];
            $scope.dashboardChoresToAdd = {};
            $scope.dashboardChoresCategoriesToAdd = [];

            //$scope.dashboardChoresToAdd.push({dashboardSelectTitle : 'What are you doing ?'});
            for (var i = 0; i < $scope.chores.length; i++) {
                var choreToAdd = $scope.chores[i];
                var choreCategory = srvDataContainer.getChoreCategoryName(choreToAdd[$scope.choreCols.category]);
                var arrC = $scope.dashboardChoresToAdd[choreCategory];
                if (!arrC && !choreToAdd[$scope.choreCols.desactivate]) {
                    $scope.dashboardChoresCategoriesToAdd.push(choreCategory);
                    arrC = $scope.dashboardChoresToAdd[choreCategory] = [];
                }
                choreToAdd.dashboardSelectTitle = choreToAdd.choreName;//''+choreCategory+' - '+choreToAdd.choreName;

                if (!choreToAdd[$scope.choreCols.desactivate]) {
                    arrC.push(choreToAdd);
                }
            }

            $scope.dashboardToAdd = {'chore': null};
        };

        $scope.dashboardComputeHistoricsByWeek = function () {
            var self = this;
            var deferred = $q.defer();
            $scope.dashboardHistoricDisplay = "week";

            // Creation liste
            srvDataContainer.computeTodoForAllUsers()
                .then(function (historics) {
                    historics.sort(function (a, b) {
                        return a[$scope.historicCols.actionTodoDate] > b[$scope.historicCols.actionTodoDate];
                    });
                    //miapp.safeApply($scope, function () {
                    $scope.dashboardHistorics = historics;
                    //});
                    deferred.resolve();
                })
                .catch(function (err) {
                    $scope.dashboardErrorMsg = err;
                    deferred.reject(err);
                });

            return deferred.promise;
        };

        $scope.dashboardTerminateHistoric = function (historic, list, index) {
            if (!historic) return $q.reject('no historic');

            var self = this;
            var historicToAdd = {};

            return $q(function (resolve, reject) {
                historicToAdd = angular.copy(historic);
                //console.log('dashboardTerminateHistoric : ', historic);

                // historize what's done
                srvData.terminateHistoric($scope.chores, historicToAdd)
                    .then(function (historicsSavedInDb) {
                        historicToAdd = historicsSavedInDb;
                        return $scope.dashboardDataSync();
                    })
                    .then(function () {
                        resolve(historicToAdd);
                    })
                    .catch(function (msg) {
                        $scope.dashboardErrorMsg = msg.message ? msg.message : msg;
                        $scope.dashboardStopSpinnerWithMessage($scope.dashboardErrorMsg);
                        reject(msg);
                    });
            });
        };

        // Now section
        $scope.dashboardHistoricToDoNow = null;
        $scope.dashboardChoresFromCatToDoNow = null;
        $scope.dashboardSetCategoryToDoNow = function (catToDoNow) {
            $scope.dashboardChoresFromCatToDoNow = null;
            if (!catToDoNow) return;
            $scope.dashboardChoresFromCatToDoNow = $scope.dashboardChoresToAdd[catToDoNow];
            $scope.dashboardSetHistoricToDoNow(null);
        };
        $scope.dashboardSetHistoricToDoNow = function (choreToDoNow) {
            $scope.dashboardHistoricToDoNow = null;
            if (!choreToDoNow) return;
            $scope.dashboardHistoricToDoNow = srvData.createHistoricFromChore(choreToDoNow);
            //$scope.dashboardHistoricToDoNow[$scope.historicCols.choreId] = choreToDoNow._id;
            $scope.dashboardHistoricToDoNow[$scope.historicCols.userId] = $scope.dashboardSearch.userId;
            $scope.dashboardHistoricToDoNow._id = null;
        };
        $scope.dashboardTerminateHistoricNow = function (historic) {
            $scope.dashboardTerminateHistoric(historic)
                .then(function () {
                    $scope.dashboardSetCategoryToDoNow(null);
                    $scope.dashboardSetHistoricToDoNow(null);
                });
        };

        $scope.dashboardNotForMe = function (historic, list, index) {
            var deleted = false;
            if (!historic) return;

            //console.log('dashboardNotForMe : ', historic, list);

            var choreId = historic[$scope.historicCols.choreId];
            var choreToChange, possibleChore;
            // retrieve chore and find a chore that doesn't exist in list
            for (var i = 0; (i < $scope.chores.length); i++) {
                var c = $scope.chores[i];
                var currentChoreId = c._id;
                if (!choreToChange && currentChoreId === choreId)
                    choreToChange = c;

                if (list) {
                    var found = srvArray.find(list, function (element) {
                        var b = (element[$scope.historicCols.choreId] === currentChoreId);
                        //console.log('compare : ', b, element.choreName, c.choreName);
                        return b;
                    });
                    if (!found) {
                        // randomize chore
                        var randomOK = (Math.random() > 0.9);
                        //console.log('randomOK ? ', randomOK, possibleChore);
                        if (!possibleChore || randomOK )
                            possibleChore = c;
                    }
                }
            }

            // replace UX list with the new historicToTake
            var hi = $scope.dashboardHistorics.indexOf(historic);
            if (hi >= 0) {
                if (!possibleChore) {
                    //console.log('remove from UX list');
                    $scope.dashboardHistorics.splice(hi, 1);
                }
                else {
                    //console.log('replace UX list with the new historicToTake ...');
                    $scope.dashboardHistorics[hi] = srvData.createHistoricFromChore(possibleChore, historic);
                }
            }

            // change chore percent_AB
            /*if ($scope.dashboardSearch.userId === $scope.userA._id) {
                if (choreToChange && choreToChange[$scope.choreCols.percentAB] >= 5) {
                    choreToChange[$scope.choreCols.percentAB] = choreToChange[$scope.choreCols.percentAB] - 5;
                }
            }
            else {
                if (choreToChange && choreToChange[$scope.choreCols.percentAB] <= 95) {
                    choreToChange[$scope.choreCols.percentAB] = choreToChange[$scope.choreCols.percentAB] + 5;
                }
            }*/

            // Save chore & Sync db
            return srvData.Chore.set(choreToChange);
            //return deleted;
        };

        $scope.dashboardNotForUs = function (historic) {
            if (!historic) return;

            var self = this;
            //var deferred = $q.defer();
            var choreId = historic[$scope.historicCols.choreId];
            var choreToChange = null;
            // retrieve chore
            for (var i = 0; (i < $scope.chores.length) && !choreToChange; i++) {
                var c = $scope.chores[i];
                if (c._id == choreId) choreToChange = c;
            }

            // retrieve Historic in List
            var hi = $scope.dashboardHistorics.indexOf(historic);
            if (hi >= 0) {
                // remove from list
                $scope.dashboardHistorics.splice(hi, 1);
            }

            // change chore timeInMn
            if (choreToChange) choreToChange[$scope.choreCols.timeInMn] = 0;

            // Save chore & Sync db
            srvData.Chore.set(choreToChange)
                .then(function (choreSaved) {
                    return srvData.sync();
                })
                .then(function (msg) {
                    //console.log('pb sync : ' + msg);
                })
                .catch(function (msg) {
                    $scope.dashboardErrorMsg = msg;
                });
        };


        $scope.dashboardAvailability = function (dateISO, userId) {

            var date = null;
            if (typeof dateISO === "string") date = new Date(dateISO);
            else if (dateISO && dateISO instanceof Date) date = new Date(Date.UTC(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate()));
            else date = new Date();
            //var res = date.toISOString().slice(0, 10).replace(/-/g, "/");
            var min = srvDataContainer.getHistoricsDoneTimeRemaining(userId, date);
            return min;
        };
        $scope.dashboardAvailabilityMax = function (dateISO, userId) {

            var date = null;
            if (typeof dateISO === "string") date = new Date(dateISO);
            else if (dateISO && dateISO instanceof Date) date = new Date(Date.UTC(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate()));
            else date = new Date();
            //var res = date.toISOString().slice(0, 10).replace(/-/g, "/");
            var max = srvDataContainer.getTimePerDay(userId, date);
            return max;
        };

        $scope.dashboardDisplayHistoricDate = function (dateISO) {

            var date = null;
            if (typeof dateISO === "string") date = new Date(dateISO);
            else if (dateISO && dateISO instanceof Date) date = new Date(Date.UTC(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate()));
            else date = new Date();

            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var day = days[date.getDay()];
            var month = months[date.getMonth()];

            var now = new Date();
            var tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            var isToday = ((date.getDate() == now.getDate()) && (date.getMonth() == now.getMonth()) && (date.getFullYear() == now.getFullYear()));
            var isTomorrow = ((date.getDate() == tomorrow.getDate()) && (date.getMonth() == tomorrow.getMonth()) && (date.getFullYear() == tomorrow.getFullYear()));
            if (isToday) day = 'Today, ' + day;
            if (isTomorrow) day = 'Tomorrow, ' + day;

            return day;
        };

        $scope.dashboardIsItToday = function (dateISO) {

            var date = null;
            if (typeof dateISO === "string") date = new Date(dateISO);
            else if (dateISO && dateISO instanceof Date) date = new Date(Date.UTC(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate()));
            else date = new Date();
            var now = new Date();
            var isToday = ((date.getDate() == now.getDate()) && (date.getMonth() == now.getMonth()) && (date.getFullYear() == now.getFullYear()));
            return isToday;
        };

        $scope.dashboardCheckTodayIsEmpty = function () {
            var now = new Date();
            var t = srvDataContainer.getHistoricsTodo($scope.dashboardSearch.userId, now);
            return (t && (t.length === 0));

        };

        //todo refactor getDateText ?
        function getDateText(dateText) {
            var dateT = null;
            if (!dateText) return dateT;

            var date = new Date(dateText);
            dateT = '' + padInteger(date.getDate(), 2) + '/' + padInteger(date.getMonth() + 1, 2) + '/' + padInteger(date.getFullYear(), 4) + ' ' + padInteger(date.getHours(), 2) + ':' + padInteger(date.getMinutes(), 2);
            return dateT;
        }

        function padInteger(num, size) {
            if (!size) size = 10;
            var s = "000000000" + num;
            return s.substr(s.length - size);
        }


        $scope.dashboardShowLastHistoricDateWithChoreId = function (choreId) {
            if (!choreId) return 'na';
            var lastDate = srvData.getDateOfLastChoreDoneByType($scope.chores, $scope.dashboardHistoricsDone, choreId);
            var str = getDateText(lastDate);
            return str;
        };

        $scope.dashboardShowLastHistoricDate = function (historic) {
            if (!historic) return 'na';
            var choreId = historic[$scope.historicCols.choreId];
            var str = $scope.dashboardShowLastHistoricDateWithChoreId(choreId);
            return str;
        };

        $scope.dashboardDisplayHistoricCalendar = function (dateISO) {

            var date = null;
            if (typeof dateISO === "string") date = new Date(dateISO);
            else if (dateISO && dateISO instanceof Date) date = new Date(Date.UTC(dateISO.getFullYear(), dateISO.getMonth(), dateISO.getDate()));
            else date = new Date();
            var res = '' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);//.toISOString();//.slice(0, 10).replace(/-/g, "/");

            var display = "" + $scope.dashboardDisplayHistoricDate(dateISO) + " <span class='small'>" + res + "</span>";
            //$log.log('dashboardDisplayHistoricCalendar: '+dateISO+' : '+display);
            return display;
        };

        /*
         $scope.dashboardProfilFillColor = function (user) {
         if (!$scope.userA || !$scope.userB) return "#FFFFFF";
         if (user._id == $scope.userB._id)
         return srvConfig.getProfilColors(1).fill;
         return srvConfig.getProfilColors(0).fill;
         };

         $scope.dashboardProfilStrokeColor = function (user) {
         if (!$scope.userA || !$scope.userB) return "#FFFFFF";
         if (user._id == $scope.userB._id)
         return srvConfig.getProfilColors(1).stroke;
         return srvConfig.getProfilColors(0).stroke;
         };
         $scope.dashboardProfilHighlightColor = function (user) {
         if (!$scope.userA || !$scope.userB) return "#FFFFFF";
         if (user._id == $scope.userB._id)
         return srvConfig.getProfilColors(1).hightlight;
         return srvConfig.getProfilColors(0).hightlight;
         };


         $scope.dashboardProfilColor = function () {
         if (!$scope.userA || !$scope.userB) return "#FFFFFF";

         if ($scope.dashboardSearch.userId == $scope.userB._id)
         return $scope.dashboardProfilFillColor($scope.userB);

         return $scope.dashboardProfilFillColor($scope.userA);
         };
         */

        $scope.dashboardGetChoreCategoryThumbPath = function (category) {
            return srvDataContainer.getChoreCategoryThumbPath(category);
        };

        // Modal
        $scope.dashboardModalHistoric = null;
        $ionicModal.fromTemplateUrl('views/dashboard/modals.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.dashboardOpenModal = function (historic) {
            if ($scope.modal) {
                $scope.dashboardModalHistoric = historic;
                $scope.dashboardModalOriginalTimeInMn = parseInt(historic[$scope.historicCols.timeInMn]);
                $scope.modal.show();
            }
        };

        $scope.dashboardCloseModal = function (historic) {
            if ($scope.modal) $scope.modal.hide();
            $scope.dashboardModalHistoric = null;
            if (!historic) return;
            $scope.dashboardTerminateHistoric(historic)
                .then(function () {
                    //dashboardSetHistoricToDoNow
                });
        };

        $scope.$on('$destroy', function () {
            if ($scope.modal) $scope.modal.remove();
        });

        $scope.$on('modal.hidden', function () {
            // Execute action
        });

        $scope.$on('modal.removed', function () {
            // Execute action
        });

        // Initialization
        $scope.dashboardInit();
        if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);

    })

    .controller('DashboardIndicatorCtrl', function ($scope, $timeout, $q, $stateParams, $ionicModal, srvDataContainer, srvData, srvConfig) {
        'use strict';

        //$scope.dashboardIndicatorUser = $stateParams.userId;
        $scope.dashboardIndicatorsSearch = {};
        //$scope.dashboardIndicatorsSearch.userId = $stateParams.userId;
        $scope.dashboardIndicatorsHistoricsForOneUser = [];
        $scope.dashboardIndicatorsHistoricsForAllUsers = [];

        // Spinner
        $scope.dashboardIndicatorsInitSpinnerStopped = false;
        $scope.afterNavigationInitSpinnerShow = function () {
            $timeout(function () {
                $scope.dashboardIndicatorsInit();
                $scope.dashboardIndicatorsStopSpinnerWithMessage();
            }, 200);
        };

        $scope.dashboardIndicatorsStopSpinnerWithMessage = function (msg) {
            var text = msg || "";
            if (text) $scope.navAddErrorMessage(text);
            $scope.dashboardIndicatorsInitSpinnerStopped = true;
        };
        //Spinner - end

        function getDateText(dateText) {
            var dateT = null;
            if (!dateText) return dateT;

            var date = new Date(dateText);
            dateT = '' + padInteger(date.getDate(), 2) + '/' + padInteger(date.getMonth() + 1, 2) + '/' + padInteger(date.getFullYear(), 4) + ' ' + padInteger(date.getHours(), 2) + ':' + padInteger(date.getMinutes(), 2);
            return dateT;
        }

        function padInteger(num, size) {
            if (!size) size = 10;
            var s = "000000000" + num;
            return s.substr(s.length - size);
        }


        $scope.dashboardIndicatorsInit = function () {
            if (!srvConfig.isLoggedIn() || !$scope.userA) return $scope.navRedirect(srvDataContainer, 'dashboard-user', {'userId': 'a'});

            // Set the userId
            $scope.dashboardIndicatorsSearch.userId = $stateParams.userId;
            $scope.dashboardIndicatorsSearch.user = $scope.userA;
            if ($scope.userB && $stateParams.userId == $scope.userB._id) $scope.dashboardIndicatorsSearch.user = $scope.userB;

            // last reset Init
            $scope.dashboardIndicatorLastResetDate = getDateText(srvData.getLastHistoricsResetDate());

            // get the ordered User done historics and ALL users done historics
            var arrayToSort = srvDataContainer.getHistoricsDone($scope.dashboardIndicatorsSearch.userId);
            arrayToSort.sort(function (a, b) {
                return a[$scope.historicCols.actionDoneDate] > b[$scope.historicCols.actionDoneDate];
            });
            $scope.dashboardIndicatorsHistoricsForOneUser = arrayToSort;
            $scope.dashboardIndicatorsHistoricsForAllUsers = srvDataContainer.getHistoricsDone();
            $scope.dashboardIndicatorsCompute();
        };

        $scope.dashboardIndicatorsBack = function () {
            var arg = {'userId': 'a'};
            if ($scope.dashboardIndicatorsSearch.userId)
                arg = {'userId': $scope.dashboardIndicatorsSearch.userId};
            $scope.navRedirect(srvDataContainer, 'dashboard-user', arg);
        };

        $scope.dashboardIndicatorShowResetVar = false;
        $scope.dashboardIndicatorShowReset = function () {
            $scope.dashboardIndicatorShowResetVar = !$scope.dashboardIndicatorShowResetVar;
            $timeout(function () {
                $scope.dashboardIndicatorShowResetVar = false;
            }, 4000);
        };

        // Synchronise DB
        $scope.dashboardIndicatorLastResetDate = "";
        $scope.dashboardIndicatorReset = function () {
            srvDataContainer.reset();
            $scope.dashboardIndicatorsHistoricsForOneUser = [];
            $scope.dashboardIndicatorsHistoricsForAllUsers = [];
            $scope.dashboardIndicatorLastResetDate = getDateText(srvDataContainer.getLastResetDate());
            $scope.dashboardIndicatorShowResetVar = false;
        };

        // Modals & Indicators display management
        $scope.dashboardIndicatorsChartColours = [
            { // userB
                fillColor: "rgba(100,100,100,0.1)",//"#fff",//$scope.dashboardProfilFillColor($scope.userB),
                strokeColor: "#bb2",//$scope.dashboardProfilStrokeColor($scope.userB),
                pointColor: "#bb3",//$scope.dashboardProfilFillColor($scope.userB),
                pointStrokeColor: "#fff",
                pointHighlightFill: "#bb4",
                pointHighlightStroke: "#bb5"//$scope.dashboardProfilHighlightColor($scope.userB)
            },
            { // userA
                fillColor: "rgba(200,200,200,0.2)",//"#fff",//$scope.dashboardProfilFillColor($scope.userA),
                strokeColor: "#ee2",//$scope.dashboardProfilStrokeColor($scope.userA),
                pointColor: "#ee3",//$scope.dashboardProfilFillColor($scope.userA),
                pointStrokeColor: "#fff",
                pointHighlightFill: "#ee5",
                pointHighlightStroke: "#ee5"//$scope.dashboardProfilHighlightColor($scope.userA)
            }
        ];
        $scope.dashboardIndicleanator = 0;
        $scope.dashboardIndicatorsComputed = {};
        $scope.dashboardIndicleanatorSquare = 0;
        $scope.dashboardIndicatorsUserATimeSpent = 0;
        $scope.dashboardIndicatorsUserBTimeSpent = 0;
        $scope.dashboardIndicatorsCompute = function () {

            $scope.dashboardIndicatorsComputed = srvDataContainer.computeIndicators();
            var indicAPer = $scope.dashboardIndicatorsComputed.indicPercent[0];
            var indicBPer = $scope.dashboardIndicatorsComputed.indicPercent[1];
            $scope.dashboardIndicatorsUserATimeSpent = $scope.dashboardIndicatorsComputed.indicTimeSpent[0];
            $scope.dashboardIndicatorsUserBTimeSpent = $scope.dashboardIndicatorsComputed.indicTimeSpent[1];

            // Abs : $scope.dashboardIndicleanator = Math.round(Math.pow(indicA - indicB, 2) * 10) / 10;
            //	$scope.dashboardIndicleanator = Math.round((indicA - indicB) * 10) / 10;
            //	$scope.dashboardIndicleanatorSquare = Math.pow($scope.dashboardIndicleanator,2);

            $scope.dashboardIndicatorsLabels = [$scope.userB[$scope.userCols.firstName], $scope.userA[$scope.userCols.firstName]];
            $scope.dashboardIndicatorsData = [indicBPer, indicAPer];
            $scope.dashboardIndicatorsDatasets = {
                labels: $scope.dashboardIndicatorsLabels,
                datasets: [{data: [indicBPer, indicAPer]}]
            };

            // 	Done ?
            $scope.dashboardIndicatorsLabelsDone = [];//["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];
            $scope.dashboardIndicatorsDataDone = [[], []];//= [
            //	[65, 59, 90, 81, 56, 55, 40],
            //	[28, 48, 40, 19, 96, 27, 100]
            //];

            $scope.dashboardIndicatorsChartOptions = {
                segmentStrokeWidth: 20,
                segmentStrokeColor: $scope.dashboardIndicatorsChartColours
            };

            for (var i = 0; i < $scope.dashboardIndicatorsHistoricsForAllUsers.length; i++) {
                var historic = $scope.dashboardIndicatorsHistoricsForAllUsers[i];
                var category = srvDataContainer.getChoreCategoryName(historic[$scope.historicCols.category]);
                var catIndex = $scope.dashboardIndicatorsLabelsDone.indexOf(category);
                if (catIndex < 0) $scope.dashboardIndicatorsLabelsDone.push(category);
            }

            for (var j = 0; j < $scope.dashboardIndicatorsLabelsDone.length; j++) {
                $scope.dashboardIndicatorsDataDone[0].push(0);
                $scope.dashboardIndicatorsDataDone[1].push(0);
            }

            for (var k = 0; k < $scope.dashboardIndicatorsHistoricsForAllUsers.length; k++) {
                var historicb = $scope.dashboardIndicatorsHistoricsForAllUsers[k];
                var categoryb = srvDataContainer.getChoreCategoryName(historicb[$scope.historicCols.category]);
                var labelIndex = $scope.dashboardIndicatorsLabelsDone.indexOf(categoryb);
                var userIndex = (historicb[$scope.historicCols.userId] == $scope.userA._id) ? 1 : 0;
                var oldValue = $scope.dashboardIndicatorsDataDone[userIndex][labelIndex];
                $scope.dashboardIndicatorsDataDone[userIndex][labelIndex] = oldValue + 1;
            }

        };

        // Initialization
        if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);

    })
;
