var state = require("./state");

module.exports = {
  authenticated(user) {
    state.set("user", user);
    page.redirect('/');
  },
  deauthenticated() {
    state.set("user", null);
    page.redirect('/');
  }
}