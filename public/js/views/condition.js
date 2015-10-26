var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var state = require('../state');
var modalSubview = require('./subviews/modal');
var helpers = require('../util/belief_helpers');

var viewState = {
  issue: {},
  condition: {},
  anonymousUserAttemptedVote: false
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
    } else if(e.target.id === "vote-yes-on-condition") {
      if(state.get("user") !== null) {
        api.post("/vote-on-condition", {
          id: viewState.issue._id,
          stand: viewState.position,
          conditionID: viewState.condition._id
        }, (data) => {
          viewState.issue = data.data;
          viewState.condition = _.findWhere(viewState.issue.conditions[viewState.position], {_id: viewState.condition._id});
          helpers.refreshIssue(data.data);
          this.updateState();
        });
      } else {
        viewState.anonymousUserAttemptedVote = true;
        this.updateState();
      }
    } else if(e.target.id === "vote-no-on-condition") {
      page.show('/stands/' + viewState.issue.slug + '/' + viewState.position);
    } else if(e.target.dataset.action === 'cancel-signup') {
      viewState.anonymousUserAttemptedVote = false;
      this.updateState();
    } else if(e.target.dataset.action === 'signup') {
      page.show('/signup');
    }
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    var submitProof;
    var proofs;
    var voteOnCondition;
    var beliefAtStake = state.get("user") && viewState.condition.dependents && !!_.findWhere(viewState.condition.dependents, {
      id: state.get("user")._id
    });
    var modal;
    var debug;

    if(!state.get("user") && viewState.anonymousUserAttemptedVote) {
      modal = modalSubview.render({
        title: "You must register in order to put your stake in this condition.",
        buttons: [
          {
            dataset: {
              action: 'signup'
            },
            text: 'Signup'
          },
          {
            dataset: {
              action: 'cancel-signup'
            },
            text: 'Cancel'
          }
        ]
      });
    }

    if(!helpers.isBeliever(viewState.issue, viewState.position)) {
      submitProof = h('div#submit-proof', [
        h('div.textarea-wrapper', [
          h('div.label', 'Describe the proof'),
          h('textarea')
        ]),
        h('div.button#submit-proof-button', 'Submit')
      ]);
    } else if(!beliefAtStake) {
      voteOnCondition = h('div#vote-on-condition', [
        h('div.button#vote-yes-on-condition', 'Yes'),
        h('div.button#vote-no-on-condition', 'No')
      ]);
    }

    if(beliefAtStake) {
      debug = h('div', 'Your belief is at stake.');
    }

    if((!helpers.isBeliever(viewState.issue, viewState.position) || beliefAtStake)) {
      if(viewState.condition.proofs) {
        proofs = viewState.condition.proofs.map((d) => {
          return h('li.proof', [
            h('div.description', d.description)
          ]);
        });        
      } else {
        proofs = h('div', 'No proofs available yet');
      }
    }

    return h('#condition-view', [
      h('div.title', viewState.condition.tagline),
      debug,
      voteOnCondition,
      submitProof,
      h('div.proofs-wrapper', [
        h('div.title', 'Proofs'),
        proofs
      ]),
      modal
    ]);
  }
}

module.exports = new conditionView();