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
  fetching: false,
  searching: false,
  drawing: false,
  analysis: null,
  hovering: ''
};

var statsTourTimeoutIDs = [];

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
    // extra 50px below because it wasn't getting properly cleared out
    ctx.clearRect(0, 0, dimensions.canvas.width * 2, (dimensions.canvas.width * 2 + 50) / dimensions.canvas.widthOverHeight);
    
    viewState = JSON.parse(JSON.stringify(initialState));

    points = [];
    pos = { x: 0, y: 0 };
  }

  start() {
    super.start();
    this.clearState();

    _.bindAll(this, 'handleMouseUp', 'handleMouseDown', 'draw', 'handleClick', 'handleMouseOver', 'handleMouseOut', 'launchStatsTour', 'cancelStatsTour');

    api.get('/sample_search', (err, data) => {
      sampleSearchPath = data.data;
      this.updateState();
    });

    mediator.subscribe("window_click", this.handleClick);
    window.addEventListener('mousemove', this.draw);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener("mouseover", this.handleMouseOver);
    window.addEventListener('mouseout', this.handleMouseOut);
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

  handleMouseOver(e) {
    if(e.target.classList.contains('stat')) {
      this.cancelStatsTour();
      viewState.hovering = e.target.getAttribute("data-stat");
      this.updateState();
    }
  }

  handleMouseOut(e) {
    if(e.target.classList.contains('stat')) {
      viewState.hovering = '';
      this.updateState();
    }
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
      viewState.fetching = true;
      viewState.searching = true;
      this.launchStatsTour();

      api.post('/search_stories_by_path', {
        inflectionPoints: viewState.analysis.inflectionPoints,
        percentChange: viewState.analysis.percentChange,
        range: viewState.analysis.range
      }, (data) => {
        viewState.fetching = false;
        viewState.results = data.data;
        this.updateState();
      });
    } else {
      this.clearState();
    }

    this.updateState();
  }

  launchStatsTour() {
    ['percentage-change', 'inflection-points', 'range', ''].forEach((d, i) => {
      statsTourTimeoutIDs.push(setTimeout(() => {
        viewState.hovering = d;
        this.updateState();
      }, 500 + i * 1500));
    });
  }

  cancelStatsTour() {
    statsTourTimeoutIDs.forEach(x => window.clearTimeout(x));
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
    window.removeEventListener('mouseover', this.handleMouseOver);
    window.removeEventListener('mouseout', this.handleMouseOut);
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

    if(d.qs('.result')) {
      var resultHeight = d.qs('.result').offsetHeight;
    }

    viewState.results.forEach((story, storyIndex) => {
      sparklineSubview.render(d3.select("#svg_" + storyIndex), {story: story}, {
        width: dimensions.resultsWidth,
        height: resultHeight
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
    var resultsLabel;

    if(viewState.searching) {
      percentChange = h('div.percentage-change-display', [
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
        analysis.range.points.map((d) => {
          return h('div.point', {
            style: {
              left: points[d[2]][0] + 'px',
              top: points[d[2]][1] + 'px'
            }
          })
        })
      ]);

      stats = h('div.stats', [
        h('div.stat', {
          dataset: { stat: 'percentage-change' }
        }, [
          h('div.label', 'change'),
          h('div.value', Math.round(analysis.percentChange) + ' percent')
        ]),
        h('div.stat', {
          dataset: { stat: 'inflection-points' }
        }, [
          h('div.label', 'inflection points'),
          h('div.value', '' + analysis.inflectionPoints.points.length)
        ]),
        h('div.stat', {
          dataset: { stat: 'range' }
        }, [
          h('div.label', 'range'),
          h('div.value', Math.round(analysis.range.points[0][1]) + ' to ' + Math.round(analysis.range.points[1][1]))
        ])
      ]);

      var resultsText = [
        h('div.main', viewState.results.length + ' ' + util.pluralize(viewState.results.length, 'story', 'stories')),
        h('div.info', 'Results are collected based on these ways etc.')
      ];

      if(viewState.fetching) {
        resultsText = 'Searching...';
      } else {
        if(!viewState.results.length) {
          resultsText = 'No results.';
        }
      }

      resultsLabel = h('div.results-label', resultsText);
    } else {
      stats = h('div.stats', 'Draw a path.')
    }

    return h('div#search', {
      dataset: { 
        hovering: viewState.hovering,
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
        resultsLabel,
        h('div.results', viewState.results.map((d, i) => {
          var username, lastNote = 'No notes.';
          if(!d.hideIdentity) {
            username = h('div.user', 'by ' + d.user.username);
          }

          d.entries.some((entry) => {
            if(entry.notes.length) {
              lastNote = entry.notes;
              return true;
            }
            return false;
          });

          return h('div.result', {
            style: { height: dimensions.height + 'px' },
            dataset: { storyId: d._id }
          }, [
            svg('svg#svg_' + i),
            h('div.handle', [
              h('div.last-updated', moment.utc(d.lastUpdated, 'x').format('MMM Do')),
              h('div.explanation', 'Last updated')
            ]),
            h('div.main', [
              h('div.excerpt', lastNote),
              h('div.bio', d.entries.length + ' entries '),
              username
            ])
          ])
        }))
      ])
    ]);
  }
}

module.exports = new searchView();