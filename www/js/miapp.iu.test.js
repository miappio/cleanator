/*
	Creates a generic miapp client with logging and buildCurl disabled

 */
function getClient() {
	return new Miapp.Client({
		orgName: 'yourorgname',
		appName: 'sandbox',
		logging: false, //optional - turn on logging, off by default
		buildCurl: true //optional - turn on curl commands, off by default
	});
}
/*
	A convenience function that will test for the presence of an API error
	and run any number of additional tests
 */
function miappTestHarness(err, data, done, tests, ignoreError) {
	if (!ignoreError) expect(!err, (err)?err.error_description:"unknown");
	if (tests) {
		if ("function" === typeof tests) {
			tests(err, data);
		} else if (tests.length) {
			tests.forEach(function(test) {
				if ("function" === typeof test) {
					test(err, data);
				}
			})
		}
	}
	done();
}


  describe('Ajax', function() {
    var dogName="dog"+Math.floor(Math.random()*5000);
    var dogData=JSON.stringify({type:"dog",name:dogName});
    var dogURI='https://api.miapp.com/yourorgname/sandbox/dogs';
    it('should POST to a URI',function(done){
        Ajax.post(dogURI, dogData).then(function(err, data){
            //expect(!err, err);
            expect(err).toBeNull(err);
            done();
        })
    });

    it('should GET a URI',function(done){
        Ajax.get(dogURI+'/'+dogName).then(function(err, data){
          //expect(!err, err);
          expect(err).toBeNull(err);
          done();
        })
    });
    it('should PUT to a URI',function(done){
      Ajax.put(dogURI+'/'+dogName, {"favorite":true}).then(function(err, data){
        //expect(!err, err);
        expect(err).toBeNull(err);
        done();
      })
    });
    it('should DELETE a URI',function(done){
        Ajax.delete(dogURI+'/'+dogName, dogData).then(function(err, data){
          //expect(!err, err);
          expect(err).toBeNull(err);
          done();
        })
    })
});
describe('MiappError', function() {
    var errorResponse={
        "error":"service_resource_not_found",
        "timestamp":1392067967144,
        "duration":0,
        "exception":"org.miapp.services.exceptions.ServiceResourceNotFoundException",
        "error_description":"Service resource not found"
    };
    it('should unmarshal a response from Miapp into a proper Javascript error',function(done){
        var error = MiappError.fromResponse(errorResponse);
        expect(error.name===errorResponse.error, "Error name not set correctly");
        expect(error.message===errorResponse.error_description, "Error message not set correctly");
        done();
    });
});
describe('Miapp', function(){
    describe('SDK Version', function(){
        it('should contain a minimum SDK version',function(){
            var parts=Miapp.VERSION.split('.').map(function(i){return i.replace(/^0+/,'')}).map(function(i){return parseInt(i)});

            expect(parts[1]>=10, "expected minor version >=10");
            expect(parts[1]>10||parts[2]>=8, "expected minimum version >=8");
        });
    });
    describe('Miapp Request/Response', function() {
        var dogName="dog"+Math.floor(Math.random()*5000);
        var dogData=JSON.stringify({type:"dog",name:dogName});
        var dogURI='https://api.miapp.com/yourorgname/sandbox/dogs';
        it('should POST to a URI',function(done){
            var req=new Miapp.Request("POST", dogURI, {}, dogData, function(err, response){
                console.error(err, response);
                //expect(!err, err);
                expect(err).toBeUndefined(err);
                expect(response instanceof Miapp.Response).toBeTruthy("Response is not and instance of Miapp.Response");
                done();
            })
        });
        it('should GET a URI',function(done){
            var req=new Miapp.Request("GET", dogURI+'/'+dogName, {}, null, function(err, response){
                expect(err).toBeUndefined(err);
                expect(response instanceof Miapp.Response).toBeTruthy("Response is not and instance of Miapp.Response");
                done();
            })
        });
        it('should GET an array of entity data from the Miapp.Response object',function(done){
            var req=new Miapp.Request("GET", dogURI, {}, null, function(err, response){
                expect(err).toBeUndefined(err);
                expect(response instanceof Miapp.Response).toBeTruthy("Response is not and instance of Miapp.Response");
                var entities=response.getEntities();
                expect(entities && entities.length).toBeTruthy("Nothing was returned");
                done();
            })
        });
        it('should GET entity data from the Miapp.Response object',function(done){
            var req=new Miapp.Request("GET", dogURI+'/'+dogName, {}, null, function(err, response){
                var entity=response.getEntity();
              expect(err).toBeUndefined(err);
              expect(response instanceof Miapp.Response).toBeTruthy("Response is not and instance of Miapp.Response");
                expect(entity, "Nothing was returned");
                done();
            })
        });
        it('should PUT to a URI',function(done){
            var req=new Miapp.Request("PUT", dogURI+'/'+dogName, {}, {favorite:true}, function(err, response){
              expect(err).toBeUndefined(err);
              expect(response instanceof Miapp.Response).toBeTruthy("Response is not and instance of Miapp.Response");
                done();
            })
        });
        it('should DELETE a URI',function(done){
            var req=new Miapp.Request("DELETE", dogURI+'/'+dogName, {}, null, function(err, response){
              expect(err).toBeUndefined(err);
              expect(response instanceof Miapp.Response).toBeTruthy("Response is not and instance of Miapp.Response");
                done();
            })
        });
        it('should NOT allow an invalid method',function(done){
            try{
                var req=new Miapp.Request("INVALID", dogURI+'/'+dogName, {}, null, function(err, response){
                    expect(true, "Should have thrown an MiappInvalidHTTPMethodError");
                    done();
                })
            }catch(e){
                expect(e instanceof MiappInvalidHTTPMethodError, "Error is not and instance of MiappInvalidHTTPMethodError");
                done()
            }
        });
        it('should NOT allow an invalid URI',function(done){
            try{
                var req=new Miapp.Request("GET", "://apigee.com", {}, null, function(err, response){
                    expect(true, "Should have thrown an MiappInvalidURIError");
                    done();
                })
            }catch(e){
                expect(e instanceof MiappInvalidURIError, "Error is not and instance of MiappInvalidURIError");
                done()
            }
        });
        it('should return a MiappError object on an invalid URI',function(done){
            var req=new Miapp.Request("GET", dogURI+'/'+dogName+'zzzzz', {}, null, function(err, response){
                expect(err, "Should have returned an error");
                expect(response instanceof Miapp.Response, "Response is not and instance of Miapp.Response");
                expect(err instanceof MiappError, "Error is not and instance of MiappError");
                done();
            })
        });
    });
  /*
    describe('Miapp Client', function() {
        var client = getClient();

        describe('Miapp CRUD request', function() {

            it('before', function (done) {

                var timeout = function() {
                  //Make sure our dog doesn't already exist
                  client.request({
                      method: 'DELETE',
                      endpoint: 'users/fred'
                  }, function(err, data) {
                      done();
                  });
                };
                setTimeout(timeout,5000);
            });
            var options = {
                method: 'GET',
                endpoint: 'users'
            };

            it('should persist default query parameters', function(done) {
                //create new client with default params
                var client=new Miapp.Client({
                    orgName: 'yourorgname',
                    appName: 'sandbox',
                    logging: false, //optional - turn on logging, off by default
                    buildCurl: true, //optional - turn on curl commands, off by default
                    qs:{
                        test1:'test1',
                        test2:'test2'
                    }
                });
                var default_qs=client.getObject('default_qs');
                expect(default_qs.test1==='test1', "the default query parameters were not persisted");
                expect(default_qs.test2==='test2', "the default query parameters were not persisted");
                client.request({
                    method: 'GET',
                    endpoint: 'users'
                }, function(err, data) {
                      expect(!err,err);
                      expect(data && data.params && data.params.test1 && data.params.test2);
                      //expect(data.params.test2[0]==='test2', "the default query parameters were not sent to the backend");
                      //TODO expect(data.params.test1[0]==='test1', "the default query parameters were not sent to the backend");
                      done();
                });
            });
            it('should CREATE a new user', function(done) {
                client.request({
                    method: 'POST',
                    endpoint: 'users',
                    body: {
                        username: 'fred',
                        password: 'secret'
                    }
                }, function(err, data) {
                    miappTestHarness(err, data, done, [
                        function(err, data) {
                            expect(!err)
                        }
                    ]);
                });
            });
            it('should RETRIEVE an existing user', function(done) {
                client.request({
                    method: 'GET',
                    endpoint: 'users/fred',
                    body: {}
                }, function(err, data) {
                    miappTestHarness(err, data, done, [

                        function(err, data) {
                            expect(true);
                        }
                    ]);
                });
            });
            it('should UPDATE an existing user', function(done) {
                client.request({
                    method: 'PUT',
                    endpoint: 'users/fred',
                    body: {
                        newkey: 'newvalue'
                    }
                }, function(err, data) {
                    miappTestHarness(err, data, done, [

                        function(err, data) {
                            expect(true);
                          //done();
                        }
                    ]);
                });
            });
            it('should DELETE the user from the database', function(done) {
                client.request({
                    method: 'DELETE',
                    endpoint: 'users/fred'
                }, function(err, data) {
                    miappTestHarness(err, data, done, [

                        function(err, data) {
                            expect(true);
                          //done();
                        }
                    ]);
                });
            });
        });
        describe('Miapp REST', function() {
            it('should return a list of users', function(done) {
                client.request({
                    method: 'GET',
                    endpoint: 'users'
                }, function(err, data) {
                    miappTestHarness(err, data, done, [
                        function(err, data) {
                          expect(data);
                          expect(data.entities);
                            //TODO expect(data.entities.length >=0, "Request should return at least one user");
                          //done();
                        }
                    ]);
                });
            });
            it('should return no entities when an endpoint does not exist', function(done) {
                client.request({
                    method: 'GET',
                    endpoint: 'nonexistantendpoint'
                }, function(err, data) {
                    miappTestHarness(err, data, done, [

                        function(err, data) {
                            expect(!err,err);
                          //TODO expect(data.entities.length===0, "Request should return no entities");
                          //done();
                        }
                    ]);
                });
            });
        });
*/

      /*
        describe('Miapp convenience methods', function(){
            it('before',function(){ client.logout();});

            it('createEntity',function(done){
                client.createEntity({type:'dog',name:'createEntityTestDog'}, function(err, response, dog){
                    console.warn(err, response, dog);
                    expect(!err, "createEntity returned an error");
                    expect(dog, "createEntity did not return a dog");
                    expect(dog.get("name")==='createEntityTestDog', "The dog's name is not 'createEntityTestDog'");
                    done();
                })
            });
            it('createEntity - existing entity',function(done){
                    client.createEntity({type:'dog',name:'createEntityTestDog'}, function(err, response, dog){
                        try{
                            expect(err, "createEntity should return an error")
                        }catch(e){
                            expect(true, "trying to create an entity that already exists throws an error");
                        }finally{
                            done();
                        }
                    });
            });
            var testGroup;
            it('createGroup',function(done){
                client.createGroup({path:'dogLovers'},function(err, response, group){
                        try{
                            expect(!err, "createGroup returned an error")
                        }catch(e){
                            expect(true, "trying to create a group that already exists throws an error");
                        }finally{
                            done();
                        }
                    expect(!err, "createGroup returned an error: "+err);
                    expect(group, "createGroup did not return a group");
                    expect(group instanceof Miapp.Group, "createGroup did not return a Miapp.Group");
                    testGroup=group;
                    done();
                });
                done();
            });
            it('buildAssetURL',function(done){
                var assetURL='https://api.miapp.com/yourorgname/sandbox/assets/00000000-0000-0000-000000000000/data';
                expect(assetURL===client.buildAssetURL('00000000-0000-0000-000000000000'), "buildAssetURL doesn't work");
                done();
            });
            var dogEntity;
            it('getEntity',function(done){
                client.getEntity({type:'dog',name:'createEntityTestDog'}, function(err, response, dog){
                    expect(!err, "createEntity returned an error");
                    expect(dog, "createEntity returned a dog");
                    expect(dog.get("uuid")!==null, "The dog's UUID was not returned");
                    dogEntity=dog;
                    done();
                })
            });
            it('restoreEntity',function(done){
                var serializedDog=dogEntity.serialize();
                var dog=client.restoreEntity(serializedDog);
                expect(dog, "restoreEntity did not return a dog");
                expect(dog.get("uuid")===dogEntity.get("uuid"), "The dog's UUID was not the same as the serialized dog");
                expect(dog.get("type")===dogEntity.get("type"), "The dog's type was not the same as the serialized dog");
                expect(dog.get("name")===dogEntity.get("name"), "The dog's name was not the same as the serialized dog");

                done();
            });
            var dogCollection;
            it('createCollection',function(done){
                client.createCollection({type:'dogs'},function(err, response, dogs){
                    expect(!err, "createCollection returned an error");
                    expect(dogs, "createCollection did not return a dogs collection");
                    dogCollection=dogs;
                    done();
                })
            });
            it('restoreCollection',function(done){
                var serializedDogs=dogCollection.serialize();
                var dogs=client.restoreCollection(serializedDogs);
                console.warn('restoreCollection',dogs, dogCollection);
                expect(dogs._type===dogCollection._type, "The dog collection type was not the same as the serialized dog collection");
                expect(dogs._qs==dogCollection._qs, "The query strings do not match");
                expect(dogs._list.length===dogCollection._list.length, "The collections have a different number of entities");
                done();
            });
            var activityUser;
            before(function(done){
                activityUser=new Miapp.Entity({client:client,data:{"type":"user",'username':"testActivityUser"}});
                console.warn(activityUser);
                activityUser.fetch(function(err, data){
                    console.warn(err, data, activityUser);
                    if(err){
                        activityUser.save(function(err, data){
                            activityUser.set(data);
                            done();
                        });
                    }else{
                        activityUser.set(data);
                        done();
                    }
                })
            });
            it('createUserActivity',function(done){
                 var options = {
                   "actor" : {
                         "displayName" :"Test Activity User",
                             "uuid" : activityUser.get("uuid"),
                             "username" : "testActivityUser",
                             "email" : "miapp@apigee.com",
                             "image" : {
                                     "height" : 80,
                                     "url" : "http://placekitten.com/80/80",
                                     "width" : 80
                             }
                        },
                        "verb" : "post",
                       "content" : "test post for createUserActivity",
                       "lat" : 48.856614,
                       "lon" : 2.352222
                     };
                client.createUserActivity("testActivityUser", options, function(err, activity){
                    expect(!err, "createUserActivity returned an error");
                    expect(activity, "createUserActivity returned no activity object");
                    done();
                })
            });
            it('createUserActivityWithEntity',function(done){
                    client.createUserActivityWithEntity(activityUser, "Another test activity with createUserActivityWithEntity", function(err, activity){
                        expect(!err, "createUserActivityWithEntity returned an error "+err);
                        expect(activity, "createUserActivityWithEntity returned no activity object");
                        done();
                    })
            });
            it('getFeedForUser',function(done){
                client.getFeedForUser('testActivityUser', function(err, data, items){
                    expect(!err, "getFeedForUser returned an error");
                    expect(data, "getFeedForUser returned no data object");
                    expect(items, "getFeedForUser returned no items array");
                    done();
                })
            });
            var testProperty="____test_item"+Math.floor(Math.random()*5000),
                testPropertyValue="test"+Math.floor(Math.random()*5000),
                testPropertyObjectValue={test:testPropertyValue};
            it('set',function(done){
                client.set(testProperty, testPropertyValue);
                done();
            });
            it('get',function(done){
                var retrievedValue=client.get(testProperty);
                expect(retrievedValue===testPropertyValue, "Get is not working properly");
                done();
            });
            it('setObject',function(done){
                client.set(testProperty, testPropertyObjectValue);
                done();
            });
            it('getObject',function(done){
                var retrievedValue=client.get(testProperty);
                expect(retrievedValue==testPropertyObjectValue, "getObject is not working properly");
                done();
            });
            it('setToken',function(done){
                client.setToken("dummytoken");
                done();
            })
            it('getToken',function(done){
                expect(client.getToken()==="dummytoken");
                done();
            })
            it('remove property',function(done){
                client.set(testProperty);
                expect(client.get(testProperty)===null);
                done();
            });
            var newUser;
            it('signup',function(done){
                client.signup("newMiappUser", "Us3rgr1d15Aw3s0m3!", "miapp@apigee.com", "Another Satisfied Developer", function(err, user){
                    expect(!err, "signup returned an error");
                    expect(user, "signup returned no user object");
                    newUser=user;
                    done();
                })
            });
            it('login',function(done){
                client.login("newMiappUser", "Us3rgr1d15Aw3s0m3!", function(err, data, user){
                    expect(!err, "login returned an error");
                    expect(user, "login returned no user object");
                    done();
                })
            });
            it('reAuthenticateLite',function(done){
                client.reAuthenticateLite(function(err){
                    expect(!err, "reAuthenticateLite returned an error");
                    done();
                })
            });
            it('reAuthenticate',function(done){
                client.reAuthenticate("miapp@apigee.com", function(err, data, user, organizations, applications){
                    expect(!err, "reAuthenticate returned an error");
                    done();
                })
            });
            it('loginFacebook',function(done){
                expect(true, "Not sure how feasible it is to test this with Mocha")
                done();
            });
            it('isLoggedIn',function(done){
                expect(client.isLoggedIn()===true, "isLoggedIn is not detecting that we have logged in.");
                done();
            });
            it('getLoggedInUser',function(done){
                setTimeout(function(){
                    client.getLoggedInUser(function(err, data, user){
                        expect(!err, "getLoggedInUser returned an error");
                        expect(user, "getLoggedInUser returned no user object");
                        done();
                    })
                },1000);
            });
            before(function(done){
                //please enjoy this musical interlude.
                setTimeout(function(){done()},1000);
            });
            it('logout',function(done){
                client.logout();
                expect(null===client.getToken(), "we logged out, but the token still remains.");
                done();
            });
            it('getLoggedInUser',function(done){
                client.getLoggedInUser(function(err, data, user){
                    expect(err, "getLoggedInUser should return an error after logout");
                    expect(user, "getLoggedInUser should not return data after logout");
                    done();
                })
            });
            it('isLoggedIn',function(done){
                expect(client.isLoggedIn()===false, "isLoggedIn still returns true after logout.");
                done();
            });
            after(function (done) {
                client.request({
                    method: 'DELETE',
                    endpoint: 'users/newMiappUser'
                }, function (err, data) {
                    done();
                });

            });
            it('buildCurlCall',function(done){
                done();
            });
            it('getDisplayImage',function(done){
                done();
            });
            after(function(done){
                dogEntity.destroy();
                //dogCollection.destroy();
                //testGroup.destroy();
                done();
            });
        });

    });
       */

  /*
    describe('Miapp Entity', function() {
        var client = getClient();
        var dog;
        it('before',function(done) {
            //Make sure our dog doesn't already exist
            client.request({
                method: 'DELETE',
                endpoint: 'dogs/Rocky'
            }, function(err, data) {
                expect(true);
                done();
            });
        });
        it('should CREATE a new dog', function(done) {
            var options = {
                type: 'dogs',
                name: 'Rocky'
            };
            dog=new Miapp.Entity({client:client,data:options});
            dog.save(function(err, entity) {
                expect(!err, "dog not created");
                done();
            });
        });
        it('should RETRIEVE the dog', function(done) {
            if (!dog) {
                expect(false, "dog not created");
                done();
                return;
            }
            //once the dog is created, you can set single properties:
            dog.fetch(function(err) {
                expect(!err, "dog not fetched");
                done();
            });
        });
        it('should UPDATE the dog', function(done) {
            if (!dog) {
                expect(false, "dog not created");
                done();
                return;
            }
            //once the dog is created, you can set single properties:
            dog.set('breed', 'Dinosaur');

            //the set function can also take a JSON object:
            var data = {
                master: 'Fred',
                state: 'hungry'
            };
            //set is additive, so previously set properties are not overwritten
            dog.set(data);
            //finally, call save on the object to save it back to the database
            dog.save(function(err) {
                expect(!err, "dog not saved");
                done();
            });
        });
        it('should DELETE the dog', function(done) {
            if (!dog) {
                expect(false, "dog not created");
                done();
                return;
            }
            //once the dog is created, you can set single properties:
            dog.destroy(function(err) {
                expect(!err, "dog not removed");
                done();
            });
        });
    });
    describe('Miapp Collections', function() {
        var client = getClient();
        var dog, dogs = {};

        before(function(done) {
            //Make sure our dog doesn't already exist
            var options = {
                type: 'dogs',
                qs: {
                    limit: 50
                } //limit statement set to 50
            };

            client.createCollection(options, function(err, response, dogs) {
                if (!err) {
                    expect(!err, "could not retrieve list of dogs: " + dogs.error_description);
                    //we got 50 dogs, now display the Entities:
                    //do doggy cleanup
                    //if (dogs.hasNextEntity()) {
                    while (dogs.hasNextEntity()) {
                        //get a reference to the dog
                        var dog = dogs.getNextEntity();
                        console.warn(dog);
                        //notice('removing dog ' + dogname + ' from database');
                        if(dog === null) continue;
                        dog.destroy(function(err, data) {
                            expect(!err, dog.get('name') + " not removed: " + data.error_description);
                            if (!dogs.hasNextEntity()) {
                                done();
                            }
                        });
                    }
                    //} else {
                    done();
                    //}
                }
            });
        });
        it('should CREATE a new dogs collection', function(done) {
            var options = {
                client:client,
                type: 'dogs',
                qs: {
                    ql: 'order by index'
                }
            };
            dogs=new Miapp.Collection(options);
            expect(dogs!==undefined&&dogs!==null, "could not create dogs collection");
            done();
        });
        it('should CREATE dogs in the collection', function(done) {
            var timeout = function() {
              var totalDogs = 30;
              Array.apply(0, Array(totalDogs)).forEach(function(x, y) {
                  var dogNum = y + 1;
                  var options = {
                      type: 'dogs',
                      name: 'dog' + dogNum,
                      index: y
                  };
                  dogs.addEntity(options, function(err, dog) {
                      expect(!err, "dog not created");
                      if (dogNum === totalDogs) {
                          done();
                      }
                  });
              });
            };
            setTimeout(timeout,5000);
        });
        it('should RETRIEVE dogs from the collection', function(done) {
            while (dogs.hasNextEntity()) {
                //get a reference to the dog
                dog = dogs.getNextEntity();
            }
            if (done) done();
        });
        it('should RETRIEVE the next page of dogs from the collection', function(done) {
            if (dogs.hasNextPage()) {
                dogs.getNextPage(function(err) {
                    loop(done);
                });
            } else {
                done();
            }
        });
        it('should RETRIEVE the previous page of dogs from the collection', function(done) {
            if (dogs.hasPreviousPage()) {
                dogs.getPreviousPage(function(err) {
                    loop(done);
                });
            } else {
                done();
            }
        });
        it('should RETRIEVE an entity by UUID.', function(done) {
            var uuid=dogs.getFirstEntity().get("uuid");
            dogs.getEntityByUUID(uuid,function(err, data){
                expect(!err, "getEntityByUUID returned an error.");
                expect(uuid==data.get("uuid"), "We didn't get the dog we asked for.");
                done();
            })
        });
        it('should RETRIEVE the first entity from the collection', function() {
            expect(dogs.getFirstEntity(), "Could not retrieve the first dog");
        });
        it('should RETRIEVE the last entity from the collection', function() {
            expect(dogs.getLastEntity(), "Could not retrieve the last dog");
        });
        it('should reset the paging', function() {
            dogs.resetPaging();
            expect(!dogs.hasPreviousPage(), "Could not resetPaging");
        });
        it('should reset the entity pointer', function() {
            dogs.resetEntityPointer();
            expect(!dogs.hasPrevEntity(), "Could not reset the pointer");
            expect(dogs.hasNextEntity(), "Dog has no more entities");
            expect(dogs.getNextEntity(), "Could not retrieve the next dog");
        });
        it('should RETRIEVE the next entity from the collection', function() {
            expect(dogs.hasNextEntity(), "Dog has no more entities");
            expect(dogs.getNextEntity(), "Could not retrieve the next dog");
        });
        it('should RETRIEVE the previous entity from the collection', function() {
            expect(dogs.getNextEntity(), "Could not retrieve the next dog");
            expect(dogs.hasPrevEntity(), "Dogs has no previous entities");
            expect(dogs.getPrevEntity(), "Could not retrieve the previous dog");
        });
        it('should DELETE the entities from the collection', function(done) {
          function remove(){
            if(dogs.hasNextEntity()){
              dogs.destroyEntity(dogs.getNextEntity(),function(err, data){
                expect(!err, "Could not destroy dog.");
                remove();
              })
            }else if(dogs.hasNextPage()){
              dogs.getNextPage();
              remove();
            }else{
              done();
            }
          };
          setTimeout(remove, 6000);
        });
    });
    describe('Miapp Counters', function() {
        var client = getClient();
        var counter;
        var MINUTE = 1000 * 60;
        var HOUR = MINUTE * 60;
        var time = Date.now() - HOUR;

        it('should CREATE a counter', function(done) {
            counter = new Miapp.Counter({
                client: client,
                data: {
                    category: 'mocha_test',
                    timestamp: time,
                    name: "test",
                    counters: {
                        test: 0,
                        test_counter: 0
                    }
                }
            });
            expect(counter, "Counter not created");
            done();
        });
        it('should save a counter', function(done) {
            counter.save(function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
        it('should reset a counter', function(done) {
            time += MINUTE * 10;
            counter.set("timestamp", time);
            counter.reset({
                name: 'test'
            }, function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
        it("should increment 'test' counter", function(done) {
            time += MINUTE * 10;
            counter.set("timestamp", time);
            counter.increment({
                name: 'test',
                value: 1
            }, function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
        it("should increment 'test_counter' counter by 4", function(done) {
            time += MINUTE * 10;
            counter.set("timestamp", time);
            counter.increment({
                name: 'test_counter',
                value: 4
            }, function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
        it("should decrement 'test' counter", function(done) {
            time += MINUTE * 10;
            counter.set("timestamp", time);
            counter.decrement({
                name: 'test',
                value: 1
            }, function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
        it('should fetch the counter', function(done) {
            counter.fetch(function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
        it('should fetch counter data', function(done) {
            counter.getData({
                resolution: 'all',
                counters: ['test', 'test_counter']
            }, function(err, data) {
                expect(!err, data.error_description);
                done();
            });
        });
    });
    describe('Miapp Folders and Assets', function() {
        var client = getClient();
        var folder,
            asset,
            user,
            image_type,
            image_url = 'http://placekitten.com/160/90',
        // image_url="https://api.miapp.com/yourorgname/sandbox/assets/a4025e7a-8ab1-11e3-b56c-5d3c6e4ca93f/data",
            test_image,
            filesystem,
            file_url,
            filename = "kitten.jpg",
            foldername = "kittens",
            folderpath = '/test/' + Math.round(5000 * Math.random()),
            filepath = [folderpath, foldername, filename].join('/');


        it('before 01', function(done) {
            var req = new XMLHttpRequest();
            req.open('GET', image_url, true);
            req.responseType = 'blob';
            req.onload = function() {
                test_image = req.response;
                image_type = req.getResponseHeader('Content-Type');
                done();
            };
            req.onerror = function(err) {
                console.error(err);
                done();
            };
            req.send(null);
        });

        it('before 02', function(done) {
            var timeout = function() {
              client.request({
                method: 'GET',
                endpoint: 'Assets'
              }, function (err, data) {
                var assets = [];
                if (data && data.entities && data.entities.length) {
                  assets.concat(data.entities.filter(function (asset) {
                    return asset.name === filename
                  }));
                }
                if (assets.length) {
                  assets.forEach(function (asset) {
                    client.request({
                      method: 'DELETE',
                      endpoint: 'assets/' + asset.uuid
                    });
                  });
                  done();
                } else {
                  done();
                }
              });
            };
            setTimeout(timeout,5000);
        });

        it('before 03', function(done) {
          var timeout = function() {
            client.request({
              method: 'GET',
              endpoint: 'folders'
            }, function (err, data) {
              var folders = [];
              if (data && data.entities && data.entities.length) {
                folders.concat(data.entities.filter(function (folder) {
                  return folder.name === foldername
                }));
              }
              if (folders.length) {
                folders.forEach(function (folder) {
                  client.request({
                    method: 'DELETE',
                    endpoint: 'folders/' + folder.uuid
                  });
                });
                done();
              } else {
                done();
              }
            });
          };
          setTimeout(timeout,5000);
        });

        it('before 03', function(done) {
          var timeout = function() {
              user = new Miapp.Entity({
                  client: client,
                  data: {
                      type: 'users',
                      username: 'assetuser'
                  }
              });
              user.fetch(function(err, data) {
                  if (err) {
                      user.save(function() {
                          done();
                      })
                  } else {
                      done();
                  }
              });
          };
          setTimeout(timeout,5000);
        });

        it('should CREATE a folder', function(done) {
            folder = new Miapp.Folder({
                client: client,
                data: {
                    name: foldername,
                    owner: user.get("uuid"),
                    path: folderpath
                }
            }, function(err, response, folder) {
                expect(!err, err);
                done();
            });
        });
        it('should CREATE an asset', function(done) {
            asset = new Miapp.Asset({
                client: client,
                data: {
                    name: filename,
                    owner: user.get("uuid"),
                    path: filepath
                }
            }, function(err, response, asset) {
                if(err){
                    expect(false, err);
                }
                done();
            });
        });
        it('should RETRIEVE an asset', function(done) {
            asset.fetch(function(err, response, entity){
                if(err){
                    expect(false, err);
                }else{
                    asset=entity;
                }
                done();
            })
        });
        it('should upload asset data', function(done) {
            var timeout = function() {
              asset.upload(test_image, function (err, response, asset) {
                if (err) {
                  expect(false, err.error_description);
                }
                done();
              });
            };
            setTimeout(timeout,5000);
        });
        it('should retrieve asset data', function(done) {
            var timeout = function() {
              asset.download(function(err, response, asset) {
                  if(err){
                      expect(false, err.error_description);
                  }
                  expect(asset.get('content-type') == test_image.type, "MIME types don't match");
                  expect(asset.get('size') == test_image.size, "sizes don't match");
                  done();
              });
            };
            setTimeout(timeout,5000);
        });
        it('should add the asset to a folder', function(done) {
            folder.addAsset({
                asset: asset
            }, function(err, data) {
                if(err){
                    expect(false, err.error_description);
                }
                done();
            })
        });
        it('should list the assets from a folder', function(done) {
            folder.getAssets(function(err, assets) {
                if(err){
                    expect(false, err.error_description);
                }
                done();
            })
        });
        it('should remove the asset from a folder', function(done) {
            folder.removeAsset({
                asset: asset
            }, function(err, data) {
                if(err){
                    expect(false, err.error_description);
                }
                done();
            })
        });
        after(function(done) {
            asset.destroy(function(err, data) {
                if(err){
                    expect(false, err.error_description);
                }
                done();
            })
        });
        after(function(done) {
            folder.destroy(function(err, data) {
                if(err){
                    expect(false, err.error_description);
                }
                done();
            })
        });
    });
    */
});
