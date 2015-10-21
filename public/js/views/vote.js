var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');

var viewState = {
  issue: {}
};

var dimensions = {};

class voteView extends view {
  start(ctx) {
    super.start();
    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    this.updateState();
  }

  inflate() {

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
      h('h1', 'Statement:'),
      h('div', viewState.issue.slug)
    ]);
  }
}

module.exports = new voteView();