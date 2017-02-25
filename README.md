# [![Cleanator](https://miappio.github.io/cleanator/img/background/screen02.jpg)](https://miapp.io/app/cleanator/download)
[![Build Status](https://travis-ci.org/miappio/cleanator.svg?branch=master)](https://travis-ci.org/miappio/cleanator)
[![codecov](https://codecov.io/gh/miappio/cleanator/branch/master/graph/badge.svg)](https://codecov.io/gh/miappio/cleanator)


                                              proudly supported by miapp.io
                     _|                                    _|            
     _|_|_|  _|_|          _|_|_|  _|_|_|    _|_|_|              _|_|    
     _|    _|    _|  _|  _|    _|  _|    _|  _|    _|      _|  _|    _|  
     _|    _|    _|  _|  _|    _|  _|    _|  _|    _|      _|  _|    _|  
     _|    _|    _|  _|    _|_|_|  _|_|_|    _|_|_|    _|  _|    _|_|    
                                   _|        _|                          
                                   _|        _|                          
> :hamburger:  tasty and useful chore organizer for couple.

> [Running](#running) | [Testing](#testing) | [APIs](#apis) | [DevOps](#devops) | [Thanks!](#thanks)

# Roll up our sleeves 

### Running

```bash
$ git clone xxxx
$ cd xxxxx
$ npm update
$ npm install -g cordova ionic gulp
$ npm install

$ cp .config.demo.js .config.js
$ cp .config.demo.js .config.test.js

$ gulp watch
$ npm start 

?
$ ionic serve --port $PORT --nolivereload  --address $IP
```

### Testing


```bash
$ npm test

$ git add .
$ git commit -am "my commit..."
$ npm version


$ npm run text:extract
```


### DevOps

    cd ~/.ssh
    mkdir key_backup
    cp id_rsa* key_backup
    ssh-keygen -t rsa -C "your_email@example.com"
    cat id_rsa.pub


### Deploy ?

//npm info cordova version
//cordova platform ls
ionic platform ls
ionic requirements
ionic build

//cordova run ios
//cordova run android --device
ionic run ios
ionic run android --device

//adb kill-server
adb devices
adb logcat

//pgb


# Thanks

[@miapp.io](https://miapp.io) @mat_cloud @gandhi @dalai_lama @my_wife !  :)


