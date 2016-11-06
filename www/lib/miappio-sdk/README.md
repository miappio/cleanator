[![Build Status](https://travis-ci.org/miappio/miappio-sdk.svg?branch=master)](https://travis-ci.org/miappio/miappio-sdk)

                                              proudly supported by miapp.io
                     _|                                    _|            
     _|_|_|  _|_|          _|_|_|  _|_|_|    _|_|_|              _|_|    
     _|    _|    _|  _|  _|    _|  _|    _|  _|    _|      _|  _|    _|  
     _|    _|    _|  _|  _|    _|  _|    _|  _|    _|      _|  _|    _|  
     _|    _|    _|  _|    _|_|_|  _|_|_|    _|_|_|    _|  _|    _|_|    
                                   _|        _|                          
                                   _|        _|                          
> :hamburger:  JS SDK to interact : your app &lt;-> miapp.io

> [Running](#running) | [Testing](#testing) | [APIs](#apis) | [DevOps](#devops) | [Thanks!](#thanks)

# Roll up our sleeves 

### Running

```bash
$ git clone xxxx
$ cd xxxxx
$ npm update
$ npm install

```

init = function (miappId, miappSalt, isOffline) 

setEndpoint = function (endpointURI) 
setOffline = function (b) {

login = function (login, password, updateProperties) {

logoff = function () {

syncPouchDb = function(pouchDB){

putFirstUserInEmptyPouchDB = function (pouchDB, firstUser) {
    
isPouchDBEmpty = function (pouchDB) {

.putInPouchDb = function(pouchDB, data){


### Testing


```bash
$ npm test
```


### DevOps

    

# Thanks

[@miapp.io](https://miapp.io) @mat_cloud @gandhi @dalai_lama @my_wife !  :)
