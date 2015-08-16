var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var state = require('../state');

class navView extends view {
  start() {
    super.start();

    mediator.subscribe('auth_status_change', this.updateState);

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "logout-button") {
        api.post('/logout', {}, () => {
          auth.deauthenticated();
        });
      }
    });
  }

  render() {
    var authenticated = state.get('user') !== null,
      profile,
      login,
      signup,
      logout;

    if(authenticated) {
      profile = h('li#me', [
        h('a', { href: './me' }, 'me')
      ]);
      logout = h('div#logout-button.button', 'logout');
    } else {
      login = h('li#login', [
        h('a', { href: './login' }, 'login')
      ]);
      signup = h('li#signup', [
        h('a', { href: './signup' }, 'signup')
      ]);
    }

    return h('nav', [
      h('li#logo', [
        h('a', { href: './'}, 'stories of')
      ]),
      profile,
      login,
      signup,
      logout,
      h('div#create-story.button', 'Create a story')
    ]);
  }
}

module.exports = new navView({
  parent: '#nav-container'
});