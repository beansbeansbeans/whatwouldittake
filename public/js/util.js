module.exports = {
  vendors: ['', 'webkit', 'Moz', 'O'],
  prefixedProperties: {
    transition: {
      js: "transition",
      dom: "transition"
    },
    transform: {
      js: "transform",
      dom: "transform"
    },
    transformOrigin: {
      js: "transformOrigin",
      dom: "transform-origin"
    },
    animation: {
      js: "animation",
      dom: "animation"
    }
  },
  prefixedKeyframe: {
    'animation': '@keyframes',
    'webkitAnimation': '@-webkit-keyframes'
  },
  prefixedTransitionEnd: {
    'transition':'transitionend',
    'webkitTransition':'webkitTransitionEnd'
  },
  prefixedAnimationEnd: {
    'animation': 'animationend',
    'webkitAnimation': 'webkitAnimationEnd'
  },
  capitalize: (str) => str.replace(str[0], str[0].toUpperCase()),
  extend(props) {
    var prop, obj;
    obj = Object.create(this);
    for(prop in props) {
      if(props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }

    return obj;
  },
  pluralize(count, singular, plural) {
    plural = plural || singular + 's';
    if(count === 1) {
      return singular;
    }
    return plural;
  },
  async(tasks, callback) {
    var count = 0, n = tasks.length;

    function complete() {
      count += 1;
      if (count === n) {
        callback();
      }
    }

    tasks.forEach(x => x(complete));
  },
  getDocumentHeight() {
    return Math.max(
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
  },
  getSign(x) {
    if(x > 0) {
      return 1;
    } else if(x < 0) {
      return -1;
    }
    return 0;
  },
  initialize() {
    this.vendors.every((prefix) => {
      var e = 'transform';

      if(prefix.length) { e = prefix + 'Transform'; }

      if(typeof document.body.style[e] !== 'undefined') {
        Object.keys(this.prefixedProperties).forEach((prop, index) => {
          if(prefix.length) {
            this.prefixedProperties[prop].js = prefix + this.capitalize(prop);
            this.prefixedProperties[prop].dom = "-" + prefix + "-" + prop;            
          } else {
            this.prefixedProperties[prop].js = prop;
            this.prefixedProperties[prop].dom = prop;
          }
        });
        return false;
      }
      return true;
    });
  }
};
