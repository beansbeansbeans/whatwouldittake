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

var dimensions = { widthOverHeight: 4 };

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
    state.get('stories').forEach((story, storyIndex) => {
      if(story.entries.length > 1) {
        sparklineSubview.render(d3.select("#svg_" + storyIndex), {story: story}, {
          width: dimensions.width,
          height: dimensions.height,
          horizontalBuffer: 30
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
    var windowWidth = state.get('dimensions').windowWidth,
      columns = 4;

    if(windowWidth < 600) {
      columns = 1;
    } else if(windowWidth < 850) {
      columns = 2;
    } else if(windowWidth < 1200) {
      columns = 3;
    }

    dimensions.columns = columns;
    dimensions.margin = windowWidth / 20;
    dimensions.width = ((d.gbID('index').offsetWidth - ((columns - 1) * dimensions.margin)) / columns) - 1;
    // offset by 1px to avoid wrapping
    dimensions.height = Math.max(dimensions.width / dimensions.widthOverHeight, 50);

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
      h('div.hero', [
        h('div.title', 'Stories of'),
        h('div.description', 'This is a place to share stories.'),
        h('div.button#go-to-search', {
          dataset: { type: 'critical' }
        }, 'Search')
      ]),
      h('h1', 'Latest stories'),
      h('ul', state.get('stories').map((story, storyIndex) => {
        var username, lastNote;
        if(!story.hideIdentity) {
          username = h('div.user', story.user.username);
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
          style: { 
            width: dimensions.width + 'px',
            height: dimensions.width + 'px',
            marginRight: storyIndex % dimensions.columns !== (dimensions.columns - 1) ? dimensions.margin + 'px' : 0,
            marginBottom: dimensions.margin + 'px'
          },
          dataset: { storyId: story._id }
        }, [
          h('div.contents', [
            svg('svg#svg_' + storyIndex),
            h('div.last-note', lastNote),
            username,
            h('div.entries-count.button', util.pluralize(story.entries.length, 'entry', 'entries')),
            h('div.last-updated', [
              h('div', 'updated'),
              h('div', moment.utc(story.lastUpdated, 'x').format('MMM Do'))
            ])
          ])
        ])
      }))
    ]);
  }
}

module.exports = new indexView();