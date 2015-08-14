var state = require('./state');
var mediator = require("./mediator");
var util = require('./util');
var api = require('./api');
var router = require('./router');

if(window.location.hostname === "localhost") {
  api.setURL("http://localhost:5500");
} else {
  api.setURL("https://storiesof-49778.onmodulus.net");
}

mediator.subscribe("window_click", (e) => {
  if(e.target.getAttribute("id") === "logout-button") {
    api.post('/logout', {}, () => {
      page.redirect('/');
    });
  }
});

window.addEventListener("click", (e) => {
  mediator.publish("window_click", e);
});

window.addEventListener("DOMContentLoaded", () => {
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