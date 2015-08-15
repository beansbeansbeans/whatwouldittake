var h = require('virtual-dom/h');
var api = require('../api');
var mediator = require('../mediator');
var view = require('../view');

class meView extends view {
  start() {
    super.start();

    api.get('/me', (err, data) => {
      console.log("SUCCESS");
      console.log(data);
    }, false);    
  }

  render() {
    return h('div', 'welcome to me');
  }
}

module.exports = new meView();