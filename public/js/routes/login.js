var api = require('../api');
var mediator = require('../mediator');

module.exports = {
  initialize() {

  },
  start() {
    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "login-button") {
        e.preventDefault();
        var form = d.gbID("login-form");

        api.post('/login', {
          username: form.querySelector('[name="username"]').value,
          password: form.querySelector('[name="password"]').value
        }, (data) => {
          if(data.success) {
            page.redirect('/');
          } else {
            console.log("FAILED TO SIGN UP");
            console.log(data.error);
          }
        });
      }
    });
  }
};