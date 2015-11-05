var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var helpers = require('../util/belief_helpers');
var state = require('../state');
var util = require('../util');

var viewState = {
  issues: []
};

var fadeOutEndHandler = (e) => {
  if(e.target.id === "content") {
    d.gbID("content").classList.remove("fade-out-view");
    d.gbID("content").removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], fadeOutEndHandler);
    page.show(viewState.nextRoute);    
  }
}

var fadeOut = (nextRoute) => {
  viewState.nextRoute = nextRoute;
  d.gbID("content").classList.add("fade-out-view");
  d.gbID("content").addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], fadeOutEndHandler);
}

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

      if(stand) {
        fadeOut('/stands/' + issue.dataset.slug + '/' + stand.stand);
      } else {
        fadeOut('/vote/' + issue.dataset.slug);
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
        return h('div.issue', {
          dataset: {
            id: d._id,
            slug: d.slug
          }
        }, [
          h('div.slug', util.capitalize(d.slug.replace('-', ' '))),
          h("div.description", d.description)
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