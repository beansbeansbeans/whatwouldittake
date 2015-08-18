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
  async(tasks, callback) {
    var count = 0, n = tasks.length;

    function complete() {
      count += 1;
      if (count === n) {
        callback();
      }
    }

    tasks.forEach(x => x(complete));
  }
};
