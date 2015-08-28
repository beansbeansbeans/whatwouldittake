module.exports = {
  render(container, state, dimensions) {
    var story = state.story;
    if(!story || story.entries.length === 1) { return; }

    var svgBuffer = 10,
      minFeeling = Math.min.apply(Math, story.entries.map(x => x.feeling)),
      maxFeeling = Math.max.apply(Math, story.entries.map(x => x.feeling)),
      feelings = story.entries.map(x => x.feeling);

    var yScale = d3.scale.linear().domain([minFeeling, maxFeeling])
      .range([svgBuffer, dimensions.height - svgBuffer * 2]),
      y = (d) => {
        return dimensions.height - yScale(d)
      },
      x = (d, i) => {
        return svgBuffer + i * (dimensions.width - svgBuffer * 2) / (story.entries.length - 1);
      };

    var line = d3.svg.line().x(x).y(y);

    container
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    var path = container.selectAll("path").data([feelings]);
    
    path.enter().append("path");

    path.attr("d", line);

    var circles = container.selectAll("circle").data(feelings);

    circles.enter().append("circle");
    
    circles
      .classed("selected", (_, i) => { return i === state.firstVisibleStoryIndex; })
      .attr("r", 5).attr("cy", y).attr("cx", x);
  }
}