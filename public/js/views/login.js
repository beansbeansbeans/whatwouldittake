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

var errorMessages = {
  username: {
    invalid(val) {
      if(val.length) { return true; }
      return 'This field is required.';
    }
  },
  password: {
    invalid(val) {
      if(val.length) { return true; }
      return 'This field is required.';
    }
  }
};

class loginView extends view {

  validate() {
    state.attemptingSubmission = true;
    state.fieldStatus = {
      username: false,
      password: false
    };

    Object.keys(errorMessages).forEach((field) => {
      var displayMsg;

      Object.keys(errorMessages[field]).every((error) => {
        var result = errorMessages[field][error](d.querySelector('[name="' + field + '"]').value);
        if(result !== true) {
          state.fieldStatus[field] = result;
        }

        return result === true;
      });
    });

    this.updateState();

    return Object.keys(state.fieldStatus).every(x => !state.fieldStatus[x]);
  }

  start() {
    super.start();

    mediator.subscribe("window_click", (e) => {
      if(e.target.getAttribute("id") === "login-button") {
        e.preventDefault();
        var form = d.gbID("login-form"),
          username = form.querySelector('[name="username"]').value,
          password = form.querySelector('[name="password"]').value;
        
        if(this.validate()) {
          api.post('/login', {
            username: username,
            password: password
          }, (data) => {
            if(data.success) {
              auth.authenticated(data.user);
            } else {
              state.fieldStatus[data.error.field] = data.error.message;
              this.updateState();
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
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.username !== false }
        }, [
          h('input', {
            type: "text",
            name: "username",
            placeholder: "username or email address"
          }),
          h('div.error', state.fieldStatus.username)
        ]),
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.password !== false }
        }, [
          h('input', {
            type: "password",
            name: "password",
            placeholder: "password"
          }),
          h('div.error', state.fieldStatus.password)
        ]),
        h('input#login-button', {
          type: "submit",
          value: "login"
        })
      ])
    ]);
  }
}

module.exports = new loginView();