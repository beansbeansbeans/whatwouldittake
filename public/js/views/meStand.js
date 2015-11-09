var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');

var viewState = {}

var dimensions = {};

class meStandView extends view {
  start(ctx) {
    super.start();
    viewState.issue = _.findWhere(state.get("issues"), { slug: ctx.params.issue });
    this.updateState();
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
    var issue;
    var user = state.get("user");
    var userOnIssue;
    var stand;
    var condition;
    var conditionTagline;
    var conditionAuthor;
    var pendingCount;
    var confirmedCount;
    var sourcesForCondition;
    var sourcesOfProof;
    var proofTagline;

    if(viewState.issue && user) {
      userOnIssue = _.findWhere(user.stands, { id: viewState.issue._id});
      stand = userOnIssue.stand;
      issue = viewState.issue[stand];

      condition = _.findWhere(viewState.issue.conditions[stand === 'aff' ? 'neg' : 'aff'], {_id: userOnIssue.previous.conditionID});

      conditionAuthor = condition.author ? condition.author.name : '';
      pendingCount = condition.dependents && condition.dependents.filter(x => x.status === 'pending').length;
      confirmedCount = condition.dependents && condition.dependents.filter(x => x.status === 'confirmed').length;

      conditionTagline = condition.tagline;
      proofTagline = _.findWhere(condition.proofs, { _id: userOnIssue.previous.proofID }).description;
    }

    return h('div#me-stand', [
      h('div.header', [
        h('div.prompt', "You believe:"),
        h('h1', issue)
      ]),
      h("div.body", [
        h('div.frame', 'What it took to change your mind:'),
        h('div.main-condition', [
          conditionAuthor,
          h('div.pending', pendingCount + ' ' + util.pluralize(pendingCount, 'opinion') + "  at stake"),
          h('span.separator', '/'),
          h('div.confirmed', {
            dataset: {
              confirmedCount: confirmedCount,
              exists: confirmedCount > 0
            }
          }, confirmedCount + " convinced"),
          h('div.title', conditionTagline),
          sourcesForCondition
        ])
      ]),
      h('div.proof', [
        h('div.tagline', proofTagline),
        sourcesOfProof
      ])
    ]);
  }
}

module.exports = new meStandView();