var state = {
  user: null,
  pair_history: [],
  pair: []
};

module.exports = {
  get(prop) {
    return state[prop];
  },
  set(prop, val) {
    state[prop] = val;
  }
};