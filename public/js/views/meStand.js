var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var api = require('../api');
var state = require('../state');
var mediator = require('../mediator');
var view = require('../view');
var util = require('../util');

var viewState = {}

var dimensions = {};

var chartWidthOverHeight = 2.75;

class meStandView extends view {
  start(ctx) {
    super.start();
    viewState.issue = _.findWhere(state.get("issues"), { slug: ctx.params.issue });
    this.updateState();
  }

  didRender() {
    if(!viewState.issue) { return; }

    var yAxisWidth = 25;
    var dateBuffer = 25;
    var chartWrapper = d3.select(".chart-contents");
    var availableWidth = chartWrapper[0][0].offsetWidth;
    var availableHeight = availableWidth / chartWidthOverHeight;

    var minY = Math.min(Math.min.apply(Math, viewState.issue.data.aff), Math.min.apply(Math, viewState.issue.data.neg));
    var maxY = Math.max(Math.max.apply(Math, viewState.issue.data.aff), Math.max.apply(Math, viewState.issue.data.neg));

    var yScale = d3.scale.linear().domain([minY, maxY]).range([0, availableHeight - dateBuffer]);
    var y = d => yScale(d);
    var x = (d, i) => {
      return yAxisWidth + i * (availableWidth / (viewState.issue.data.aff.length - 1));
    };
    var line = d3.svg.line().x(x).y(y).interpolate("cardinal");

    var chartEl = chartWrapper.select("svg");
    chartEl.attr("width", availableWidth + yAxisWidth).attr("height", availableHeight)
      .style("margin-left", -1 * yAxisWidth);

    var sparklines = chartEl.selectAll("path").data([viewState.issue.data.aff, viewState.issue.data.neg]);
    sparklines.enter().append("path");
    sparklines.attr("d", line);

    if(!d.qs(".date-markers")) {
      chartEl.append("g").attr("class", "date-markers");
    }

    var dateMarkers = chartEl.select(".date-markers").selectAll("text").data(viewState.issue.data.times);
    dateMarkers.enter().append("text");
    dateMarkers.text(d => moment.unix(d).format('M/YY')).attr("x", x).attr("y", availableHeight - 5);

    if(!d.qs(".y-axis-markers")) {
      chartEl.append("g").attr("class", "y-axis-markers");
    }

    var yAxisData = [minY];
    var yAxisCount = 5;
    var yAxisLabelHeight = 10;
    for(var i=1; i<yAxisCount ; i++) {
      if(i === yAxisCount - 1) {
        yAxisData.push(maxY);
      } else {
        yAxisData.push(minY + i * ((maxY - minY) / (yAxisCount - 1)));
      }
    }

    var yAxisMarkers = chartEl.select(".y-axis-markers").selectAll("text").data(yAxisData);
    yAxisMarkers.enter().append("text");
    yAxisMarkers.text(d => Math.round(d)).attr("y", (d, i) => { 
      return (availableHeight - dateBuffer) - i * ((availableHeight - dateBuffer - yAxisLabelHeight) / (yAxisData.length - 1));
    });
  }

  handleResize() {

  }

  mount() {
    super.mount();
    this.handleResize();
  }

  stop() {
    super.stop();
  }

  render() {
    var issue;
    var user = state.get("user");
    var userOnIssue;
    var stand;
    var proof;
    var proofEl;
    var condition;
    var conditionTagline;
    var conditionAuthor;
    var pendingCount;
    var confirmedCount;
    var sourcesForCondition;
    var sourcesOfProof;
    var proofTagline;
    var userOnIssue = viewState.issue && _.findWhere(user.stands, { id: viewState.issue._id});
    var prompt;
    var body;
    var source;

    if(viewState.issue && user && userOnIssue && userOnIssue.previous) {
      prompt = "You believe:";
      stand = userOnIssue.stand;
      issue = viewState.issue[stand];

      condition = _.findWhere(viewState.issue.conditions[stand === 'aff' ? 'neg' : 'aff'], {_id: userOnIssue.previous.conditionID});

      if(condition.author) {
        conditionAuthor = h('div.author', 'by ' + condition.author.name);
      }
      pendingCount = condition.dependents && condition.dependents.filter(x => x.status === 'pending').length;
      confirmedCount = condition.dependents && condition.dependents.filter(x => x.status === 'confirmed').length;

      conditionTagline = condition.tagline;
      proof = _.findWhere(condition.proofs, { _id: userOnIssue.previous.proofID });
      proofTagline = proof.description;

      if(proof.sources && proof.sources.length) {
        sourcesOfProof = h('div.source-list', [
          h('div.label', 'Sources:'),
          proof.sources.map((source) => {
            return h('a.source', {
              href: source.address,
              target: '_blank'
            }, source.display.length ? source.display : source.address)
          })
        ]);
      }

      body = h("div.body", [
        h('div.frame', 'What it took to change your mind:'),
        h('div.main-condition', [
          conditionAuthor,
          h('div.pending', pendingCount + ' ' + util.pluralize(pendingCount, 'opinion') + "  at stake"),
          h('span.separator', '/'),
          h('div.confirmed', {
            dataset: {
              confirmedCount: confirmedCount,
              exists: confirmedCount > 0
            }
          }, confirmedCount + " convinced"),
          h('div.title', conditionTagline),
          sourcesForCondition
        ])
      ]);

      proofEl = h('div.proof', [
        h('div.tagline', proofTagline),
        sourcesOfProof
      ]);
    } else {
      prompt = "The issue:";
      issue = viewState.issue && viewState.issue.description;
    }

    if(viewState.issue) {
      source = h('div.chart-source', [
        h('div.label', 'Source:'),
        h('a.link', {href: viewState.issue.data.source.address}, viewState.issue.data.source.display)
      ]);
    }

    return h('div#me-stand', [
      h('div.contents', [
        h('div.header', [
          h('div.prompt', prompt),
          h('h1', issue)
        ]),
        body,
        proofEl
      ]),
      h('div.chart', [
        h('div.chart-title', 'How opinions have changed:'),
        h('div.chart-contents', [svg('svg')]),
        source
      ])
    ]);
  }
}

module.exports = new meStandView();