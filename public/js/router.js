var state = require('./state');
var mediator = require('./mediator');
var routes = {
  login: require('./views/login'),
  signup: require('./views/signup'),
  condition: require('./views/condition'),
  vote: require('./views/vote'),
  stand: require('./views/stand'),
  meStand: require('./views/meStand'),
  issues: require('./views/issues'),
  about: require('./views/about')
};

var previousRoute;

var getRandomIssueSlug = () => state.get("issues")[Math.round(Math.random() * (state.get("issues").length - 1))].slug;
var getRandomPosition = () => Math.random() > 0.5 ? 'aff' : 'neg';

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
        if(state.get("user") !== null) {
          page.show('/issues');
        } else {
          page.redirect('/vote');
        }
      });

      page('login', routes.login.start);
      page('signup', routes.signup.start);
      page('about', routes.about.start);
      page('issues', routes.issues.start);
      page('stands', () => {
        page.show('stands/' + getRandomIssueSlug() + '/' + getRandomPosition());
      });
      page('stands/:issue', (ctx) => {
        page.show('stands/' + ctx.params.issue + '/' + getRandomPosition());
      });
      page('stands/:issue/:side', routes.stand.start);
      page('me/:issue', routes.meStand.start);
      page('vote', routes.vote.start);
      page('vote/:issue', routes.vote.start);
      page('stands/:issue/:side/:condition', routes.condition.start);
      page();
    });

  }
};
