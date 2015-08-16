var Pikaday = require('pikaday');
var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var createEntrySubview = require('./subviews/create_entry');

class createView extends view {
  start() {
    super.start();

    var picker = new Pikaday({ field: d.gbID('datepicker') });

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "publish-story") {
        var date = picker.toString('X'),
          feeling = d.gbID("feeling-picker").value,
          notes = d.gbID("notes").value;

        api.post('/create_story', {
          date: date,
          feeling: feeling,
          notes: notes
        }, (data) => {
          console.log("CREATED A FREAKING STORY");
        });
      }
    });
  }

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
      ]),
      h('div#publish-story', 'Publish story')
    ]);
  }
}

module.exports = new createView();