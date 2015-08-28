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
var scrollHelpers = require('../util/scroll_helpers');
var config = require('../config');

var storyState = {
  isOwnStory: false,
  fieldStatus: { date: false },
  firstVisibleStoryIndex: 0,
  nextIndex: -1
};

var debugIterationCount = 0;

var errorMessages = { date: formHelpers.errorMessages.date };

var svgDimensions = { widthOverHeight: 10 };

var picker;

class storyView extends view {

  validate() {
    storyState.fieldStatus = { date: false };

    return formHelpers.validate(this, errorMessages, storyState);
  }

  start(ctx) {
    super.start();
    document.body.scrollTop = 0;

    _.bindAll(this, 'handleScroll', 'handleClick', 'findNextIndex');

    api.get('/story/' + ctx.params.id, (error, data) => {
      storyState.story = data.data;
      storyState.isOwnStory = state.get('user') && state.get('user')._id === storyState.story.user._id;

      this.handleResize();

      if(storyState.isOwnStory) {
        picker = new Pikaday(_.defaults({ field: d.gbID('datepicker') }, config.pikadayConfig ));
      }
    });

    var thisIndex = _.findIndex(state.get('stories'), d => d._id === +ctx.params.id);
    var isLastStory = state.get('page_limit') === state.get('page') && (thisIndex + 1 === state.get('stories').length);

    if(!isLastStory) {
      if(thisIndex !== -1 && (thisIndex + 1) < state.get('stories').length) {
        storyState.nextIndex = thisIndex + 1;
      } else {
        this.findNextIndex(ctx.params.id);
      }      
    }

    mediator.subscribe("window_click", this.handleClick);
    window.addEventListener("scroll", this.handleScroll);
  }

  findNextIndex(id) {

    debugIterationCount++;
    
    if(debugIterationCount < 20) {
      api.get('/stories/' + state.get('page'), (err, data) => {
        if(data.data && data.data.length) {
          state.set('stories', state.get('stories').concat(data.data));
          state.set('page', state.get('page') + 1);
        } else {
          state.set('page_limit', state.get('page'));
        }

        var thisIndex = _.findIndex(state.get('stories'), d => d._id === +id);
        var isLastStory = state.get('page_limit') === state.get('page') && (thisIndex + 1 === state.get('stories').length);

        if(!isLastStory) {
          if(thisIndex !== -1 && (thisIndex + 1) < state.get('stories').length) {
            storyState.nextIndex = thisIndex + 1;
            this.updateState();
          } else {
            this.findNextIndex(id);
          }        
        }
      });      
    }
  }

  handleClick(e) {
    if(e.target.id === "update-story-button" && storyState.isOwnStory) {
      var date = picker.toString('x'),
        feeling = d.qs('[name="feeling"]').value,
        notes = d.qs('[name="notes"]').value;

      if(this.validate()) {
        api.post('/edit_story', {
          id: storyState.story._id,
          date: +date,
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
      scrollHelpers.scrollTo(d.qs('.entry:nth-of-type(' + indexOfCircle + 'n)').getBoundingClientRect().top + body.scrollTop);
    } else if(e.target.id === "next-story") {
      page('story/' + state.get('stories')[storyState.nextIndex]._id);
    }
  }

  handleScroll(e) {
    var previousFirstVisibleStoryIndex = storyState.firstVisibleStoryIndex;

    if(storyState.entryPositions) {
      storyState.entryPositions.some((d, i) => {
        if((d + 50 - document.body.scrollTop) > storyState.svgBottom) {
          storyState.firstVisibleStoryIndex = i;
          return true;
        }
        return false;
      });      
    }

    if(previousFirstVisibleStoryIndex !== storyState.firstVisibleStoryIndex) {
      this.updateState();
    }
  }

  stop() {
    if(picker) { picker.destroy(); }
    mediator.unsubscribe("window_click", this.handleClick);
    window.removeEventListener("scroll", this.handleScroll);
  }

  didRender() {
    sparklineSubview.render(d3.select("svg"), storyState, svgDimensions);
    if(storyState.story) {
      storyState.entryPositions = storyState.story.entries.map((_, i) => {
        return document.body.scrollTop + d.qs('.entry:nth-of-type(' + (i + 1) + 'n)').getBoundingClientRect().top;
      });
    }

    if(d.qs("svg")) {
      var svgRect = d.qs("svg").getBoundingClientRect();
      storyState.svgBottom = svgRect.top + svgRect.height;      
    }
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

    var userDisplay, edit, nextStory;

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

    if(storyState.nextIndex !== -1) {
      nextStory = h('div#next-story', 'NEXT STORY');
    }

    return h('div#story-view', [
      h('div.header', {
        style: { height: svgDimensions.height + "px" }
      }, [ svg('svg', {
        style: { top: '100px' }
      }) ]),
      nextStory,
      userDisplay,
      edit,
      h('div.entry-list', storyState.story.entries.map((entry) => {
        return h('div.entry', [
          h('div.date', moment.utc(entry.date, 'x').format('YYYY MM DD')),
          h('div.feeling', entry.feeling),
          h('div.notes', entry.notes)
        ]);
      }))
    ]);
  }
}

module.exports = new storyView();