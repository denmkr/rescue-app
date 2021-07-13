// var fill = d3.scaleOrdinal(d3.schemeCategory10); //For coloring datapoints
  var width = 190;
  var height = 210;

function drawWordCloudFunction(words) {

    d3.select("#wordcloud").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + ~~(width / 2) + "," + ~~(height / 2) + ")")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", function(d) {
          return d.size + "px";
      })
      .style("-webkit-touch-callout", "none")
      .style("-webkit-user-select", "none")
      .style("-khtml-user-select", "none")
      .style("-moz-user-select", "none")
      .style("-ms-user-select", "none")
      .style("user-select", "none")
      .style("cursor", "default")
      .style("font-family", "Impact")
      .style("fill", function(d, i) {
          return d.color;
      })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) {
          return d.text;
      });
  }

  function drawHashtagCloudFunction(words) {
    d3.select("#hashtagcloud").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + ~~(width / 2) + "," + ~~(height / 2) + ")")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", function(d) {
          return d.size + "px";
      })
      .style("-webkit-touch-callout", "none")
      .style("-webkit-user-select", "none")
      .style("-khtml-user-select", "none")
      .style("-moz-user-select", "none")
      .style("-ms-user-select", "none")
      .style("user-select", "none")
      .style("cursor", "default")
      .style("font-family", "Impact")
      .style("fill", function(d, i) {
          return d.color;
      })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) {
          return d.text;
      });
  }