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
          h('span', "The site is composed of posts in which users grade their feelings at a particular moment on a scale of one to 100. A user's posts over time form a story of their feelings. Text is optional, and users can post anonymously. This way, a post is simply an acknowledgment of a user's feelings.")
        ]),
        h('div.description', [
          h('span.bold', "(2) A searchable database of people's wide-ranging feelings. "),
          h('span', [
            h('span', "When we're unhappy it can feel like we'll never bounce back. What if in those moments we could browse stories of people recovering from their unhappiness? On STORIES OF, users can "),
            h('a', { href: '/search' }, 'search'),
            h('span', ' for stories matching particular trajectories of feeling. For example, users can search for stories of people feeling sad but then getting happier, or vice versa.')
          ])
        ])
      ])
    ]);
  }
}

module.exports = new aboutView();