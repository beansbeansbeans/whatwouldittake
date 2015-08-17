var state = require('./state');
var mediator = require('./mediator');
var routes = {
  login: require('./views/login'),
  signup: require('./views/signup'),
  index: require('./views/index'),
  me: require('./views/me'),
  create: require('./views/create'),
  story: require('./views/story')
};

module.exports = {
  initialize() {
    mediator.subscribe("loaded", () => {
      page.base('/');

      page((context, next) => {
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
