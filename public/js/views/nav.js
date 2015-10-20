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
      this.handleResize();
    });

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "logout-button") {
        api.post('/logout', {}, () => {
          auth.deauthenticated();
        });
      }
    });
  }

  handleResize() {
    var dimensions = state.get('dimensions') || {};
    dimensions.headerHeight = d.qs('nav .contents').getBoundingClientRect().height;

    state.set('dimensions', dimensions);
    this.updateState();
  }

  mount() {
    super.mount();
    this.handleResize();
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
      h('div.spacer', {
        style: { height: state.get('dimensions').headerHeight + 'px' }
      }),
      h('div.contents', [
        h('li#logo', [
          h('a', { href: './'}, 'What would it take?')
        ]),
        logout,
        profile,
        login,
        signup,
        h('div#go-to-about', [
          h('a', { href: './about' }, 'about')
        ]),
        h('div#go-to-issues', [
          h('a.text', { href: './issues' }, 'issues')
        ])
      ])
    ]);
  }
}

module.exports = new navView({
  parent: '#nav-container'
});