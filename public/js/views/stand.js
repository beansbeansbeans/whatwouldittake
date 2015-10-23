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
    var closestCondition = e.target.closest(".condition");
    if(e.target.id === 'convert-belief') {
      var stand = {
        id: viewState.issue._id,
        stand: viewState.position
      };

      if(state.get("user") !== null) {
        api.post('/vote', stand, (data) => {
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
    } else if(e.target.id === 'see-other-side') {
      page.show('/stands/' + viewState.issue.slug + '/' + (viewState.position === 'aff' ? 'neg' : 'aff'));
    } else if(e.target.id === 'submit-what-would-it-take') {
      api.post('/contribute', {
        id: viewState.issue._id,
        stand: viewState.position,
        tagline: d.qs("#contribute .tagline textarea").value,
        moreInfo: d.qs("#contribute .more-info textarea").value
      }, (data) => {
        viewState.issue = data.data;
        var issues = state.get("issues");
        var thisIssueIndex = _.findIndex(issues, x => x.slug === viewState.issue.slug);
        issues[thisIssueIndex] = data.data;
        state.set("issues", issues);
        api.setCache("/issues", issues);
        this.updateState();
      });
    } else if(closestCondition) {
      page.show('/stands/' + viewState.issue.slug + '/' + viewState.position + '/' + closestCondition.dataset.id);
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
    var conditions;
    var conditionsTitle;

    if(helpers.isBeliever(viewState.issue, viewState.position)) {
      frame = "You believe that:";
      conditionsTitle = "What would it take to change your mind?";
    } else {
      frame = "Some people believe that:";
      convertButton = h('div.button#convert-belief', 'I believe this');
      conditionsTitle = "What could it take to change their minds?";
    }

    if(!_.isEmpty(viewState.issue) && viewState.issue.conditions[viewState.position]) {
      conditions = viewState.issue.conditions[viewState.position].map((d) => {
        return h('div.condition', {
          dataset: {
            id: d._id
          }
        }, [
          h('div', d.tagline)
        ]);
      });
    }

    return h('div#stand-view', [
      h('h1', frame),
      h('div', viewState.issue.slug),
      h('div', viewState.issue[viewState.position]),
      h('div.button#see-other-side', 'See the other side'),
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
      h('div.conditions-wrapper', [
        h('div.title', conditionsTitle),
        conditions
      ])
    ]);
  }
}

module.exports = new standView();