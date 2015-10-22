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

class standView extends view {
  start(ctx) {
    super.start();

    _.bindAll(this, 'handleClick');

    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.position = ctx.params.side;
    this.updateState();

    mediator.subscribe("window_click", this.handleClick);
  }

  didRender() {

  }

  handleResize() {

  }

  handleClick(e) {
    
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    var frame = "Some people believe that:";
    var user = state.get("user") || state.get("anonymous_activity");
    var issue = _.findWhere(user.stands, {id: viewState.issue._id});
    if(issue && issue.stand === viewState.position) {
      frame = "You believe that:";
    }

    return h('div#index', [
      h('h1', frame),
      h('div', viewState.issue.slug),
      h('div', viewState.issue[viewState.position])
    ]);
  }
}

module.exports = new standView();