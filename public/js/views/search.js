var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var sparklineSubview = require('./subviews/sparkline');

class searchView extends view {

  render() {
    return h('div#search', [
      h('div', 'this is the search page')
    ]);
  }
}

module.exports = new searchView();