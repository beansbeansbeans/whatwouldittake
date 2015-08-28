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

var dimensions = { widthOverHeight: 10 };

class indexView extends view {
  start() {
    super.start();

    _.bindAll(this, 'handleScroll', 'getMoreStories');

    window.addEventListener("scroll", this.handleScroll);

    this.getMoreStories();
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

  didRender() {
    state.get('stories').forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), {story: story}, dimensions);
    });
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
    dimensions.width = Math.max(window.innerWidth - 50, 250);
    dimensions.height = Math.min(dimensions.width / dimensions.widthOverHeight, 200)

    state.get('stories').forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), {
        story: story
      }, dimensions);
    });
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  stop() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  render() {
    return h('div#index', [
      h('h1', 'STORIES OF'),
      h('ul', state.get('stories').map((story, storyIndex) => {
        var username;
        if(!story.hideIdentity) {
          username = h('div.user', story.user.username);
        }

        return h('li', [
          svg('svg#svg_' + storyIndex),
          username,
          h('div.last-updated', [
            h('div', 'last updated: '),
            h('div', moment.utc(story.lastUpdated, 'x').format('h:mm:ss a'))
          ]),
          h('div.entries-count', util.pluralize(story.entries.length, 'entry', 'entries')),
          h('div.date', moment.utc(story.entries[0].date, 'x').format('YYYY MM DD')),
          h('a', {
            href: 'story/' + story._id
          }, 'goto')
        ])
      }))
    ]);
  }
}

module.exports = new indexView();