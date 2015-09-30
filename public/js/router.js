var state = require('./state');
var mediator = require('./mediator');
var routes = {
  login: require('./views/login'),
  signup: require('./views/signup'),
  index: require('./views/index'),
  me: require('./views/me'),
  create: require('./views/create'),
  story: require('./views/story'),
  search: require('./views/search'),
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
      page('search', routes.search.start);
      page('me', routes.me.start);
      page('about', routes.about.start);

      page('create', (context) => {
        if(state.get('user')) {
          routes.create.start(context);
        } else {
          routes.signup.start(context);
        }
      });

      page('story/:id', routes.story.start);

      page();
    });

  }
};
