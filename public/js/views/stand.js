var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var helpers = require('../util/belief_helpers');
var headerSubview = require('./subviews/belief_header');

var descriptionTextareaMaxLength = 255;
var moreInfoTextareaMaxLength = 1000;

var pristineState = {
  issue: {},
  sourceCount: 1,
  activelyContributing: false,
  descriptionTextarea: descriptionTextareaMaxLength,
  moreInfoTextarea: moreInfoTextareaMaxLength
};
var viewState = JSON.parse(JSON.stringify(pristineState));

var dimensions = {};

class standView extends view {
  start(ctx) {
    super.start();

    _.bindAll(this, 'handleClick', 'handleKeydown');

    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.position = ctx.params.side;
    this.updateState();

    mediator.subscribe("window_click", this.handleClick);
    mediator.subscribe("window_keydown", this.handleKeydown);
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
      if(d.qs("#contribute .tagline textarea").value.length) {
        api.post('/contribute', {
          id: viewState.issue._id,
          stand: viewState.position,
          sources: [].filter.call(d.qsa('.source-wrapper'), (el) => {
            return el.querySelector(".source-href").value.length;
          }).map((el) => {
            return {
              address: el.querySelector(".source-href").value,
              display: el.querySelector(".source-display").value
            }
          }),
          tagline: d.qs("#contribute .tagline textarea").value,
          moreInfo: d.qs("#contribute .more-info textarea").value
        }, (data) => {
          viewState.issue = data.data;
          viewState.activelyContributing = false;
          viewState.sourceCount = 1;
          helpers.refreshIssue(data.data);
          this.updateState();
        });
      }
    } else if(closestCondition) {
      page.show('/stands/' + viewState.issue.slug + '/' + viewState.position + '/' + closestCondition.dataset.id);
    } else if(e.target.id === "toggle-contributing") {
      viewState.activelyContributing = true;
      this.updateState();
    } else if(e.target.id === 'cancel-what-would-it-take') {
      viewState.activelyContributing = false;
      viewState.sourceCount = 1;
      this.updateState();
    } else if(e.target.classList.contains("add-more")) {
      viewState.sourceCount++;
      this.updateState();
    }
  }

  handleKeydown() {
    viewState.descriptionTextarea = descriptionTextareaMaxLength - d.qs("#contribute .tagline textarea").value.length;
    viewState.moreInfoTextarea = moreInfoTextareaMaxLength - d.qs("#contribute .more-info textarea").value.length;
    this.updateState();
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
    mediator.unsubscribe("window_keydown", this.handleKeydown);
    viewState = JSON.parse(JSON.stringify(pristineState));
  }

  render() {
    var conditions;
    var conditionsTitle;

    if(helpers.isBeliever(viewState.issue, viewState.position)) {
      conditionsTitle = "What would it take to change your mind?";
    } else {
      conditionsTitle = "What it would take to change their minds:";
    }

    if(!_.isEmpty(viewState.issue) && viewState.issue.conditions[viewState.position]) {
      conditions = viewState.issue.conditions[viewState.position].sort((a, b) => {
        if(a.dependents.length > b.dependents.length) { return -1; }
        if(a.dependents.length < b.dependents.length) { return 1; }
        return 0;
      }).map((d) => {
        var pendingCount = d.dependents.filter(x => x.status === 'pending').length;
        var confirmedCount = d.dependents.filter(x => x.status === 'confirmed').length;
        var sourceList;

        if(d.sources && d.sources.length) {
          sourceList = h('div.source-list', [
            h('div.label', 'Sources:'),
            d.sources.map((source) => {
              return h('a.source', {
                href: source.address,
                target: '_blank'
              }, source.display.length ? source.display : source.address)
            })
          ]);
        }

        var author;
        if(d.author) {
          author = h('div.author', 'by ' + d.author.name);
        }

        return h('div.condition', {
          dataset: {
            id: d._id
          }
        }, [
          author,
          h('div.pending', pendingCount + ' ' + util.pluralize(pendingCount, 'opinion') + "  at stake"),
          h('div.confirmed', {
            dataset: {
              exists: confirmedCount > 0
            }
          }, confirmedCount + " convinced"),
          h('div.tagline', [
            h('span', d.tagline),
            h('span', ' (' + d.proofs.length + util.pluralize(d.proofs.length, ' response') + ')')
          ]),
          sourceList
        ]);
      });
    }

    var sourceList = [];
    for(var i=0; i<viewState.sourceCount; i++) {
      sourceList.push(h('div.source-wrapper', [
        h('div.label', 'Source ' + (i + 1)),
        h('input.source-href', {
          placeholder: 'link address'
        }),
        h('input.source-display', {
          placeholder: 'link display'
        })
      ]));
    }

    var addMoreSources;
    if(viewState.sourceCount < 5) {
      addMoreSources = h('div.add-more', '+ Add source');
    }

    return h('div#stand-view', [
      headerSubview.render({
        issue: viewState.issue,
        position: viewState.position
      }),
      h('div.body', [
        h('div.title', conditionsTitle),
        h('div#contribute', {
          dataset: {
            active: viewState.activelyContributing
          }
        }, [
          h('div.label#toggle-contributing', 'Contribute'),
          h('div.form-container', [
            h('div.input-container.tagline', [
              h('textarea', { 
                placeholder: "Description",
                maxlength: descriptionTextareaMaxLength
              }),
              h('div.remaining-characters', '' + viewState.descriptionTextarea)
            ]),
            h('div.sources-container', [
              h('div.source-list', sourceList),
              addMoreSources
            ]),
            h('div.input-container.more-info', [
              h('textarea', { 
                placeholder: "More information (optional)",
                maxlength: moreInfoTextareaMaxLength
              }),
              h('div.remaining-characters', '' + viewState.moreInfoTextarea)
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