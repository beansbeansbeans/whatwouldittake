module.exports = {
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
      return count + ' ' + singular;
    }
    return count + ' ' + plural;
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
  }
};
