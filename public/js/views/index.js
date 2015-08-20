var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');

var viewState = {
  stories: []
}

class indexView extends view {
  start() {
    super.start();

    api.get('/stories', (err, data) => {
      viewState.stories = data.data;
      this.updateState();
    });
  }

  render() {
    return h('div#index', [
      h('h1', 'STORIES OF'),
      h('ul', viewState.stories.map((story) => {
        var username;
        if(!story.hideIdentity) {
          username = h('div.user', story.user.username);
        }

        return h('li', [
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