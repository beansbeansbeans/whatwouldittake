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

    _.bindAll(this, 'handleClick');

    viewState.position = ctx.params.side;
    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.condition = _.findWhere(viewState.issue.conditions[ctx.params.side], {_id: ctx.params.condition});
    this.updateState();

    mediator.subscribe("window_click", this.handleClick);
  }

  handleClick(e) {
    if(e.target.id === "submit-proof-button") {
      api.post("/contribute-proof", {
        id: viewState.issue._id,
        stand: viewState.position,
        conditionID: viewState.condition._id,
        description: d.qs("#submit-proof textarea").value
      }, (data) => {
        viewState.issue = data.data;
        viewState.condition = _.findWhere(viewState.issue.conditions[viewState.position], {_id: viewState.condition._id});
        helpers.refreshIssue(data.data);
        this.updateState();
      });
    }
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    var submitProof;
    var proofs;

    if(!helpers.isBeliever(viewState.issue, viewState.position)) {
      submitProof = h('div#submit-proof', [
        h('div.textarea-wrapper', [
          h('div.label', 'Describe the proof'),
          h('textarea')
        ]),
        h('div.button#submit-proof-button', 'Submit')
      ]);
    }

    if(viewState.condition.proofs) {
      proofs = viewState.condition.proofs.map((d) => {
        return h('li.proof', [
          h('div.description', d.description)
        ]);
      });
    }

    return h('#condition-view', [
      h('div.title', viewState.condition.tagline),
      submitProof,
      h('div.proofs-wrapper', [
        h('div.title', 'Proofs'),
        proofs
      ])
    ]);
  }
}

module.exports = new conditionView();