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
    super.start();

    _.bindAll(this, 'handleClick');

    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    this.updateState();

    mediator.subscribe("window_click", this.handleClick);
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
        }, () => {
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
        }, () => {
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
    return h('div#index', [
      h('h1', 'Statement:'),
      h('div', viewState.issue.slug),
      h('div', viewState.issue.aff),
      h('div#agree-button', 'I agree'),
      h('div#disagree-button', 'I disagree')
    ]);
  }
}

module.exports = new voteView();