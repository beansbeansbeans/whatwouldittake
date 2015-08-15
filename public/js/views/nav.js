var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');

class navView extends view {
  render() {
    return h('nav', [
      h('li#logo', [
        h('a', { href: './'}, 'stories of')
      ]),
      h('li#me', [
        h('a', { href: './me' }, 'me')
      ]),
      h('li#login', [
        h('a', { href: './login' }, 'login')
      ]),
      h('li#signup', [
        h('a', { href: './signup' }, 'signup')
      ],
      h('div#logout-button.button', 'logout'))
    ]);
  }
}

module.exports = new navView({
  parent: '#nav-container'
});