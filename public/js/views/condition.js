var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var state = require('../state');

var viewState = {
  issue: {},
  condition: {}
};

class conditionView extends view {
  start(ctx) {
    super.start();
    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.condition = _.findWhere(viewState.issue.conditions[ctx.params.side]), {_id: ctx.params.condition};
    this.updateState();
  }

  render() {
    return h('#condition-view', [
      h('div.title', viewState.condition.tagline)
    ]);
  }
}

module.exports = new conditionView();