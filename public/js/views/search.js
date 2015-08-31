var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');
var sparklineSubview = require('./subviews/sparkline');

var pos = {
  x: 0,
  y: 0
};

var offset = {
  x: 0,
  y: 0
}

var ctx;
var dragging = false;

var draw = (e) => {
  if(!dragging) { return; }

  ctx.beginPath();

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c0392b';

  ctx.moveTo(pos.x, pos.y);
  setPosition(e);
  ctx.lineTo(pos.x, pos.y);

  ctx.stroke();
}

var setPosition = (e) => {
  pos.x = e.clientX - offset.x;
  pos.y = e.clientY - offset.y;
}

var handleMouseDown = (e) => {
  dragging = true;
  setPosition(e);
}

var handleMouseUp = (e) => {
  dragging = false;
}

class searchView extends view {

  start() {
    super.start();

    window.addEventListener('mousemove', draw);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
  }

  stop() {
    super.stop();

    window.removeEventListener('mousemove', draw);
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  mount() {
    super.mount();

    var canvas = d.qs('canvas');
    ctx = canvas.getContext('2d');

    var rect = canvas.getBoundingClientRect();
    offset.x = rect.left;
    offset.y = rect.top;
  }

  render() {
    return h('div#search', [
      h('div.title', 'this is the search page'),
      h('canvas', {
        width: 600,
        height: 300
      })
    ]);
  }
}

module.exports = new searchView();