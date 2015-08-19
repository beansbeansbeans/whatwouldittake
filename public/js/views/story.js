var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
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

var svgDimensions = {
  widthOverHeight: 7,
  minWidth: 300,
  maxHeight: 400
};

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
              api.post('/edit_story', {
                id: storyState.story._id,
                date: date,
                feeling: feeling,
                notes: notes
              }, (data) => {
                if(data.success) {
                  storyState.story.entries = data.entries;
                  this.updateState();                  
                }
              });             
            }
          }
        });
      }
    });
  }

  renderSVG() {
    if(!storyState.story) { return; }

    var line = d3.svg.line().x((d, i) => {
      return i * window.innerWidth / storyState.story.entries.length;
    }).y(_.identity);

    var container = d3.select("svg");

    var sparklines = container.selectAll("path")
      .data([storyState.story.entries.map(x => x.feeling)]);

    sparklines.enter().append("path");

    sparklines.attr("d", line);
  }

  didRender() {
    this.renderSVG();
  }

  handleResize() {
    this.renderSVG();
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
      h('div.header', [
        svg('svg', {
          width: window.innerWidth,
          height: 200
        })
      ]),
      userDisplay,
      edit,
      storyState.story.entries
        .sort((a, b) => {
          if(a.date > b.date) { return -1; }
          if(a.date < b.date) { return 1; }
          return 0;
        }).map((entry) => {
          return h('div.entry', [
            h('div.date', moment.utc(entry.date, 'X').format('YYYY MM DD')),
            h('div.feeling', entry.feeling),
            h('div.notes', entry.notes)
          ]);
      })
    ]);
  }
}

module.exports = new storyView();