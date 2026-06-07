// Wrapper to load index.js app object for testing
const fs = require('fs');
const path = require('path');

function loadApp(WaterRecommendation) {
  const code = fs.readFileSync(
    path.resolve(__dirname, '../../www/js/index.js'),
    'utf-8'
  );

  // Remove auto-initialization call at the end
  const modifiedCode = code.replace('app.initialize();', '// initialization disabled for testing');

  const factory = new Function('WaterRecommendation', modifiedCode + '\nreturn app;');
  return factory(WaterRecommendation);
}

function loadHtml() {
  return fs.readFileSync(
    path.resolve(__dirname, '../../www/index.html'),
    'utf-8'
  );
}

module.exports = { loadApp, loadHtml };
