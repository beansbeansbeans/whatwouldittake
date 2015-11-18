var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');
var auth = require('../auth');
var formHelpers = require('../util/form_helpers');

var pristineState = {
  loading: false,
  attemptingSubmission: false,
  fieldStatus: {
    username: false,
    password: false
  }
};

var state = JSON.parse(JSON.stringify(pristineState));

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

    return formHelpers.validate(this, errorMessages, state);
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
          state.loading = true;
          this.updateState();
          api.post('/login', {
            username: username,
            password: password
          }, (data) => {
            if(data.success) {
              auth.authenticated(data.data.user);
            } else {
              state.loading = false;
              state.fieldStatus[data.data.error.field] = data.data.error.message;
              this.updateState();
            }
          });
        }
      }
    });
  }

  stop() {
    state = JSON.parse(JSON.stringify(pristineState));
  }

  render() {
    return h('div#login-page', [
      h('div.title', 'Welcome back'),
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
        h('div#login-button', {
          dataset: { loading: state.loading }
        }, [
          h('div.button-loader', [
            h('div.button-loader-center')
          ]),
          h('div.text', 'login')
        ])
      ])
    ]);
  }
}

module.exports = new loginView();