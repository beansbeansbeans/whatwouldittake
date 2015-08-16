var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

class storyView extends view {
  start(ctx) {
    console.log("IN STORY");
    console.log(ctx)
    // super.start();


    // api.get('/story/' + )
  }

  render() {
    return h('div#story-view', 'HEY HERE IS THE STORY');
  }
}