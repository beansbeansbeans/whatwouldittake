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
        h('div.subtitle', 'This is a concept for a social network.'),
        h('div.description', "We use social media as a tool for projecting the best versions of ourselves to the world. According to our Facebook newsfeeds, everyone around us is leading happy and fulfilling lives. Which means that when we're unhappy, it can feel like we're alone in our experience."),
        h('div.description', [
          h("span", "I built Stories of as a way for people to share their moods, good or bad. "),
          h("span.bold", "I hope this will achieve two effects:")
        ]),
        h('div.description', "(1) I want people who are feeling unhappy to see this as a safe place for sharing."),
        h('div.description', "(2) I want people who are feeling unhappy to see that they're not alone.")
      ])
    ]);
  }
}

module.exports = new aboutView();