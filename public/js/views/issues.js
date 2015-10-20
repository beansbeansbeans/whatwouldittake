var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

class issuesView extends view {
  start() {
    super.start();

  }
  render() {
    return h('div#issues-view', [
      h('div', 'The issues')
    ]);
  }
}

module.exports = new issuesView();