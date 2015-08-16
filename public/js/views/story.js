var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

class storyView extends view {
  start(ctx) {
    super.start();

    api.get('/story/' + ctx.params.id, (error, data) => {
      console.log("GOT STORY");
      console.log(data);
    });
  }

  render() {
    return h('div#story-view', 'HEY HERE IS THE STORY');
  }
}

module.exports = new storyView();