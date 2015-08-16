var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var createEntrySubview = require('./subviews/create_entry');

class createView extends view {
  render() {
    var createEntry = createEntrySubview.render();

    return h('div#create-story', [
      h('div.title', 'New story'),
      h('div.explanation', 'A story is a collection of entries'),
      h('div.checkbox-wrapper', [
        h('div.checkbox'),
        h('div.label', 'Show my name with this story')
      ]),
      h('div.create-entry-wrapper', [
        h('div.title', 'First entry'),
        createEntry
      ])
    ]);
  }
}

module.exports = new createView();