var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var state = require('../state');

class navView extends view {
  start() {
    super.start();

    mediator.subscribe('auth_status_change', () => {
      this.updateState();
    });

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "logout-button") {
        api.post('/logout', {}, () => {
          auth.deauthenticated();
        });
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
      logout = h('div#logout-button', 'logout');
    } else {
      login = h('li#login', [
        h('a', { href: './login' }, 'login')
      ]);
      signup = h('li#signup', [
        h('a', { href: './signup' }, 'signup')
      ]);
    }

    return h('nav', [
      h('div.contents', [
        h('li#logo', [
          h('a', { href: './issues'}, 'WWIT')
        ]),
        h('li#go-to-about', [
          h('a', { href: './about' }, 'about')
        ]),
        h('li#go-to-issues', [
          h('a.text', { href: './issues' }, 'issues')
        ]),
        login,
        signup,
        logout
      ])
    ]);
  }
}

module.exports = new navView({
  parent: '#nav-container'
});