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
        h('div.description', "Social media has become a tool for projecting the best version of ourselves to the world. Someone feeling unhappy may get the impression from their Facebook newsfeed that they're alone in their experience."),
        h('div.description', "I built Stories of as a way for people to share their moods, good or bad.")
      ])
    ]);
  }
}

module.exports = new aboutView();