var h = require('virtual-dom/h');

module.exports = {
  render(opts) {
    var title = opts.title,
      buttons = opts.buttons;

    return h('div.modal', [
      h('div.blackout'),
      h('div.contents', [
        h('div.title', title),
        buttons.map((b) => {
          return h('div.button', {
            dataset: b.dataset
          }, b.text);
        })
      ])
    ]);
  }
};