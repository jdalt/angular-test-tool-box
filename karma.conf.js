module.exports = function(config) {

  var coverageReporters = [{type: 'text-summary'}]

  if(process.env['TRAVIS']) {
    coverageReporters.push({type: 'text'})
  } else {
    coverageReporters.push({type: 'html', dir:'coverage/'})
  }

  config.set({

    preprocessors: {
      'src/!(backported)*.js': ['coverage']
    },

    frameworks: ['jasmine'],

    files: [
      'bower_components/jquery/dist/jquery.js', // jquery makes dom querying easier in tests, it's expected that it will be used with this module for testing
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/js-data/dist/js-data.js',
      'bower_components/js-data-angular/dist/js-data-angular.js',

      'src/*.js',
      'wrapper/*.js',
      'test/dummy/*.js',
      'test/*-test.js',
      'karma.start.js'
    ],

    reporters: ['dots', 'coverage'],
    coverageReporter: {
      reporters: coverageReporters
    },

    port: 9876,
    colors: true,

    logLevel: config.LOG_INFO,

    browsers: ['PhantomJS'],
    captureTimeout: 60000,
    reportSlowerThan: 500,
    autoWatch: true,
    singleRun: false

  })

}
