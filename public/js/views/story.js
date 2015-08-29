var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var Pikaday = require('pikaday');
var mediator = require('../mediator');
var view = require('../view');
var state = require('../state');
var createEntrySubview = require('./subviews/create_entry');
var sparklineSubview = require('./subviews/sparkline');
var modalSubview = require('./subviews/modal');
var formHelpers = require('../util/form_helpers');
var scrollHelpers = require('../util/scroll_helpers');
var config = require('../config');

var storyState = {
  isOwnStory: false,
  fieldStatus: { date: false },
  firstVisibleStoryIndex: 0,
  nextIndex: -1,
  confirming: false
};

var modalOptions = {
  DELETE_STORY: {
    title: "Are you sure you want to delete your story?",
    buttons: [
      {
        dataset: {
          type: 'severe',
          action: 'delete-story'
        },
        text: 'Yes, delete'
      },
      {
        dataset: {
          action: 'cancel-delete-story'
        },
        text: 'Cancel'
      }
    ]
  }
}

var isLastStory = thisIndex => state.get('page_limit') === state.get('page') && (thisIndex + 1 === state.get('stories').length);

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
    if(!isLastStory(thisIndex)) {
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
        if(!isLastStory(thisIndex)) {
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
    } else if(e.target.id === "delete-story") {
      storyState.confirming = 'DELETE_STORY';
      this.updateState();
    } else if(e.target.dataset.action === 'delete-story') {
      api.post('/delete_story', {
        id: storyState.story._id
      }, () => {
        api.clearCache('stories*');
        page('/');
      });
    } else if(e.target.dataset.action === 'cancel-delete-story') {
      storyState.confirming = false;
      this.updateState();
    } else if(e.target.classList.contains('delete-entry')) {
      api.post('/delete_entry', {
        id: storyState.story._id,
        date: storyState.story.entries[e.target.dataset.entryId].date
      }, (data) => {
        if(data.success) {
          api.clearCache('stories*');
          api.clearCache('/story/' + storyState.story._id);
          storyState.story.entries = data.entries;
          this.updateState();
        }
      });
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
    if(storyState.story) {
      if(storyState.story.entries.length > 1) {
        sparklineSubview.render(d3.select("svg"), storyState, svgDimensions);
      }
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

    var userDisplay, edit, nextStory, deleteStory, svgContainer, modal;

    if(!storyState.story.hideIdentity) {
      userDisplay = h('div.user', storyState.story.user.username);
    }

    if(storyState.isOwnStory) {
      deleteStory = h('div.button#delete-story', 'Delete story'),
      edit = h('div.edit', [
        h('div', 'Add an entry!'),
        createEntrySubview.render(storyState.fieldStatus),
        h('div#update-story-button', 'Update')
      ]);
    }

    if(storyState.nextIndex !== -1) {
      nextStory = h('div#next-story', 'NEXT STORY');
    }

    if(storyState.story.entries.length > 1) {
      svgContainer = svg('svg', { style: { top: '100px' } });
    }

    if(storyState.confirming !== false) {
      modal = modalSubview.render(modalOptions[storyState.confirming]);
    }

    return h('div#story-view', [
      h('div.header', {
        style: { height: svgDimensions.height + "px" }
      }, [ svgContainer ]),
      nextStory,
      userDisplay,
      deleteStory,
      edit,
      h('div.entry-list', storyState.story.entries.map((entry, i) => {
        var deleteEntry;
        if(storyState.isOwnStory) {
          deleteEntry = h('div.button.delete-entry', {
            dataset: { entryId: i }
          }, 'Delete entry');
        }

        return h('div.entry', [
          deleteEntry,
          h('div.date', moment.utc(entry.date, 'x').format('YYYY MM DD')),
          h('div.feeling', entry.feeling),
          h('div.notes', entry.notes)
        ]);
      })),
      modal
    ]);
  }
}

module.exports = new storyView();