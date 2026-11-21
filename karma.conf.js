// Karma configuration (Angular unit tests).
//   ng test                                        watch mode, opens Chrome
//   ng test --watch=false --browsers=ChromeHeadlessCI --code-coverage     what the CI pipeline runs
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      // Tests run in a random order: a test that only passes after another one is a hidden dependency, better found early
      jasmine: { random: true },
      clearContext: false
    },
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/barcode'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    customLaunchers: {
      // Headless Chrome for the CI machine (a container: the sandbox is not available there)
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] }
    },
    restartOnFileChange: true
  });
};
