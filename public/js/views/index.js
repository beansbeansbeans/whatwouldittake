var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

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
        return h('li', [
          h('div.user', story.user.username),
          h('a', {
            href: 'story/' + story._id
          }, 'goto')
        ])
      }))
    ]);
  }
}

module.exports = new indexView();