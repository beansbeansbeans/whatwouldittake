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

class standView extends view {
  start(ctx) {
    super.start();

    _.bindAll(this, 'handleClick');

    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.position = ctx.params.side;
    this.updateState();

    mediator.subscribe("window_click", this.handleClick);
  }

  didRender() {

  }

  handleResize() {

  }

  handleClick(e) {
    if(e.target.id === 'convert-belief') {
      var stand = {
        id: viewState.issue._id,
        stand: viewState.position
      };

      if(state.get("user") !== null) {
        api.post('/vote', stand, (data) => {
          api.setCache("user", data.data);
          this.updateState();
        });        
      } else {
        var anonymous_activity = state.get("anonymous_activity");
        if(!anonymous_activity.stands) {
          anonymous_activity.stands = [];
        }
        anonymous_activity.stands.push(stand);
        state.set("anonymous_activity", anonymous_activity);
        this.updateState();
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
    var convertButton;
    var frame;
    var user = state.get("user") || state.get("anonymous_activity");
    var issue = _.findWhere(user.stands, {id: viewState.issue._id});
    if(issue && issue.stand === viewState.position) {
      frame = "You believe that:";
    } else {
      frame = "Some people believe that:";
      convertButton = h('div.button#convert-belief', 'I believe this');
    }

    return h('div#index', [
      h('h1', frame),
      h('div', viewState.issue.slug),
      h('div', viewState.issue[viewState.position]),
      convertButton
    ]);
  }
}

module.exports = new standView();