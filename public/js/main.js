var state = require('./state');
var mediator = require("./mediator");
var util = require('./util');
var api = require('./api');
var auth = require("./auth");
var router = require('./router');

// views
var nav = require('./views/nav');

nav.start();

if(window.location.hostname === "localhost") {
  api.setURL("http://localhost:5500");
} else {
  api.setURL("https://storiesof-49778.onmodulus.net");
}

mediator.subscribe("window_click", (e) => {
  if(e.target.getAttribute("id") === "logout-button") {
    api.post('/logout', {}, () => {
      auth.deauthenticated();
    });
  }
});

window.addEventListener("click", (e) => {
  mediator.publish("window_click", e);
});

window.addEventListener("DOMContentLoaded", () => {
  api.get('/session', (err, data) => {
    if(data.data.auth) {
      state.set("user", data.user);
      auth.authStatusChange(true);
    } else {

    }
  });

  mediator.subscribe("route_updated", (context) => {
    var path = context.path.split('/')[0];

    if(!path.length) {
      path = "index";
    }

    d.body.setAttribute("data-active-route", path);
  });

  router.initialize();

  mediator.publish("loaded");
  d.documentElement.classList.remove('loading');
});