var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

class indexView extends view {
  render() {
    return h('div#index', [
      h('h1', 'STORIES OF'),
      h('ul', [
        h('li', 'story one'),
        h('li', 'story two'),
        h('li', 'story three')
      ])
    ]);
  }
}

module.exports = new indexView();