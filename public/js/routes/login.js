var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var api = require('../api');
var mediator = require('../mediator');

var rootNode;
var tree;

var updateState = () => {
  var newTree = render();
  var patches = diff(tree, newTree);
  rootNode = patch(rootNode, patches);
  tree = newTree;
};

var render = () => {
  return h('div#login-page', [
    h('div.title', 'login to the app'),
    h('form', [
      h('input')
    ])
  ]);
};

module.exports = {
  initialize() {

  },
  start() {
    tree = render();
    rootNode = createElement(tree);
    d.gbID('content').appendChild(rootNode);

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "login-button") {
        e.preventDefault();
        var form = d.gbID("login-form");

        api.post('/login', {
          username: form.querySelector('[name="username"]').value,
          password: form.querySelector('[name="password"]').value
        }, (data) => {
          if(data.success) {
            page.redirect('/');
          } else {
            console.log("FAILED TO SIGN UP");
            console.log(data.error);
          }
        });
      }
    });
  }
};