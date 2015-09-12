var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var sparklineSubview = require('./subviews/sparkline');

var scrollBottomThreshold = 50;

var viewState = {
  pageHeight: 0,
  gettingMoreStories: false
}

var dimensions = {};

class indexView extends view {
  start() {
    super.start();

    _.bindAll(this, 'handleClick', 'handleScroll', 'getMoreStories');

    window.addEventListener("scroll", this.handleScroll);
    mediator.subscribe("window_click", this.handleClick);

    this.getMoreStories();
  }

  handleClick(e) {
    var storyItem = e.target.classList.contains('story-item') ? e.target : e.target.closest('.story-item');
    if(storyItem) {
      page('/story/' + storyItem.dataset.storyId);
    } else if(e.target.id === 'go-to-search') {
      page('/search');
    }
  }

  getMoreStories() {
    viewState.gettingMoreStories = true;
    api.get('/stories/' + state.get('page'), (err, data) => {
      if(data.data && data.data.length) {
        state.set('stories', state.get('stories').concat(data.data));
        state.set('page', state.get('page') + 1);
      } else {
        state.set('page_limit', state.get('page'));
      }
      viewState.gettingMoreStories = false;
      this.updateState();
    });    
  }

  renderPaths() {
    if(!d.qs('.story-item')) { return; }
    var storyHeight = d.qs('.story-item').offsetHeight;

    state.get('stories').forEach((story, storyIndex) => {
      if(story.entries.length > 1) {
        sparklineSubview.render(d3.select("#svg_" + storyIndex), {story: story}, {
          width: dimensions.width,
          height: storyHeight,
          horizontalBuffer: 0
        });
      }
    });    
  }

  didRender() {
    this.renderPaths();
    viewState.pageHeight = util.getDocumentHeight();
  }

  handleScroll() {
    if((viewState.pageHeight - (document.body.scrollTop + state.get('dimensions').windowHeight)) < scrollBottomThreshold) {
      if(!viewState.gettingMoreStories && state.get('page') !== state.get('page_limit')) {
        this.getMoreStories();
      }
    }
  }

  handleResize() {
    dimensions.width = d.gbID("index").offsetWidth;

    this.renderPaths();
    this.updateState();
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  stop() {
    super.stop();
    window.removeEventListener("scroll", this.handleScroll);
    mediator.unsubscribe('window_click', this.handleClick);
  }

  render() {
    return h('div#index', [
      h('h1', 'Latest'),
      h('div.description', "These are stories of people's moods."),
      h('div.button#go-to-search', {
        dataset: { type: "critical" }
      }, 'Search'),
      h('ul', state.get('stories').map((story, storyIndex) => {
        var username, lastNote;
        if(!story.hideIdentity) {
          username = h('div.user', 'by ' + story.user.username);
        }

        lastNote = 'No notes.';
        story.entries.some((d) => {
          if(d.notes.length) {
            lastNote = d.notes;
            return true;
          }
          return false;
        });

        return h('li.story-item', {
          dataset: { storyId: story._id }
        }, [
          svg('svg#svg_' + storyIndex),
          h('div.last-updated', [
            h('div.date', moment.utc(story.lastUpdated, 'x').format('MMM Do')),
            h('div', 'last updated')
          ]),
          h('div.main', [
            h('div.last-note', lastNote),
            h('div.entries-count', story.entries.length + ' ' + util.pluralize(story.entries.length, 'entry', 'entries')),
            username
          ])
        ])
      }))
    ]);
  }
}

module.exports = new indexView();