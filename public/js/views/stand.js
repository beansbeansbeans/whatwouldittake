var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var helpers = require('../util/belief_helpers');

var viewState = {
  issue: {},
  activelyContributing: false
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
    } else if(e.target.id === 'submit-what-would-it-take') {
      api.post('/contribute', {
        id: viewState.issue._id,
        stand: viewState.position,
        tagline: d.qs("#contribute .tagline textarea").value,
        moreInfo: d.qs("#contribute .more-info textarea").value
      }, (data) => {
        viewState.issue = data.data;
        helpers.refreshIssue(data.data);
        this.updateState();
      });
    } else if(closestCondition) {
      page.show('/stands/' + viewState.issue.slug + '/' + viewState.position + '/' + closestCondition.dataset.id);
    } else if(e.target.id === "toggle-contributing") {
      viewState.activelyContributing = true;
      this.updateState();
    } else if(e.target.id === 'cancel-what-would-it-take') {
      viewState.activelyContributing = false;
      this.updateState();
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
      frame = "You believe:";
      conditionsTitle = "to change your mind?";
    } else {
      frame = "Some believe:";
      // if(helpers.isFormerBeliever(viewState.issue, viewState.position)) {
      //   frame = "Some people (you used to be among them) believe that:";
      // } else {
      // }
      convertButton = h('div#convert-belief', 'I believe this');
      conditionsTitle = "to change their minds?";
    }

    if(!_.isEmpty(viewState.issue) && viewState.issue.conditions[viewState.position]) {
      conditions = viewState.issue.conditions[viewState.position].sort((a, b) => {
        if(a.dependents.length > b.dependents.length) { return -1; }
        if(a.dependents.length < b.dependents.length) { return 1; }
        return 0;
      }).map((d) => {
        var pendingCount = d.dependents.filter(x => x.status === 'pending').length;
        var confirmedCount = d.dependents.filter(x => x.status === 'confirmed').length;

        return h('div.condition', {
          dataset: {
            id: d._id
          }
        }, [
          h('div.tagline', d.tagline),
          h('div', pendingCount + util.pluralize(pendingCount, " person's opinion ", " people's opinions ") + " at stake"),
          h('div', confirmedCount + util.pluralize(confirmedCount, " person", " people") + " convinced by this")
        ]);
      });
    }

    return h('div#stand-view', [
      h('div.header', [
        h('div.prompt', frame),
        h('h1', viewState.issue[viewState.position]),
        h('div.actions', [
          h('div#see-other-side', 'See the other side'),
          convertButton
        ])
      ]),
      h('div.body', [
        h('div.title', [
          h('span', 'What would it take '),
          h('span', conditionsTitle)
        ]),
        h('div#contribute', {
          dataset: {
            active: viewState.activelyContributing
          }
        }, [
          h('div.label#toggle-contributing', 'Contribute'),
          h('div.form-container', [
            h('div.prompt', "Don't see anything convincing? Let us know what it would take."),
            h('div.input-container.tagline', [
              h('textarea', { 
                placeholder: "Description",
                maxlength: 255
              })
            ]),
            h('div.input-container.more-info', [
              h('textarea', { placeholder: "More information (optional)" })
            ]),
            h('div.button-container', [
              h('div.button#submit-what-would-it-take', 'Submit'),
              h('div.button#cancel-what-would-it-take', 'Cancel')
            ])
          ])
        ]),
        h('div.conditions-wrapper', [
          conditions
        ])
      ])
    ]);
  }
}

module.exports = new standView();