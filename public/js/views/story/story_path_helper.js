module.exports = {
  render(container, state, dimensions) {
    var story = state.story;

    var horizontalBuffer = typeof dimensions.horizontalBuffer === 'undefined' ? 0 : dimensions.horizontalBuffer,
      verticalBuffer = typeof dimensions.verticalBuffer === 'undefined' ? 25 : dimensions.verticalBuffer,
      dates = story.entries.map(x => x.date).slice(0).reverse(),
      feelings = story.entries.map(x => x.feeling).slice(0).reverse();

    var yScale = d3.scale.linear().domain([0, 100])
      .range([verticalBuffer, dimensions.height - verticalBuffer]),
      y = d => dimensions.height - yScale(d),
      x = (d, i) => {
        return horizontalBuffer + i * (dimensions.width - horizontalBuffer * 2) / (story.entries.length - 1);
      },
      selected = (_, i) => { 
        return i === (feelings.length - 1 - state.firstVisibleStoryIndex); 
      };

    var line = d3.svg.line().x(x).y(y).interpolate("cardinal");

    container
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    var path = container.selectAll("path").data([feelings]);
    
    path.enter().append("path");

    path.attr("d", line);

    var connectors = container.selectAll('line').data(feelings);

    connectors.enter().append('line');

    connectors.exit().remove();

    connectors
      .classed("selected", selected)
      .attr("x1", x).attr("y1", dimensions.height / 2)
      .attr("x2", x).attr("y2", y);

    var circles = container.selectAll("circle").data(feelings);

    circles.enter().append("circle");

    circles.exit().remove();
    
    circles
      .classed("selected", selected)
      .attr("r", 2).attr("cy", dimensions.height / 2).attr("cx", x);

    var labels = container.selectAll("text").data(feelings);

    labels.enter().append("text");

    labels.exit().remove();

    labels
      .classed("selected", selected)
      .attr("x", x).attr("y", (d) => {
        var multiplier = d > 50 ? 1 : -1;
        return (dimensions.height / 2 + 5) + (multiplier * 15);
      })
      .text((d, i) => { return moment.utc(dates[i], 'x').format('MMM D'); });

  }
}