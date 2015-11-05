var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var helpers = require('../util/belief_helpers');

var viewState = {
  issue: {}
};

var dimensions = {};

var vote = (stand) => {
  if(state.get("user") !== null) {
    if(helpers.isBeliever(viewState.issue, stand)) {
      page.show('/stands/' + viewState.issue.slug + '/' + stand);
    } else {
      api.post('/vote', {
        id: viewState.issue._id,
        stand: stand
      }, (data) => {
        helpers.refreshIssue(data.data.issue);
        state.set("user", data.data.user);
        page.show('/stands/' + viewState.issue.slug + '/' + stand);
      });                  
    }
  } else {
    var anonymous_activity = state.get("anonymous_activity");
    if(!anonymous_activity.stands) {
      anonymous_activity.stands = [];
    }
    anonymous_activity.stands.push({
      id: viewState.issue._id,
      stand: stand
    });
    state.set("anonymous_activity", anonymous_activity);
    page.show('/stands/' + viewState.issue.slug + '/' + stand);
  }
};

class voteView extends view {
  start(ctx) {
    if(!ctx.params.issue) {
      return page.redirect('/vote/' + state.get("issues")[Math.round(Math.random() * (state.get("issues").length - 1))].slug);
    }

    super.start();

    _.bindAll(this, 'handleClick', 'inflate');

    mediator.subscribe("window_click", this.handleClick);

    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    this.updateState();
  }

  didRender() {

  }

  handleResize() {

  }

  handleClick(e) {
    if(e.target.id === "agree-button") {
      vote('aff');
    } else if(e.target.id === "disagree-button") {
      vote('neg');
    }
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
    var userStand = null;
    if(state.get("user") !== null) {
      userStand = _.findWhere(state.get("user").stands, {id: viewState.issue._id});
    }

    return h('div#vote-page', [
      h('div.prompt', 'The belief:'),
      h('h1', viewState.issue.aff),
      h('div#agree-button.button', {
        dataset: {
          active: userStand && userStand.stand === 'aff'
        }
      }, 'I agree'),
      h('div#disagree-button.button', {
        dataset: {
          active: userStand && userStand.stand === 'neg'
        }
      }, 'I disagree')
    ]);
  }
}

module.exports = new voteView();