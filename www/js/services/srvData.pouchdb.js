angular.module('srvData.pouchdb', ['MiappService'])

    .config(function () {

    })

    .factory('srvData', function ($q, $log, $http, $timeout, MiappService, srvArray, srvConfig) {
        return new SrvDataPouchDB($q, $log, $http, $timeout, MiappService, srvArray, srvConfig);
    });

var SrvDataPouchDB = (function () {
    'use strict';

    function Service($q, $log, $http, $timeout, MiappService, srvArray, srvConfig) {

        var self = this;
        self.$q = $q;
        self.$log = $log;
        self.$http = $http;
        self.$timeout = $timeout;
        self.db = null;
        self.srvMiapp = MiappService;
        self.srvArray = srvArray;
        self.srvConfig = srvConfig;
        self.initDone = false;
        self.dataLastResetDate = null;

        self.userType = 'UserDocType';
        self.coupleType = 'CoupleDocType';
        self.choreType = 'ChoreDocType';
        self.historicType = 'HistoricDocType';
        self.categoryType = 'CategoryDocType';
        self.userColumns = {
            type: 'docType',
            firstName: 'firstname',
            lastName: 'lastname',
            email: 'email',
            password: 'password',
            timeInMnPerWeekTodo: 'timeInMnPerWeekTodo',
            profilID: 'profilID',
            profilColor: 'profilColor',
            timeInMnPerMond: 'timeInMnPerMond',
            timeInMnPerTues: 'timeInMnPerTues',
            timeInMnPerWedn: 'timeInMnPerWedn',
            timeInMnPerThur: 'timeInMnPerThur',
            timeInMnPerFrid: 'timeInMnPerFrid',
            timeInMnPerSatu: 'timeInMnPerSatu',
            timeInMnPerSund: 'timeInMnPerSund',
            lastModified: 'lastModified'
        };
        self.coupleColumns = {
            type: 'docType',
            name: 'coupleName',
            description: 'description',
            userAId: 'userA_id',
            userBId: 'userB_id',
            lastResetDate: 'LastResetDate',
            lastModified: 'lastModified'
        };
        self.choreColumns = {
            type: 'docType',
            name: 'choreName',
            category: 'choreCategoryName',
            description: 'description',
            percentAB: 'percent_AB',
            AUserAffinity: 'AUserAffinity',
            BUserAffinity: 'BUserAffinity',
            frequencyDays: 'frequencyDays',
            timeInMn: 'timeInMn',
            choreDescriptionCat: 'choreDescriptionCat',
            priority: 'priority',
            priorityComputed: 'priorityComputed',
            lastTimeDone: 'lastTimeDone',
            desactivate: 'desactivate',
            lastModified: 'lastModified'
        };
        self.historicColumns = {
            type: 'docType',
            name: 'choreName',
            category: 'choreCategoryName',
            description: 'description',
            percentAB: 'percent_AB',
            AUserAffinity: 'AUserAffinity',
            BUserAffinity: 'BUserAffinity',
            frequencyDays: 'frequencyDays',
            timeInMn: 'timeInMn',
            choreDescriptionCat: 'choreDescriptionCat',
            priority: 'priority',
            priorityComputed: 'priorityComputed',
            lastTimeDone: 'lastTimeDone',
            desactivate: 'desactivate',
            choreId: 'choreId',
            userId: 'userId',
            action: 'action',
            actionTodoDate: 'actionTodoDate',
            actionDoneDate: 'actionDoneDate',
            internalWeight: 'internalWeight',
            internalLate: 'internalLate',
            lastModified: 'lastModified',
            histoComment: 'histoComment'
        };
        self.categoryColumns = {
            type: 'docType',
            name: 'categoryName',
            description: 'description',
            thumbPath: 'thumb',
            groupName: 'group',
            desactivate: 'desactivate',
            lastModified: 'lastModified'
        };

        self.User = {

            type: self.userType,
            columns: self.userColumns,

            findAll: function () {
                var deferred = self.$q.defer();
                var users = [];
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var results = response.rows.map(function (r) {
                            if (r && r.doc && r.doc[self.userColumns.type] == self.userType) {
                                var user = r.doc;
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
            findOneById: function (userId) {
                var deferred = self.$q.defer();
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                        deferred.reject("No User found ById " + err);
                    }
                    else if (response) {
                        var respLength = response.rows.length;
                        if (!respLength) deferred.reject("No user list");
                        else {
                            var respTested = 0;
                            var respFound = false;
                            var results = response.rows.map(function (r) {
                                respTested++;
                                if (!respFound &&
                                    r && r.doc && r.doc[self.userColumns.type] == self.userType &&
                                    r.doc._id == userId) {
                                    respFound = true;
                                    deferred.resolve(r.doc);
                                    return r;
                                }
                                if (!respFound && respTested === respLength) deferred.reject("User not found");
                                return null;
                            });
                        }
                    }
                });
                return deferred.promise;
            },
            findOneByEmail: function (userEmail) {
                var deferred = self.$q.defer();
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {

                    if (err || !response || !response.rows) {
                        self.$log.error(err);
                        return deferred.reject('No User found ByEmail : ' + err);
                    }

                    var respLength = response.rows.length;
                    if (!respLength) return deferred.reject('srvData.pouchdb.User.findOneByEmail : No user list');

                    var respTested = 0;
                    var respFound = false;
                    var results = response.rows.map(function (r) {
                        respTested++;
                        if (!respFound &&
                            r && r.doc &&
                            r.doc[self.userColumns.type] == self.userType &&
                            r.doc[self.userColumns.email] == userEmail) {
                            respFound = true;
                            deferred.resolve(r.doc);
                            return r;
                        }
                        if (!respFound && respTested === respLength) deferred.reject("User not found");
                        return null;
                    });

                });
                return deferred.promise;
            },
            set: function (user) {
                var deferred = self.$q.defer();

                user[self.userColumns.type] = self.userType;
                user[self.userColumns.lastModified] = self.srvConfig.getDateNow();

                return self.srvMiapp.put(user);
            },
            lastModified: function () {
                return self.srvConfig.getDateNow();
            }
        };
        self.Couple = {

            type: self.coupleType,
            columns: self.coupleColumns,

            findAll: function () {
                var deferred = self.$q.defer();
                var couples = [];
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var results = response.rows.map(function (r) {
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
            findAllRelatedToUser: function (user) {
                var deferred = self.$q.defer();
                var couples = [];
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var results = response.rows.map(function (r) {
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
            findOne: function (user) {
                var deferred = self.$q.defer();
                var couple = null;
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var responseLength = response.rows.length;
                        if (responseLength <= 0) return deferred.reject("No couple found");
                        var responseComputed = 0;
                        //console.log('srvData.pouchdb.Couple.findOne results: ' + response.rows.length);
                        var results = response.rows.map(function (r) {
                            // Get the first couple //TODO criterias ??
                            var isCouple = (r && r.doc && r.doc[self.coupleColumns.type] == self.coupleType);
                            var isOwnBy = (r && r.doc && (r.doc[self.coupleColumns.userAId] == user._id || r.doc[self.coupleColumns.userBId] == user._id));
                            //if (isCouple) console.log('srvData.pouchdb.Couple.findOne isCouple: ' + r.doc[self.coupleColumns.userAId] + ' == ' + user._id), console.log(r.doc);
                            //if (isOwnBy) console.log('srvData.pouchdb.Couple.findOne isOwnBy: ' + r.doc);

                            if (!couple && isCouple && isOwnBy) {
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
            set: function (couple) {
                var deferred = self.$q.defer();

                couple[self.coupleColumns.type] = self.coupleType;
                couple[self.coupleColumns.lastModified] = self.srvConfig.getDateNow();
                var name = couple[self.coupleColumns.name];

                return self.srvMiapp.put(couple);
            },
            lastModified: function () {
                return self.srvConfig.getDateNow();
            }
        };
        self.Category = {

            type: self.categoryType,
            columns: self.categoryColumns,

            findAll: function () {
                var deferred = self.$q.defer();
                var categories = [];
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var results = response.rows.map(function (r) {
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
            set: function (category) {
                var deferred = self.$q.defer();

                category[self.categoryColumns.type] = self.categoryType;
                category[self.categoryColumns.lastModified] = self.srvConfig.getDateNow();
                category[self.categoryColumns.desactivate] = category[self.categoryColumns.desactivate] ? category[self.categoryColumns.desactivate] : false;

                return self.srvMiapp.put(category);
            },
            applyToLinkedChores: function (category, fnToApply) {
                //NO defered ? var deferred = self.$q.defer();
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var results = response.rows.map(function (r) {
                            if (r && r.doc && r.doc[self.choreColumns.type] == self.choreType &&
                                r.doc[self.choreColumns.category] == category[self.categoryColumns.name]) {
                                fnToApply(r.doc);
                            }
                        });
                    }
                });
                // return deferred.promise;
            },


            lastModified: function () {
                return self.srvConfig.getDateNow();
            }
        };
        self.Chore = {

            type: self.choreType,
            columns: self.choreColumns,

            findAll: function (user) {
                var deferred = self.$q.defer();
                var chores = [];
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var results = response.rows.map(function (r) {
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
            findOneById: function (choreId) {
                var deferred = self.$q.defer();
                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                        deferred.reject("No Chore found ById " + err);
                    }
                    else if (response) {
                        var respLength = response.rows.length;
                        if (!respLength) deferred.reject("No chore list");
                        else {
                            var respTested = 0;
                            var respFound = false;
                            var results = response.rows.map(function (r) {
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
            set: function (chore) {
                var deferred = self.$q.defer();

                chore[self.choreColumns.type] = self.choreType;
                chore[self.choreColumns.lastModified] = self.srvConfig.getDateNow();
                chore[self.choreColumns.desactivate] = chore[self.categoryColumns.desactivate] ? chore[self.choreColumns.desactivate] : false;

                return self.srvMiapp.put(chore);
            },
            remove: function (chore) {
                var deferred = self.$q.defer();
                var appChoreId = chore._id;
                if (!appChoreId) deferred.reject("Remove impossible");
                else  self.db.remove(chore, function (err, response) {
                    if (response && response.ok) {
                        return deferred.resolve(err);
                    }
                    return deferred.reject(err);
                });
                return deferred.promise;
            },
            lastModified: function () {
                return self.srvConfig.getDateNow();
            }
        };
        self.Historic = {

            type: self.historicType,
            columns: self.historicColumns,

            findAll: function (bFilteredByLastDate) {
                var deferred = self.$q.defer();
                var historics = [];

                self.db.allDocs({include_docs: true, descending: true}, function (err, response) {
                    if (err) {
                        self.$log.error(err);
                    }
                    if (response) {
                        var lastResetDate = self.getLastHistoricsResetDate();
                        var results = response.rows.map(function (r) {
                            if (r && r.doc && r.doc[self.historicColumns.type] == self.historicType) {
                                var historic = r.doc;

                                if (bFilteredByLastDate && lastResetDate) {
                                    var date1 = new Date(historic[self.historicColumns.actionDoneDate]);
                                    var date2 = new Date(lastResetDate);
                                    var bActiveHisto = (date1 >= date2);
                                    // Not active : not push up this old item
                                    if (!bActiveHisto)
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
            set: function (historic) {
                var deferred = self.$q.defer();

                historic[self.historicColumns.type] = self.historicType;
                historic[self.historicColumns.lastModified] = self.srvConfig.getDateNow();
                historic[self.historicColumns.desactivate] = historic[self.historicColumns.desactivate] ? historic[self.historicColumns.desactivate] : false;

                return self.srvMiapp.put(historic);
            },
            lastModified: function () {
                return self.srvConfig.getDateNow();
            }
        };

    }

    Service.prototype.isInitDone = function () {
        return this.initDone;
    };

    Service.prototype.init = function () {
        var bok = true;
        var self = this;
        //this.$log.log('srvData.pouchdb.init');
        //var deferred = self.$q.defer();
        if (this.isInitDone()) return;

        //this.$log.log('srvData.pouchdb.init : check _db');
        if (this.srvMiapp && this.srvMiapp.miappService && this.srvMiapp.miappService._db)
        //this.db = new PouchDB('cltorDB', {adapter : 'websql'});
            this.db = this.srvMiapp.miappService._db;

        //this.$log.log('srvData.pouchdb.init : check _db..');
        //this.$log.log(this.srvMiapp);
        if (!this.db) {
            this.$log.error('srvData.pouchdb.init : PB => NO DB !');
            return;
        }

        //this.$log.log('srvData.pouchdb.init : done.');
        self.initDone = true;
    };

    //todo : set in srvDataContainer or srvComputing
    Service.prototype.getUserAFromCouple = function (couple) {
        var self = this;
        var deferred = self.$q.defer();
        if (!couple) return self.$q.reject(null);
        var userId = couple.userA_id;
        //console.log('srvData.pouchdb.getUserAFromCouple : ' + userId);

        self.db.get(userId).then(function (resp) {
            //if (err) return deferred.reject(err);
            //console.log('srvData.pouchdb.getUserAFromCouple resp : ' + resp);
            if (resp) {
                return deferred.resolve(resp);
            }
            else return deferred.reject(null);
        });

        return deferred.promise;
    };

    Service.prototype.getUserBFromCouple = function (couple) {
        var self = this;
        var deferred = self.$q.defer();
        if (!couple) return self.$q.reject(null);
        var userId = couple.userB_id;
        //console.log('srvData.pouchdb.getUserBFromCouple : ' + userId);

        self.db.get(userId).then(function (resp) {
            //console.log('srvData.pouchdb.getUserBFromCouple resp : ' + resp);
            //if (err) return deferred.reject(err);
            if (resp) {
                return deferred.resolve(resp);
            }
            else return deferred.reject(null);
        });

        return deferred.promise;
    };

    Service.prototype.computeHistoricsByCalendar = function (chores, historics, userA, userB, maxDayx) {
        var i, self = this;
        var lstHistoLate = [];
        var lstHistoByCalendar = [];
        var maxDays = maxDayx ? maxDayx : 7;
        var now = self.srvConfig.getDateNow();

        // 1) Pour chaque tâche existante
        //	Retard (en jours) = Date actuelle - Date de dernière réalisation - (nbCopy * fréq)
        //	Si Retard >= - 7 (jours)
        //		Poids = (Retard - fréquence) / fréquence
        //		Affectation du poids à la tache
        //         	Affectation du retard à la tache
        //		Remplissage de la liste L avec cette tâche
        //if (chores) console.log('computeHistoricsByCalendar chores & historics length + maxDays : ', chores.length, historics.length, maxDays);
        for (i = 0; chores && (i < chores.length); i++) {
            var choreToCopy = chores[i];
            var dateLastDone = self.getDateOfLastChoreDoneByType(chores, historics, choreToCopy._id);
            var freq = parseInt(choreToCopy[self.choreColumns.frequencyDays]);

            for (var nbCopy = 1; nbCopy <= maxDays; nbCopy++) {
                var historic = self.createHistoricFromChore(choreToCopy);

                var late = 0;
                var isAvailable = (parseInt(historic[self.historicColumns.timeInMn]) > 0);
                var aa = (historic[self.historicColumns.desactivate] === 'false');
                var ab = !!historic[self.historicColumns.desactivate];
                var disactive = aa ? false : ab;
                isAvailable = !disactive;
                //console.log('isAvailable ? ', aa, ab, disactive, isAvailable, historic)

                if (dateLastDone) {
                    //dateLastDone = dateLastDone ? dateLastDone : new Date('2015/01/01');
                    var dateLastDone_ = new Date(dateLastDone);
                    var timeDiff = now.getTime() - dateLastDone_.getTime();
                    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    late = daysDiff - (nbCopy * freq);
                }
                else {
                    late = freq - (nbCopy * freq);
                }

                //console.log('late maxDays isAvailable : ', late, maxDays, isAvailable)
                if (late >= -maxDays && isAvailable) {
                    var prioWeight = 1;
                    var prioH = parseInt(historic[self.historicColumns.priority]);
                    if (prioH < 3) prioWeight = 2;
                    var weight = ((late + 40 - freq) / freq) * prioWeight;
                    //if (weight < 0) {
                    //    console.log("weight" + weight);
                    //}
                    historic[self.historicColumns.internalWeight] = weight;
                    historic[self.historicColumns.internalLate] = late;
                    lstHistoLate.push(historic);
                }
                else break;
            }
        }

        // 2) Ordonner la liste L par poids (decroissant)
        //console.log('computeHistoricsByCalendar lstHistoLate.length : ', lstHistoLate.length);
        lstHistoLate.sort(function (histoA, histoB) {
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

                var historicToCopy = lstHistoLate[j];
                var historic = angular.copy(historicToCopy);
                var lateInDays = historic[self.historicColumns.internalLate];
                var histoTimeInMn = parseInt(historic[self.historicColumns.timeInMn]);

                historic.iPreventNUID = "uid_" + j + "_" + day;
                if (lateInDays >= (-day)) {
                    // 			Dispo A = Calcul dispo de A pour J
                    // 			Dispo B = Calcul dispo de B pour J
                    // jour glissant
                    var dayOfWeek = now.getDay();
                    var slidingDayOfWeek = (day + dayOfWeek) % 7;
                    var timeInMnPer = (self.userColumns.timeInMnPerSund);
                    if (slidingDayOfWeek == 1) timeInMnPer = (self.userColumns.timeInMnPerMond);
                    else if (slidingDayOfWeek == 2) timeInMnPer = (self.userColumns.timeInMnPerTues);
                    else if (slidingDayOfWeek == 3) timeInMnPer = (self.userColumns.timeInMnPerWedn);
                    else if (slidingDayOfWeek == 4) timeInMnPer = (self.userColumns.timeInMnPerThur);
                    else if (slidingDayOfWeek == 5) timeInMnPer = (self.userColumns.timeInMnPerFrid);
                    else if (slidingDayOfWeek == 6) timeInMnPer = (self.userColumns.timeInMnPerSatu);

                    // calcul du temps deja done pour le jour day
                    var dateTodo = new Date(now);
                    dateTodo.setDate(dateTodo.getDate() + day);

                    //todo : sauvegarde dispo, decrement chaque jour
                    var doneElapsed = 0;
                    if (typeof dispoA[day] == "undefined") {
                        doneElapsed = self.getDoneTimeElapsedByUser(historics, userA, dateTodo);
                        dispoA[day] = userA[timeInMnPer] ? (parseInt(userA[timeInMnPer]) - doneElapsed) : 0;
                    }
                    if (typeof dispoB[day] == "undefined") {
                        doneElapsed = self.getDoneTimeElapsedByUser(historics, userB, dateTodo);
                        dispoB[day] = userB[timeInMnPer] ? (parseInt(userB[timeInMnPer]) - doneElapsed) : 0;
                    }

                    // 	Si Dispo A = ok & Dispo B = ok
                    var todoAdd = false;

                    // Si deja existant dans la journee, future ou passée
                    var found = false;
                    var dateTxt = "" + dateTodo.getFullYear() + "/" + padInteger(dateTodo.getMonth() + 1, 2) + '/' + padInteger(dateTodo.getDate(), 2);

                    for (var x = 0; (x < lstHistoByCalendar.length) && !found; x++) {
                        var h1 = lstHistoByCalendar[x];
                        if (h1[self.historicColumns.actionTodoDate] === dateTxt &&
                            h1[self.historicColumns.choreId] === historic[self.historicColumns.choreId])
                            found = true;
                    }
                    for (var y = 0; (y < historics.length) && !found; y++) {
                        var h2 = historics[y];
                        var h2Date = new Date(h2[self.historicColumns.actionDoneDate]);
                        if (h2Date.getDate() === dateTodo.getDate() &&
                            h2Date.getMonth() === dateTodo.getMonth() &&
                            h2Date.getFullYear() === dateTodo.getFullYear() &&
                            h2.choreId === historic.choreId)
                            found = true;
                    }


                    if (!found && (dispoA[day] - histoTimeInMn) >= 0 && (dispoB[day] - histoTimeInMn) >= 0) {
                        // Calcul du taux de réalisation par A de la tâche / B
                        var nbA = self.getChoresNbDoneByUser(historics, userA, historic[self.historicColumns.choreId]);
                        var nbB = self.getChoresNbDoneByUser(historics, userB, historic[self.historicColumns.choreId]);
                        var nbATemp = self.getChoresNbDoneByUser(lstHistoByCalendar, userA, historic[self.historicColumns.choreId]);
                        var nbBTemp = self.getChoresNbDoneByUser(lstHistoByCalendar, userB, historic[self.historicColumns.choreId]);
                        nbA += nbATemp;
                        nbB += nbBTemp;
                        var rateA = (nbA + nbB) ? (nbA / (nbA + nbB) * 100) : 50;
                        var affA = (100 - parseInt(historic[self.historicColumns.percentAB])); //if percentAB == 0 --> A wants to do everytime : affA = 100

                        // Si taux de A > Affinité de A
                        // Remplissage de la liste de B (Nom de la tache + date J pour affichage)
                        if ((rateA > affA || affA === 0)) {
                            historic[self.historicColumns.userId] = userB._id;
                            dispoB[day] = dispoB[day] - histoTimeInMn;
                        }
                        else {
                            historic[self.historicColumns.userId] = userA._id;
                            dispoA[day] = dispoA[day] - histoTimeInMn;
                        }
                        todoAdd = true;
                    }
                    else if (!found && (dispoA[day] - histoTimeInMn) >= 0) {
                        historic[self.historicColumns.userId] = userA._id;
                        dispoA[day] = dispoA[day] - histoTimeInMn;
                        todoAdd = true;
                    }
                    else if (!found && (dispoB[day] - histoTimeInMn) >= 0) {
                        historic[self.historicColumns.userId] = userB._id;
                        dispoB[day] = dispoB[day] - histoTimeInMn;
                        todoAdd = true;
                    }
                    else {
                        todoAdd = false;
                    }

                    if (todoAdd) {
                        historic[self.historicColumns.actionTodoDate] = dateTxt;
                        lstHistoByCalendar.push(historic);
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

        //console.log('computeHistoricsByCalendar lstHistoByCalendar.length : ', lstHistoByCalendar.length);
        return new self.$q(function (resolve, reject) {
            resolve(lstHistoByCalendar);
        });
    };

    Service.prototype.terminateHistoric = function (chores, historic) {
        var i, self = this;
        var deferred = self.$q.defer();
        var now = self.srvConfig.getDateNow();

        // retrieve chore and set lastTimeDone
        var historicChoreId = historic[self.historicColumns.choreId];
        var choreDone = null;
        for (i = 0; (i < chores.length) && !choreDone; i++) {
            var chore = chores[i];
            var choreId = chore._id;
            if (choreId === historicChoreId) {
                chore[self.choreColumns.lastTimeDone] = now;
                choreDone = chore;
            }
        }

        if (choreDone) {
            self.Chore.set(choreDone).then(function (choreSaved) {
                // set historic
                historic[self.historicColumns.actionDoneDate] = now;
                self.Historic.set(historic)
                    .then(function (histoSaved) {
                        deferred.resolve(histoSaved);
                    })
                    .catch(function (err) {
                        deferred.reject(err);
                    });
            }).catch(function (err) {
                deferred.reject(err);
            });
        }
        else {
            deferred.reject('Not possible to terminate chore or historic :' + historicChoreId);
        }

        return deferred.promise;
    };

    Service.prototype.resetHistorics = function () {
        //if (!this.dataCoupleLoggedIn) return null;
        this.dataLastResetDate = self.srvConfig.getDateNow();
        setObjectFromLocalStorage('dataLastResetDate', this.dataLastResetDate);
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
        for (var j = 0; (j < chores.length) && !lastDateDefault; j++) {
            var chore = chores[j];
            if (choreIdToSearch === chore._id)
                lastDateDefault = chore[this.choreColumns.lastTimeDone];
        }

        for (var i = 0; (choreIdToSearch && historics) && (i < historics.length); i++) {
            var hist = historics[i];
            if (choreIdToSearch == hist[this.historicColumns.choreId]) {
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
        for (var i = 0; (user && historics) && (i < historics.length); i++) {
            var hist = historics[i];

            if (!choreId || choreId == hist[this.historicColumns.choreId]) {
                if (hist[this.historicColumns.userId] == user._id) nb++;
            }
        }

        return nb;
    };

    Service.prototype.getDoneTimeElapsedByUser = function (historics, user, dayDate) {
        var timeE = 0;
        for (var i = 0; (user && historics) && (i < historics.length); i++) {
            var hist = historics[i];
            var isSameDay = false;
            if (dayDate) {
                var dateToCheck = new Date(hist[this.historicColumns.actionDoneDate]);
                isSameDay = ( dateToCheck.getDate() === dayDate.getDate() &&
                dateToCheck.getMonth() === dayDate.getMonth() &&
                dateToCheck.getFullYear() === dayDate.getFullYear());
            }

            if (!dayDate || isSameDay) {
                if (hist[this.historicColumns.userId] === user._id) timeE += parseInt(hist[this.historicColumns.timeInMn]);
            }
        }

        return timeE;
    };


    /** @deprecated **/
    Service.prototype.initWithDemoData = function () {
        var i, self = this, chanceBaseUser = 12345, chanceBaseCouple = 12645, chanceBaseChore = 12945;//Math.random
        var deferred = self.$q.defer();


        var users = [];
        for (i = 0; i < 10; i++) {
            var user = {};
            var chanceUser = new Chance(chanceBaseUser + i);
            user._id = 'demo' + chanceUser.hash({length: 10});
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
            var chanceCouple = new Chance(chanceBaseCouple + i);
            couple[self.coupleColumns.type] = self.coupleType;
            couple[self.coupleColumns.name] = chanceCouple.sentence({words: 2});
            couple[self.coupleColumns.description] = chanceCouple.sentence({words: 5});
            couple[self.coupleColumns.lastModified] = chanceCouple.date();

            couple[self.coupleColumns.userAId] = users[i]._id;
            couple[self.coupleColumns.userBId] = users[(i > 5) ? (i - 1) : (i + 1)]._id;


            couples.push(couple);
        }
        var chores = [];
        for (i = 0; i < 10; i++) {
            var chore = {};
            chores.push(chore);
        }

        var docs = users.concat(couples, chores);
        self.db.bulkDocs(docs, function (err, response) {
            //self.$log.log(err+' '+response);
            if (err) return deferred.reject(err);
            deferred.resolve(response);
        });

        return deferred.promise;
    };
    Service.prototype.becarefulClean = function () {
        var self = this;
        var deferred = self.$q.defer();
        this.alreadySyncronized = false;

        self.srvMiapp.miappService.becarefulCleanDb()
            .then(function () {
                self.db = self.srvMiapp.miappService._db;
                deferred.resolve();
            })
            .catch(function () {
                deferred.reject();
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
    Service.prototype.computeFairIndicleanator = function (historics, userA, userB) {

        var indic = 50;
        var nbA = 0;
        var nbB = 0;
        // depending on percent, copy chores
        for (var i = 0; (i < historics.length); i++) {
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
        setObjectFromLocalStorage('dataFairIndicleanator', newValue);
    };
    Service.prototype.getFairIndicleanator = function () {
        var obj = getObjectFromLocalStorage('dataFairIndicleanator');
        this.dataFairIndicleanator = obj;
        return this.dataFairIndicleanator;
    };

    /**
     *
     * @param chores
     * @param userA
     * @param userB
     * @param maxHistoric
     * @returns {*|Function|promise}

     Service.prototype.computeHistoricsByPrior = function (chores, userA, userB, maxHistoric) {
        var i, self = this;
        var deferred = self.$q.defer();
        var lstChores = [];

        // depending on % affinity , copy chores
        var rand = new Chance(Math.random);
        rand = rand.year();
        for (i = 0; userA && userB && chores && i < chores.length && i < maxHistoric; i++) {

            var j = (rand + i) % chores.length;
            var choreToCopy = chores[j];

            if (!choreToCopy) {
                alert("Pb : (" + j + ") " + chores.length);
            }

            if (choreToCopy[self.historicColumns.timeInMn] > 0) {
                var historic = angular.copy(choreToCopy);
                historic._id = null;
                historic[self.historicColumns.choreId] = choreToCopy._id;
                var uId = new Chance(Math.random).bool() ? userB._id : userA._id; //choreToCopy.percent_AB > 50 ? userB._id : userA._id;
                if (uId == userA._id && choreToCopy.percent_AB > 85) uId = userB._id;
                if (uId == userB._id && choreToCopy.percent_AB < 15) uId = userA._id;

                historic[self.historicColumns.userId] = uId;
                historic[self.historicColumns.frequencyDays] = padInteger(historic[self.historicColumns.frequencyDays]);
                lstChores.push(historic);
            }
        }
        deferred.resolve(lstChores);
        return deferred.promise;
    };
     */

    Service.prototype.createHistoricFromChore = function (choreToCopy, refHistoric) {
        var historic = angular.copy(choreToCopy);

        // get all data from previous ref
        if (refHistoric) {
            for (var key in this.historicColumns) {
                if (refHistoric[key] && !historic[key]) {
                    historic[key] = refHistoric[key];
                    //console.log('historic[key] ',key, historic[key]);
                }
            }
        }
        // force some properties
        historic._id = null;
        historic[this.historicColumns.choreId] = choreToCopy._id;

        return historic;
    };


    // private
    function padInteger(num, size) {
        if (!size) size = 10;
        var s = "000000000" + num;
        return s.substr(s.length - size);
    }

    function setObjectFromLocalStorage(id, object) {
        if (typeof(Storage) === "undefined") return null;

        var jsonObj = JSON.stringify(object);
        // Retrieve the object from storage
        localStorage.setItem(id, jsonObj);

        //console.log('retrievedObject: ', JSON.parse(retrievedObject));
        return jsonObj;

    }

    function getObjectFromLocalStorage(id) {
        if (typeof(Storage) === "undefined") return null;

        // Retrieve the object from storage
        var retrievedObject = localStorage.getItem(id);
        var obj = JSON.parse(retrievedObject);

        //console.log('retrievedObject: ', JSON.parse(retrievedObject));
        return obj;

    }

    return Service;
})();
