var state = require('../state');
var api = require('../api');

module.exports = {
  isBeliever(issue, position) {
    var user = state.get("user") || state.get("anonymous_activity");
    var matchingIssue = _.findWhere(user.stands, {id: issue._id});

    return matchingIssue && matchingIssue.stand === position;
  },
  refreshIssue(issue) {
    var issues = state.get("issues");
    var thisIssueIndex = _.findIndex(issues, x => x.slug === issue.slug);
    issues[thisIssueIndex] = issue;
    state.set("issues", issues);
    api.setCache("/issues", issues);
  }
}