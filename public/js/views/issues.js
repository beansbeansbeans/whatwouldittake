var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var animationHelpers = require('../util/animation_helpers');
var helpers = require('../util/belief_helpers');
var state = require('../state');
var util = require('../util');

var viewState = {
  issues: []
};

class issuesView extends view {
  start() {
    super.start();

    _.bindAll(this, 'handleClick');

    api.get('/issues', (err, data) => {
      viewState.issues = data.data;
      this.updateState();
    });    

    mediator.subscribe("window_click", this.handleClick);
  }

  handleClick(e) {
    var issue = e.target.closest('.issue');
    if(issue) {
      var user = state.get("user");
      var stand;
      if(user) {
        stand = _.findWhere(user.stands, {id: issue.dataset.id});
      }

      if(e.target.classList.contains("label")) {
        animationHelpers.fadeOut('/' + issue.dataset.slug);
      } else if(stand) {
        animationHelpers.fadeOut('/stands/' + issue.dataset.slug + '/' + stand.stand);
      } else {
        animationHelpers.fadeOut('/vote/' + issue.dataset.slug);
      }
    }
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    var issues;

    if(viewState.issues.length) {
      issues = viewState.issues.map((d) => {
        var label;
        var userOnIssue;
        if(state.get("user") && state.get("user").stands.length) {
          userOnIssue = _.findWhere(state.get("user").stands, { id: d._id });
          label = h('div.label', {
            dataset: { stand: userOnIssue ? userOnIssue.stand : '' }
          }, userOnIssue ? (userOnIssue.stand === 'aff' ? 'y' : 'n') : '');
        }

        return h('div.issue', {
          dataset: {
            id: d._id,
            slug: d.slug,
            containsLabel: typeof label !== 'undefined'
          }
        }, [
          label,
          h('div.body', [
            h('div.slug', d.title),
            h("div.description", d.description)
          ])
        ]);
      });
    }

    return h('div#issues-view', [
      h('h1', 'The issues'),
      issues
    ]);
  }
}

module.exports = new issuesView();