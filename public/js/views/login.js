var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');

var state = {
  attemptingSubmission: false,
  fieldStatus: {
    username: false,
    password: false
  }
};

class loginView extends view {
  start() {
    super.start();

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "login-button") {
        e.preventDefault();
        var form = d.gbID("login-form"),
          username = form.querySelector('[name="username"]').value,
          password = form.querySelector('[name="password"]').value;
        
        state.attemptingSubmission = true;
        state.fieldStatus = {
          username: !username,
          password: !password
        };
        this.updateState();

        if(Object.keys(state.fieldStatus).every(x => !state.fieldStatus[x])) {
          api.post('/login', {
            username: username,
            password: password
          }, (data) => {
            if(data.success) {
              auth.authenticated(data.user);
            } else {
              console.log("FAILED TO SIGN UP");
              console.log(data.error);
            }
          });
        }
      }
    });
  }

  render() {
    return h('div#login-page', [
      h('div.title', 'login to the app'),
      h('form#login-form', { method: "post" }, [
        h('input', {
          type: "text",
          name: "username",
          placeholder: "username",
          dataset: { error: state.fieldStatus.username }
        }),
        h('input', {
          type: "text",
          name: "password",
          placeholder: "password",
          dataset: { error: state.fieldStatus.password }
        }),
        h('input#login-button', {
          type: "submit",
          value: "login"
        })
      ])
    ]);
  }
}

module.exports = new loginView();