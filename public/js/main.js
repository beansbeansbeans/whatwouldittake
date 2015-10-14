var state = require('./state');
var mediator = require("./mediator");
var util = require('./util');
var api = require('./api');
var auth = require("./auth");
var router = require('./router');
var closest = require('./util/closest');

// views
var nav = require('./views/nav');

nav.start();

if(window.location.hostname === "localhost") {
  api.setURL("http://localhost:5500");
} else {
  api.setURL("https://storiesof-49778.onmodulus.net");
}

window.addEventListener("click", (e) => {
  mediator.publish("window_click", e);
});

var loaded = () => {
  router.initialize();

  mediator.publish("loaded");
  d.documentElement.classList.remove('loading');
}

var handleResize = () => {
  var dimensions = state.get('dimensions') || {};
  dimensions.windowWidth = window.innerWidth;
  dimensions.windowHeight = window.innerHeight;

  state.set("dimensions", dimensions);
  mediator.publish("resize");  
}

handleResize();

window.addEventListener("resize", _.debounce(handleResize, 300));

window.addEventListener("DOMContentLoaded", () => {
  util.async([
    (done) => {
      api.get('/session', (err, data) => {
        if(data.data.auth) {
          state.set("user", data.data.user);
          auth.authStatusChange(true);
        } else {

        }
        done();
      });
    }
  ], loaded);

  mediator.subscribe("route_updated", (context) => {
    var path = context.path.split('/')[0];

    if(!path.length) {
      path = "index";
    }

    d.body.setAttribute("data-active-route", path);
  });
});