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
        h('div.subtitle', 'Our goal is to help people become better informed about their opinions.'),
        h('div.quote.description', [
          h('em', "One sign that you're capable of constructive self-criticism is that you're not dumbfounded by the question: What would it take to convince you you're wrong? If you can't answer that question you can take that as a warning sign."),
          h('span', ' - Philip Tetlock')
        ]),
        h('div.description', "What Would It Take (WWIT) encourages users to consider beliefs that contradict their own by asking them to describe what evidence could change their beliefs. WWIT focuses on hot button issues like gun control and climate change, where beliefs tend to be rigid and impassioned."),
        h('div.description', "Sometimes a user will be able to articulate mind-changing evidence - for example, a user may believe stricter gun laws would not reduce mass shootings, but he may also acknowledge that he would change his mind if shown evidence that criminals would obey gun laws. Thus, WWIT gives the user a way to consider opposing beliefs."),
        h('div.description', "Other times, a user will not be able to articulate any evidence that would change his mind. WWIT may then prompt the uncomfortable realization that his belief cannot be refuted because it is based on emotion, not evidence.")
      ])
    ]);
  }
}

module.exports = new aboutView();