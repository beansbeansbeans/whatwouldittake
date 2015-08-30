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
  confirming: false,
  lastClickedDeleteEntry: -1,
  addingEntry: false,
  editingVisibility: false,
  editedHideIdentitySetting: false
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
  },
  DELETE_ENTRY: {
    title: "Are you sure you want to delete this entry?",
    buttons: [
      {
        dataset: {
          type: 'severe',
          action: 'delete-entry'
        },
        text: 'Yes, delete'
      },
      {
        dataset: {
          action: 'cancel-delete-entry'
        },
        text: 'Cancel'
      }
    ]
  }
};

var svgDimensions = { 
  widthOverHeight: 10,
  horizontalPadding: 50,
  verticalPadding: 25
};

var isLastStory = thisIndex => state.get('page_limit') === state.get('page') && (thisIndex + 1 === state.get('stories').length);

var debugIterationCount = 0;

var errorMessages = { date: formHelpers.errorMessages.date };

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
      storyState.editedHideIdentitySetting = storyState.story.hideIdentity;

      this.handleResize();
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
        return api.post('/edit_story', {
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
    } else if(e.target.id === 'open-update-story') {
      storyState.addingEntry = true;
    } else if(e.target.id === 'cancel-update-story') {
      storyState.addingEntry = false;
    } else if(e.target.nodeName === "circle") {
      var indexOfCircle = storyState.story.entries.length - [].indexOf.call(e.target.parentNode.children, e.target) + 1;
      scrollHelpers.scrollTo(d.qs('.entry:nth-of-type(' + indexOfCircle + 'n)').getBoundingClientRect().top + body.scrollTop - svgDimensions.height - state.get('dimensions').headerHeight);
    } else if(e.target.id === "next-story") {
      page('story/' + state.get('stories')[storyState.nextIndex]._id);
    } else if(e.target.id === "delete-story") {
      storyState.confirming = 'DELETE_STORY';
    } else if(e.target.dataset.action === 'delete-story') {
      api.post('/delete_story', {
        id: storyState.story._id
      }, () => {
        api.clearCache('stories*');
        page('/');
      });
    } else if(e.target.dataset.action === 'cancel-delete-story') {
      storyState.confirming = false;
    } else if(e.target.classList.contains('delete-entry')) {
      storyState.confirming = 'DELETE_ENTRY';
      storyState.lastClickedDeleteEntry = e.target.dataset.entryId;
    } else if(e.target.dataset.action === 'cancel-delete-entry') {
      storyState.confirming = false;
    } else if(e.target.dataset.action === 'delete-entry') {
      return api.post('/delete_entry', {
        id: storyState.story._id,
        date: storyState.story.entries[storyState.lastClickedDeleteEntry].date
      }, (data) => {
        if(data.success) {
          api.clearCache('stories*');
          api.clearCache('/story/' + storyState.story._id);
          storyState.story.entries = data.entries;
          storyState.confirming = false;
          this.updateState();
        }
      });
    } else if(e.target.id === 'open-edit-visibility') {
      storyState.editingVisibility = true;
    } else if(e.target.id === 'cancel-update-visibility') {
      storyState.editingVisibility = false;
    } else if(e.target.id === 'hide-identity') {
      storyState.editedHideIdentitySetting = !storyState.editedHideIdentitySetting;
    } else if(e.target.id === 'update-visibility') {
      return api.post('/change_story_visibility', {
        id: storyState.story._id,
        hideIdentity: storyState.editedHideIdentitySetting
      }, (data) => {
        if(data.success) {
          api.clearCache('stories*');
          api.clearCache('/story/' + storyState.story._id);
          storyState.story.hideIdentity = data.hideIdentity;
          storyState.editingVisibility = false;
          this.updateState();
        }
      });
    } else {
      return;
    }

    this.updateState();
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
    super.stop();
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

    if(storyState.addingEntry) {
      if(storyState.isOwnStory) {
        if(picker) { picker.destroy(); }
        picker = new Pikaday(_.defaults({ field: d.gbID('datepicker') }, config.pikadayConfig ));
      }                
    }
  }

  handleResize() {
    svgDimensions.width = Math.max(window.innerWidth - (svgDimensions.horizontalPadding * 2), 300);
    svgDimensions.height = Math.min(svgDimensions.width / svgDimensions.widthOverHeight, 300);

    this.updateState();
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  render() {
    if(!storyState.story) { return h('div'); }

    var userDisplay, edit, nextStory, deleteStory, svgContainer, modal,
      editVisibility,
      svgContainerStyle;

    if(!storyState.story.hideIdentity) {
      userDisplay = h('div.user', storyState.story.user.username);
    }

    if(storyState.isOwnStory) {
      deleteStory = h('div.button#delete-story', {
        dataset: { type: 'severe' }
      }, 'Delete story');

      var editVisibilityDisplay = 'Your name is displayed with this story.';
      if(storyState.story.hideIdentity) {
        editVisibilityDisplay = 'Your name is hidden.';
      }

      editVisibility = h('div.edit-visibility', {
        dataset: { editing: storyState.editingVisibility }
      }, [
        h('div.display', [
          h('div.status', editVisibilityDisplay),
          h('div.button#open-edit-visibility', 'Change')
        ]),
        h('div.edit-visibility-form', [
          h('div.checkbox-wrapper', [
            h('div.checkbox#hide-identity', {
              dataset: {
                hide: storyState.editedHideIdentitySetting
              }
            }, [
              h('i.material-icons', 'check')
            ]),
            h('div.label', 'Show my name with this story')
          ]),
          h('div.button#update-visibility', 'Update'),
          h('div.button#cancel-update-visibility', 'Cancel')
        ])
      ]);

      edit = h('div.edit', {
        dataset: { editing: storyState.addingEntry }
      }, [
        h('div.button#open-update-story', 'Add entry'),
        h('div.form', [
          createEntrySubview.render(storyState.fieldStatus),
          h('div#update-story-button.button', 'Update'),
          h('div.button#cancel-update-story', 'Cancel')
        ])
      ]);
    }

    if(storyState.nextIndex !== -1) {
      nextStory = h('div#next-story', [
        h('i.material-icons', 'keyboard_arrow_right')
      ]);
    }

    svgContainerStyle = { height: (svgDimensions.height + (2 * svgDimensions.verticalPadding)) + "px" };

    if(storyState.story.entries.length > 1) {
      svgContainer = h('div.header-contents', {
        style: svgContainerStyle
      }, [
        svg('svg', { 
          style: { top: svgDimensions.verticalPadding + 'px' } 
        })
      ]);
    }

    if(storyState.confirming !== false) {
      modal = modalSubview.render(modalOptions[storyState.confirming]);
    }

    return h('div#story-view', [
      h('div.header', {
        style: svgContainerStyle
      }, [ svgContainer ]),
      nextStory,
      userDisplay,
      h('div.utilities', [
        editVisibility,
        edit
      ]),
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
      h('div.delete-story-container', [ deleteStory ]),
      modal
    ]);
  }
}

module.exports = new storyView();