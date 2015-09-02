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
  results: [],
  searching: false,
  drawing: false,
  showingPercentChange: false,
  showingInflectionPoints: false,
  analysis: null
};

var dimensions = {
  canvas: {
    width: window.innerWidth, // default
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
  var edgeOffset = 20;

  pos.x = Math.max(edgeOffset, Math.min(Math.max(e.clientX - offset.x, pos.x), dimensions.canvas.width - edgeOffset));
  pos.y = Math.max(0, Math.min(e.clientY - offset.y, (dimensions.canvas.width / dimensions.canvas.widthOverHeight)));
  points.push([pos.x, pos.y]);
}

class searchView extends view {

  clearState() {
    ctx.clearRect(0, 0, dimensions.canvas.width * 2, dimensions.canvas.width * 2 / dimensions.canvas.widthOverHeight);
    
    viewState = {
      results: [],
      searching: false,
      drawing: false,
      showingPercentChange: false,
      showingInflectionPoints: false,
      analysis: null
    };

    points = [];
    pos = { x: 0, y: 0 };
  }

  start() {
    super.start();

    _.bindAll(this, 'handleMouseUp', 'handleMouseDown', 'draw', 'handleClick');

    mediator.subscribe("window_click", this.handleClick);
    window.addEventListener('mousemove', this.draw);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  draw(e) {
    if(!dragging || viewState.searching) { return; }

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
    if(viewState.searching) { return; }
    viewState.drawing = true;
    dragging = true;
    setPosition(e);
    this.updateState();
  }

  handleMouseUp(e) {
    if(viewState.searching) { return; }
    dragging = false;
    var canvasHeight = dimensions.canvas.width / dimensions.canvas.widthOverHeight;
    viewState.analysis = pathUtil.analyze(points.map((p) => {
      return [p[0], 100 * ((canvasHeight - p[1]) / canvasHeight)];
    }));

    viewState.drawing = false;
    viewState.searching = true;
    viewState.showingPercentChange = true;
    viewState.showingInflectionPoints = true;

    this.updateState();

    api.post('/search_stories_by_path', {
      inflectionPoints: viewState.analysis.inflectionPoints,
      percentChange: viewState.analysis.percentChange
    }, (data) => {
      viewState.results = data.data;
      this.updateState();
    });
  }

  handleClick(e) {
    var storyItem = e.target.classList.contains('result') ? e.target : e.target.closest('.result');

    if(e.target.id === 'clear-search-button') {
      this.clearState();
      this.updateState();
    } else if(storyItem) {
      page('/story/' + storyItem.dataset.storyId);
    }
  }

  handleResize() {
    this.updateState();
  }

  stop() {
    super.stop();
    this.clearState();

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

  didRender() {
    if(!this.mounted) { return; }
    var width = d.qs('.results').offsetWidth;

    viewState.results.forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), {story: story}, {
        width: width,
        height: width / dimensions.canvas.widthOverHeight
      });
    });
  }

  render() {
    var canvasWidth = dimensions.canvas.width;
    var canvasHeight = canvasWidth / dimensions.canvas.widthOverHeight;

    var analysis = viewState.analysis;
    var percentChange;
    var inflectionPoints;
    var stats;

    if(viewState.showingPercentChange) {
      percentChange = h('div.percent-change-display', [
        h('div.description', analysis.percentChange + '% change'),
        h('div.start', {
          style: {
            left: points[0][0] + 'px',
            top: points[0][1] + 'px'
          }
        }),
        h('div.end', {
          style: {
            left: points[points.length - 1][0] + 'px',
            top: points[points.length - 1][1] + 'px'            
          }
        })
      ]);
    }

    if(viewState.showingInflectionPoints) {
      inflectionPoints = h('div.inflection-points-display', [
        h('div.description', analysis.inflectionPointIndices.length + ' inflection points'),
        analysis.inflectionPointIndices.map((d) => {
          return h('div.point', {
            style: {
              left: points[d][0] + 'px',
              top: points[d][1] + 'px'
            }
          })
        })
      ]);
    }

    if(viewState.searching) {
      stats = h('div.stats', 'Stats: ' + analysis.percentChange + '% change, ' + analysis.inflectionPoints.length + ' inflection points.');
    }

    return h('div#search', {
      dataset: { 
        searching: viewState.searching,
        drawing: viewState.drawing
      }
    }, [
      h('div.title', 'Search by mood path.'),
      h('div.canvas-container', {
        style: {
          width: canvasWidth + 'px',
          height: canvasHeight + 'px'
        }
      }, [
        h('canvas', {
          width: canvasWidth * 2,
          height: canvasHeight * 2
        }),
        h('div.sample-search', [
          h('div.text', 'E.g.')
        ]),
        h('div.button#clear-search-button', 'Clear search'),
        percentChange,
        inflectionPoints
      ]),
      h('div.results-container', [
        stats,
        h('div.results', viewState.results.map((d, i) => {
          var username;
          if(!d.hideIdentity) {
            username = h('div.user', d.user.username);
          }

          return h('div.result', {
            style: { height: dimensions.height + 'px' },
            dataset: { storyId: d._id }
          }, [
            svg('svg#svg_' + i),
            username,
            h('div.last-updated', [
              h('div', 'last updated: '),
              h('div', moment.utc(d.lastUpdated, 'x').format('h:mm:ss a'))
            ]),
            h('div.entries-count', util.pluralize(d.entries.length, 'entry', 'entries')),
            h('div.date', moment.utc(d.entries[0].date, 'x').format('YYYY MM DD'))
          ])
        }))
      ])
    ]);
  }
}

module.exports = new searchView();