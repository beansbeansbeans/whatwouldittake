var state = require('./state');
var mediator = require("./mediator");
var util = require('./util');
var api = require('./api');
var auth = require("./auth");
var router = require('./router');
var closest = require('./util/closest');
var useragent = require('./useragent');

// views
var nav = require('./views/nav');

util.initialize();
nav.start();

if(window.location.hostname === "localhost") {
  api.setURL("http://localhost:5500");
} else {
  api.setURL("http://whatwouldittake-53541.onmodulus.net");
}

window.addEventListener("click", (e) => {
  mediator.publish("window_click", e);
});

window.addEventListener("keydown", (e) => {
  mediator.publish("window_keydown", e);
});

window.addEventListener("keyup", (e) => {
  mediator.publish("window_keyup", e);
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
    },
    (done) => {
      api.get('/issues', (err, data) => {
        state.set("issues", data.data);
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