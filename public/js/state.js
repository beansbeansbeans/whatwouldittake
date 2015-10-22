var state = {
  anonymous_activity: {},
  dimensions: {},
  page: 0,
  page_limit: Infinity,
  pair: [],
  pair_history: [],
  stories: [],
  user: null
};

module.exports = {
  get(prop) {
    return state[prop];
  },
  set(prop, val) {
    state[prop] = val;
  }
};