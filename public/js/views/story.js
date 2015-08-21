var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var Pikaday = require('pikaday');
var mediator = require('../mediator');
var view = require('../view');
var state = require('../state');
var createEntrySubview = require('./subviews/create_entry');
var sparklineSubview = require('./subviews/sparkline');
var formHelpers = require('../util/form_helpers');
var config = require('../config');

var storyState = {
  isOwnStory: false,
  fieldStatus: { date: false }
};

var errorMessages = { date: formHelpers.errorMessages.date };

var svgDimensions = { widthOverHeight: 10 };

var picker;
var scrollTop = 0;
var easeOut = (t) => {
  return yPos + (dest - yPos) * Math.exp(timeConstant * t);
}
var scrollRafID = null;
var yPos = 0;
var ticksToComplete = Math.round(200/16);
var ticks = ticksToComplete;
var timeConstant = -3 / ticksToComplete;
var dest = 0;

var move = () => {
  scrollTop = easeOut(ticks);
  ticks--;
  body.scrollTop = scrollTop;
  if(ticks > 0) {
    scrollRafID = requestAnimationFrame(move);
  } else {
    ticks = ticksToComplete;
    window.cancelAnimationFrame(scrollRafID);
  }
}

class storyView extends view {

  validate() {
    storyState.fieldStatus = { date: false };

    return formHelpers.validate(this, errorMessages, storyState);
  }

  start(ctx) {
    super.start();

    api.get('/story/' + ctx.params.id, (error, data) => {
      storyState.story = data.data;
      storyState.isOwnStory = state.get('user') && state.get('user')._id === storyState.story.user._id;

      this.updateState();

      if(storyState.isOwnStory) {
        picker = new Pikaday(_.defaults({ field: d.gbID('datepicker') }, config.pikadayConfig ));
      }
    });

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "update-story-button" && storyState.isOwnStory) {
        var date = picker.toString('X'),
          feeling = d.qs('[name="feeling"]').value,
          notes = d.qs('[name="notes"]').value;

        if(this.validate()) {
          api.post('/edit_story', {
            id: storyState.story._id,
            date: date,
            feeling: feeling,
            notes: notes
          }, (data) => {
            if(data.success) {
              storyState.story.entries = data.entries;
              this.updateState();                  
            }
          });             
        }
      } else if(e.target.nodeName === "circle") {
        var indexOfCircle = [].indexOf.call(e.target.parentNode.children, e.target);
        this.scrollTo(d.qs('.entry:nth-of-type(' + indexOfCircle + 'n)').getBoundingClientRect().top + body.scrollTop);
      }
    });
  }

  scrollTo(distance) {
    scrollTop = body.scrollTop;
    yPos = scrollTop;
    dest = distance;
    scrollRafID = requestAnimationFrame(move);
  }

  stop() {
    if(picker) {
      picker.destroy();
    }
  }

  didRender() {
    sparklineSubview.render(d3.select("svg"), storyState.story, svgDimensions);
  }

  handleResize() {
    svgDimensions.width = Math.max(window.innerWidth - 10, 300);
    svgDimensions.height = Math.min(svgDimensions.width / svgDimensions.widthOverHeight, 300);

    this.updateState();
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  render() {
    if(!storyState.story) { return h('div'); }

    var userDisplay, edit;

    if(!storyState.story.hideIdentity) {
      userDisplay = h('div.user', storyState.story.user.username);
    }

    if(storyState.isOwnStory) {
      edit = h('div.edit', [
        h('div', 'Add an entry!'),
        createEntrySubview.render(storyState.fieldStatus),
        h('div#update-story-button', 'Update')
      ]);
    }

    return h('div#story-view', [
      h('div.header', {
        style: { height: svgDimensions.height + "px" }
      }, [ svg('svg', {
        style: { top: '100px' }
      }) ]),
      userDisplay,
      edit,
      h('div.entry-list', storyState.story.entries
        .sort((a, b) => {
          if(a.date > b.date) { return -1; }
          if(a.date < b.date) { return 1; }
          return 0;
        }).map((entry) => {
          return h('div.entry', [
            h('div.date', moment.utc(entry.date, 'X').format('YYYY MM DD')),
            h('div.feeling', entry.feeling),
            h('div.notes', entry.notes)
          ]);
      }))
    ]);
  }
}

module.exports = new storyView();