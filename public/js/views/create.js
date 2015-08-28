var Pikaday = require('pikaday');
var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var formHelpers = require('../util/form_helpers');
var createEntrySubview = require('./subviews/create_entry');
var config = require('../config');

var viewState = {
  hideIdentity: false,
  fieldStatus: { date: false }
};

var errorMessages = { date: formHelpers.errorMessages.date };

var picker;

class createView extends view {

  validate() {
    viewState.fieldStatus = { date: false };

    return formHelpers.validate(this, errorMessages, viewState);
  }

  start() {
    super.start();

    picker = new Pikaday(_.defaults({ field: d.gbID('datepicker') }, config.pikadayConfig ));

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "publish-story") {
        var date = picker.toString('x'),
          feeling = d.gbID("feeling-picker").value,
          notes = d.gbID("notes").value,
          hideIdentity = viewState.hideIdentity;

        if(this.validate()) {
          api.post('/create_story', {
            date: +date,
            feeling: feeling,
            notes: notes,
            hideIdentity: hideIdentity
          }, (data) => {
            if(data.error) {

            } else {
              page('story/' + data._id);
            }
          });
        }
      } else if(e.target.getAttribute("id") === "hide-identity") {
        viewState.hideIdentity = !viewState.hideIdentity;

        this.updateState();
      }
    });
  }

  stop() {
    picker.destroy();
  }

  render() {
    var createEntry = createEntrySubview.render(viewState.fieldStatus);

    return h('div#create-story', [
      h('div.title', 'New story'),
      h('div.explanation', 'A story is a collection of entries'),
      h('div.checkbox-wrapper', [
        h('div.checkbox#hide-identity', {
          dataset: {
            hide: viewState.hideIdentity
          }
        }),
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