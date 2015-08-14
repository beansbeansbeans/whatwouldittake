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
  }
};