var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');

var viewState = {}

var dimensions = {};

class indexView extends view {
  start() {
    super.start();
  }

  didRender() {

  }

  handleResize() {

  }

  mount() {
    super.mount();
    this.handleResize();
  }

  stop() {
    super.stop();
  }

  render() {
    return h('div#index', [
      h('h1', 'Random issue')
    ]);
  }
}

module.exports = new indexView();