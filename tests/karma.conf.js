module.exports = function(config){
  'use strict';
  config.set({

    basePath : '../app/',

    files : [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-gestures/gestures.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-gettext/dist/angular-gettext.js',
      'bower_components/angular-filter/dist/angular-filter.js',
      '../node_modules/es5-shim/es5-shim.js', // needed for pouchdb : http://stackoverflow.com/questions/24971148/setup-karma-unit-tests-with-pouchdb
      '../node_modules/es5-shim/es5-sham.js',
      'bower_components/pouchdb/dist/pouchdb.js',
      'bower_components/chance/chance.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/Chart.js/Chart.js',
      'bower_components/angular-chart.js/dist/angular-chart.js',
      //'test/lib/**/*.js',
      '../node_modules/jasmine-as-promised/src/jasmine-as-promised.js',
      '../node_modules/angular-mocks/angular-mocks.js',
      'javascripts/*.js',
      'javascripts/config/*.js',
      'javascripts/controllers/*.js',
      'javascripts/directives/*.js',
      'javascripts/filters/*.js',
      'javascripts/languages/*.js',
      'javascripts/services/*.js',
      'javascripts/services/a4p/*.js',
      'javascripts/services/data/*.js',
      'views/*.js',
      'views/**/*.js'
    ],

    preprocessors : {
      'javascripts/**/*.js': ['coverage'],
      'views/**/*.js': ['coverage']
    },
    coverageReporter : {
      type : 'html',
      dir : '../build/coverage/'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],
    //browsers : ['PhantomJS','Chrome'],

    reporters: ['progress', 'dots', 'coverage', 'growl', 'html'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-html-reporter',
            'karma-phantomjs-launcher',
            'karma-ng-scenario',
            'karma-coverage',
            'karma-growl'
            ],

    junitReporter : {
      outputFile: 'build/test/karma_unit.xml',
      suite: 'unit'
    },// the default configuration
    htmlReporter: {
      outputDir: 'build/test/karma_html'
    }

  });
};
