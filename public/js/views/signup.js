var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');

var state = {
  attemptingSubmission: false,
  fieldStatus: {
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  }
};

class signupView extends view {
  start() {
    super.start();

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "signup-button") {
        e.preventDefault();
        var form = d.gbID("signup-form"),
          username = form.querySelector('[name="username"]').value,
          email = form.querySelector('[name="email"]').value,
          password = form.querySelector('[name="password"]').value,
          confirmPassword = form.querySelector('[name="confirm_password"]').value;

        state.attemptingSubmission = true;
        state.fieldStatus = {
          username: !username,
          email: !email,
          password: !password,
          confirmPassword: !confirmPassword
        };
        this.updateState();

        if(Object.keys(state.fieldStatus).every(x => !state.fieldStatus[x])) {
          api.post('/signup', {
            username: username,
            email: email,
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
    return h('div#signup-page', [
      h('div.title', 'signup for the app'),
      h('form#signup-form', { method: "post" }, [
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.username }
        }, [
          h('input', {
            type: "text",
            name: "username",
            placeholder: "username"
          }),
          h('div.error', 'This field is required.')
        ]),
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.email }
        }, [
          h('input', {
            type: "text",
            name: "email",
            placeholder: "email"
          }),
          h('div.error', 'This field is required.')
        ]),
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.password }
        }, [
          h('input', {
            type: "password",
            name: "password",
            placeholder: "password"
          }),
          h('div.error', 'This field is required.')
        ]),
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.confirmPassword }
        }, [
          h('input', {
            type: "password",
            name: "confirm_password",
            placeholder: "confirm password"
          }),
          h('div.error', 'This field is required.')
        ]),
        h('input#signup-button', {
          type: "submit",
          value: "signup"
        })
      ])
    ]);
  }
}

module.exports = new signupView();