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
        h('div.description', "According to our Facebook newsfeeds, everyone around us is leading happy and fulfilling lives. We use social media to project the best versions of ourselves to the world. Which means that when we're unhappy, it can feel like we're alone in our experience."),
        h('div.description', [
          h("span", "I built Stories of as a way for people to share their moods, good or bad. "),
          h("span.bold", "I hope this will achieve two effects:")
        ]),
        h('div.description', "(1) I want people who are feeling unhappy to see this as a safe place for sharing. That's why users can choose to hide their names on their posts, and why notes are optional. Sometimes it's nice just to be able to acknowledge that you're not feeling your best."),
        h('div.description', "(2) I want people who are feeling unhappy to see that they're not alone. When you're unhappy, it can easily seem like you'll always feel this way. I want the site to serve as proof that people get over their unhappiness. Stories are defined by a sparkline that tracks changes in the user's mood, and users can search the site for stories matching a particular mood trajectory.")
      ])
    ]);
  }
}

module.exports = new aboutView();