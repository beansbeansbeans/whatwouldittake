var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var util = require('../util');
var state = require('../state');

var viewState = {};

var fadeOutEndHandler = (e) => {
  if(e.target.id === "content") {
    d.gbID("content").classList.remove("fade-out-view");
    d.gbID("content").removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], fadeOutEndHandler);
    page.show(viewState.nextRoute);    
  }
}

var fadeOut = (nextRoute) => {
  viewState.nextRoute = nextRoute;
  d.gbID("content").classList.add("fade-out-view");
  d.gbID("content").addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], fadeOutEndHandler);
}

class navView extends view {
  start() {
    super.start();

    mediator.subscribe('auth_status_change', () => {
      this.updateState();
    });

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "logout-button") {
        api.post('/logout', {}, () => {});
        auth.deauthenticated();
      } else if(e.target.id === 'login-anchor') {
        fadeOut('/login');
      } else if(e.target.id === 'signup-anchor') {
        fadeOut('/signup');
      } else if(e.target.id === 'logo-anchor') {
        fadeOut('/issues');
      } else if(e.target.id === 'about-anchor') {
        fadeOut('/about');
      } else if(e.target.id === 'issues-anchor') {
        fadeOut('/issues');
      }
    });
  }

  mount() {
    super.mount();
  }

  render() {
    var authenticated = state.get('user') !== null,
      login,
      signup,
      logout;

    if(authenticated) {
      logout = h('li#logout-button', 'logout');
    } else {
      login = h('li#login', [
        h('a#login-anchor', 'login')
      ]);
      signup = h('li#signup', [
        h('a#signup-anchor', 'signup')
      ]);
    }

    return h('nav', [
      h('div.contents', [
        h('li#logo', [
          h('a#logo-anchor', 'WWIT')
        ]),
        login,
        signup,
        logout,
        h('li#go-to-about', [
          h('a#about-anchor', 'about')
        ]),
        h('li#go-to-issues', [
          h('a.text#issues-anchor', 'issues')
        ])
      ])
    ]);
  }
}

module.exports = new navView({
  parent: '#nav-container'
});