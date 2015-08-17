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
    password: false
  }
};

var errorMessages = {
  username: {
    invalid(val) {
      if(val.length > 2 && val.indexOf(' ') === -1) {
        return true;
      }
      return 'Usernames must be at least 3 characters long and may not contain spaces.';
    }
  },
  email: {
    invalid(val) {
      var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if(re.test(val)) { return true; }
      return 'Sorry, that does not appear to be a valid email address.'
    }
  },
  password: {
    invalid(val) {
      if(val.length > 4 && val.indexOf(' ') === -1) {
        return true;
      }
      return 'Passwords must be at least 5 characters long and may not contain spaces.';
    }
  }
};

class signupView extends view {

  validate() {
    state.attemptingSubmission = true;
    state.fieldStatus = {
      username: false,
      email: false,
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
      if(e.target.getAttribute("id") === "signup-button") {
        e.preventDefault();
        
        var form = d.gbID("signup-form"),
          username = form.querySelector('[name="username"]').value,
          email = form.querySelector('[name="email"]').value,
          password = form.querySelector('[name="password"]').value;

        if(this.validate()) {
          api.post('/signup', {
            username: username,
            email: email,
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
    return h('div#signup-page', [
      h('div.title', 'signup for the app'),
      h('form#signup-form', { method: "post" }, [
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.username !== false }
        }, [
          h('input', {
            type: "text",
            name: "username",
            placeholder: "username"
          }),
          h('div.error', state.fieldStatus.username)
        ]),
        h('div.input-wrapper', {
          dataset: { error: state.fieldStatus.email !== false }
        }, [
          h('input', {
            type: "text",
            name: "email",
            placeholder: "email"
          }),
          h('div.error', state.fieldStatus.email)
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
        h('input#signup-button', {
          type: "submit",
          value: "signup"
        })
      ])
    ]);
  }
}

module.exports = new signupView();