// Wrapper to load recommendation.js in a way Jest can instrument for coverage
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadRecommendation() {
  const code = fs.readFileSync(
    path.resolve(__dirname, '../../www/js/recommendation.js'),
    'utf-8'
  );
  const script = new vm.Script(code, { filename: 'www/js/recommendation.js' });
  const context = vm.createContext({ ...global });
  script.runInContext(context);
  return context.WaterRecommendation;
}

module.exports = { loadRecommendation };
