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
      if(state.get("user") !== null) {
        api.post('/vote', {
          id: viewState.issue._id,
          stand: 'aff'
        }, (data) => {
          api.setCache("user", data.data);
          page.show('/stands/' + viewState.issue.slug + '/aff');
        });        
      } else {
        page.show('/stands/' + viewState.issue.slug + '/aff');
      }
    } else if(e.target.id === "disagree-button") {
      if(state.get("user") !== null) {
        api.post('/vote', {
          id: viewState.issue._id,
          stand: 'neg'
        }, (data) => {
          api.setCache("user", data.data);
          page.show('/stands/' + viewState.issue.slug + '/neg');
        });        
      } else {
        page.show('/stands/' + viewState.issue.slug + '/neg');
      }
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
      h('h1', 'Statement:'),
      h('div', viewState.issue.slug),
      h('div', viewState.issue.aff),
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