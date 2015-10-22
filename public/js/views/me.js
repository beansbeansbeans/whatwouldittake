var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

var meState = {
  active: 'stories'
};

class meView extends view {
  start() {
    super.start();

    _.bindAll(this, 'handleClick');

    api.get('/me', (err, data) => {
      meState.user = data.data;
      this.updateState();
    }, false);    

    mediator.subscribe("window_click", this.handleClick);
  }

  handleClick(e) {
    var toggle = e.target.getAttribute("data-toggle");
    var story = e.target.closest(".story-item");
    if(toggle) {
      meState.active = toggle;
      this.updateState();
    } else if(story) {
      page('/story/' + story.dataset.storyId);
    }
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    return h('div#me-view', meState.user ? meState.user.username : "");
  }
}

module.exports = new meView();