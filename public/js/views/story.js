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
  widthOverHeight: 10,
  minWidth: 300,
  maxHeight: 300
};

var setFeelingBounds = () => {
  storyState.minFeeling = Math.min.apply(Math, storyState.story.entries.map(x => x.feeling));
  storyState.maxFeeling = Math.max.apply(Math, storyState.story.entries.map(x => x.feeling));
}

var picker;

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
      setFeelingBounds();

      this.updateState();

      if(storyState.isOwnStory) {
        picker = new Pikaday({ field: d.gbID('datepicker') });
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
                  setFeelingBounds();
                  this.updateState();                  
                }
              });             
            }
          }
        });
      }
    });
  }

  stop() {
    picker.destroy();
  }

  renderSVG() {
    if(!storyState.story || storyState.story.entries.length === 1) { return; }

    var svgBuffer = 10;

    var yScale = d3.scale.linear().domain([storyState.minFeeling, storyState.maxFeeling])
      .range([svgBuffer, svgDimensions.height - svgBuffer * 2]);

    var line = d3.svg.line().x((d, i) => {
      return svgBuffer + i * (svgDimensions.width - svgBuffer * 2) / (storyState.story.entries.length - 1);
    }).y((d) => {
      return svgDimensions.height - yScale(d);
    });

    var container = d3.select("svg").attr("width", svgDimensions.width)
      .attr("height", svgDimensions.height);

    var sparklines = container.selectAll("path")
      .data([storyState.story.entries.map(x => x.feeling)]);

    sparklines.enter().append("path");

    sparklines.attr("d", line);
  }

  didRender() {
    this.renderSVG();
  }

  handleResize() {
    svgDimensions.width = Math.max(window.innerWidth - 10, svgDimensions.minWidth);
    svgDimensions.height = Math.min(svgDimensions.width / svgDimensions.widthOverHeight, svgDimensions.maxHeight);

    this.renderSVG();
  }

  mount() {
    super.mount();
    this.handleResize();
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
      h('div.header', [
        svg('svg')
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