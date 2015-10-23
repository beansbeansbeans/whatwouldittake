var state = require('../state');

module.exports = {
  isBeliever(issue, position) {
    var user = state.get("user") || state.get("anonymous_activity");
    var matchingIssue = _.findWhere(user.stands, {id: issue._id});

    return matchingIssue && matchingIssue.stand === position;
  }
}