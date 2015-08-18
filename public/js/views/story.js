var h = require('virtual-dom/h');
var api = require('../api');
var Pikaday = require('pikaday');
var mediator = require('../mediator');
var view = require('../view');
var state = require('../state');
var createEntrySubview = require('./subviews/create_entry');
var formHelpers = require('../util/form_helpers');

var storyState = {
  isOwnStory: false,
  fieldStatus: { date: false }
};

var errorMessages = { date: formHelpers.errorMessages.date };

class storyView extends view {

  validate() {
    storyState.fieldStatus = { date: false };

    return formHelpers.validate(this, errorMessages, storyState);
  }

  start(ctx) {
    super.start();

    api.get('/story/' + ctx.params.id, (error, data) => {
      storyState.story = data.data;
      storyState.isOwnStory = state.get('user') && state.get('user')._id === storyState.story.user._id;
      this.updateState();

      if(storyState.isOwnStory) {
        var picker = new Pikaday({ field: d.gbID('datepicker') });
        mediator.subscribe("window_click", (e) => {
          if(e.target.getAttribute("id") === "update-story-button") {
            var date = picker.toString('X'),
              feeling = d.qs('[name="feeling"]').value,
              notes = d.qs('[name="notes"]').value;

            if(this.validate()) {
              console.log("READY TO UPDATE");
              console.log(date, feeling, notes);              
            }
          }
        });
      }
    });
  }

  render() {
    if(!storyState.story) { return h('div'); }

    var userDisplay, edit;

    if(!storyState.story.hideIdentity) {
      userDisplay = h('div.user', storyState.story.user.username);
    }

    if(storyState.isOwnStory) {
      edit = h('div.edit', [
        h('div', 'Add an entry!'),
        createEntrySubview.render(storyState.fieldStatus),
        h('div#update-story-button', 'Update')
      ]);
    }

    return h('div#story-view', [
      h('div.title', 'It is a story!!!!!'),
      userDisplay,
      edit,
      storyState.story.entries.map((entry) => {
        return h('div.entry', [
          h('div.date', moment.utc(entry.date, 'X').format('YYYY')),
          h('div.feeling', entry.feeling),
          h('div.notes', entry.notes)
        ]);
      })
    ]);
  }
}

module.exports = new storyView();