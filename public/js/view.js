var util = require('./util');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

class view {
  constructor(opts) {
    opts = opts || {};

    this.tree = null;
    this.rootNode = null;
    this.parent = opts.parent || '#content';

    this.start = this.start.bind(this);
    this.mount = this.mount.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  initialize() {}

  start() {
    this.tree = this.render();
    this.rootNode = createElement(this.tree);
    this.mount();
  }

  mount() {
    if(d.qs(this.parent).hasChildNodes()) {
      d.qs(this.parent).replaceChild(this.rootNode, d.qs(this.parent).childNodes[0]);
    } else {
      d.qs(this.parent).appendChild(this.rootNode);
    }    
  }

  updateState() {
    var newTree = this.render();
    var patches = diff(this.tree, newTree);
    this.rootNode = patch(this.rootNode, patches);
    this.tree = newTree;
  }  
}

module.exports = view;