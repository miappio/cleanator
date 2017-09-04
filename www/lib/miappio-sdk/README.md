
> Miapp.io SDK : Help your app to manage your users (signup, login, deletion ...) but also filestorage, crypto, analytics ... and more :-)

[![Build Status](https://travis-ci.org/miappio/miappio-sdk.svg?branch=master)](https://travis-ci.org/miappio/miappio-sdk) [![NPM version](https://badge.fury.io/js/miappio-sdk.svg)](https://www.npmjs.com/package/miappio-sdk) [![Bower version](https://badge.fury.io/bo/miappio-sdk.svg)](https://libraries.io/bower/miappio-sdk)

> [Install](https://github.com/miappio/miappio-sdk#install) | [APIs](https://github.com/miappio/miappio-sdk#api) | [Support](https://github.com/miappio/miappio-sdk#develop) | [Thanks!](https://github.com/miappio/miappio-sdk#thanks)


# 1) You're an app builder
Thank you for building great app. 
Miapp.io will support you to manager auth, session storage.

Like described in this blog post : https://goo.gl/P9fXQH 

### Install

With NPM :
```bash
npm install miappio-sdk --save-dev
```
With Bower :
```bash
bower install miappio-sdk
```

### API

All apis describe in [https://miappio.github.io/miappio-sdk/](https://miappio.github.io/miappio-sdk/)

# 2) You're a miapp.io dev
Thank you for your support !

Miapp.io is an Open Source project - we need you to provide great tools to great apps.

## Develop

Fork the project
```bash
git clone https://github.com/miappio/miappio-sdk.git
cd miappio-sdk
npm install
```
and pull request ...

### Connection


First Login (login , password, deviceIsOnline):

| Mode (dev / prod) | Device online | Miapp.io connection 	|
| --- | --- | --- |
| dev				|  				| **no** 				|
| prod				| yes			| **yes** 				|
| 					| no			| **reject with error**	| 

Renew authentication with Login (,, deviceIsOnline):

| Mode (dev / prod) | Device online | Miapp.io token still valid 	| Miapp.io connection 	|
| --- | --- | --- | --- |
| dev				|  				|  								| **no** 				|
| prod				| yes			| yes							| **yes** 				|
| 					| yes			| no							| **yes** 				| 
| 					| no			| yes							| **no**				|
| 					| no			| no							| **reject with error**	|


First DB Sync (deviceIsOnline):

| Mode (dev / prod) | Device online | Miapp.io connection 	|
| --- | --- | --- |
| dev				|  				| **no** 				|
| prod				| yes			| **yes** 				|
| 					| no			| **reject with error**	| 

Current DB Sync (deviceIsOnline):

| Mode (dev / prod) | Device online | Miapp.io connection 	|
| --- | --- | --- |
| dev				|  				| **no** 				|
| prod				| yes			| **yes** 				|
| 					| no			| **no**				| 

### Testing

With npm :
```bash
$ npm test
```

With a swagger UI :  
https://app.swaggerhub.com/api/mlefree/miapp-io_rest_api/


# Thanks

[@miapp.io](https://miapp.io) @mat_cloud @gandhi @dalai_lama

                                              proudly supported by miapp.io
                     _|                                    _|            
     _|_|_|  _|_|          _|_|_|  _|_|_|    _|_|_|              _|_|    
     _|    _|    _|  _|  _|    _|  _|    _|  _|    _|      _|  _|    _|  
     _|    _|    _|  _|  _|    _|  _|    _|  _|    _|      _|  _|    _|  
     _|    _|    _|  _|    _|_|_|  _|_|_|    _|_|_|    _|  _|    _|_|    
                                   _|        _|                          
 
 
