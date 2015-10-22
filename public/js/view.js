var util = require('./util');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var mediator = require('./mediator');

class view {
  constructor(opts) {
    opts = opts || {};
    
    this.mounted = false;

    this.tree = null;
    this.rootNode = null;
    this.parent = opts.parent || '#content';

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.didRender = this.didRender.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.mount = this.mount.bind(this);
    this.inflate = this.inflate.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  inflate() {}

  didRender() {}

  handleResize() {}

  stop() {
    this.mounted = false;
    mediator.unsubscribe("resize", this.handleResize);
  }
  
  start() {
    this.mounted = true;
    this.tree = this.render();
    this.rootNode = createElement(this.tree);
    this.mount();
    mediator.publish("last_route", this);
  }

  mount() {
    if(d.qs(this.parent).hasChildNodes()) {
      d.qs(this.parent).replaceChild(this.rootNode, d.qs(this.parent).childNodes[0]);
    } else {
      d.qs(this.parent).appendChild(this.rootNode);
    }    

    mediator.subscribe("resize", this.handleResize);
  }

  updateState() {
    var newTree = this.render();
    var patches = diff(this.tree, newTree);
    this.rootNode = patch(this.rootNode, patches);
    this.tree = newTree;
    this.didRender();
  }  
}

module.exports = view;