var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

var meState = {
  active: 'stories',
  user: {}
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
    if(toggle) {
      meState.active = toggle;
      this.updateState();
    }
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    var stories = [];

    if(!_.isEmpty(meState.user)) {
      if(meState.active === 'stories') {
        stories = meState.user.stories.map((d) => {
          return h('div', '' + d._id);
        });
      } else {
        stories = meState.user.likes.map((d) => {
          return h('div', '' + d._id);
        });
      }      
    }

    return h('div#me-view', {
      dataset: { active: meState.active }
    }, [
      h('div.your-stories', {
        dataset: { toggle: 'stories' }
      }, 'YOUR STORIES'),
      h('div.your-likes', {
        dataset: { toggle: 'likes' }
      }, 'YOUR LIKES'),
      h('div.stories', stories)
    ]);
  }
}

module.exports = new meView();