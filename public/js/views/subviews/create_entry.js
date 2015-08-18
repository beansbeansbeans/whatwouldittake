var h = require('virtual-dom/h');

module.exports = {
  render(fieldStatus) {
    return h('div#create-entry', [
      h('div.date-wrapper', {
        dataset: { error: fieldStatus.date !== false }
      }, [
        h('div.label', 'Date'),
        h('input#datepicker', {
          type: 'text',
          name: 'date'
        }),
        h('div.error', fieldStatus.date)
      ]),
      h('div.feeling-wrapper', [
        h('div.label', 'How are you feeling?'),
        h('input#feeling-picker', {
          type: 'range',
          name: 'feeling'
        })
      ]),
      h('div.notes-wrapper', [
        h('div.label', 'Notes (optional)'),
        h('textarea#notes')
      ])
    ]);
  }
};