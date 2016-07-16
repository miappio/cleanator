// Karma configuration
// Generated on Thu Dec 03 2015 13:31:54 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      '../www/lib/ionic/js/ionic.bundle.js',
      '../www/lib/angular-gettext/dist/angular-gettext.js',
      '../www/lib/chance/dist/chance.min.js',
      '../node_modules/es5-shim/es5-shim.js',
      '../www/lib/pouchdb/dist/pouchdb.min.js',
      '../www/lib/angular-filter/dist/angular-filter.min.js',
      '../www/lib/Chart.js/Chart.min.js',
      '../www/lib/angular-chart.js/dist/angular-chart.min.js',
      '../www/lib/angular-mocks/angular-mocks.js',


      '../www/js/app.js',
      '../www/js/miapp.iu.js',
      '../www/js/miapp.iu.test.js',
      '../www/js/config/*.js',
      '../www/js/directives/*.js',
      '../www/js/filters/*.js',
      '../www/js/languages/*.js',
      '../www/js/services/data/*.js',
      '../www/js/services/a4p/*.js',
      '../www/js/services/*.js',

      '../www/views/*.js',
      '../www/views/chore/*.js',
      '../www/views/dashboard/*.js',
      '../www/views/login/*.js',
      '../www/views/user/*.js'

    ],


    // list of files to exclude
    exclude: [
      '../www/**/*.notused'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 8101,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  });
};
