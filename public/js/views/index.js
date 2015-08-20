var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var sparklineSubview = require('./subviews/sparkline');

var viewState = {
  stories: []
}

var dimensions = { widthOverHeight: 8 };

class indexView extends view {
  start() {
    super.start();

    api.get('/stories', (err, data) => {
      viewState.stories = data.data;
      this.updateState();
    });
  }

  didRender() {
    viewState.stories.forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), story, dimensions);
    });
  }

  handleResize() {
    dimensions.width = Math.max(window.innerWidth - 10, 250);
    dimensions.height = Math.min(dimensions.width / dimensions.widthOverHeight, 200)

    viewState.stories.forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), story, dimensions);
    });
  }

  mount() {
    super.mount();
    this.handleResize();
  }

  render() {
    return h('div#index', [
      h('h1', 'STORIES OF'),
      h('ul', viewState.stories.map((story, storyIndex) => {
        var username;
        if(!story.hideIdentity) {
          username = h('div.user', story.user.username);
        }

        return h('li', [
          svg('svg#svg_' + storyIndex),
          username,
          h('div.entries-count', util.pluralize(story.entries.length, 'entry', 'entries')),
          h('div.date', moment.utc(story.entries.sort((a, b) => {
            if(a.date > b.date) { return -1; }
            if(a.date < b.date) { return 1; }
            return 0;
          })[0].date, 'X').format('YYYY MM DD')),
          h('a', {
            href: 'story/' + story._id
          }, 'goto')
        ])
      }))
    ]);
  }
}

module.exports = new indexView();