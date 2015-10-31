var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var util = require('../util');
var state = require('../state');
var modalSubview = require('./subviews/modal');
var helpers = require('../util/belief_helpers');
var headerSubview = require('./subviews/belief_header');

var viewState = {
  issue: {},
  condition: {},
  anonymousUserAttemptedVote: false,
  submittingProof: false
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
    if(e.target.id === 'convert-belief') {
      var stand = {
        id: viewState.issue._id,
        stand: viewState.position
      };

      if(state.get("user") !== null) {
        api.post('/vote', stand, (data) => {
          helpers.refreshIssue(data.data.issue);
          state.set("user", data.data.user);
          viewState.issue = data.data.issue;
          this.updateState();
        });        
      } else {
        var anonymous_activity = state.get("anonymous_activity");
        if(!anonymous_activity.stands) {
          anonymous_activity.stands = [];
        }

        var matchingStand = _.findWhere(anonymous_activity.stands, {id: stand.id });
        if(matchingStand) {
          matchingStand.stand = viewState.position;
        } else {
          anonymous_activity.stands.push(stand);
        }

        state.set("anonymous_activity", anonymous_activity);
        this.updateState();
      }
    } else if(e.target.id === 'see-other-side') {
      page.show('/stands/' + viewState.issue.slug + '/' + (viewState.position === 'aff' ? 'neg' : 'aff'));
    } else if(e.target.id === "submit-proof-button") {
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
    } else if(e.target.classList.contains("vote")) {
      var closestProof = e.target.closest(".proof");
      api.post('/convinced-by-proof', {
        id: viewState.issue._id,
        stand: viewState.position,
        conditionID: viewState.condition._id,
        proofID: closestProof.dataset.id
      }, (data) => {
        helpers.refreshIssue(data.data.issue);
        viewState.submittingProof = false;
        state.set("user", data.data.user);
        page.show('/stands/' + viewState.issue.slug + '/' + viewState.position)
      });
    } else if(e.target.id === 'toggle-proof-submission') {
      viewState.submittingProof = true;
      this.updateState();
    } else if(e.target.id === 'cancel-submit-proof-button') {
      viewState.submittingProof = false;
      this.updateState();
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
    var frame;
    var pendingCount = viewState.condition.dependents && viewState.condition.dependents.filter(x => x.status === 'pending').length;
    var confirmedCount = viewState.condition.dependents && viewState.condition.dependents.filter(x => x.status === 'confirmed').length;

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
      submitProof = h('div#submit-proof', {
        dataset: { active: viewState.submittingProof }
      }, [
        h('div#toggle-proof-submission', 'Contribute'),
        h('div.form-container', [
          h('div.textarea-wrapper', [
            h('textarea', {
              placeholder: 'Prove the statement above.',
              maxlength: 1000
            })
          ]),
          h('div.button-container', [
            h('div.button#submit-proof-button', 'Submit'),
            h('div.button#cancel-submit-proof-button', 'Cancel')
          ])
        ])
      ]);
    } else if(!beliefAtStake) {
      frame = 'Would this change your mind?';
      voteOnCondition = h('div#vote-on-condition', [
        h('div.button#vote-yes-on-condition', 'Yes'),
        h('div.button#vote-no-on-condition', 'No')
      ]);
    }

    if(beliefAtStake) {
      frame = 'But this would change your mind:';
    } else {
      if(!helpers.isBeliever(viewState.issue, viewState.position)) {
        frame = 'But this could change their minds:'
      }
    }

    if((!helpers.isBeliever(viewState.issue, viewState.position) || beliefAtStake)) {
      if(viewState.condition.proofs && viewState.condition.proofs.length) {
        proofs = h('div.proofs-wrapper', [
          h('div.title', 'See anything convincing?'),
          submitProof,
          h('ul', viewState.condition.proofs.sort((a, b) => {
            if(a.believers.length > b.believers.length) { return -1; }
            if(a.believers.length < b.believers.length) { return 1; }
            return 0;
          }).map((d) => {
            var button;
            if(beliefAtStake) {
              button = h('div.vote.button', "I'm convinced");
            }
            return h('li.proof', {
              dataset: { id: d._id }
            }, [
              h('div.tagline', d.description),
              h('div.pending', d.believers.length + ' people convinced'),
              button
            ]);
          }))
        ]);
      } else {
        proofs = h('div.proofs-wrapper', [
          h('div.title', 'No proofs available yet.'),
          submitProof
        ]);
      }
    }

    return h('#condition-view', [
      headerSubview.render({
        issue: viewState.issue,
        position: viewState.position
      }),
      h('div.body', [
        h('div.frame', frame),
        h('div.title', viewState.condition.tagline),
        h('div.pending', pendingCount + util.pluralize(pendingCount, " person's opinion ", " people's opinions ") + " at stake"),
        h('div.confirmed', confirmedCount + util.pluralize(confirmedCount, " person", " people") + " convinced"),
        voteOnCondition,
        proofs,
        modal
      ])
    ]);
  }
}

module.exports = new conditionView();