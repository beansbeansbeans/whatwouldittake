var h = require('virtual-dom/h');
var helpers = require('../../util/belief_helpers');

module.exports = {
  render(opts) {
    var frame, convertButton;

    if(helpers.isBeliever(opts.issue, opts.position)) {
      frame = "You believe:";
    } else {
      frame = "Some believe:";
      // if(helpers.isFormerBeliever(viewState.issue, viewState.position)) {
      //   frame = "Some people (you used to be among them) believe that:";
      // } else {
      // }
      convertButton = h('div#convert-belief', 'I believe this');
    }

    return h('div.header', [
      h('div.header-contents', [
        h('div.prompt', frame),
        h('h1', opts.issue[opts.position]),
        h('div.actions', [
          h('div#see-info', 'Info'),
          h('div#see-other-side', 'See the other side'),
          convertButton
        ])
      ])
    ]);
  }
}