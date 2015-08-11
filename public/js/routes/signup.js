var api = require('../api');
var mediator = require('../mediator');

module.exports = {
  initialize() {

  },
  start() {
    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "signup-button") {
        e.preventDefault();
        api.post('/signup', {
          username: 'ann',
          email: 'ann@ann.com',
          password: 'yuan'
        }, (data) => {
          if(data.success) {
            console.log("SIGNED UP");
          } else {
            console.log("FAILED TO SIGN UP");
          }
          console.log(data);
        });
      }
    });
  }
};