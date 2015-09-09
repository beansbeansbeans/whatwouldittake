var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var pathUtil = require('../util/path_analysis_helpers');
var sparklineSubview = require('./subviews/sparkline');

var initialState = {
  results: [],
  searching: false,
  drawing: false,
  analysis: null
};

var sampleSearchPath;

var viewState = JSON.parse(JSON.stringify(initialState));

var dimensions = {
  canvas: {
    width: window.innerWidth, // default
    widthOverHeight: 4
  }
}

var gradientSize = 20;
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

var enterSampleSearch = _.once((path) => {
  var length = path.getTotalLength();
  path.setAttribute("style", "stroke-dasharray:" + length + ";stroke-dashoffset:" + length);
  path.classList.add("animate");
});

class searchView extends view {

  clearState() {
    ctx.clearRect(0, 0, dimensions.canvas.width * 2, dimensions.canvas.width * 2 / dimensions.canvas.widthOverHeight);
    
    viewState = JSON.parse(JSON.stringify(initialState));

    points = [];
    pos = { x: 0, y: 0 };
  }

  start() {
    super.start();
    this.clearState();

    _.bindAll(this, 'handleMouseUp', 'handleMouseDown', 'draw', 'handleClick');

    api.get('/sample_search', (err, data) => {
      sampleSearchPath = data.data;
      this.updateState();
    });

    mediator.subscribe("window_click", this.handleClick);
    window.addEventListener('mousemove', this.draw);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.updateState();
  }

  draw(e) {
    if(!dragging || viewState.searching) { return; }
    if(getDistance(e) < 10) { return; }

    ctx.beginPath();

    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FD7475';

    ctx.moveTo(pos.x * 2, pos.y * 2);

    setPosition(e);

    ctx.lineTo(pos.x * 2, pos.y * 2);
    ctx.stroke();
  }

  handleMouseDown(e) {
    if(viewState.searching || !e.target.closest('.canvas-container')) { return; }
    viewState.drawing = true;
    dragging = true;
    this.updateState();
    setPosition(e);
  }

  handleMouseUp(e) {
    if(viewState.searching || !dragging) { return; }
    dragging = false;
    var canvasHeight = dimensions.canvas.width / dimensions.canvas.widthOverHeight;
    viewState.analysis = pathUtil.analyze(points.map((p) => {
      return [p[0], 100 * ((canvasHeight - p[1]) / canvasHeight)];
    }));

    viewState.drawing = false;

    if(points.length > 1) { 
      viewState.searching = true;

      api.post('/search_stories_by_path', {
        inflectionPoints: viewState.analysis.inflectionPoints,
        percentChange: viewState.analysis.percentChange
      }, (data) => {
        viewState.results = data.data;
        this.updateState();
      });
    } else {
      this.clearState();
    }

    this.updateState();
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
    dimensions.canvas.width = Math.ceil(d.gbID("search").offsetWidth / gradientSize) * gradientSize;
    dimensions.resultsWidth = d.qs('.results').offsetWidth
    this.updateState();
  }

  stop() {
    super.stop();

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

    if(!viewState.drawing && !viewState.searching && sampleSearchPath) {
      sparklineSubview.render(d3.select('#sample_search_svg'), {story: sampleSearchPath}, {
        width: dimensions.canvas.width * 0.8,
        height: dimensions.canvas.width * 0.8 / dimensions.canvas.widthOverHeight
      });

      enterSampleSearch(d3.select('#sample_search_svg path')[0][0]);
    }

    viewState.results.forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), {story: story}, {
        width: dimensions.resultsWidth,
        height: dimensions.resultsWidth / dimensions.canvas.widthOverHeight
      });
    });
  }

  render() {
    var canvasWidth = dimensions.canvas.width;
    var canvasHeight = Math.ceil((canvasWidth / dimensions.canvas.widthOverHeight) / gradientSize) * gradientSize;

    var analysis = viewState.analysis;
    var percentChange;
    var inflectionPoints;
    var range;
    var stats;
    var animator;
    var resultsLabel;

    if(viewState.searching) {
      percentChange = h('div.percent-change-display', [
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
      
      inflectionPoints = h('div.inflection-points-display', [
        analysis.inflectionPointIndices.map((d) => {
          return h('div.point', {
            style: {
              left: points[d][0] + 'px',
              top: points[d][1] + 'px'
            }
          })
        })
      ]);

      range = h('div.range-display', [
        analysis.range.map((d) => {
          return h('div.point', {
            style: {
              left: points[d[2]][0] + 'px',
              top: points[d[2]][1] + 'px'
            }
          })
        })
      ]);

      stats = h('div.stats', [
        h('div.percentage-change.stat', [
          h('div.label', 'percentage change'),
          h('div.value', Math.round(analysis.percentChange) + '%')
        ]),
        h('div.inflection-points.stat', [
          h('div.label', 'inflection points'),
          h('div.value', '' + analysis.inflectionPoints.length)
        ]),
        h('div.range.stat', [
          h('div.label', 'range'),
          h('div.value', Math.round(analysis.range[0][1]) + ' - ' + Math.round(analysis.range[1][1]))
        ])
      ]);

      animator = h('div.animator');
      resultsLabel = h('div.results-label', 'Results');
    } else {
      stats = h('div.stats', 'Draw a path.')
    }

    return h('div#search', {
      dataset: { 
        searching: viewState.searching,
        drawing: viewState.drawing
      }
    }, [
      h('div.title', 'Search'),
      h('div.description', 'Find stories by mood history.'),
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
          svg('svg#sample_search_svg'),
          h('div.text', 'E.g.')
        ]),
        h('div.button#clear-search-button', 'Clear search'),
        percentChange,
        inflectionPoints,
        range
      ]),
      h('div.results-container', [
        stats,
        animator,
        resultsLabel,
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
            h('div.entries-count', d.entries.length + ' ' + util.pluralize(d.entries.length, 'entry', 'entries')),
            h('div.date', moment.utc(d.entries[0].date, 'x').format('YYYY MM DD'))
          ])
        }))
      ])
    ]);
  }
}

module.exports = new searchView();