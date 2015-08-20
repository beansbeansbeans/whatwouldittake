module.exports = {
  render(container, story, dimensions) {
    if(!story || story.entries.length === 1) { return; }

    var svgBuffer = 10;

    var minFeeling = Math.min.apply(Math, story.entries.map(x => x.feeling));
    var maxFeeling = Math.max.apply(Math, story.entries.map(x => x.feeling));

    var yScale = d3.scale.linear().domain([minFeeling, maxFeeling])
      .range([svgBuffer, dimensions.height - svgBuffer * 2]);

    var line = d3.svg.line().x((d, i) => {
      return svgBuffer + i * (dimensions.width - svgBuffer * 2) / (story.entries.length - 1);
    }).y((d) => {
      return dimensions.height - yScale(d);
    });

    container.attr("width", dimensions.width).attr("height", dimensions.height);

    var sparklines = container.selectAll("path").data([story.entries.map(x => x.feeling)]);

    sparklines.enter().append("path");

    sparklines.attr("d", line);
  }
}