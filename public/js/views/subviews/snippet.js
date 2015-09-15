var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var util = require('../../util');

module.exports = {
  render(story, storyIndex) {
    var username, lastNote;
    if(!story.hideIdentity) {
      username = h('div.user', 'by ' + story.user.username);
    }

    lastNote = 'No notes.';
    story.entries.some((d) => {
      if(d.notes.length) {
        lastNote = d.notes;
        return true;
      }
      return false;
    });

    return h('li.story-item', {
      dataset: { storyId: story._id }
    }, [
      svg('svg#svg_' + storyIndex),
      h('div.last-updated', [
        h('div.date', moment.utc(story.lastUpdated, 'x').format('MMM Do')),
        h('div', 'last updated')
      ]),
      h('div.main', [
        h('div.last-note', lastNote),
        h('div.entries-count', story.entries.length + ' ' + util.pluralize(story.entries.length, 'entry', 'entries')),
        username
      ])
    ]);
  }
};