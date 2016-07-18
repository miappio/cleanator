

angular.module('srvData.pouchdb', [])

.config(function () {

})

.factory('srvData', function (//$rootScope,$q,$resource,$log,$http, appName,appVersion) {
  $q,$log,$http,$timeout, appName,appVersion) {
  return new SrvDataPouchDB($q,$log,$http,$timeout,appName,appVersion);
});


var SrvDataPouchDB = (function() {
  'use strict';
  function Service($q,$log,$http,$timeout,appName,appVersion) {

      //this.$rootScope = $rootScope;
      this.$q = $q;
      this.$log = $log;
      this.$http = $http;
      this.$timeout = $timeout;
      this.appName = appName;
      this.appVersion = appVersion;

      //this.WS_URL_LOCAL=WS_URL_LOCAL;
      //this.WS_URL_ONLINE=WS_URL_ONLINE;
      //this.currentWSUrl = this.WS_URL_LOCAL;

      this.initDone = false;
      this.dataUserLoggedIn = false;
      this.dataCoupleLoggedIn = false;
      this.dataLastResetDate = null;
      //todo ? this.dataHistoricsDone = [];

      this.alreadySyncronized = false;
      this.userType     = 'UserDocType';
      this.coupleType   = 'CoupleDocType';
      this.choreType    = 'ChoreDocType';
      this.historicType    = 'HistoricDocType';
      this.categoryType    = 'CategoryDocType';
      this.userColumns = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id',     firstName:'firstname',lastName:'lastname',email:'email',password:'password',timeInMnPerWeekTodo:'timeInMnPerWeekTodo',profilID:'profilID',profilColor:'profilColor',timeInMnPerMond:'timeInMnPerMond',timeInMnPerTues:'timeInMnPerTues',timeInMnPerWedn:'timeInMnPerWedn',timeInMnPerThur:'timeInMnPerThur',timeInMnPerFrid:'timeInMnPerFrid',timeInMnPerSatu:'timeInMnPerSatu',timeInMnPerSund:'timeInMnPerSund',   lastModified:'lastModified'};
      this.coupleColumns = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id',   name:'coupleName',description:'description',userAId:'userA_id',userBId:'userB_id',lastResetDate:'LastResetDate',  lastModified:'lastModified'};
      this.choreColumns = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id',    name:'choreName',category:'choreCategoryName',description:'description',percentAB:'percent_AB',AUserAffinity:'AUserAffinity',BUserAffinity:'BUserAffinity',frequencyDays:'frequencyDays',timeInMn:'timeInMn',choreDescriptionCat:'choreDescriptionCat',priority:'priority',priorityComputed:'priorityComputed',lastTimeDone:'lastTimeDone',desactivate:'desactivate', lastModified:'lastModified'};
      this.historicColumns = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id', name:'choreName',category:'choreCategoryName',description:'description',percentAB:'percent_AB',AUserAffinity:'AUserAffinity',BUserAffinity:'BUserAffinity',frequencyDays:'frequencyDays',timeInMn:'timeInMn',choreDescriptionCat:'choreDescriptionCat',priority:'priority',priorityComputed:'priorityComputed',lastTimeDone:'lastTimeDone',desactivate:'desactivate',choreId:'choreId',userId:'userId',action:'action',actionTodoDate:'actionTodoDate',actionDoneDate:'actionDoneDate',internalWeight:'internalWeight',internalLate:'internalLate', lastModified:'lastModified' };
      this.categoryColumns = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id', name:'categoryName',description:'description',thumbPath:'thumb',groupName:'group',desactivate:'desactivate',  lastModified:'lastModified'};
      //this.categories = {};

      var self = this;
      this.User = {

          type : self.userType,
          columns : self.userColumns,

          findAll: function() {
              var deferred = self.$q.defer();
              var users = [];
              self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){ self.$log.log(err); }
                if(response){
                  var results = response.rows.map(function(r){
                        if (r && r.doc && r.doc[self.userColumns.type] == self.userType) {
                          var user = r.doc;
                          // mapping ?
                          //user[userColumns.firstName] = '';
                          //user[userColumns.lastName] = '';
                          //user[userColumns.email] = '';
                          users.push(user);
                          return r;
                        }
                        return null;
                  });
                  deferred.resolve(users);
                }
              });
              return deferred.promise;
          },
          findOneById: function(userId) {
            var deferred = self.$q.defer();
            self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){
                  deferred.reject("No doc found "+ err);
                  self.$log.log(err);
                }
                if(response){
                  var respLength = response.rows.length;
                  if (!respLength) deferred.reject("No user list");
                  else {
                    var respTested = 0;
                    var respFound = false;
                    var results = response.rows.map(function(r){
                      respTested++;
                      if (!respFound &&
                          r && r.doc && r.doc[self.userColumns.type] == self.userType &&
                          r.doc._id == userId) {
                            respFound = true;
                            deferred.resolve(r.doc);
                            return r;
                      }
                      if (!respFound && respTested == respLength) deferred.reject("User not found");
                      return null;
                    });
                  }
                }
              });
              return deferred.promise;
          },
          findOneByEmail: function(userEmail) {
            var deferred = self.$q.defer();
            self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
              if(err){
                deferred.reject("No doc found "+ err);
                self.$log.log(err);
              }
              if(response){
                var respLength = response.rows.length;
                if (!respLength) deferred.reject("No user list");
                else {
                  var respTested = 0;
                  var respFound = false;
                  var results = response.rows.map(function(r){
                    respTested++;
                    if (!respFound &&
                      r && r.doc &&
                      r.doc[self.userColumns.type] == self.userType &&
                      r.doc[self.userColumns.email] == userEmail) {
                        respFound = true;
                        deferred.resolve(r.doc);
                        return r;
                    }
                    if (!respFound && respTested == respLength) deferred.reject("User not found");
                    return null;
                  });
                }
              }
            });
            return deferred.promise;
          },
          set: function(user) {
              var deferred = self.$q.defer();

              var loggedUser = self.getUserLoggedIn();
              var firstUserId = null;
              if (loggedUser) firstUserId = loggedUser[self.userColumns.email];
              if (!firstUserId) firstUserId = user[self.userColumns.email];
              user[self.userColumns.appUserId] = firstUserId;
              user[self.userColumns.appVendorId] = self.appName;
              user[self.userColumns.appVendorVersion] = self.appVersion;

              user[self.userColumns.type] = self.userType;
              user[self.userColumns.lastModified] = new Date();

              var appUserId = user._id;
              if (!appUserId)
                //appUserId = self.appName.charAt(0)+self.userType.substring(0,4)+firstUserId.substring(0,4)+'_'+new Date().toISOString()+'';
                appUserId = generateObjectUniqueId(self.appName,self.userType, firstUserId);

              var updatedUser = user;
              //updatedUser._id = appUserId;
              delete updatedUser._id;
              self.db.put(updatedUser, appUserId, function(err, response) {
                if (response && response.ok && response.id && response.rev) {
                  updatedUser._id = response.id;
                  updatedUser._rev = response.rev;
                  console.log("updatedUser: "+updatedUser._id+" - "+updatedUser._rev);
                  return deferred.resolve(updatedUser);
                }
                return deferred.reject(err);
              });
              return deferred.promise;
          },
          lastModified:function() {
              return new Date();
          }
      };
      this.Couple = {

          type : self.coupleType,
          columns : self.coupleColumns,

          findAll: function() {
              var deferred = self.$q.defer();
              var couples = [];
              self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){ self.$log.log(err); }
                if(response){
                  var results = response.rows.map(function(r){
                        if (r && r.doc && r.doc[self.coupleColumns.type] == self.coupleType) {
                          var couple = r.doc;
                          // mapping ?
                          //user[userColumns.firstName] = '';
                          //user[userColumns.lastName] = '';
                          //user[userColumns.email] = '';
                          couples.push(couple);
                          return r;
                        }
                        return null;
                  });
                  deferred.resolve(couples);
                }
              });
              return deferred.promise;
          },
          findAllRelatedToUser: function(user) {
              var deferred = self.$q.defer();
              var couples = [];
              self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){ self.$log.log(err); }
                if(response){
                  var results = response.rows.map(function(r){
                        if ((r && r.doc && r.doc[self.coupleColumns.type] == self.coupleType) &&
                            (r.doc[self.coupleColumns.userAId] == user._id || r.doc[self.coupleColumns.userBId] == user._id)) {
                          var couple = r.doc;
                          // mapping ?
                          //user[userColumns.firstName] = '';
                          //user[userColumns.lastName] = '';
                          //user[userColumns.email] = '';
                          couples.push(couple);
                          return r;
                        }
                        return null;
                  });
                  deferred.resolve(couples);
                }
              });
              return deferred.promise;
          },
          findOne: function(user) {
              var deferred = self.$q.defer();
              var couple = null;
              self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){ self.$log.log(err); }
                if(response){
                  var responseLength = response.rows.length;
                  if (responseLength <= 0) return deferred.reject("No couple found");
                  var responseComputed = 0;
                  var results = response.rows.map(function(r){
                        // Get the first couple //TODO criterias ??
                        if ((r && r.doc && r.doc[self.coupleColumns.type] == self.coupleType) &&
                            (r.doc[self.coupleColumns.userAId] == user._id || r.doc[self.coupleColumns.userBId] == user._id) &&
                            (!couple)) {
                          couple = r.doc;
                          deferred.resolve(couple);
                          return r;
                        }
                        responseComputed++;
                        if (responseComputed == responseLength) deferred.reject(couple);
                        return null;
                  });
                }
              });
              return deferred.promise;
          },
          set: function(couple) {
              var deferred = self.$q.defer();

              var loggedUser = self.getUserLoggedIn();
              var appUserId = loggedUser ? loggedUser[self.userColumns.email] : null;
              couple[self.coupleColumns.appUserId] = appUserId;
              couple[self.coupleColumns.appVendorId] = self.appName;
              couple[self.coupleColumns.appVendorVersion] = self.appVersion;
              couple[self.coupleColumns.type] = self.coupleType;
              couple[self.coupleColumns.lastModified] = new Date();
              var name = couple[self.coupleColumns.name];

              var appCoupleId = couple._id;
              if (!appCoupleId)
                //appCoupleId = self.appName.charAt(0)+self.coupleType.substring(0,4)+name.substring(0,4)+'_'+new Date().toISOString()+'';
                appCoupleId = generateObjectUniqueId(self.appName,self.coupleType, name);

              var updatedCouple = couple;
              //updatedCouple._id = appCoupleId;
              delete updatedCouple._id;
              self.db.put(updatedCouple, appCoupleId, function(err, response) {
                if (response && response.ok && response.id && response.rev) {
                  updatedCouple._id = response.id;
                  updatedCouple._rev = response.rev;
                  return deferred.resolve(updatedCouple);
                }
                return deferred.reject(err);
              });
              return deferred.promise;
          },
          lastModified:function() {
              return new Date();
          }
      };


      this.Category = {

        type : self.categoryType,
        columns : self.categoryColumns,

        findAll: function() {
          var deferred = self.$q.defer();
          var categories = [];
          self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
            if(err){ self.$log.log(err); }
            if(response){
              var results = response.rows.map(function(r){
                if (r && r.doc && r.doc[self.categoryColumns.type] == self.categoryType) {
                  var category = r.doc;
                  categories.push(category);
                  return r;
                }
                return null;
              });
              deferred.resolve(categories);
            }
          });
          return deferred.promise;
        },
        set: function(category) {
          var deferred = self.$q.defer();

          var loggedUser = self.getUserLoggedIn();
          var appUserId = loggedUser ? loggedUser[self.userColumns.email] : null;
          category[self.categoryColumns.appUserId] = appUserId;
          category[self.categoryColumns.appVendorId] = self.appName;
          category[self.categoryColumns.appVendorVersion] = self.appVersion;
          category[self.categoryColumns.type] = self.categoryType;
          category[self.categoryColumns.lastModified] = new Date();
          var name = category[self.categoryColumns.name];
          category[self.categoryColumns.desactivate] = category[self.categoryColumns.desactivate] ? category[self.categoryColumns.desactivate] : false;

          var appCategoryId = category._id;
          if (!appCategoryId) appCategoryId = generateObjectUniqueId(self.appName,self.categoryType, name);

          var updatedCategory = category;
          //updatedCouple._id = appCoupleId;
          delete updatedCategory._id;
          self.db.put(updatedCategory, appCategoryId, function(err, response) {
            if (response && response.ok && response.id && response.rev) {
              updatedCategory._id = response.id;
              updatedCategory._rev = response.rev;
              return deferred.resolve(updatedCategory);
            }
            return deferred.reject(err);
          });
          return deferred.promise;
        },
        applyToLinkedChores: function(category,fnToApply) {
         //NO defered ? var deferred = self.$q.defer();
          self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
            if(err){ self.$log.log(err); }
            if(response){
              var results = response.rows.map(function(r){
                   if ( r && r.doc && r.doc[self.choreColumns.type] == self.choreType &&
                        r.doc[self.choreColumns.category] == category[self.categoryColumns.name]) {
                            fnToApply(r.doc);
                      }
              });
            }
          });
         // return deferred.promise;
        },


        lastModified:function() {
            return new Date();
        }
      };


      this.Chore = {

          type : self.choreType,
          columns : self.choreColumns,

          findAll: function(user) {
              var deferred = self.$q.defer();
              var chores = [];
              self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){ self.$log.log(err); }
                if(response){
                  var results = response.rows.map(function(r){
                        if (r && r.doc && r.doc[self.choreColumns.type] == self.choreType) {
                          var chore = r.doc;
                          chores.push(chore);
                          return r;
                        }
                        return null;
                  });
                  deferred.resolve(chores);
                }
              });
              return deferred.promise;
          },
          findOneById: function(choreId) {
            var deferred = self.$q.defer();
            self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
                if(err){
                  deferred.reject("No doc found "+ err);
                  self.$log.log(err);
                }
                if(response){
                  var respLength = response.rows.length;
                  if (!respLength) deferred.reject("No chore list");
                  else {
                    var respTested = 0;
                    var respFound = false;
                    var results = response.rows.map(function(r){
                      respTested++;
                      if (!respFound &&
                          r && r.doc && r.doc[self.choreColumns.type] == self.choreType &&
                          r.doc._id == choreId) {
                            respFound = true;
                            deferred.resolve(r.doc);
                            return r;
                      }
                      if (!respFound && respTested == respLength) deferred.reject("Chore not found");
                      return null;
                    });
                  }
                }
              });
              return deferred.promise;
          },
          set: function(chore) {
              var deferred = self.$q.defer();

              var loggedUser = self.getUserLoggedIn();
              var appUserId = loggedUser ? loggedUser[self.userColumns.email] : null;
              chore[self.choreColumns.appUserId] = appUserId;
              chore[self.choreColumns.appVendorId] = self.appName;
              chore[self.choreColumns.appVendorVersion] = self.appVersion;
              chore[self.choreColumns.type] = self.choreType;
              chore[self.choreColumns.lastModified] = new Date();
              var name = chore[self.choreColumns.name] ? chore[self.choreColumns.name] : "New Item";
              chore[self.choreColumns.desactivate] = chore[self.categoryColumns.desactivate] ? chore[self.choreColumns.desactivate] : false;

              var appChoreId = chore._id;
              if (!appChoreId)
                //appChoreId = self.appName.charAt(0)+self.choreType.substring(0,4)+name.substring(0,4)+'_'+new Date().toISOString()+'';
                appChoreId = generateObjectUniqueId(self.appName,self.choreType, name);

              var updatedChore = chore;
              //updatedChore._id = appChoreId;
              //updatedChore._deleted = true;

              delete updatedChore._id;
              self.db.put(updatedChore, appChoreId, function(err, response) {
                if (response && response.ok && response.id && response.rev) {
                  updatedChore._id = response.id;
                  updatedChore._rev = response.rev;
                  return deferred.resolve(updatedChore);
                }
                return deferred.reject(err);
              });
              return deferred.promise;
          },
          remove: function(chore) {
              var deferred = self.$q.defer();
              var appChoreId = chore._id;
              if (!appChoreId) deferred.reject("Remove impossible");
              else  self.db.remove(chore, function(err, response) {
                if (response && response.ok) {
                  return deferred.resolve(err);
                }
                return deferred.reject(err);
              });
              return deferred.promise;
          },
          lastModified:function() {
              return new Date();
          }
      };
      this.Historic = {

        type : self.historicType,
        columns : self.historicColumns,

        findAll: function(bFilteredByLastDate) {
          var deferred = self.$q.defer();
          var historics = [];

          self.db.allDocs({include_docs: true, descending: true}, function(err, response) {
            if(err){ self.$log.log(err); }
              if(response){
                var lastResetDate = self.getLastHistoricsResetDate();
                var results = response.rows.map(function(r){
                  if (r && r.doc && r.doc[self.historicColumns.type] == self.historicType) {
                    var historic = r.doc;

                    if (bFilteredByLastDate && lastResetDate) {
                      var date1 = new Date(historic[self.historicColumns.actionDoneDate]);
                      var date2 = new Date(lastResetDate);
                      var bActiveHisto = (date1 >= date2);
                      // Not active : not push up this old item
                      if(!bActiveHisto)
                        return null;
                    }

                    historics.push(historic);
                    return r;
                  }
                  return null;
                });
                deferred.resolve(historics);
              }
            });
            return deferred.promise;
          },
          set: function(historic) {
            var deferred = self.$q.defer();

            var loggedUser = self.getUserLoggedIn();
            var appUserId = loggedUser ? loggedUser[self.userColumns.email] : null;


            //name:'historicName',description:'description',choreId:'choreId', userId:'userId', action:'action',actionDate:'actionDate',lastModified:'lastModified'};

            historic[self.historicColumns.appUserId] = appUserId;
            historic[self.historicColumns.appVendorId] = self.appName;
            historic[self.historicColumns.appVendorVersion] = self.appVersion;
            historic[self.historicColumns.type] = self.historicType;
            historic[self.historicColumns.lastModified] = new Date();
            var name = historic[self.historicColumns.name];
            historic[self.historicColumns.desactivate] = historic[self.historicColumns.desactivate] ? historic[self.historicColumns.desactivate] : false;

            var appHistoricId = historic._id;
            if (!appHistoricId)
              //appHistoricId = self.appName.charAt(0)+self.historicType.substring(0,4)+name.substring(0,4)+'_'+new Date().toISOString()+'';
              appHistoricId = generateObjectUniqueId(self.appName,self.historicType, name);

            var updatedHistoric = historic;
            //updatedHistoric._id = appHistoricId;
            delete updatedHistoric._id;
            self.db.put(updatedHistoric, appHistoricId, function(err, response) {
              if (response && response.ok && response.id && response.rev) {
                updatedHistoric._id = response.id;
                updatedHistoric._rev = response.rev;
                return deferred.resolve(updatedHistoric);
              }
              return deferred.reject(err);
            });
            return deferred.promise;
          },
          lastModified:function() {
            return new Date();
          }
        };
      this.Connection  = null;

      this.init();

  }


  Service.prototype.initAlreadyDone = function () {
    return this.initDone;
  };


  Service.prototype._dbFilter= function(doc){
      var dataUserLoggedIn = this.getUserLoggedIn();
      if (doc.appUser_Id == dataUserLoggedIn.email)
        return doc;
      return null;
  };


  Service._testConnection = function () {

    return true;
  };


  Service.prototype.isInitDone = function () {
      return this.initDone;
  };

  Service.prototype.init = function () {
      var bok = true;
      var self = this;
      var deferred = self.$q.defer();
      if (this.initAlreadyDone()) return;

      this.db = new PouchDB('cltorDB', {adapter : 'websql'});

      if (!this.db || !bok) return;

      self.initDone = true;
    /*  self.$http.get('data/conf.en.json')
      .success(function(data) {
        //if (!data | !data.categories) return deferred.reject();

        //self.categories = data.categories;
        self.initDone = true;
        deferred.resolve(true);
      })
      .error(function(data) {
          return deferred.reject(data);
      })
      .catch(function(err) {
          return deferred.reject(data);
      });*/

      return deferred.promise;
  };

  Service.prototype.isEmpty = function () {
      var self = this;
      var deferred = self.$q.defer();

      if (!self.initAlreadyDone()) {

        //Promise.resolve().then(function() {
          throw new TypeError("srvData init should be done");
        //});
        //return deferred.promise;
      }

      if (!self.dataUserLoggedIn) {
        //deferred.resolve(true);
        //return deferred.promise;
        throw new TypeError("srvData need a user logged in");
      }

      self.db.allDocs({
              filter : function(doc){
                if (doc.appUser_Id == self.dataUserLoggedIn.email) return doc;
              }}).then(function(response) {

                if (response.total_rows && response.total_rows > 5) return deferred.resolve(false);
                else self.$timeout(function(){return deferred.resolve(true);},10);
                //$rootScope.$apply(function(){deferred.resolve(true)});
                //return deferred.resolve(true);
              }).catch(function(err){
                return deferred.reject(err);
              });


      return deferred.promise;
  };




  function setObjectFromLocalStorage(id, object){
    if(typeof(Storage) === "undefined") return null;

    var jsonObj = JSON.stringify(object);
    // Retrieve the object from storage
    localStorage.setItem(id,jsonObj);

    //console.log('retrievedObject: ', JSON.parse(retrievedObject));
    return jsonObj;

  }

  function getObjectFromLocalStorage(id){
    if(typeof(Storage) === "undefined") return null;

    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem(id);
    var obj = JSON.parse(retrievedObject);

    //console.log('retrievedObject: ', JSON.parse(retrievedObject));
    return obj;

  }


  var _srvDataUniqId = 0;
  function generateObjectUniqueId(appName, type, name){

    //return null;
    var now = new Date();
    var simpleDate = ""+now.getYear()+""+now.getMonth()+""+now.getDate()+""+now.getHours()+""+now.getMinutes();//new Date().toISOString();
    var sequId = ++_srvDataUniqId;
    var UId = appName.charAt(0)+"_"+type.substring(0,4)+"_"+name.substring(0,4)+'_'+simpleDate+'_'+sequId;
    return UId;
  }


  Service.prototype.setUserLoggedIn = function (user) {
    //if (!user) return;

    this.dataUserLoggedIn = user;
    setObjectFromLocalStorage('dataUserLoggedIn',this.dataUserLoggedIn);
  };
  Service.prototype.getUserLoggedIn = function () {

      var obj = getObjectFromLocalStorage('dataUserLoggedIn');
      //if (!obj) return this.dataUserLoggedIn;

      this.dataUserLoggedIn = obj;
      return this.dataUserLoggedIn;
  };

  Service.prototype.setCoupleLoggedIn = function (couple) {
    this.dataCoupleLoggedIn = couple;
  };


  Service.prototype.getUserAFromCouple = function (couple) {
      var self = this;
      var deferred = self.$q.defer();

      //var user = null;
      var userId = couple.userA_id;

      this.db.get(userId).then(function(resp) {
        //if (err) return deferred.reject(err);
        if (resp) {
          return deferred.resolve(resp);
        }
        else return deferred.reject("Not found");
      });

      return deferred.promise;
  };

  Service.prototype.getUserBFromCouple = function (couple) {
      var self = this;
      var deferred = self.$q.defer();

      //var user = null;
      var userId = couple.userB_id;

      this.db.get(userId).then(function(resp) {
        //if (err) return deferred.reject(err);
        if (resp) {
          return deferred.resolve(resp);
        }
        else return deferred.reject("Not found");
      });

      return deferred.promise;
  };


  Service.prototype.initWithDemoData = function(){
    var i, self = this, chanceBaseUser = 12345,chanceBaseCouple = 12645,chanceBaseChore = 12945;//Math.random
    var deferred = self.$q.defer();


    var users = [];
    for (i = 0; i < 10; i++) {
      var user = {};
      var chanceUser = new Chance(chanceBaseUser+i);
      user._id = 'demo'+chanceUser.hash({length: 10});
      user[self.userColumns.type] = self.userType;
      user[self.userColumns.firstName] = chanceUser.first();
      user[self.userColumns.lastName] = chanceUser.last();
      user[self.userColumns.email] = chanceUser.email();
      user[self.userColumns.lastModified] = chanceUser.date();

      users.push(user);
    }
    var couples = [];
    for (i = 0; i < 10; i++) {
      var couple = {};
      var chanceCouple = new Chance(chanceBaseCouple+i);
      couple[self.coupleColumns.type] = self.coupleType;
      couple[self.coupleColumns.name] = chanceCouple.sentence({words: 2});
      couple[self.coupleColumns.description] = chanceCouple.sentence({words: 5});
      couple[self.coupleColumns.lastModified] = chanceCouple.date();

      couple[self.coupleColumns.userAId] = users[i]._id;
      couple[self.coupleColumns.userBId] = users[(i>5)?(i-1):(i+1)]._id;


      couples.push(couple);
    }
    var chores = [];
    for (i = 0; i < 10; i++) {
      var chore = {};
      chores.push(chore);
    }

    var docs = users.concat(couples, chores);
    self.db.bulkDocs(docs, function(err, response) {
      //self.$log.log(err+' '+response);
      if (err) return deferred.reject(err);
      deferred.resolve(response);
    });

    return deferred.promise;
  };


  Service.prototype.initWithFirstData = function(langOfFile){
    var i,j, self = this;
    var chanceBaseUser = 2345,chanceBaseCouple = 2645,chanceBaseChore = 2945;//Math.random
    var deferred = self.$q.defer();

    var firstUser = self.getUserLoggedIn();
    self.User.set(firstUser).then(function(firstUserUpdated){
      if (!firstUserUpdated) return deferred.reject();

      var fileLang = langOfFile || 'fr';
      self.$http.get('data/init.'+fileLang+'.json')
      .success(function(data) {
        if (!data | !data.chores) return deferred.reject();

        // Users first init
        if (data.users && data.users.length >= 2) {
          var users = data.users;
          var userA = {}, userB = {};
          angular.extend(userA, firstUserUpdated);
          angular.extend(userA, users[0]);
          angular.extend(userB, users[1]);

          self.User.set(userA)
          .catch(function(err){
            deferred.reject(err);
            alert("user creation pb "+err);})
          .then(function(newUserA){
            self.User.set(userB).then(function(newUserB){

              // Couple first init
              var couple = {};
              var chanceCouple = new Chance(chanceBaseCouple+i);
              couple[self.coupleColumns.name] = chanceCouple.sentence({words: 2});
              couple[self.coupleColumns.description] = chanceCouple.sentence({words: 5});

              couple[self.coupleColumns.userAId] = firstUserUpdated._id;
              couple[self.coupleColumns.userBId] = newUserB._id;
              if (!firstUserUpdated._id || !newUserB._id) deferred.reject("no couple available.");

              self.Couple.set(couple)
              .then(function(coupleSaved){

                // Categories first init
                var categories = data.categories;
                var categorySavedCount = 0;
                var categoriesLength = categories.length;
                for (i = 0; i < categoriesLength; i++) {
                  var category = categories[i];
                  self.Category.set(category)
                  .then(function(catg){
                    categorySavedCount++;
                    if (categorySavedCount == categoriesLength) {

                      // Chores first init
                      var chores = data.chores;
                      var choreSavedCount = 0;
                      var choresLength = chores.length;
                      for (j = 0; j < choresLength; j++) {
                        var chore = chores[j];
                        self.Chore.set(chore)
                        .then(function(chore){
                          choreSavedCount++;
                          if (choreSavedCount == choresLength)
                            return deferred.resolve(chores);
                        })
                        .catch(function(err){
                          var msg = "chores creation pb : ("+choreSavedCount+")" + (err.message ? err.message : err);
                          return deferred.reject(msg);
                        });
                      }
                      // Chores end
                    }
                    // Categories end
                  })
                  .catch(function(err){
                    var msg = "categories creation pb : ("+categorySavedCount+")" + (err.message ? err.message : err);
                    return deferred.reject(msg);
                  });
                }

              })
              .catch(function(err){
                var msg = "couple creation pb : " + (err.message ? err.message : err);
                return deferred.reject(msg);
              });
            });
          });
        }
        //end if


      })
      .error(function(data) {
        return deferred.reject(data);
      });

    })
    .catch(function(err){
      return deferred.reject(err);
    });
    return deferred.promise;
  };

  Service.prototype.sync = function(){
    var self = this;
    var deferred = self.$q.defer();

    if (!self.db || !self.dataUserLoggedIn || !self.dataUserLoggedIn.email) {
      self.$log.warn('DB sync impossible');
      deferred.reject('DB sync impossible');
      return deferred.promise;
    }


    self.db.sync('http://51.255.34.37:8080/cltordsdsds sds',{

    //self.db.sync('http://51.255.34.37:8080/cltor',{
    //self.db.sync('http://poupouch.herokuapp.com/cltor',{
    //self.db.sync('https://apps4pro.iriscouch.com/cltor',{
      //live: true,
      //retry: true,
      filter : function(doc){
        if (doc.appUser_Id == self.dataUserLoggedIn.email) return doc;
      }})
    .on('change', function (info) {
      // handle change
      console.log("db change : "+ info);
    }).on('paused', function (err) {
      // replication paused (e.g. user went offline)
      console.log("db paused : "+err);

    }).on('active', function () {
      // replicate resumed (e.g. user went back online)
      console.log("db activate");
    }).on('denied', function (info) {
      // a document failed to replicate, e.g. due to permissions
      console.log("db denied : "+info);
      deferred.reject("db denied : "+info);
    })
    .on('complete', function (info) {
      // handle complete
      console.log("db complete : "+info);
      deferred.resolve(info);
      self.alreadySyncronized = true;
    })
    .on('error', function (err) {
      // handle error
      console.log("db error : "+err);
      deferred.reject(err);
    });

    return deferred.promise;
  };

  Service.prototype.becarefulClean = function() {
    var self = this;
    var deferred = self.$q.defer();
    this.alreadySyncronized = false;

    self.db.destroy(function(err, info) {
      if(!err) {
        self.db = new PouchDB('cltorDB', {adapter : 'websql'});
        deferred.resolve();
      }
    });

    return deferred.promise;
  };

  Service.prototype.createCouple = function (couple) {
      /*this.DS.create('couple', couple,{useClass:true,cacheResponse:true,eagerInject:true})
        .then(function (coupleCreated) {
          //post; // { id: 65, author: 'Sally', title: 'Angular gotchas' }
          alert("couple created"+coupleCreated);
        });*/
  };

  function padInteger(num, size) {
    if (!size) size = 10;
    var s = "000000000" + num;
    return s.substr(s.length-size);
  }

  // creation de la liste des taches
  // chores 	 : liste de toutes les taches
  // userA, userB : utilisateurs
  // maxHistoric : nb de taches max a retourner
  Service.prototype.computeHistoricsByPrior = function (chores, userA, userB, maxHistoric) {
    var i, self = this;
    var deferred = self.$q.defer();
    var lstChores = [] ;

    // depending on % affinity , copy chores
    var rand = new Chance(Math.random);
    rand = rand.year();
    for (i = 0 ; userA && userB && chores && i < chores.length && i < maxHistoric; i++){
        var historic = {};
        var j = (rand + i) % chores.length;
        var choreToCopy = chores[j];

        if (!choreToCopy) {
          alert("Pb : (" +j+") "+chores.length);
        }

        if (choreToCopy[self.historicColumns.timeInMn] > 0) {
          angular.copy(choreToCopy, historic);
          historic._id = null;
          historic[self.historicColumns.choreId] = choreToCopy._id;
          var uId = new Chance(Math.random).bool() ? userB._id : userA._id; //choreToCopy.percent_AB > 50 ? userB._id : userA._id;
          if (uId == userA._id && choreToCopy.percent_AB > 85 ) uId = userB._id;
          if (uId == userB._id && choreToCopy.percent_AB < 15 ) uId = userA._id;

          historic[self.historicColumns.userId] = uId;
          historic[self.historicColumns.frequencyDays] = padInteger(historic[self.historicColumns.frequencyDays]);
          lstChores.push(historic);
        }
    }
    deferred.resolve(lstChores);
    return deferred.promise;
  };

  Service.prototype.computeHistoricsByCalendar = function (chores, historics, userA, userB, maxDayx) {
    var i, self = this;
    var deferred = self.$q.defer();
    var lstHistoLate = [];
    var lstHistoByCalendar = [];
    var maxDays = maxDayx ? maxDayx : 7;
    var now = new Date();

    // 1) Pour chaque tâche existante
    //	Retard (en jours) = Date actuelle - Date de dernière réalisation - (nbCopy * fréq)
    //	Si Retard >= - 7 (jours)
    //		Poids = (Retard - fréquence) / fréquence
    //		Affectation du poids à la tache
    //         	Affectation du retard à la tache
    //		Remplissage de la liste L avec cette tâche
    for (i = 0 ; chores && (i < chores.length); i++){
      var choreToCopy = chores[i];
      var dateLastDone = self.getDateOfLastChoreDoneByType(chores, historics, choreToCopy._id);
      var freq = choreToCopy[self.choreColumns.frequencyDays];

      for (var nbCopy = 1; nbCopy <= maxDays; nbCopy++) {
        var historic = angular.copy(choreToCopy);
        historic._id = null;

        var late = 0;
        var isAvailable = (historic[self.historicColumns.timeInMn] > 0);
        isAvailable = !historic[self.historicColumns.desactivate];

        if (dateLastDone) {
          //dateLastDone = dateLastDone ? dateLastDone : new Date('2015/01/01');
          var dateLastDone_ = new Date(dateLastDone);
          var timeDiff = now.getTime() - dateLastDone_.getTime();
          var daysDiff = Math.ceil(timeDiff / (1000*3600*24));
          late = daysDiff - (nbCopy*freq);
        }
        else {
          late = freq - (nbCopy*freq);
        }

        if (late >= -maxDays && isAvailable) {
          var prioWeight = 1;
          if (historic[self.historicColumns.priority] == 1) prioWeight = 2;
          var weight = ((late + 40 - freq) / freq) * prioWeight;
          if (weight < 0){
            console.log("weight"+weight);
          }
          historic[self.historicColumns.choreId] = choreToCopy._id;
          historic[self.historicColumns.internalWeight] = weight;
          historic[self.historicColumns.internalLate] = late;
          lstHistoLate.push(historic);
        }
        else break;
      }
    }

    // 2) Ordonner la liste L par poids (decroissant)
    lstHistoLate.sort(function(histoA,histoB){
      var a = histoA[self.historicColumns.internalWeight];
      var b = histoB[self.historicColumns.internalWeight];
      if (a && b) return b - a;
      else return 0;
    });

    // 3) Dispatchage pour les 2 personnes A et B
    var dispoA = {}, dispoB = {};
    // Pour toutes les taches de la liste L ordonnée
    // 	Pour les 7 jours J à venir ( J = 0 -> 7 )
    for (var j = 0; j < lstHistoLate.length; j++) {
      for (var day = 0; day < maxDays; day++) {

        var histo = {};
        var historicToCopy = lstHistoLate[j];
        angular.copy(historicToCopy,histo);
        var lateInDays = histo[self.historicColumns.internalLate];
        var histoTimeInMn = histo[self.historicColumns.timeInMn];

        histo.iPreventNUID = "uid_"+j+"_"+day;
        if (lateInDays >= (-day)) {
          // 			Dispo A = Calcul dispo de A pour J
          // 			Dispo B = Calcul dispo de B pour J
          // jour glissant
          var dayOfWeek = now.getDay();
          var slidingDayOfWeek = (day + dayOfWeek) % 7;
          var timeInMnPer = self.userColumns.timeInMnPerSund;
          if (slidingDayOfWeek == 1) timeInMnPer = self.userColumns.timeInMnPerMond;
          else if (slidingDayOfWeek == 2) timeInMnPer = self.userColumns.timeInMnPerTues;
          else if (slidingDayOfWeek == 3) timeInMnPer = self.userColumns.timeInMnPerWedn;
          else if (slidingDayOfWeek == 4) timeInMnPer = self.userColumns.timeInMnPerThur;
          else if (slidingDayOfWeek == 5) timeInMnPer = self.userColumns.timeInMnPerFrid;
          else if (slidingDayOfWeek == 6) timeInMnPer = self.userColumns.timeInMnPerSatu;

          // calcul du temps deja done pour le jour day
          var dateTodo = new Date(now);
          dateTodo.setDate(dateTodo.getDate() + day);

          //todo : sauvegarde dispo, decrement chaque jour
          var doneElapsed = 0;
          if (typeof dispoA[day] == "undefined") {
            doneElapsed = self.getDoneTimeElapsedByUser(historics,userA,dateTodo);
            dispoA[day] = userA[timeInMnPer] ? (userA[timeInMnPer] - doneElapsed) : 0;
          }
          if (typeof dispoB[day]  == "undefined") {
            doneElapsed = self.getDoneTimeElapsedByUser(historics,userB,dateTodo);
            dispoB[day] = userB[timeInMnPer] ? (userB[timeInMnPer] - doneElapsed) : 0;
          }

          // 			Si Dispo A = ok & Dispo B = ok
          var todoAdd = false;
          if ((dispoA[day] - histoTimeInMn) >= 0 && (dispoB[day] - histoTimeInMn) >= 0) {
            // Calcul du taux de réalisation par A de la tâche / B
            var nbA = self.getChoresNbDoneByUser(historics,userA,histo[self.historicColumns.choreId]);
            var nbB = self.getChoresNbDoneByUser(historics,userB,histo[self.historicColumns.choreId]);
            var nbATemp = self.getChoresNbDoneByUser(lstHistoByCalendar,userA,histo[self.historicColumns.choreId]);
            var nbBTemp = self.getChoresNbDoneByUser(lstHistoByCalendar,userB,histo[self.historicColumns.choreId]);
            nbA += nbATemp;
            nbB += nbBTemp;
            var rateA = (nbA + nbB) ? (nbA / (nbA + nbB) * 100) : 50;
            var affA = (100 - histo[self.historicColumns.percentAB]); //if percentAB == 0 --> A wants to do everytime : affA = 100

            // Si taux de A > Affinité de A
            // Remplissage de la liste de B (Nom de la tache + date J pour affichage)
            if ((rateA > affA || affA === 0)) {
              histo[self.historicColumns.userId] = userB._id;
              dispoB[day] = dispoB[day] - histoTimeInMn;
            }
            else {
              histo[self.historicColumns.userId] = userA._id;
              dispoA[day] = dispoA[day] - histoTimeInMn;
            }
            todoAdd = true;
          }
          else if ((dispoA[day] - histoTimeInMn) >= 0) {
            histo[self.historicColumns.userId] = userA._id;
            dispoA[day] = dispoA[day] - histoTimeInMn;
            todoAdd = true;
          }
          else if ((dispoB[day] - histoTimeInMn) >= 0) {
            histo[self.historicColumns.userId] = userB._id;
            dispoB[day] = dispoB[day] - histoTimeInMn;
            todoAdd = true;
          }

          if (todoAdd) {
            var dateTxt = ""+dateTodo.getFullYear()+"/"+padInteger(dateTodo.getMonth()+1,2)+'/'+padInteger(dateTodo.getDate(),2);
            histo[self.historicColumns.actionTodoDate] = dateTxt;

            // add to Todo List if not already put for this day
            var found = false;
            for (var x=0;(x < lstHistoByCalendar.length) && !found; x++){
              var h1 = lstHistoByCalendar[x];
              if (h1.actionTodoDate == dateTxt && h1.choreId === histo.choreId) found = true;
            }
            for (var y=0;(y < historics.length) && !found; y++){
              var h2 = historics[y];
              var h2Date = new Date(h2.actionDoneDate);
              if (h2Date.getDate() == dateTodo.getDate() && h2Date.getMonth() == dateTodo.getMonth() && h2Date.getFullYear() == dateTodo.getFullYear() &&
                  h2.choreId === histo.choreId)
                  found = true;
            }
            if (!found) lstHistoByCalendar.push(histo);
            break;
          }
          else {
            // Retard ++ (dans la liste, pas dans la bdd...)  // Plus de place dispo chez A ou B : à traiter le jour suivant
            historicToCopy[self.historicColumns.internalLate] = lateInDays + 1;
          }

        }
      }
    }
    // 		Si retard >= - J   // il faut traiter la tâche
    // 			Dispo A = Calcul dispo de A pour J
    // 			Dispo B = Calcul dispo de B pour J

    // 			Si Dispo A = ok & Dispo B = ok
    // 				Calcul du taux de réalisation par A de la tâche / B

    // 				Si taux de A > Affinité de A
    // 					Remplissage de la liste de B (Nom de la tache + date J pour affichage)
    // 				Sinon
    // 					Remplissage de la liste de A (Nom de la tache + date J pour affichage)

    // 				Suppression de la tâche de la liste L

    // 			Sinon si Dispo A = ok OU Dispo B = ok

    // 				Si dispo A = ok
    // 					Remplissage de la liste de A (Nom de la tache + date J pour affichage)

    // 				Sinon si dispo B = ok
    // 					Remplissage de la liste de B (Nom de la tache + date J pour affichage)

    // 				Suppression de la tâche de la liste L

    // 			Sinon
    // 				Retard ++ (dans la liste, pas dans la bdd...)

    // Plus de place dispo chez A ou B : à traiter le jour suivant



    deferred.resolve(lstHistoByCalendar);
    return deferred.promise;
  };


  Service.prototype.terminateHistoric = function (chores,historic) {
    var i, self = this;
    var deferred = self.$q.defer();
    var now = new Date();

    // retrieve chore and set lastTimeDone
    var historicChoreId = historic[self.historicColumns.choreId];
    var choreDone = null;
    for (i = 0; (i <  chores.length) && !choreDone; i++){
      var chore = chores[i];
      var choreId = chore._id;
      if (choreId === historicChoreId) {
        chore[self.choreColumns.lastTimeDone] = now;
        choreDone = chore;
      }
    }

    if (choreDone) {
      self.Chore.set(choreDone).then(function(choreSaved){
        // set historic
        historic[self.historicColumns.actionDoneDate] = now;
        self.Historic.set(historic)
        .then(function(histoSaved){deferred.resolve(histoSaved);})
        .catch(function(err){deferred.reject(err);});
      }).catch(function(err){deferred.reject(err);});
    }
    else {
      deferred.reject('Not possible to terminate chore or historic :'+historicChoreId);
    }

    return deferred.promise;
  };

  Service.prototype.computeFairIndicleanator = function (historics, userA, userB) {

    var indic = 50;
    var nbA = 0;
    var nbB = 0;
    // depending on percent, copy chores
    for (var i = 0; (i <  historics.length); i++){
      var historic = historics[i];
      var userId = historic[self.historicColumns.userId];
      if (userId == userA._id) nbA++;
      if (userId == userB._id) nbB++;
    }
    var nb = nbA + nbB;
    if (nb) indic = nbA / nb;
    return indic;
  };

  Service.prototype.setFairIndicleanator = function (newValue) {
    this.dataFairIndicleanator = newValue;
    setObjectFromLocalStorage('dataFairIndicleanator',this.dataUserLoggedIn);
  };

  Service.prototype.getFairIndicleanator = function () {
    var obj = getObjectFromLocalStorage('dataFairIndicleanator');
    this.dataFairIndicleanator = obj;
    return this.dataFairIndicleanator;
  };


  Service.prototype.resetHistorics = function () {
    //if (!this.dataCoupleLoggedIn) return null;
    this.dataLastResetDate = new Date();
    setObjectFromLocalStorage('dataLastResetDate',this.dataLastResetDate);
    //this.dataCoupleLoggedIn.lastResetDate = this.dataLastResetDate;
    //store couple
  };

  Service.prototype.getLastHistoricsResetDate = function () {
    //return this.srvConfig.getLastHistoricsResetDate();
      if (!this.dataLastResetDate) {
        var obj = getObjectFromLocalStorage('dataLastResetDate');
        this.dataLastResetDate = obj;
      }
      return this.dataLastResetDate;
  };


  Service.prototype.getDateOfLastChoreDoneByType = function (chores, historics, choreIdToSearch) {
    //var obj = getObjectFromLocalStorage('dataLastResetDate');
    //this.dataLastResetDate = obj;

    var lastDate = null;
    var lastDateDefault = null;
    for (var j = 0; (j<chores.length) && !lastDateDefault; j++) {
        var chore = chores[j];
        if (choreIdToSearch === chore._id)
          lastDateDefault = chore[this.choreColumns.lastTimeDone];
    }

    for (var i = 0; (choreIdToSearch && historics) && (i<historics.length); i ++) {
        var hist = historics[i];
        if (choreIdToSearch == hist[this.historicColumns.choreId]){
          var newLastDate = new Date(hist[this.historicColumns.actionDoneDate]);
          if (!lastDate || newLastDate > lastDate)
            lastDate = newLastDate;
        }
    }

    if (!lastDate) lastDate = lastDateDefault;

    return lastDate;
  };

  Service.prototype.getChoresNbDoneByUser = function (historics, user, choreId) {
    var nb = 0;
    for (var i = 0;  (user && historics) && (i< historics.length); i ++) {
      var hist = historics[i];

      if (!choreId || choreId == hist[this.historicColumns.choreId]){
        if (hist[this.historicColumns.userId] == user._id) nb++;
      }
    }

    return nb;
  };

  Service.prototype.getDoneTimeElapsedByUser = function (historics, user, dayDate) {
    var timeE = 0;
    for (var i = 0;  (user && historics) && (i< historics.length); i ++) {
      var hist = historics[i];
      var isSameDay = false;
      if (dayDate) {
              var dateToCheck = new Date(hist[this.historicColumns.actionDoneDate]);
              isSameDay = ( dateToCheck.getDate() == dayDate.getDate() &&
                            dateToCheck.getMonth() == dayDate.getMonth() &&
                            dateToCheck.getFullYear() == dayDate.getFullYear());
      }

      if (!dayDate || isSameDay){
        if (hist[this.historicColumns.userId] == user._id) timeE += hist[this.historicColumns.timeInMn];
      }
    }

    return timeE;
  };


  return Service;
})();
