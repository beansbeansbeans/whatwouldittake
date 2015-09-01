var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var pathUtil = require('../util/path_analysis_helpers');
var sparklineSubview = require('./subviews/sparkline');

var viewState = {
  results: []  
};

var dimensions = {
  canvas: {
    width: 600, // default
    widthOverHeight: 3
  }
}

var pos = { x: 0, y: 0 };
var offset = { x: 0, y: 0 }
var ctx;
var dragging = false;
var points = [];

var getDistance = (e) => {
  var a = Math.max(e.clientX - offset.x, pos.x) - pos.x;
  var b = e.clientY - offset.y - pos.y;
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

var setPosition = (e) => {
  pos.x = Math.max(e.clientX - offset.x, pos.x);
  pos.y = e.clientY - offset.y;
  points.push([pos.x, pos.y]);
}

class searchView extends view {

  start() {
    super.start();

    _.bindAll(this, 'handleMouseUp', 'handleMouseDown', 'draw');

    mediator.subscribe("window_click", this.handleClick);
    window.addEventListener('mousemove', this.draw);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  draw(e) {
    if(!dragging) { return; }

    if(getDistance(e) < 10) { return; }

    ctx.beginPath();

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#77C4D3';

    ctx.moveTo(pos.x * 2, pos.y * 2);

    setPosition(e);

    ctx.lineTo(pos.x * 2, pos.y * 2);

    ctx.stroke();
  }

  handleMouseDown(e) {
    dragging = true;
    setPosition(e);
  }

  handleMouseUp(e) {
    dragging = false;
    var canvasHeight = dimensions.canvas.width / dimensions.canvas.widthOverHeight;
    var analysis = pathUtil.analyze(points.map((p) => {
      return [p[0], 100 * ((canvasHeight - p[1]) / canvasHeight)];
    }));

    api.post('/search_stories_by_path', {
      inflectionPoints: analysis.inflectionPoints,
      percentChange: analysis.percentChange
    }, (data) => {
      viewState.results = data.data;
      this.updateState();
    });
  }

  handleClick(e) {

  }

  handleResize() {
    dimensions.canvas.width = d.qs('#search').offsetWidth;
    this.updateState();
  }

  stop() {
    super.stop();

    pos = { x: 0, y: 0 };

    mediator.unsubscribe("window_click", this.handleClick);
    window.removeEventListener('mousemove', this.draw);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  mount() {
    super.mount();

    var canvas = d.qs('canvas');
    ctx = canvas.getContext('2d');

    var rect = d.qs('.canvas-container').getBoundingClientRect();
    offset.x = rect.left;
    offset.y = rect.top;

    this.handleResize();
  }

  render() {
    var canvasWidth = dimensions.canvas.width;
    var canvasHeight = canvasWidth / dimensions.canvas.widthOverHeight;

    return h('div#search', [
      h('div.title', 'this is the search page'),
      h('div.canvas-container', {
        style: {
          width: canvasWidth + 'px',
          height: canvasHeight + 'px'
        }
      }, [
        h('canvas', {
          width: canvasWidth * 2,
          height: canvasHeight * 2
        })
      ]),
      h('div.results', viewState.results.map((d) => {
        var username;
        if(!d.hideIdentity) {
          username = h('div.user', d.user.username);
        }

        return h('li', {
          style: { height: dimensions.height + 'px' },
          dataset: { storyId: d._id }
        }, [
          username,
          h('div.last-updated', [
            h('div', 'last updated: '),
            h('div', moment.utc(d.lastUpdated, 'x').format('h:mm:ss a'))
          ]),
          h('div.entries-count', util.pluralize(d.entries.length, 'entry', 'entries')),
          h('div.date', moment.utc(d.entries[0].date, 'x').format('YYYY MM DD'))
        ])
      }))
    ]);
  }
}

module.exports = new searchView();