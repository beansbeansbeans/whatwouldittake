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
        h('div.description', "According to a typical Facebook newsfeed, people's lives are perpetually happy and fulfilling. This is because we use social media to project the best versions of ourselves to the world. But it means that when we're unhappy, it can feel like we're alone in our experience."),
        h('div.description', "STORIES OF aims to address this problem. The site is: "),
        h('div.description', [
          h('span.bold', '(1) A tool for people to share their feelings, good or bad. '),
          h('span', "The site is composed of posts in which users grade their feelings on a sliding scale. We wanted people feeling unhappy to see this as a safe place, which is why users can choose to hide their names on their posts, and why text is optional. Sometimes it helps just to be able to acknowledge your feelings.")
        ]),
        h('div.description', [
          h('span.bold', "(2) A searchable database of people's wide-ranging feelings. "),
          h('span', "When you're unhappy it can sometimes feel like you'll never bounce back. What if in those moments you could browse stories of people recovering from their unhappiness? On STORIES OF, users can search for stories matching particular mood trajectories. For example, users can search for stories of people starting out sad but then becoming happy.")
        ])
      ])
    ]);
  }
}

module.exports = new aboutView();