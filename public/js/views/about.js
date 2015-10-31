var h = require('virtual-dom/h');
var mediator = require('../mediator');
var view = require('../view');

class aboutView extends view {
  start() {
    super.start();
  }

  stop() {
    super.stop();
  }

  render() {
    return h('div#about-view', [
      h('div.main', [
        h('h1', 'About'),
        h('div.subtitle', 'What is this place?'),
        h('div.description', "We created this site because we wanted to help people become better informed about their opinions.")
      ])
    ]);
  }
}

module.exports = new aboutView();