var mediator = require('./mediator');
var state = require("./state");

module.exports = {
  authenticated(user) {
    state.set("user", user);
    page.redirect('/');
    this.authStatusChange(true);
  },
  deauthenticated() {
    state.set("user", null);
    page.redirect('/');
    this.authStatusChange(false);
  },
  authStatusChange(authenticated) {
    mediator.publish('auth_status_change', authenticated);
  }
}