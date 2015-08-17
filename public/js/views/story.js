var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

var storyState = {};

class storyView extends view {
  start(ctx) {
    super.start();

    api.get('/story/' + ctx.params.id, (error, data) => {
      storyState.story = data.data;
      this.updateState();
    });
  }

  render() {
    if(!storyState.story) { return h('div'); }
    
    return h('div#story-view', [
      h('div.user', storyState.story.user.username),
      storyState.story.entries.map((entry) => {
        return h('div.entry', [
          h('div.date', entry.date),
          h('div.feeling', entry.feeling)
        ])
      })
    ]);
  }
}

module.exports = new storyView();