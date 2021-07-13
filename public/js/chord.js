console.log("hello");
createChordChart();

function createChordChart(){
	var matrixData={
  "Palace Hills":
  [0, 10,5,4,10,10,0,0,0,0],
  "Nuclear":
  [0, 0,0,0,0,0,0,0,0,0],
  "Energy":
  [0, 0,0,0,0,0,0,0,0,0],
  "Water":
  [0, 0,0,0,0,0,0,0,0,0],
  "Gas":
  [0, 0,0,0,0,0,0,0,0,0],
  "Hospital":
  [0, 0,0,0,0,0,0,0,0,0],
  "Firefighters":
  [0, 0,0,0,0,0,0,0,0,0],
  "Shelters":
  [0, 0,0,0,0,0,0,0,0,0],
  "Garbage":
  [0, 0,0,0,0,0,0,0,0,0],
  "Traffic":
  [0, 0,0,0,0,0,0,0,0,0]
}

matrix= Object.values(matrixData);
matrixKeys = Object.keys(matrixData);

var width = 800, height= 800;
  
var svg = d3.select("#chord").append('svg')
	.attr('width',width)
	.attr('height',height),
    outerRadius = Math.min(width, height) * 0.5 - 150,
    innerRadius = outerRadius - 30;

var formatValue = d3.formatPrefix(",.0", 1e3);

var chord = d3.chord()
    .padAngle(0.024)
    .sortSubgroups(d3.descending);

var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var ribbon = d3.ribbon()
    .radius(innerRadius);

var color = d3.scaleOrdinal()
    .domain(d3.range(10))
    .range(d3.schemeCategory10);

var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(75)")
    .datum(chord(matrix));

var group = g.append("g")
    .attr("class", "groups")
  .selectAll("g")
  .data(function(chords) { return chords.groups; })
  .enter().append("g");

group.append("path")
    .style("fill", function(d) { return color(d.index); })
    .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
    .attr("d", arc);

var groupTick = group.selectAll(".group-tick")
  .data(function(d) { return groupTicks(d, 1e3); })
  .enter().append("g")
    .attr("class", "group-tick")
    .attr("transform", function(d) { 
      return "rotate(" + (d.angle * 180 / Math.PI - 75) + 
        ") translate(" + outerRadius + ",2)"; 
    });

groupTick.append("line")
    .attr("x2", 6);

groupTick
  .filter(function(d) { return d.value % 5e3 === 0; })
  .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) { return d.angle > Math.PI/2 && d.angle < Math.PI*3/2 ? "rotate(180) translate(-16)" : null; })
    .style("text-anchor", function(d) { return d.angle > Math.PI/2 && d.angle < Math.PI*3/2? "end" : null; })
    .text(function(d) { 
  return matrixKeys[d.index]; 
});

g.append("g")
    .attr("class", "ribbons")
  .selectAll("path")
  .data(function(chords) { return chords; })
  .enter().append("path")
    .attr("d", ribbon)
    .style("fill", function(d) { return color(d.target.index); })
    .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });

}


// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {
      index:d.index,
      value: value, 
      angle: value * k + d.startAngle
    };
  });
}