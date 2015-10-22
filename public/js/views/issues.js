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

    api.get('/issues', (err, data) => {
      viewState.issues = data.data;
      this.updateState();
    });
  }

  render() {
    return h('div#issues-view', [
      h('div', 'The issues'),
      viewState.issues.map((d) => {
        return h('div', d.slug);
      })
    ]);
  }
}

module.exports = new issuesView();