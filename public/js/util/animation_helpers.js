var util = require('../util');

var helpers = {
  fadeOut(nextRoute) {
    this.nextRoute = nextRoute;
    d.gbID("content").classList.add("fade-out-view");
    d.gbID("content").addEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.fadeOutEndHandler);
  },
  fadeOutEndHandler(e) {
    if(e.target.id === "content") {
      d.gbID("content").classList.remove("fade-out-view");
      d.gbID("content").removeEventListener(util.prefixedTransitionEnd[util.prefixedProperties.transition.js], this.fadeOutEndHandler);
      page.show(this.nextRoute);    
    }
  }
};

helpers.fadeOutEndHandler = helpers.fadeOutEndHandler.bind(helpers);

module.exports = helpers;