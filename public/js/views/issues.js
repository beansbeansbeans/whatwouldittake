var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

var viewState = {
  issues: []
};

class issuesView extends view {
  start() {
    super.start();

    _.bindAll(this, 'handleClick');

    api.get('/issues', (err, data) => {
      viewState.issues = data.data;
      this.updateState();
    });

    mediator.subscribe("window_click", this.handleClick);
  }

  handleClick(e) {
    if(e.target.classList.contains('issue')) {
      page.show('vote/' + e.target.dataset.slug);
    }
  }

  stop() {
    super.stop();
    mediator.unsubscribe("window_click", this.handleClick);
  }

  render() {
    return h('div#issues-view', [
      h('div', 'The issues'),
      viewState.issues.map((d) => {
        return h('div.issue', {
          dataset: {
            slug: d.slug
          }
        }, d.slug);
      })
    ]);
  }
}

module.exports = new issuesView();