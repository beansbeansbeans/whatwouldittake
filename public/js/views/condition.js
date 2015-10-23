var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var state = require('../state');
var helpers = require('../util/belief_helpers');

var viewState = {
  issue: {},
  condition: {}
};

class conditionView extends view {
  start(ctx) {
    super.start();
    viewState.position = ctx.params.side;
    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.condition = _.findWhere(viewState.issue.conditions[ctx.params.side]), {_id: ctx.params.condition};
    this.updateState();
  }

  render() {
    var proofs;
    var submitProof;

    if(!helpers.isBeliever(viewState.issue, viewState.position)) {
      submitProof = h('div#submit-proof', [
        h('div.textarea-wrapper', [
          h('div.label', 'Describe the proof'),
          h('textarea')
        ]),
        h('div.button#submit-proof-button', 'Submit')
      ]);
    }

    return h('#condition-view', [
      h('div.title', viewState.condition.tagline),
      proofs,
      submitProof
    ]);
  }
}

module.exports = new conditionView();