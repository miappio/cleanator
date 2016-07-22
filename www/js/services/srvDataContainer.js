

angular.module('srvDataContainer', ['srvData.pouchdb'])

.factory('srvDataContainer', function ($log, $q, filterFilter, srvData, srvConfig) {
  return new SrvDataContainer($log, $q, filterFilter, srvData, srvConfig);
});



var SrvDataContainer = (function() {
'use strict';

    function Service($log, $q, filterFilter, srvData, srvConfig) {
      this.$log = $log;
      this.$q = $q;
      this.filterFilter = filterFilter;

      this.srvData = srvData;
      this.srvConfig = srvConfig;
      this.srvDataNeedFirstSyncForThisUser = true;

      this.userA = null;
      this.couple = null;
      this.userB = null;
      this.chores = [];
      this.categories = [];
      this.historicsTodo = {};
      this.historicsDone = [];
      this.userCols = srvData.User.columns;
      this.coupleCols = srvData.Couple.columns;
      this.historicCols = srvData.Historic.columns;
      this.choreCols = srvData.Chore.columns;
      this.categoryCols = srvData.Category.columns;
    }

    Service.prototype.sync = function () {
      var self = this;
      var deferred = self.$q.defer();

      var lang = self.srvConfig.getConfigLang() ? self.srvConfig.getConfigLang().code : 'en_US';

      var userMain = self.srvData.getUserLoggedIn();
      if (!userMain || !userMain.email) {
        var errMessage = 'Need one user logged in';
        deferred.reject(errMessage);
        return deferred.promise;
      }


      self.srvData.isEmpty().then(function(isE){
            if (isE && !self.srvDataNeedFirstSyncForThisUser) {

                //initAvec première données (fichier en dur)
                self.srvData.initWithFirstData(lang, userMain).then(function(ra) {

                    bindData(self).then(function(){
                        deferred.resolve();
                    })
                    .catch(function(err){
                        var errMessage = err ? err : 'pb with binding data';
                        deferred.reject(errMessage);
                    });

                }).catch(function(err){
                var errMessage = err ? err : 'pb with getting data';
                deferred.reject(errMessage);
                });
            } else {

                self.srvData.sync()
                .then(function(msg){})
                .catch(function(err){})
                .finally(function(){
                    bindData(self).then(function(){
                            // Almost Sync Done
                            deferred.resolve();
                    })
                    .catch(function(err){
                        var errMessage = err ? err : 'pb with binding data';
                        deferred.reject(errMessage);
                    });

                    self.srvDataNeedFirstSyncForThisUser = false;
                });
            }
          })
          .catch(function(err){
            var errMessage =  err ? err : 'pb with getting first data';
            deferred.reject(errMessage);
          });

      return deferred.promise;
    };


    Service.prototype.isLoggedIn = function () {
      var userMain = this.srvData.getUserLoggedIn();
      var bc = this.srvConfig.isLoggedIn();
      var loggedIn = (userMain && userMain.email && bc) ? true : false;
      return loggedIn;
    };
    Service.prototype.logout = function (is) {
      this.srvData.setUserLoggedIn(null);
      this.srvData.becarefulClean();
      this.srvConfig.setUserLoggedIn(null);
      this.srvConfig.setAppFirstInitLevel(0);
      this.srvDataNeedFirstSyncForThisUser = true;
    };

    Service.prototype.reset = function () {
      this.historicsDone = [];
      this.srvData.resetHistorics();
      //this.srvConfig.setLastResetDate();
    };

    Service.prototype.getLastResetDate = function () {
      //return this.srvConfig.getLastResetDate();
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
      if (userId) done = this.filterFilter(this.historicsDone,userId);
      else done = this.historicsDone;
    return done;
    };


/*
    	// Recherche données en BdD :
    	$scope.choreDataBind = function() {
        var self = this;
        var deferred = $q.defer();
        //deferred.resolve($scope.chores);
        //deferred.reject(err);


    	};

    */

    Service.prototype.getChoreCategoryName = function(choreGroup){
      var self = this;
      if (!choreGroup || !self.categories) return 'na';
      var choreCategories = self.categories;
      for (var i = 0; i < choreCategories.length; i++){
        var cat = choreCategories[i];
        if (cat.categoryName == choreGroup)
          return cat.description;
      }
      return 'na';
    };


    Service.prototype.getChoreCategoryThumbPath = function(choreGroup){

      var self = this;
      if (!choreGroup || !self.categories) return 'na';
      var choreCategories = self.categories;
      for (var i = 0; i < choreCategories.length; i++){
        var cat = choreCategories[i];
        if (cat.categoryName == choreGroup)
          return cat.thumb;
      }
      return 'na';
    };


    // not correct !
    Service.prototype.computeTodoForOneUser = function(userId){

        var self = this;
        var deferred = self.$q.defer();

        if (!self.userA || !self.userB) {
          deferred.reject('not initialized');
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
        .then(function(allHistoricsTodo){

          var allHistoricForOneUser = [];
          for (var i=0; i < allHistoricsTodo.length; i++){
            var h = allHistoricsTodo[i];
            if (h.userId && userId && h.userId === userId) allHistoricForOneUser.push(h);
          }
          //store the UserTodoList
          self.historicsTodo[userId] = allHistoricForOneUser;

          deferred.resolve(allHistoricForOneUser);
        })
        .catch(function(err){
          deferred.reject(err);
        });

        return deferred.promise;
    };


    Service.prototype.computeTodoForAllUsers = function(){

        var self = this;
        var deferred = self.$q.defer();

        if (!self.userA || !self.userB) {
          deferred.reject('not initialized');
          return deferred.promise;
        }

        // compute base on all historics done
        self.srvData.computeHistoricsByCalendar(self.chores, self.historicsDone, self.userA, self.userB, 7)
        .then(function(allHistoricsTodo){
          deferred.resolve(allHistoricsTodo);
        })
        .catch(function(err){
          deferred.reject(err);
        });

        return deferred.promise;
    };

    Service.prototype.computeIndicators = function() {
      var self = this;
      var usersIndicTimeAvailabity = 0;
      var choresIndicTimeRequired = 0;
      var choresIndicFeasibility = 0;
      var userATimeSpent = 0;
      var userBTimeSpent = 0;
      var userATimeAvailable = self.userA ? self.userA[self.userCols.timeInMnPerWeekTodo] : 0;
      var userBTimeAvailable = self.userB ? self.userB[self.userCols.timeInMnPerWeekTodo] : 0;


      // compute Average availability for the couple on a week
      usersIndicTimeAvailabity = (userATimeAvailable + userBTimeAvailable)/ (7*2);

      // compute chores Required time
      for(var j=0; self.chores && j < self.chores.length; j++){
        var chore = self.chores[j];
        if (!chore[self.choreCols.desactivate]){
          choresIndicTimeRequired += chore[self.choreCols.timeInMn] / chore[self.choreCols.frequencyDays];
        }
      }


      var period = 12; //TODO find vs reset
      for (var i = 0; i < self.historicsDone.length; i++) {
        var historic = self.historicsDone[i];
        if (historic[self.historicCols.userId] == self.userA._id) {
          userATimeSpent += historic[self.historicCols.timeInMn];
        }
        else {
          userBTimeSpent += historic[self.historicCols.timeInMn];
        }
      }
      var indicA = userATimeAvailable ? (Math.round((userATimeSpent * period / userATimeAvailable)*10)/10) : 0;
      var indicB = userBTimeAvailable ? (Math.round((userBTimeSpent * period / userBTimeAvailable)*10)/10) : 0;
      var indicAB = indicA+indicB;
      var indicAPer = indicAB ? (Math.round((indicA * 100 / (indicAB)))) : 0;
      var indicBPer = indicAB ? (Math.round((indicB * 100 / (indicAB)))) : 0;
      choresIndicFeasibility = choresIndicTimeRequired ? (usersIndicTimeAvailabity / choresIndicTimeRequired) : 0;

      return {indicPercent: [indicAPer,indicBPer],
              indicTimeSpent: [userATimeSpent,userBTimeSpent],
              indicUsersTimeAvailabity: Math.round(usersIndicTimeAvailabity),
              indicChoresTimeRequired: Math.round(choresIndicTimeRequired),
              indicChoresFeasibility: Math.round(choresIndicFeasibility*100)/100
            };
    };


    // --------------------------
    // Private functions
    // --------------------------


    var bindData = function(self) {

        var deferred = self.$q.defer();
        var userMain = self.srvData.getUserLoggedIn();
        if (!userMain || !userMain.email)
            deferred.reject("Need one logged in user");
        else
            self.srvData.User.findOneByEmail(userMain.email)
            .then(function (user) {

                // we have an User Logged In
                self.srvData.setUserLoggedIn(user);

                // initialise données depuis bdd
                bindCouple(self).then(function(couple) {
                    bindCategories(self).then(function(categories) {
                      bindChores(self).then(function(chores) {
                        bindHistoricsDone(self).then(function(historics){
                          deferred.resolve(); //OK
                        }).catch(function(err){
                          var errMessage = err ? err : 'pb with getting historics';
                          deferred.reject(errMessage);
                        });
                      }).catch(function(err){
                        var errMessage = err ? err : 'pb with getting chores';
                        deferred.reject(errMessage);
                      });
                    }).catch(function(err){
                      var errMessage = err ? err : 'pb with getting categories';
                      deferred.reject(errMessage);
                    });
                }).catch(function(err){
                var errMessage = err ? err : 'pb with getting couple';
                deferred.reject(errMessage);
                });
            })
            .catch(function (err) {
            var errMessage = err ? err : 'pb with getting main user';
            deferred.reject(errMessage);
            });

        return deferred.promise;
    };


    var bindUserLoggedIn = function(self) {
        //var self = this;
        var deferred = self.$q.defer();
        var userMain = self.srvData.getUserLoggedIn();

        if (userMain && userMain.email) {
          self.srvData.User.findOneByEmail(userMain.email)
          .then(function (user) {
            self.srvData.setUserLoggedIn(user);
            deferred.resolve(user);
          })
          .catch(function (msg) {
            deferred.reject(msg);
          });
        }
        else deferred.reject('No user to find');

        return deferred.promise;
      };


    var bindCouple = function(self) {
        //var self = this;
        var deferred = self.$q.defer();

        var userMain = self.srvData.getUserLoggedIn();

        if (userMain) {
          self.srvData.Couple.findOne(userMain)
          .then(function (couple) {
            self.couple = couple;

            if (self.couple) self.srvData.getUserAFromCouple(self.couple).then(function(user){
              self.userA = user;
              self.srvData.getUserBFromCouple(self.couple).then(function(user){
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

    var bindChores = function(self) {
        //var self = this;
        var deferred = self.$q.defer();
        //deferred.resolve(this.chores);
        //deferred.reject(err);
        var userMain = self.srvData.getUserLoggedIn();

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


     var bindCategories = function(self) {
        //var self = this;
        var deferred = self.$q.defer();
        self.srvData.Category.findAll().then(function (categories) {
          self.categories = categories;
          deferred.resolve(self.categories);
        });
        return deferred.promise;
      };



      // Find and bind historics marked as "done" in db
      var bindHistoricsDone = function(self) {
        //var self = this;
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
