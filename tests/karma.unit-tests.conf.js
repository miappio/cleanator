// Karma configuration
// Generated on Thu Dec 03 2015 13:31:54 GMT+0100 (CET)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        plugins: [
            'karma-jasmine',
            'karma-coverage',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher'
        ],


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [

            'www/lib/ionic/js/ionic.bundle.js',
            'www/lib/angular-mocks/angular-mocks.js',
            // 'node_modules/angular/angular.js',
            //'node_modules/angular-mocks/angular-mocks.js',

            'www/lib/angular-gettext/dist/angular-gettext.js',
            'www/lib/pouchdb/dist/pouchdb.min.js',
            'www/lib/angular-filter/dist/angular-filter.min.js',
            'www/lib/chance/dist/chance.min.js',
            //'../node_modules/es5-shim/es5-shim.js',
            'www/lib/Chart.js/Chart.min.js',
            'www/lib/angular-chart.js/dist/angular-chart.min.js',
            'www/lib/crypto-js/crypto-js.js',
            'www/lib/miappio-sdk/dist/miappio.sdk.js',

            'www/js/app.js',
            'www/js/app.test.js',
            '.config.example.js',
            'www/js/directives/*.js',
            'www/js/filters/*.js',
            'www/js/languages/*.js',
            'www/js/services/*.js',

            'www/views/*.js',
            'www/views/chore/*.js',
            'www/views/dashboard/*.js',
            'www/views/login/*.js',
            'www/views/user/*.js',

            // fixtures
            {pattern: 'www/data/*.json', watched: true, served: true, included: false}

        ],


        // list of files to exclude
        exclude: [
            'www/**/*.notused*'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'www/js/**/!(*.test).js': ['coverage'],
            'www/views/**/!(*.test).js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        // optionally, configure the reporter
        coverageReporter: {
            // specify a common output directory
            //dir: 'build/coverage',
            reporters: [
                // reporters not supporting the `file` property
                {type: 'html', subdir: 'report-html'},
                {type: 'lcov', subdir: 'report-lcov'},
                // reporters supporting the `file` property, use `subdir` to directly
                // output them in the `dir` directory
                // { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
                {type: 'lcovonly', subdir: '.'}
                // { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
                // { type: 'text', subdir: '.', file: 'text.txt' },
                // { type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
            ]
        },


        // web server port
        port: 8101,


        // enable / disable colors in the output (reporters and logs)
        colors: true,



        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        //client: {
        //    captureConsole: true
        //},


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],
        //browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultanous
        concurrency: Infinity
    });
};
