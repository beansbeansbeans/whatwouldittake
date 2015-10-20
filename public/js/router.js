var state = require('./state');
var mediator = require('./mediator');
var routes = {
  login: require('./views/login'),
  signup: require('./views/signup'),
  index: require('./views/index'),
  issues: require('./views/issues'),
  me: require('./views/me'),
  about: require('./views/about')
};

var previousRoute;

module.exports = {
  initialize() {
    mediator.subscribe("loaded", () => {

      mediator.subscribe("last_route", (data) => {
        previousRoute = data;
      })
      page.base('/');

      page((context, next) => {
        if(typeof previousRoute !== 'undefined') {
          previousRoute.stop();
        }

        mediator.publish("route_updated", context);
        next();
      });

      page('/', (context) => {
        if(context.pathname.indexOf("#!") !== -1) {
          page.redirect(context.pathname.slice(3));
        }
        routes.index.start();
      });

      page('login', routes.login.start);
      page('signup', routes.signup.start);
      page('me', routes.me.start);
      page('about', routes.about.start);
      page('issues', routes.issues.start);

      page();
    });

  }
};
