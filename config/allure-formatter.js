/**
 * config/allure-formatter.js
 * -----------------------------------------------------------------------
 * cucumber-js loads custom `--format <module>` formatters by directly
 * instantiating whatever class/function the module exports as default,
 * calling `new FormatterConstructor(options)` with a SINGLE argument.
 *
 * `allure-cucumberjs`'s `CucumberJSAllureFormatter`, however, expects
 * three constructor arguments: `(options, allureRuntime, config)`.
 * Per the package's documented integration pattern, the fix is to
 * subclass it here, construct the `AllureRuntime` + label/link config
 * ourselves, and forward everything to `super()` — so cucumber-js only
 * ever needs to call `new (this exported class)(options)`.
 * -----------------------------------------------------------------------
 */

const { AllureRuntime } = require('allure-js-commons');
const { CucumberJSAllureFormatter } = require('allure-cucumberjs');

class AllureFormatter extends CucumberJSAllureFormatter {
  constructor(options) {
    super(options, new AllureRuntime({ resultsDir: 'allure-results' }), {
      labels: [
        { pattern: [/@(smoke|regression|critical)/], name: 'tag' },
      ],
      links: [],
    });
  }
}

module.exports = AllureFormatter;
module.exports.default = AllureFormatter;
