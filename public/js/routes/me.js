var api = require('../api');
var mediator = require('../mediator');

module.exports = {
  initialize() {

  },
  start() {
    console.log("STARTING");
    api.get('/me', (err, data) => {
      console.log("SUCCESS");
      console.log(data);
    }, false);
  }
};