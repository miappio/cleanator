angular
    .module('srvDataContainer', ['srvData.pouchdb'])
    .factory('srvDataContainer', function ($log, $q, $http, $rootScope, $cordovaNetwork, filterFilter, srvData, srvConfig, MiappService, demoMode) {
        return new SrvDataContainer($log, $q, $http, $rootScope, $cordovaNetwork, filterFilter, srvData, srvConfig, MiappService, demoMode);
    });

var SrvDataContainer = (function () {
    'use strict';

    function Service($log, $q, $http, $rootScope, $cordovaNetwork, filterFilter, srvData, srvConfig, MiappService, demoMode) {

        var self = this;
        self.$log = $log;
        self.$q = $q;
        self.$rootScope = $rootScope;
        self.$http = $http;
        self.filterFilter = filterFilter;
        self.srvData = srvData;
        self.srvConfig = srvConfig;
        self.srvMiapp = MiappService;

        self.demoMode = demoMode;
        // Check Online Event based on Cordova
        self.isCordovaOnline = false;
        if (!self.demoMode) {
            //if ($cordovaNetwork && $cordovaNetwork.isCordovaOnline)
            //    self.isCordovaOnline = $cordovaNetwork.isCordovaOnline();
            self.isCordovaOnline = true;

            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                self.isCordovaOnline = true;
                //console.log('self.isCordovaOnline ON');
            });
            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                self.isCordovaOnline = false;
                //console.log('self.isCordovaOnline OFF');
            });
        }

        self.userA = null;
        self.couple = null;
        self.userB = null;
        self.chores = [];
        self.categories = [];
        self.historicsTodo = {};
        self.historicsTodo2 = [];
        self.historicsDone = [];
        self.userCols = srvData.User.columns;
        self.coupleCols = srvData.Couple.columns;
        self.historicCols = srvData.Historic.columns;
        self.choreCols = srvData.Chore.columns;
        self.categoryCols = srvData.Category.columns;

        /**
         * [{title:'English', code:'en_US'},{title:'Français', code:'fr_FR'}, {title:'Espagnol', code:'es_ES'}];
         */
        self.$rootScope.navigLangs = self.getConfigLangs();
        self.$rootScope.navigLang = self.getConfigLang();

        self.$rootScope.navChangeLang = function (lang) {
            self.setConfigLang(lang);
        };

        //this.$rootScope.Math = window.Math;
        self.$rootScope.navMathRound = function (val) {
            var ret = val;
            if (window.Math) ret = window.Math.round(val);
            return ret;
        };

        // All Data needed in Navigation RootScope
        self.$rootScope.userA = null;
        self.$rootScope.couple = null;
        self.$rootScope.userB = null;
        self.$rootScope.chores = null;
        self.$rootScope.categories = null;
        self.$rootScope.userCols = self.userCols;
        self.$rootScope.coupleCols = self.coupleCols;
        self.$rootScope.historicCols = self.historicCols;
        self.$rootScope.choreCols = self.choreCols;
        self.$rootScope.categoryCols = self.categoryCols;
        self.$rootScope.navProfils = [
            {id: 'g1', img: './img/profil/girl01.jpg'},
            {id: 'b1', img: './img/profil/boy01.jpg'},
            {id: 'g2', img: './img/profil/girl02.jpg'},
            {id: 'b2', img: './img/profil/boy02.jpg'},
            {id: 'g3', img: './img/profil/girl03.jpg'},
            {id: 'b3', img: './img/profil/boy03.jpg'}
        ];

        self.$rootScope.navAppInitLevel = function () {
            var level = self.getAppFirstInitLevel();
            return level;
        };

        self.$rootScope.navSetAppInitLevel = function (level) {
            return self.setAppFirstInitLevel(level);
        };

        self.$rootScope.navAppOnlineLevel = function () {
            return self.isCordovaOnline ? 'o' : 'n';
        };

        // BindFunction
        self.bindDone = false;
        self.bindData = bindData;
        self.bindCategories = bindCategories;
        self.bindChores = bindChores;
        self.bindCouple = bindCouple;
        self.bindHistoricsDone = bindHistoricsDone;

    }

    Service.prototype.init = function () {
        this.srvData.init();
    };

    Service.prototype.login = function (user) {
        var self = this;
        var login = null;
        var password = null;
        if (!!user) {
            login = user.email;
            password = user.password;
        }

        //self.$log.log('srvDataContainer.login : ', login, self.isCordovaOnline);
        return self.$q(function (resolve, reject) {
            self.srvMiapp.login(login, password, self.isCordovaOnline)
                .then(function (miappUser) {

                    //self.$log.log('srvDataContainer.login srvMiapp received: ', miappUser);
                    if (user) for (var attrname in user) {
                        miappUser[attrname] = user[attrname];
                    }
                    var configUser = self.srvConfig.getUserLoggedIn();
                    if (configUser) for (var attrname in configUser) {
                        miappUser[attrname] = configUser[attrname];
                    }

                    //   self.$log.log('srvDataContainer.login srvMiapp put : ', miappUser);
                    //   return self.putInDB(self.srvData.User, miappUser);
                    //})
                    //.then(function (miappUser) {
                    //self.$log.log('srvDataContainer.login srvConfig put : ', miappUser);
                    self.srvConfig.setUserLoggedIn(miappUser);
                    resolve(miappUser);
                })
                .catch(function (err) {
                    self.$log.error('srvConfig.setUserLoggedIn reject : ' + err);
                    reject(err);
                });
        });
    };

    Service.prototype.sync = function () {
        var self = this;
        var lang = self.srvConfig.getConfigLang() ? self.srvConfig.getConfigLang().code : 'en_US';
        var userMain = self.srvConfig.getUserLoggedIn();
        if (!userMain || !userMain.email) return self.$q.reject('srvDataContainer.sync : Need one user logged in.');

        //self.$log.log('srvDataContainer.sync');
        var firstSyncDone = false;
        return new self.$q(function (resolve, reject) {
            self.srvMiapp
                .sync(
                    function (miappSrv) {
                        //self.$log.log('srvDataContainer.sync first data. ', firstSyncDone);
                        firstSyncDone = true;
                        return self.initWithFirstData(lang, userMain);
                    },
                    self.isCordovaOnline
                )
                .then(function () {
                    return self.bindData();
                })
                .then(function (err) {
                    if (err) return reject(err);
                    //self.$log.log('srvDataContainer.sync resolved. ', firstSyncDone);
                    if (!firstSyncDone && !self.bindDone) {
                        // we have data
                        self.srvConfig.setAppFirstInitLevel(3);
                    }

                    self.bindDone = true;
                    resolve();
                })
                .catch(function (err) {
                    var errMessage = err ? err : 'pb with getting first data';
                    self.$log.error(errMessage);
                    reject(errMessage);
                });
        });
    };

    Service.prototype.isLoggedIn = function () {
        var userMain = this.srvConfig.getUserLoggedIn();
        var bc = this.srvConfig.isLoggedIn();
        var mi = this.srvMiapp.isLoggedIn();

        //console.log('srvDataContainer.isLoggedIn : ', userMain, bc, mi);
        var loggedIn = (userMain && userMain.email && bc && mi) ? true : false;
        return loggedIn;
    };

    Service.prototype.getAppFirstInitLevel = function () {
        var level = this.srvConfig.getAppFirstInitLevel();
        return level;
    };
    Service.prototype.isAppFirstInitCompleted = function () {
        return this.srvConfig.isAppFirstInitCompleted();
    };
    Service.prototype.setAppFirstInitLevel = function (level) {
        return this.srvConfig.setAppFirstInitLevel(level);
    };

    Service.prototype.getConfigLangs = function () {
        return this.srvConfig.getConfigLangs();
    };
    Service.prototype.getConfigLang = function () {
        return this.srvConfig.getConfigLang();
    };
    Service.prototype.setConfigLang = function (lang) {
        return this.srvConfig.setConfigLang(lang);
    };

    Service.prototype.logout = function () {
        //console.log('srvDataContainer logout');
        this.srvConfig.logout();
        this.srvConfig.setAppFirstInitLevel(0);
        //return this.srvData.becarefulClean();
        return this.srvMiapp.logout();
    };

    Service.prototype.reset = function () {
        this.historicsDone = [];
        this.srvData.resetHistorics();
    };

    Service.prototype.getLastResetDate = function () {
        return this.srvData.getLastHistoricsResetDate();
    };

    Service.prototype.getUserA = function () {
        return this.userA;
    };
    Service.prototype.getCouple = function () {
        return this.couple;
    };
    Service.prototype.getUserB = function () {
        return this.userB;
    };
    Service.prototype.getChores = function () {
        return this.chores;
    };
    Service.prototype.getCategories = function () {
        return this.categories;
    };
    Service.prototype.getHistoricsDone = function (userId) {
        var done = [];
        var filter = {};
        if (userId) {
            filter[this.historicCols.userId] = userId;
            done = this.filterFilter(this.historicsDone, filter);
        }
        else done = this.historicsDone;

        //console.log('srvDataContainer.getHistoricsDone :' + userId + ' (' + this.historicsDone.length + '/' + done.length + ') ', this.historicsDone);
        return done;
    };

    Service.prototype.getHistoricsDoneTimeElapsedByUser = function (userId, date) {
        var self = this;
        var user = self.userB;
        if (self.userA._id === userId) user = self.userA;
        var timeElapsed = self.srvData.getDoneTimeElapsedByUser(self.historicsDone, user, date);
        return timeElapsed;
    };

    Service.prototype.getHistoricsTodo = function (userId, date) {
        var self = this;
        var user = self.userB;
        if (self.userA._id == userId) user = self.userA;

        var todos = self.historicsTodo2;
        var todosToday = [];
        for (var i = 0; todos && (i < todos.length); i++) {
            var dateCorrect = false;
            if (!date) dateCorrect = true;
            else {
                var dateUTCYYYYMMDD = new Date(date);
                var dateUTCYYYYMMDDTodo = new Date(todos[i].actionTodoDate);
                if (dateUTCYYYYMMDD.getFullYear() === dateUTCYYYYMMDDTodo.getFullYear()
                    && dateUTCYYYYMMDD.getMonth() === dateUTCYYYYMMDDTodo.getMonth()
                    && dateUTCYYYYMMDD.getDate() === dateUTCYYYYMMDDTodo.getDate())
                    dateCorrect = true;
            }

            if (dateCorrect && (todos[i].userId === userId))
                todosToday.push(todos[i]);

        }

        return todosToday;
    };

    Service.prototype.getHistoricsDoneTimeRemaining = function (userId, date) {
        var self = this;

        var timeElapsed = self.getHistoricsDoneTimeElapsedByUser(userId, date);

        var timeRemain = self.getTimePerDay(userId, date);
        timeRemain = timeRemain - timeElapsed;
        return (timeRemain > 0) ? timeRemain : 0;
    };

    Service.prototype.getTimePerDay = function (userId, date) {
        var self = this;

        var dayOfWeek = date.getDay();
        var col = self.srvData.userColumns.timeInMnPerSund;
        if (dayOfWeek == 1) col = self.srvData.userColumns.timeInMnPerMond;
        else if (dayOfWeek == 2) col = self.srvData.userColumns.timeInMnPerTues;
        else if (dayOfWeek == 3) col = self.srvData.userColumns.timeInMnPerWedn;
        else if (dayOfWeek == 4) col = self.srvData.userColumns.timeInMnPerThur;
        else if (dayOfWeek == 5) col = self.srvData.userColumns.timeInMnPerFrid;
        else if (dayOfWeek == 6) col = self.srvData.userColumns.timeInMnPerSatu;

        var user = self.userB;
        if (self.userA._id == userId) user = self.userA;
        var timePerDay = parseInt(user[col]);

        return timePerDay;
    };

    Service.prototype.putInDB = function (dataModel, dataToPut) {
        //return dataModel.put(dataToPut);
        return dataModel.set(dataToPut);
    };

    Service.prototype.initWithFirstData = function (langOfFile, firstUserLoggedIn) {
        var i, j, self = this;
        var chanceBaseUser = 2345, chanceBaseCouple = 2645, chanceBaseChore = 2945;//Math.random
        //var deferred = self.$q.defer();

        //self.$log.log('srvDataContainer.initWithFirstData ' + langOfFile + ' firstUserLoggedIn._id: ' + firstUserLoggedIn._id);
        return new self.$q(function (resolve, reject) {

            var fileLang = langOfFile || 'fr';
            var fileURI = 'data/init.' + fileLang + '.json';
            //self.$log.log('srvDataContainer.initWithFirstData ready to init : ' + fileURI);
            self.$http.get(fileURI)
                .success(function (data) {

                    //self.$log.log('srvDataContainer.initWithFirstData data/init read :' + data);
                    //self.$log.log(data);
                    if (!data || !data.chores) return reject();

                    // Users first init
                    //if (data.users && data.users.length >= 2) {

                    var users = data.users;

                    //self.$log.log(users);
                    var userA = {}, userB = {};
                    angular.extend(userA, firstUserLoggedIn);
                    angular.extend(userA, users[0]);
                    angular.extend(userB, users[1]);

                    self.putInDB(self.srvData.User, userA)
                        .then(function (newUserA) {
                            //self.$log.log('srvDataContainer.initWithFirstData put A :', newUserA);
                            return self.putInDB(self.srvData.User, userB);
                        })
                        .then(function (newUserB) {
                            //self.$log.log('srvDataContainer.initWithFirstData put B :', newUserB);

                            var couple = {};
                            //var chanceCouple = new Chance(chanceBaseCouple + i);
                            couple[self.coupleCols.name] = 'we are happy';//chanceCouple.sentence({words: 2});
                            couple[self.coupleCols.description] = 'happy couple';//chanceCouple.sentence({words: 5});

                            couple[self.coupleCols.userAId] = firstUserLoggedIn._id;
                            couple[self.coupleCols.userBId] = newUserB._id;
                            if (!firstUserLoggedIn._id || !newUserB._id) return reject("no couple available.");

                            return self.putInDB(self.srvData.Couple, couple);
                        })
                        .then(function (coupleSaved) {
                            //self.$log.log('srvDataContainer.initWithFirstData coupleSaved :', coupleSaved);

                            // Categories first init
                            var categories = data.categories;
                            var categoriesLength = categories.length;
                            var promiseArray = [];
                            for (i = 0; i < categoriesLength; i++) {
                                var category = categories[i];
                                promiseArray.push(self.putInDB(self.srvData.Category, category));
                            }
                            return self.$q.all(promiseArray);
                        })
                        .then(function (allCategories) {
                            //self.$log.log('srvDataContainer.initWithFirstData allCategories :' + allCategories.length);
                            var chores = data.chores;
                            var choresLength = chores.length;
                            var promiseArray = [];
                            for (j = 0; j < choresLength; j++) {
                                var chore = chores[j];
                                promiseArray.push(self.putInDB(self.srvData.Chore, chore));
                            }
                            return self.$q.all(promiseArray);
                        })
                        .then(function (allChores) {
                            //self.$log.log('srvDataContainer.initWithFirstData allChores :' + allChores.length);
                            return resolve();
                        })
                        .catch(function (err) {
                            var msg = "first data creation pb : " + (err.message ? err.message : err);
                            return reject(msg);
                        });

                })
                .error(function (data) {
                    self.$log.error('srvDataContainer.initWithFirstData data/init reject: ' + data);
                    return reject(data);
                });

        });
    };

    Service.prototype.getChoreCategoryName = function (choreGroup) {
        var self = this;
        if (!choreGroup || !self.categories) return 'na';
        var choreCategories = self.categories;
        for (var i = 0; i < choreCategories.length; i++) {
            var cat = choreCategories[i];
            if (cat.categoryName == choreGroup)
                return cat.description;
        }
        return 'na';
    };

    Service.prototype.getChoreCategoryThumbPath = function (choreGroup) {

        var self = this;
        if (!choreGroup || !self.categories) return 'na';
        var choreCategories = self.categories;
        for (var i = 0; i < choreCategories.length; i++) {
            var cat = choreCategories[i];
            if (cat.categoryName == choreGroup)
                return cat.thumb;
        }
        return 'na';
    };

    /**
     * @deprecated ???

     Service.prototype.computeTodoForOneUser = function (userId) {

        var self = this;
        var deferred = self.$q.defer();

        if (!self.userA || !self.userB) {
            deferred.reject('data not initialized');
            return deferred.promise;
        }

        // merge all Historics
        var historicsTodoAndDone = [];
        var ha = self.historicsTodo[self.userA._id] ? self.historicsTodo[self.userA._id] : [];
        var hb = self.historicsTodo[self.userB._id] ? self.historicsTodo[self.userB._id] : [];
        if (userId === self.userB._id) historicsTodoAndDone = historicsTodoAndDone.concat(ha);
        if (userId === self.userA._id) historicsTodoAndDone = historicsTodoAndDone.concat(hb);
        historicsTodoAndDone = historicsTodoAndDone.concat(self.historicsDone);

        self.srvData.computeHistoricsByCalendar(self.chores, historicsTodoAndDone, self.userA, self.userB, 7)
            .then(function (allHistoricsTodo) {

                var allHistoricForOneUser = [];
                for (var i = 0; i < allHistoricsTodo.length; i++) {
                    var h = allHistoricsTodo[i];
                    if (h.userId && userId && h.userId === userId) allHistoricForOneUser.push(h);
                }
                //store the UserTodoList
                self.historicsTodo[userId] = allHistoricForOneUser;

                deferred.resolve(allHistoricForOneUser);
            })
            .catch(function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };*/

    /**
     *
     * @returns {*}
     */
    Service.prototype.computeTodoForAllUsers = function () {
        var self = this;
        if (!self.userA || !self.userB) return self.$q.reject('data not initialized...');

        // compute base on all historics done
        return new self.$q(function (resolve, reject) {
            self.srvData.computeHistoricsByCalendar(self.chores, self.historicsDone, self.userA, self.userB, 7)
                .then(function (allHistoricsTodo) {
                    self.historicsTodo2 = allHistoricsTodo;
                    resolve(allHistoricsTodo);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    };

    Service.prototype.computeIndicators = function () {
        var self = this;
        var usersIndicTimeAvailabity = 0;
        var choresIndicTimeRequired = 0;
        var choresIndicFeasibility = 0;
        var userATimeSpent = 0;
        var userBTimeSpent = 0;
        var userATimeAvailable = self.userA ? parseInt(self.userA[self.userCols.timeInMnPerWeekTodo]) : 0;
        var userBTimeAvailable = self.userB ? parseInt(self.userB[self.userCols.timeInMnPerWeekTodo]) : 0;


        // compute Average availability for the couple on a week
        usersIndicTimeAvailabity = (userATimeAvailable + userBTimeAvailable) / (7 * 2);

        // compute chores Required time
        for (var j = 0; self.chores && j < self.chores.length; j++) {
            var chore = self.chores[j];
            var desactive = (chore[self.choreCols.desactivate] == 'false');
            if (!chore[self.choreCols.desactivate] || desactive) {
                var mn = parseInt(chore[self.choreCols.timeInMn]);
                var freq = parseInt(chore[self.choreCols.frequencyDays]);
                if (mn && freq)
                    choresIndicTimeRequired += parseFloat(mn / freq);
                else {
                    //console.log('chore pb to remove : ', chore);
                    self.srvMiapp.remove(chore);
                }
            }
        }


        var period = 12; //TODO find vs reset
        for (var i = 0; i < self.historicsDone.length; i++) {
            var historic = self.historicsDone[i];
            if (historic[self.historicCols.userId] === self.userA._id) {
                userATimeSpent += parseInt(historic[self.historicCols.timeInMn]);
            }
            else {
                userBTimeSpent += parseInt(historic[self.historicCols.timeInMn]);
            }
        }
        var indicA = userATimeAvailable ? (Math.round((userATimeSpent * period / userATimeAvailable) * 10) / 10) : 0;
        var indicB = userBTimeAvailable ? (Math.round((userBTimeSpent * period / userBTimeAvailable) * 10) / 10) : 0;
        var indicAB = indicA + indicB;
        var indicAPer = indicAB ? (Math.round((indicA * 100 / (indicAB)))) : 50;
        var indicBPer = indicAB ? (Math.round((indicB * 100 / (indicAB)))) : 50;
        choresIndicFeasibility = choresIndicTimeRequired ? (usersIndicTimeAvailabity * 2 / choresIndicTimeRequired) : 0;

        //console.log('computeIndicators :', indicAPer, indicBPer, userATimeSpent, userBTimeSpent, usersIndicTimeAvailabity, choresIndicTimeRequired, choresIndicFeasibility);

        return {
            indicPercent: [indicAPer, indicBPer],
            indicTimeSpent: [userATimeSpent, userBTimeSpent],
            indicUsersTimeAvailabity: Math.round(usersIndicTimeAvailabity * 2),
            indicChoresTimeRequired: Math.round(choresIndicTimeRequired),
            indicChoresFeasibility: Math.round(choresIndicFeasibility * 100) / 100
        };
    };

    // --------------------------
    // Private functions
    // --------------------------
    var bindData = function () {

        var self = this;
        //self.$log.log('srvDataContainer.bindData');
        var deferred = self.$q.defer();
        var userMain = self.srvConfig.getUserLoggedIn();
        if (!userMain || !userMain.email)
            deferred.reject("Need one logged in user");
        else {

            //self.$log.log('srvDataContainer.bindData findOneByEmail: ' + userMain.email);
            self.srvData.User.findOneByEmail(userMain.email)
                .then(function (user) {
                    //self.$log.log('srvDataContainer.bindData user:' + user.email);
                    return self.bindCouple();
                })
                .then(function (couple) {
                    //self.$log.log('srvDataContainer.bindData couple:' + couple);
                    return self.bindCategories();
                })
                .then(function (categories) {
                    //self.$log.log('srvDataContainer.bindData categories:' + categories.length);
                    return self.bindChores();
                })
                .then(function (chores) {
                    //self.$log.log('srvDataContainer.bindData chores:' + chores.length);
                    return self.bindHistoricsDone();
                })
                .then(function (historics) {
                    //self.$log.log('srvDataContainer.bindData historics:' + historics.length);
                    return deferred.resolve(); //OK
                })
                .catch(function (err) {
                    var errMessage = err ? err : 'pb with getting data';
                    return deferred.reject(errMessage);
                });
        }

        return deferred.promise;
    };

    var bindCouple = function () {
        var self = this;
        var deferred = self.$q.defer();

        var userMain = self.srvConfig.getUserLoggedIn();

        if (userMain) {
            self.srvData.Couple.findOne(userMain)
                .then(function (couple) {
                    self.couple = couple;

                    if (self.couple) self.srvData.getUserAFromCouple(self.couple).then(function (user) {
                        self.userA = user;
                        self.srvData.getUserBFromCouple(self.couple).then(function (user) {
                            self.userB = user;
                            deferred.resolve(self.couple);
                        });
                    });
                })
                .catch(function (msg) {
                    deferred.resolve(self.couple);
                });
        }
        return deferred.promise;
    };

    var bindChores = function () {
        var self = this;
        var deferred = self.$q.defer();
        //deferred.resolve(this.chores);
        //deferred.reject(err);
        var userMain = self.srvConfig.getUserLoggedIn();

        if (userMain)
            self.srvData.Chore.findAll(userMain).then(function (chores) {
                self.chores = chores;
                deferred.resolve(self.chores);
            })
                .catch(function (msg) {
                    deferred.reject(msg);
                });
        else throw new TypeError("srvDataContainer need a user logged in");

        return deferred.promise;
    };

    var bindCategories = function () {
        var self = this;
        var deferred = self.$q.defer();
        self.srvData.Category.findAll().then(function (categories) {
            self.categories = categories;
            deferred.resolve(self.categories);
        });
        return deferred.promise;
    };

    // Find and bind historics marked as "done" in db
    var bindHistoricsDone = function () {
        var self = this;
        var deferred = self.$q.defer();

        self.srvData.Historic.findAll(true)
            .then(function (historicsSavedInDb) {
                self.historicsDone = historicsSavedInDb;
                deferred.resolve(self.historicsDone);
            })
            .catch(function (msg) {
                deferred.reject(msg);
            });

        return deferred.promise;
    };

    return Service;
})();
