var h = require('virtual-dom/h');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var animationHelpers = require('../util/animation_helpers');
var helpers = require('../util/belief_helpers');
var headerSubview = require('./subviews/belief_header');

var descriptionTextareaMaxLength = 1000;

var pristineState = {
  issue: {},
  sourceCount: 1,
  activelyContributing: false,
  descriptionTextarea: descriptionTextareaMaxLength
};
var viewState = JSON.parse(JSON.stringify(pristineState));

var convertBeliefTransition = () => {
  d.gbID("condition-view").classList.add("converting-belief");
}

var dimensions = {};

class standView extends view {
  start(ctx) {
    super.start();

    _.bindAll(this, 'handleClick', 'handleKeydown', 'convertBeliefTransition', 'convertBeliefTransitionEnd', 'animateInCondition', 'animateInConditionEnd', 'animateInForm', 'animateInFormEnd', 'animateOutForm', 'animateOutFormEnd');

    viewState.issue = _.findWhere(state.get("issues"), {slug: ctx.params.issue});
    viewState.position = ctx.params.side;
    this.updateState();

    mediator.subscribe("window_click", this.handleClick);
    mediator.subscribe("window_keydown", this.handleKeydown);
  }

  convertBeliefTransition() {
    d.gbID("stand-view").classList.add("converting-belief");
    d.gbID("stand-view").addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.convertBeliefTransitionEnd);
  }

  convertBeliefTransitionEnd(e) {
    d.gbID("stand-view").removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.convertBeliefTransitionEnd);
    this.updateState();
    d.gbID("stand-view").classList.remove("converting-belief");
  }

  didRender() {

  }

  handleResize() {

  }

  animateOutFormEnd() {
    d.qs(".form-container").removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.animateOutFormEnd);
    d.gbID("stand-view").classList.remove("animating-out-form");
    d.qs(".conditions-wrapper").style[util.prefixedProperties.transform.js] = "";
    viewState.activelyContributing = false;
    viewState.sourceCount = 1;
    this.updateState();
  }

  animateOutForm() {
    var translateY = d.qs(".form-container").getBoundingClientRect().height;
    d.gbID("stand-view").classList.add("animating-out-form");
    d.qs(".conditions-wrapper").style[util.prefixedProperties.transform.js] = "translateY(-" + translateY + "px)";
    d.qs(".form-container").addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.animateOutFormEnd);
  }

  animateInFormEnd() {
    d.gbID("toggle-contributing").removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.animateInFormEnd);
    d.gbID("stand-view").classList.remove("animating-in-form");
    d.qs(".conditions-wrapper").style[util.prefixedProperties.transform.js] = "";
    viewState.activelyContributing = true;
    this.updateState();
  }

  animateInForm() {
    d.qs(".form-container").style.visibility = "hidden";
    d.qs(".form-container").style.position = "absolute";
    d.qs(".form-container").style.display = "block";
    var translateY = d.qs(".form-container").getBoundingClientRect().height;
    d.qs(".form-container").style.visibility = "";
    d.qs(".form-container").style.position = "";
    d.qs(".form-container").style.display = "";

    _.defer(() => {
      d.gbID("stand-view").classList.add("animating-in-form");
      d.qs(".conditions-wrapper").style[util.prefixedProperties.transform.js] = "translateY(" + translateY + "px)";
      d.gbID("toggle-contributing").addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.animateInFormEnd);
    });
  }

  animateInConditionEnd() {
    d.qs('.target-condition').removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.animateInConditionEnd);
    page.show(viewState.nextRoute);
  }

  animateInCondition(closestCondition) {
    var scrollY = window.scrollY;
    var y = (closestCondition.getBoundingClientRect().top) - (d.qs('.body .title').getBoundingClientRect().top) - 15 - scrollY;

    if(scrollY > 0) {
      document.body.classList.add("scroll-jumping");
    }

    document.body.classList.add("animating-in-condition");
    closestCondition.style[util.prefixedProperties.transform.js] = "translateY(" + (-y) + "px)";
    closestCondition.classList.add("target-condition");
    var dummyCondition = d.createElement("div");
    var dummyTagline = d.createElement("div");
    dummyTagline.textContent = closestCondition.querySelector(".tagline span:first-of-type").textContent;
    dummyCondition.appendChild(dummyTagline);
    if(closestCondition.querySelector(".source-list")) {
      var dummySourceList = closestCondition.querySelector(".source-list").cloneNode(true);
      dummyCondition.appendChild(dummySourceList);
    }
    dummyCondition.classList.add("dummy-condition");
    dummyTagline.classList.add("tagline");
    closestCondition.appendChild(dummyCondition);

    viewState.nextRoute = '/stands/' + viewState.issue.slug + '/' + viewState.position + '/' + closestCondition.dataset.id;
    closestCondition.addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.animateInConditionEnd);
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
        });        
      }

      helpers.vote(viewState.issue, stand.stand);
      this.convertBeliefTransition();
    } else if(e.target.id === 'see-info') {
      animationHelpers.fadeOut('/' + viewState.issue.slug);
    } else if(e.target.id === 'see-other-side') {
      animationHelpers.fadeOut('/stands/' + viewState.issue.slug + '/' + (viewState.position === 'aff' ? 'neg' : 'aff'));
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
          tagline: d.qs("#contribute .tagline textarea").value
        }, (data) => {
          d.qs("#contribute .tagline textarea").value = '';
          viewState.issue = data.data;
          viewState.activelyContributing = false;
          viewState.sourceCount = 1;
          helpers.refreshIssue(data.data);
          this.updateState();
        });
      }
    } else if(closestCondition) {
      this.animateInCondition(closestCondition);
    } else if(e.target.id === "toggle-contributing") {
      this.animateInForm();
    } else if(e.target.id === 'cancel-what-would-it-take') {
      this.animateOutForm();
    } else if(e.target.classList.contains("add-more")) {
      viewState.sourceCount++;
      this.updateState();
    }
  }

  handleKeydown() {
    viewState.descriptionTextarea = descriptionTextareaMaxLength - d.qs("#contribute .tagline textarea").value.length;
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
                maxLength: descriptionTextareaMaxLength
              }),
              h('div.remaining-characters', '' + viewState.descriptionTextarea)
            ]),
            h('div.sources-container', [
              h('div.source-list', sourceList),
              addMoreSources
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