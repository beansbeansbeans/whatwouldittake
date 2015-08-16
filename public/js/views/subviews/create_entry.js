var h = require('virtual-dom/h');

module.exports = {
  render() {
    return h('div#create-entry', [
      h('div.date-wrapper', [
        h('div.label', 'Date')
      ]),
      h('div.feeling-wrapper', [
        h('div.label', 'How are you feeling?')
      ]),
      h('div.notes-wrapper', [
        h('div.label', 'Notes (optional)')
      ])
    ]);
  }
};