module.exports = {
  render(container, state, dimensions) {
    var story = state.story;
    
    var horizontalBuffer = typeof dimensions.horizontalBuffer === 'undefined' ? 10 : dimensions.horizontalBuffer,
      verticalBuffer = typeof dimensions.verticalBuffer === 'undefined' ? 10 : dimensions.verticalBuffer,
      minFeeling = Math.min.apply(Math, story.entries.map(x => x.feeling)),
      maxFeeling = Math.max.apply(Math, story.entries.map(x => x.feeling)),
      feelings = story.entries.map(x => x.feeling).slice(0).reverse();

    var yScale = d3.scale.linear().domain([minFeeling, maxFeeling])
      .range([verticalBuffer, dimensions.height - verticalBuffer]),
      y = (d) => {
        return dimensions.height - yScale(d)
      },
      x = (d, i) => {
        return horizontalBuffer + i * (dimensions.width - horizontalBuffer * 2) / (story.entries.length - 1);
      };

    var line = d3.svg.line().x(x).y(y).interpolate("cardinal");

    container
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    var path = container.selectAll("path").data([feelings]);
    
    path.enter().append("path");

    path.attr("d", line);

    var circles = container.selectAll("circle").data(feelings);

    circles.enter().append("circle");

    circles.exit().remove();
    
    circles
      .classed("selected", (_, i) => { 
        return i === (feelings.length - 1 - state.firstVisibleStoryIndex); 
      })
      .attr("r", 5).attr("cy", y).attr("cx", x);
  }
}