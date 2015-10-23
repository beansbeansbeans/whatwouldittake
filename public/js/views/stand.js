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
          state.set("user", data.data);
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
    } else if(e.target.id === 'submit-what-would-it-take') {
      api.post('/contribute', {
        id: viewState.issue._id,
        stand: viewState.position,
        tagline: d.qs("#contribute .tagline textarea").value,
        moreInfo: d.qs("#contribute .more-info textarea").value
      }, (data) => {
        viewState.issue = data.data;
        this.updateState();
      });
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
    var conditions;

    if(issue && issue.stand === viewState.position) {
      frame = "You believe that:";
    } else {
      frame = "Some people believe that:";
      convertButton = h('div.button#convert-belief', 'I believe this');
    }

    if(!_.isEmpty(viewState.issue) && viewState.issue.conditions[viewState.position]) {
      conditions = viewState.issue.conditions[viewState.position].map((d) => {
        return h('div.condition', [
          h('div', d.tagline)
        ]);
      });
    }

    return h('div#index', [
      h('h1', frame),
      h('div', viewState.issue.slug),
      h('div', viewState.issue[viewState.position]),
      convertButton,
      h('div#contribute', [
        h('div', 'Contribute a what-would-it-take'),
        h('div.input-container.tagline', [
          h('div.label', 'Tagline'),
          h('textarea')
        ]),
        h('div.input-container.more-info', [
          h('div.label', 'More information (optional)'),
          h('textarea')
        ]),
        h('div.button#submit-what-would-it-take', 'Submit')
      ]),
      conditions
    ]);
  }
}

module.exports = new standView();