var Pikaday = require('pikaday');
var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var createEntrySubview = require('./subviews/create_entry');

var viewState = {
  hideIdentity: false,
  fieldStatus: {
    date: false
  }
};

var errorMessages = {
  date: {
    invalid(val) {
      if(val.length && moment.utc(val, 'YYYY-MM-DD').isValid()) { return true; }
      return 'Invalid date.'
    }
  }
}

class createView extends view {

  validate() {
    viewState.fieldStatus = {
      date: false
    };

    Object.keys(errorMessages).forEach((field) => {
      Object.keys(errorMessages[field]).every((error) => {
        var result = errorMessages[field][error](d.qs('[name="' + field + '"]').value);
        if(result !== true) {
          viewState.fieldStatus[field] = result;
        }
        return result === true;
      })
    });

    this.updateState();

    return Object.keys(viewState.fieldStatus).every(x => !viewState.fieldStatus[x]);
  }

  start() {
    super.start();

    var picker = new Pikaday({ field: d.gbID('datepicker') });

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "publish-story") {
        var date = picker.toString('X'),
          feeling = d.gbID("feeling-picker").value,
          notes = d.gbID("notes").value,
          hideIdentity = viewState.hideIdentity;

        if(this.validate()) {
          api.post('/create_story', {
            date: date,
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