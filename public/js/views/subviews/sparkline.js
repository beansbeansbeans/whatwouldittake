module.exports = {
  render(container, story, dimensions) {
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
      .attr("height", dimensions.height)
      .selectAll("path").data([feelings])
      .enter().append("path").attr("d", line);

    container.selectAll("circle").data(feelings)
      .enter().append("circle")
      .attr("r", 5).attr("cy", y).attr("cx", x);
  }
}