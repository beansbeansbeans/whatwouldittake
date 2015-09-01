var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var sparklineSubview = require('./subviews/sparkline');

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

var draw = (e) => {
  if(!dragging) { return; }

  if(getDistance(e) < 10) { return; }

  ctx.beginPath();

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c0392b';

  ctx.moveTo(pos.x * 2, pos.y * 2);

  setPosition(e);

  ctx.lineTo(pos.x * 2, pos.y * 2);

  ctx.stroke();
}

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

var handleMouseDown = (e) => {
  dragging = true;
  setPosition(e);
}

var handleMouseUp = (e) => {
  dragging = false;
  console.log(analyze(points));
}

var analyze = (arr) => {
  var percentChange, 
    inflectionPoints = [],
    lastDirection,
    minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

  arr.forEach((point, i) => {
    if(point[0] < minX) { minX = point[0]; }
    if(point[0] > maxX) { maxX = point[0]; }
    if(point[1] < minY) { minY = point[1]; }
    if(point[1] > maxY) { maxY = point[1]; }

    if(i > 0) {
      var diff = point[1] - arr[i - 1][1];
      if(i === 1) {
        lastDirection = util.getSign(diff);
      } else {
        if(util.getSign(diff) !== lastDirection && util.getSign(diff) !== 0) {
          inflectionPoints.push(point);
        }

        lastDirection = util.getSign(diff);
      }
    }
  });

  percentChange = (maxY - minY) / (maxX - minX);

  return {
    percentChange: percentChange,
    inflectionPoints: inflectionPoints
  };
}

class searchView extends view {

  start() {
    super.start();

    window.addEventListener('mousemove', draw);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
  }

  handleResize() {
    dimensions.canvas.width = d.qs('#search').offsetWidth;
    this.updateState();
  }

  stop() {
    super.stop();

    pos = { x: 0, y: 0 };

    window.removeEventListener('mousemove', draw);
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
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
      ])
    ]);
  }
}

module.exports = new searchView();