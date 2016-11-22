// Karma configuration
// Generated on Sun Nov 20 2016 17:07:04 GMT+0200 (EET)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'node_modules/angular/angular.min.js',
            'node_modules/angular-route/angular-route.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-cookies/angular-cookies.js',
            'node_modules/angular-resource/angular-resource.js',
            'node_modules/angular-oauth2/dist/angular-oauth2.js',
            'node_modules/angular-bootstrap-alert-modals/dist/angular-bootstrap-alert-modals.min.js',
            'node_modules/angular-modal-service/dst/angular-modal-service.js',
            'app/**/*.js',
            'app/**/*.html'
        ],

        ngHtml2JsPreprocessor: {
            // create a single module that contains templates from all the files
            moduleName: 'templates'
        },

        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
          'app/**/!(*spec|*mock).js': ['coverage'],
          'app/**/*.html': ['ng-html2js']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
