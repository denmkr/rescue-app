/* Map variables */
var projection, mapWidth, mapHeight, mapViewport, centered;
var mapZoom;
var currentDistrict;
var commonMode = true;
var updateChords = true;
var launchBrush = false;

var activeEventTimeStart;
var activeEventTimeEnd;
var xContext;

/* Amount chart variables */
var tick = 3600 * 1000;
var initialData, amountData, resourceAmountData, slicedData, dataByLocations;
var allInitialData, allSlicedData;
var brushCount = 1;
var districtCommonAmounts = {};
var dataByResource = [];

var fatalitiesData;

var contextVis;
var brush;
var moveBrush = false;
var updateSunburst = true;
var sliderX;
var sizeOfTweets = 0;

var container = d3.select("#vis-container");

var margins = {
  top: 20,
  right: 30,
  bottom: 50,
  left: 30
};

/* Panel vsriables */
var activeTab = 'common';
var activeResource = "";

//LDA - NMF topics
var dictionary = [
  "power", "nuclear", "plant", "safe", "radiation",
  "routes", "precautionary", "pending", "notice", "action", "inspection", "closed", "safety", "bridge",
  "repair", "testing", "failure", "integrity", "defects", "damages",
  "shelter", "disaster", "water", "bottled", "sewer", "boil", "department", "contaminated", "neighborhoods", "health",
  "fast", "service", "break", "fatalities", "hearing", "trust", "friend", "wife", "monitoring", "city", "safer", "cooperation",
  "connection", "battery", "broken", "dead", "earthquake", "shaking", "feel", "hard", "ambulance", "town", "reports", "energy",
  "public", "radio", "route", "feel", "evacuation", "active", "build", "seek", "dangerous", "victims", "heavy", "search", "evacuating", "buildings", "time", "hospital", "people", "congestion", "severe", "experience", "collapsed", "street", "lapping", "rolling", "accident",
  "scene", "roads", "chains", "rescue", "workers", "trapped", "helping", "trained", "teams", "volunteers", "destroy", "limitation", "school", "library", "hazard", "effect", "trees",
  "food", "hospitals", "warehouse", "stores", "supplies", "generators", "night", "donations", "suffered", "emergency", "shelters", "damages", "integrity", "helpful", "happen", "headset",
  "lose", "fire", "explosion", "life", "help", "electricity", "electirical"
];

/* NEED DICTIONARY */
var need_dictionary = [
	"FOOD",
	"GAS",
	"MEDICAL",
	"NUCLEAR",
	"POWER",
	"RESCUE",
	"SEWER",
	"SHELTER",
	"TRANSPORTATION",
	"VOLUNTEERS",
];

/* NEED DATA HIERARCHY */
var FOOD = ["FOOD"];
var GAS = ["GAS", "HEATING"];
var MEDICAL = ["MEDICAL", "HOSPITAL"];
var NUCLEAR = ["NUCLEAR"];
var POWER = ["POWER", "COMMUNICATION"];
var RESCUE = ["RESCUE", "FIRE", "MISSING"];
var TRANSPORTATION = ["TRANSPORTATION", "TRAFFIC", "ROAD"];
var SEWER = ["SEWER", "WATER", "SANITARY", "FLOODING"];
var SHELTER = ["SHELTER", "COLLAPSED", "CLOSED"];
var VOLUNTEERS = ["VOLUNTEERS"];

/* Creating hierarchy for Sunburst with these categories */
var nuclear = ["nuclear", "power", "safe", "radiation", "failure", "disaster", "feel", "energy", "hazard", "damages", "fatalities"];
var water = ["water", "failure", "bottled", "contaminated", "boil", "fatalities", "sewer", "supplies", "infrastructure", "pipes", "pipe"];
var energy = ["power", "electricity", "failure", "service", "break", "energy", "battery", "generators", "electrical"];
var hospital = ["health", "fast", "help", "ambulance", "reports", "victims", "hospital", "severe", "accident", "hospitals", "donations", "emergency",
  "helpful", "life", "dead", "serum", "death", "psychologist"
];
var firefighter = ["lose", "fire", "service", "friend", "wife", "cooperation", "connection", "search", "rescue", "helping", "trapped", "teams", "volunteers"]
var shelters = ["shelter", "shelters", "roof", "buildings", "warehouse", "stores", "supplies"];
var traffic = ["congestion", "closed", "road", "connection", "route", "roads", "bridge", "closed", "dangerous", "repair",
  "delay", "street", "traffic", "airport"
];
var garbage = ["contaminated", "contamination", "garbage", "dirty", "smelly", "waste"];
var gas = ["congestion", "gas", "smell", "damages", "repair"];

//Color schemes

//var colors = ['#FF4C40',"#FFD300","#39FF14","#57A0D3","#FF0800",'#8B008B','#EE7417','#636363','#FF6666','#964514'];
var colors = ['#ff5d53', '#ffd719', '#78cd2d', '#67a9d7', '#ff2019', '#b966b9', '#ff8e00', '#727272', '#ff7575', '#824b3f'];
var yellow = ["#ffd719", "#FFD300", "#FADA5E", "#F8DE7E", "#DAA520", "#FCF4A3", "#FCD12A", "#FFC30B", "#FCE205", "#FFBF00", "#FEDC56", '#FFDDAF'];
var blue = ["#67a9d7", "#4F97A3", "#4682B4", "#6593F5", "#89CFF0", "#588BAE", "#95C8D8", "#B0DFE5", "#3FE0D0", "#73C2FB", "#008ECC", "#0080FF"];
var green = ["#78cd2d", "#0b6623", "#708238", "#3f704d", "#c7ea46", "#00A86B", "#4CBB17", "#50C878", "#679267", "#2E8B57", "#50C878", "#00A572"];
var red = ["#ff2019", "#b20000", '#FF2400', '#ED2939', '#CD5C5C', '#C21807', '#E0115F', '#B22222', '#960018', '#800000', '#A45A52', '#EA3C53', '#D21F3C', '#CA3433', '#BF0A30', '#B80F0A', '#80021F', '#5E1914', '#e50000'];
var orange = ['#EE7417', '#EF7215', '#F79862', '#F05E23', '#BE5504', '#D7722C', '#CB5C0D', '#B3672B', '#EF8200', '#FDA50F', '#FD6A02', '#F9812A', '#FC6600'];
var purple = ['#b966b9', '#9370DB', '#9400D3', '#9932CC', '#BA55D3', '#800080', '#D8BF08', '#DDA0DD', '#EE82EF', '#DA70D6', '#C71585', '#DB7093'];
var gray = ['#727272', '#787878', '#828282', '#919191', '#A1A1A1', '#ABABAB', '#B8B8B8', '#C2C2C2', '#CFCFCF', '#636363', '#555555', '#454545', '#363636', '#424242', '#999999'];
var brown = ['#964514', '#6B4226', '#733D1A', '#8B4513', '#D2691E', '#BC7642', '#603311', '#AA5303'];
var pink = ['#FF6666', '#FF6A6A', '#FFC1C1', '#FA8072', '#FFE4E1', '#F08080', '#CD5555'];
var teal = ['#469990', '#469990', '#469990'];

/* NEED COLORS */
/*
var maroon = ['#800000'];
var brown = ['#9A6324'];
var olive = ['#808000'];
var teal = ['#469990', '#469990'];
var navy = ['#000075'];
var red = ['#e6194B'];
var orange = ['#f58231'];
var yellow = ['#ffe119'];
var lime = ['#bfef45'];
var green = ['#3cb44b'];
var cyan = ['#42d4f4'];
var blue = ['#4363d8', '#4363d8', "#4363d8"];
var purple = ['#911eb4', '#911eb4'];
var magenta = ['#f032e6'];
var grey = ['#a9a9a9'];
var mint = ['#aaffc3'];
var lavender = ['#e6beff'];
var black = ['#000000', '#000000'];
*/


drawMap();
drawChart();

/* Time Slider Functions */
function drawTimeSlider(data, xFocus, focusVis, yLine, xAxisFocus) {
  contextAreaHeight = 60;
  contextVisWidth = window.innerWidth - 55;

  var dateParser = d3.timeParse('%m %Y');
  var dateFormat = d3.timeFormat('%m / %Y');
  var curve = d3.curveMonotoneX;

  /*
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", contextVisWidth)
    .attr("height", contextVisWidth);
  */

  xContext = d3.scaleTime().domain(d3.extent(data, function(d) {
    return d.time;
  })).range([0, contextVisWidth]);
  var yContext = d3.scaleLinear().domain([0, d3.extent(data.map(function(d) {
    return d.amount
  }))[1] + 100]).range([contextAreaHeight, 0]);

  // To organize our code, we add one group for the context visualization
  contextVis = d3.select("#time").append("svg").attr("width", contextVisWidth).attr("height", "80px").append("g").style("transform", "translate(18px, 0)");

  var xAxisContext = d3.axisBottom(xContext).ticks();
  contextVis.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + contextAreaHeight + ")")
    .call(xAxisContext);

  // Init two line generators
  var lineContext = d3.area()
    .x(function(d) {
      return xContext(d.time);
    })
    .y0(contextAreaHeight)
    .y1(function(d) {
      return yContext(d.amount);
    })
    .curve(curve);

  contextVis.append("linearGradient")
    .attr("id", "area-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", yContext(0))
    .attr("x2", 0).attr("y2", yContext(140))
    .selectAll("stop")
    .data([{
        offset: "0%",
        color: "#2e6b3f"
      },
      {
        offset: "15%",
        color: "#a1ce76"
      },
      {
        offset: "40%",
        color: "#fae19c"
      },
      {
        offset: "70%",
        color: "#e88759"
      },
      {
        offset: "100%",
        color: "#a4252c"
      }
    ])
    .enter().append("stop")
    .attr("offset", function(d) {
      return d.offset;
    })
    .attr("stop-color", function(d) {
      return d.color;
    });

  // Add the two lines for rain and temperature
  contextVis.append("path")
    .datum(data)
    .attr("class", "line line-temp")
    .attr("d", lineContext);

  var earthquakeTime1 = new Date('2020-04-06T13:00:00');
  var earthquakeTime2 = new Date('2020-04-08T08:36:00');
  var earthquakeTime3 = new Date('2020-04-09T14:36:00');

  var red_color = '#e30000';

  contextVis.append("circle")
    .attr("cx", xContext(earthquakeTime1)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", red_color)
    .style("fill", red_color);


  contextVis.append("circle")
    .attr("cx", xContext(earthquakeTime2)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", red_color)
    .style("fill", red_color);

  contextVis.append("circle")
    .attr("cx", xContext(earthquakeTime3)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", red_color)
    .style("fill", red_color);

  var change1Time = new Date('2020-04-08T09:36:00');
  var change2Time = new Date('2020-04-08T13:00:00');
  var change3Time = new Date('2020-04-09T07:00:00');
  var plusFive = new Date('2020-04-08T13:36:00');
  var plusThirty = new Date('2020-04-09T14:36:00');

  var blue_color = '#036ec9';

  contextVis.append("circle")
    .attr("cx", xContext(change1Time)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", blue_color)
    .style("fill", blue_color);

  contextVis.append("circle")
    .attr("cx", xContext(change2Time)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", blue_color)
    .style("fill", blue_color);

  contextVis.append("circle")
    .attr("cx", xContext(change3Time)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", blue_color)
    .style("fill", blue_color);

    /*
  contextVis.append("circle")
    .attr("cx", xContext(plusFive)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", "grey")
    .style("fill", "grey");

  contextVis.append("circle")
    .attr("cx", xContext(plusThirty)) //<<== change your code here
    .attr("cy", contextAreaHeight + 10)
    .attr("r", 5)
    .style("stroke-width", 2)
    .style("stroke", "#444444")
    .style("fill", "#444444");

    */

  contextVis.append("line")
    .attr("x1", xContext(plusFive))
    .attr("x2", xContext(plusFive))
    .attr("y1", 0)
    .attr("y2", contextAreaHeight)
    .style("stroke-dasharray", "5,5")
    .style("stroke-width", 2)
    .style("stroke", "grey")
    .style("fill", "grey");

  $(".plusfive").css("left", xContext(plusFive) - 10);

  contextVis.append("line")
    .attr("x1", xContext(plusThirty))
    .attr("x2", xContext(plusThirty))
    .attr("y1", 0)
    .attr("y2", contextAreaHeight)
    .style("stroke-dasharray", "5,5")
    .style("stroke-width", 2)
    .style("stroke", "black")
    .style("fill", "black");

  $(".plusthirty").css("left", xContext(plusThirty) - 10);
  /*
   * Add Interactive Features here
   */

  brush = d3.brushX()
    .extent([
      [0, 0],
      [contextVisWidth, contextAreaHeight]
    ])
    .on("brush end", function(e) {
      if (updateSunburst) launchBrush = true;
      if (!launchBrush) launchBrush = true;
      else {
        var s = d3.event.selection || xContext.range();
        if (s[1] - s[0] <= 32) {
          d3.select(".brush").call(brush.move, [s[0], s[1] + 1]);
          //d3.event.target.extent([s[0], s[0] - 3]);
          //d3.event.target(d3.select(this));
        }

        sliderX = s;
        xFocus.domain(s.map(xContext.invert, xContext));

        var left = new Date(parseInt(xFocus.domain()[0].getTime() / tick) * tick);
        var right = new Date(parseInt(xFocus.domain()[1].getTime() / tick) * tick);

        var usedData;

        if (activeTab == "common") usedData = amountData;
        else {
          /* */

          // console.log(initialData);

          /* COUNTING common sum of */
          brushCount++;

          districtCommonAmounts = {};

          if (brushCount >= 1) {
            dataByResource = [];

            var resourceSets = [FOOD, GAS, MEDICAL, NUCLEAR, POWER, RESCUE, TRANSPORTATION, SEWER, SHELTER, VOLUNTEERS];

            for (var i = 0; i < initialData.length; i++) {
              var label = initialData[i]['label'];
              for (var k = 0; k < resourceSets.length; k++) {
                var resourceSet = resourceSets[k];
                for (var j = 0; j < resourceSet.length; j++) {
                  var n = resourceSet[j];
                  if (label.includes(n)) {
                    dataByResource.push(initialData[i]);
                    break;
                  }
                }
              }
            }
          }
          // console.log(dataByResource);

          var leftIndex = dataByResource.map(function(e) {
            return e.time.getTime()
          }).indexOf(left.getTime());
          var rightIndex = dataByResource.map(function(e) {
            return e.time.getTime()
          }).indexOf(right.getTime());

          if (leftIndex == -1 || rightIndex == -1) {
            var tempData = Object.create(dataByResource);
            if (leftIndex == -1) tempData.push({
              time: left,
              location: "",
              account: "",
              message: "",
              cleanedMessage: "",
              hashtags: ""
            });
            if (rightIndex == -1) tempData.push({
              time: right,
              location: "",
              account: "",
              message: "",
              cleanedMessage: "",
              hashtags: ""
            });

            tempData = tempData.sort(function(a, b) {
              return a.time > b.time ? 1 : -1;
            });

            leftIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(left.getTime());
            rightIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(right.getTime());
          }

          slicedDataByResource = dataByResource.slice(leftIndex, rightIndex - 1);

          dataByLocations = d3.nest()
            .key(d => d.location)
            .entries(slicedDataByResource);

          dataByLocations.map(d1 => {
            var name = d1.key.toLowerCase();
            var count = d1.values.length;
            districtCommonAmounts[name] = count;
          });

          brushCount = 0;


          /* */
          usedData = resourceAmountData;
        }

        leftIndex = usedData.map(function(e) {
          return e.time.getTime()
        }).indexOf(left.getTime());
        rightIndex = usedData.map(function(e) {
          return e.time.getTime()
        }).indexOf(right.getTime());

        if (leftIndex == -1 || rightIndex == -1) {
          var tempData = Object.create(usedData);
          if (leftIndex == -1) tempData.push({
            time: left,
            amount: 0,
            values: []
          });
          if (rightIndex == -1) tempData.push({
            time: right,
            amount: 0,
            values: []
          });

          tempData = tempData.sort(function(a, b) {
            return a.time > b.time ? 1 : -1;
          });

          leftIndex = tempData.map(function(e) {
            return e.time.getTime()
          }).indexOf(left.getTime());
          rightIndex = tempData.map(function(e) {
            return e.time.getTime()
          }).indexOf(right.getTime());
        }

        // console.log(leftIndex);


        data = usedData.slice(leftIndex, rightIndex - 1);
        slicedData = data;

        districtAmounts = {};

        data.map(d1 => {
          d1.values.map(d2 => {
            var name = d2.key.toLowerCase();
            if (activeTab != "common") {
              var allSum = districtCommonAmounts[name];

              if (allSum == null || allSum == undefined || isNaN(allSum)) allSum = 1;
              //console.log(allSum);

              if (isNaN(districtAmounts[name])) districtAmounts[name] = parseInt(d2.values.length);
              else {
                districtAmounts[name] += parseInt(d2.values.length);
                if (name == "<location with-held due to contract>") districtAmounts[name] = 0;
                if (name == "UNKNOWN") districtAmounts[name] = 0;
              }

              // console.log(d2.values.length);


            } else {
              var count = districtAmounts[name];

              if (isNaN(count)) districtAmounts[name] = d2.values.length;
              else {
                districtAmounts[name] = parseInt(count) + d2.values.length;
                if (name == "<location with-held due to contract>") districtAmounts[name] = 0;
                if (name == "UNKNOWN") districtAmounts[name] = 0;
              }
            }
          });
        });

        if (activeTab != "common") {
          Object.keys(districtAmounts).forEach(function(d) {
            if (districtAmounts[d] != undefined || districtAmounts[d] != null || !isNaN(districtAmounts[d]))
              districtAmounts[d] = districtAmounts[d] / districtCommonAmounts[d];
            else districtAmounts[d] = 0;
          });
        }



        // districtAmounts = districtAmounts / districtCommonAmounts
        // console.log(districtAmounts);

        var districtLinear;
        if (activeTab == "common") districtLinear = d3.scaleLinear().domain([0, d3.extent(Object.values(districtAmounts), function(d) {
          return d;
        })[1]]).range([0.95, 0]);
        else districtLinear = d3.scaleLinear().domain([0, d3.extent(Object.values(districtAmounts), function(d) {
          return d;
        })[1]]).range([0.95, 0.2]);

        mapViewport.selectAll("polygon").each(function(d) {
          var name = d3.select(this).attr("name");
          var amount = districtAmounts[name];
          var lightness = 0.95;

          //console.log(districtAmounts);
          // console.log(districtCommonAmounts['wilson forest']);

          if (amount != undefined && amount != null && !isNaN(amount)) {
            lightness = districtLinear(amount);

          }

          var color;

          d3.select(".scale-map .colors").classed("all", false);
          d3.select(".scale-map .colors").classed("gas", false);
          d3.select(".scale-map .colors").classed("nuclear", false);
          d3.select(".scale-map .colors").classed("sewer", false);
          d3.select(".scale-map .colors").classed("transportation", false);
          d3.select(".scale-map .colors").classed("shelter", false);
          d3.select(".scale-map .colors").classed("rescue", false);
          d3.select(".scale-map .colors").classed("medical", false);
          d3.select(".scale-map .colors").classed("power", false);
          d3.select(".scale-map .colors").classed("volunteers", false);
          d3.select(".scale-map .colors").classed("food", false);

          if (activeTab == "common") {
            color = d3.interpolateRdYlGn(lightness);

            d3.select(".scale-map .colors").classed("all", true);
            d3.select(".scale-map .title").text("Degree of damage");

            /*
            d3.select(".scale-map .values > div:first-child").text("0");
            d3.select(".scale-map .values > div:last-child").text(d3.extent(Object.values(districtAmounts), function(d) {
              return d;
            })[1]);
            */

          } else {
            if (activeResource == "nuclear") color = d3.hsl(47, 0.9, lightness);
            if (activeResource == "gas") color = d3.hsl(345, 0.7, lightness);
            if (activeResource == "sewer") color = d3.hsl(220, 0.7, lightness);
            if (activeResource == "transportation") color = d3.hsl(0, 0.07, lightness);
            if (activeResource == "shelter") color = d3.hsl(282, 0.9, lightness);
            if (activeResource == "rescue") color = d3.hsl(18, 0.9, lightness);
            if (activeResource == "medical") color = d3.hsl(0, 0.9, lightness);
            if (activeResource == "power") color = d3.hsl(120, 0.6, lightness);
            if (activeResource == "volunteers") color = d3.hsl(18, 0.55, lightness);
            if (activeResource == "food") color = d3.hsl(173, 0.71, lightness);

            d3.select(".scale-map .colors").classed(activeResource, true);
            d3.select(".scale-map .title").text("Importance");

            d3.select(".scale-map .values > div:first-child").text("low");
            d3.select(".scale-map .values > div:last-child").text("high");
          }

          d3.select(this).style("fill", color);

          if (lightness < 0.3) {
            if (name != "scenic vista") {
              mapViewport.selectAll(".district_label").filter(function() {
                return d3.select(this).text() == name
              }).classed("white", true);
            }
          } else {
            mapViewport.selectAll(".district_label").filter(function() {
              return d3.select(this).text() == name
            }).classed("white", false);
          }
        });

        focusVis.select(".line-temp").attr("d", yLine);
        focusVis.select(".x.axis").call(xAxisFocus);

        if (contextVis.select(".brush").attr("pointer-events") == "all") {

          if (activeEventTimeStart != s[0] || activeEventTimeEnd != s[1]) {
            $("#events-panel .event-item").removeClass("active");
          }

          var rightIndex = fatalitiesData.map(function(e) {
            return e.time.getTime()
          }).indexOf(right.getTime());

          if (rightIndex == -1) {
            var tempData = Object.create(fatalitiesData);
            if (rightIndex == -1) tempData.push({
              time: right,
              fatalities: 0,
              label: ""
            });

            tempData = tempData.sort(function(a, b) {
              return a.time > b.time ? 1 : -1;
            });

            rightIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(right.getTime());
          }

          if (rightIndex > 0) {
            var lastItem = fatalitiesData[rightIndex - 1];
            var secondLastItem;

            for (var i=(rightIndex - 2); i>=0; i--) {
              secondLastItem = fatalitiesData[i];
              if (lastItem.label == "unconfirmed") {
                if (secondLastItem.label == "confirmed") break;
              }
              if (lastItem.label == "confirmed") {
                if (secondLastItem.label == "unconfirmed") break;
              }
            }

            if (lastItem.label == "unconfirmed") {
              $("#unconfirmedCount").text(lastItem.fatalities);
              $("#confirmedCount").text(secondLastItem.fatalities);
            }

            if (secondLastItem.label == "unconfirmed") {
              $("#unconfirmedCount").text(secondLastItem.fatalities);
              $("#confirmedCount").text(lastItem.fatalities);
            }
          }
          else {
            $("#unconfirmedCount").text(0);
            $("#confirmedCount").text(0);
          }

          

          

          /* */

          var leftIndex = initialData.map(function(e) {
            return e.time.getTime()
          }).indexOf(left.getTime());
          var rightIndex = initialData.map(function(e) {
            return e.time.getTime()
          }).indexOf(right.getTime());


          if (leftIndex == -1 || rightIndex == -1) {
            var tempData = Object.create(initialData);
            if (leftIndex == -1) tempData.push({
              time: left,
              amount: 0,
              values: []
            });
            if (rightIndex == -1) tempData.push({
              time: right,
              amount: 0,
              values: []
            });

            tempData = tempData.sort(function(a, b) {
              return a.time > b.time ? 1 : -1;
            });

            leftIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(left.getTime());
            rightIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(right.getTime());
          }


          slicedData = initialData.slice(leftIndex, rightIndex - 1);

          /* ALL MESSAGES */

          leftIndex = allInitialData.map(function(e) {
            return e.time.getTime()
          }).indexOf(left.getTime());
          rightIndex = allInitialData.map(function(e) {
            return e.time.getTime()
          }).indexOf(right.getTime());


          if (leftIndex == -1 || rightIndex == -1) {
            var tempData = Object.create(allInitialData);
            if (leftIndex == -1) tempData.push({
              time: left,
              amount: 0,
              values: []
            });
            if (rightIndex == -1) tempData.push({
              time: right,
              amount: 0,
              values: []
            });

            tempData = tempData.sort(function(a, b) {
              return a.time > b.time ? 1 : -1;
            });

            leftIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(left.getTime());
            rightIndex = tempData.map(function(e) {
              return e.time.getTime()
            }).indexOf(right.getTime());
          }

          allSlicedData = allInitialData.slice(leftIndex, rightIndex - 1);

          updateElementsByDistrict(currentDistrict);
          moveBrush = false;

          if (activeTab != "common") {
            updateSunburstPercentage(activeResource);
          }
        } else updateSunburst = true;

        var formatTime = d3.timeFormat("%B %d %H:00");
        d3.select("#time .time-title").text(formatTime(left) + " - " + formatTime(right));

        launchBrush = false;
      }
    });


  contextVis.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, xContext.range());
}


/* Chart Functions */
function drawChart() {
  var width = 520;
  var height = 350;

  var focusAreaHeight = 240 - margins.top;
  var visWidth = width - margins.left - margins.right;
  var visHeight = height - margins.top - margins.bottom;

  var panelContainer = d3.select("#panel");
  var svg = panelContainer.select("#chart").append("svg").attr("width", visWidth).attr("height", visHeight);

  var viewport = svg.append("g");

  var dateParser = d3.timeParse('%m %Y');
  var dateFormat = d3.timeFormat('%m / %Y');
  var curve = d3.curveMonotoneX;

  d3.dsv(",", "data/need_data_3.csv", function(d) {
    return {
      time: dateFromString(d.time),
      location: d.location,
      account: d.account,
      message: d.message,
      cleanedMessage: d["spellcheck_msg"],
      label: d["label"],
      hashtags: ""
    };
  }).then(function(data) {
  	 data = data.sort(function(a, b) {
        return a.time > b.time ? 1 : -1;
      });

    initialData = data;
    slicedData = initialData;

    var dataByTime = d3.nest()
      // s = ms / 1000
      // h = s / 3600
      .key(d => parseInt(d.time.getTime() / tick))
      .sortKeys((a, b) => d3.ascending(+a, +b))
      .entries(data);

    amountData = [];
    dataByTime.forEach(function(elem, index) {
      var dataByLocation = d3.nest()
        .key(d => d.location)
        .sortKeys((a, b) => d3.ascending(+a, +b))
        .entries(elem.values);

      amountData.push({
        time: new Date(parseInt(elem.key) * tick),
        amount: elem.values.length,
        values: dataByLocation
      });
    });

    data = amountData;

    // Init Scales
    var xFocus = d3.scaleTime().domain(d3.extent(data, function(d) {
      return d.time;
    })).range([0, visWidth]);

    var yFocus = d3.scaleLinear().domain(d3.extent(data.map(function(d) {
      return d.amount
    }))).range([focusAreaHeight, 0]);

    // In order to organize our code, we add one group for the focus visualization (the large lien chart)
    var focusVis = viewport.append("g");

    // Initialize a line generator for each line
    var yLine = d3.area()
      .x(function(d) {
        return xFocus(d.time);
      })
      .y0(function(d) {
        return focusAreaHeight;
      })
      .y1(function(d) {
        return yFocus(d.amount);
      })
      .curve(curve);

    // Append two path elements
    focusVis.append("path")
      .datum(data)
      .attr("class", "line line-temp")
      .attr("d", yLine);

    // Lets add some axis
    var axisG = focusVis.append("g");
    var xAxisFocus = d3.axisBottom(xFocus);
    axisG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + focusAreaHeight + ")")
      .call(xAxisFocus);

    axisG.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yFocus));

    // Append three text elements to the axisG group and label the axes respectively
    axisG.append("text").text("Amount").attr("x", -50).attr("y", -5).attr("fill", "steelblue");
    axisG.append("text").text("Time").attr("x", visWidth / 2 - 10).attr("y", focusAreaHeight + 50);

    d3.dsv(";", "data/fatalities_by_time.csv", function(d) {
      return {
        time: dateFromString(d.time),
        fatalities: d.fatalities,
        label: d.LABEL
      };
    }).then(function(data) {
      fatalitiesData = data;
    });

    d3.dsv(",", "data/related_data.csv", function(d) {
      return {
        time: dateFromString(d.Time),
        location: d.Location,
        account: d.Account,
        message: d.Message,
        cleanedMessage: d["Cleaned message"],
        hashtags: d.Hashtags
      };
    }).then(function(data) {
      allInitialData = data;

      var allDataByTime = d3.nest()
      // s = ms / 1000
      // h = s / 3600
      .key(d => parseInt(d.time.getTime() / tick))
      .sortKeys((a, b) => d3.ascending(+a, +b))
      .entries(data);

      allAmountData = [];
      allDataByTime.forEach(function(elem, index) {
        var dataByLocation = d3.nest()
          .key(d => d.location)
          .sortKeys((a, b) => d3.ascending(+a, +b))
          .entries(elem.values);

        allAmountData.push({
          time: new Date(parseInt(elem.key) * tick),
          amount: elem.values.length,
          values: dataByLocation
        });
      });

      data = allAmountData;

      // Init Scales
      var xFocus = d3.scaleTime().domain(d3.extent(data, function(d) {
        return d.time;
      })).range([0, visWidth]);

      var yFocus = d3.scaleLinear().domain(d3.extent(data.map(function(d) {
        return d.amount
      }))).range([focusAreaHeight, 0]);

      // Initialize a line generator for each line
      var yLine = d3.area()
        .x(function(d) {
          return xFocus(d.time);
        })
        .y0(function(d) {
          return focusAreaHeight;
        })
        .y1(function(d) {
          return yFocus(d.amount);
        })
        .curve(curve);

      var xAxisFocus = d3.axisBottom(xFocus);

      /* Draw time slider */
      drawTimeSlider(data, xFocus, focusVis, yLine, xAxisFocus);
    });

    var tooltip = panelContainer.append("div")
      .attr("class", "tooltip");

    var indicatorLine = viewport.append('line')
      .style("visibility", "hidden")
      .style("stroke", "black")
      .style("stroke-width", "2");

    var interactionRect = viewport.append("rect")
      .attr("class", "interaction-rect")
      .attr("width", visWidth)
      .attr("height", focusAreaHeight);

    interactionRect.on("mousemove", function(d) {
        var mouse = d3.mouse(this);
        var cont = d3.select(this);

        var x0 = xFocus.invert(mouse[0]);

        var bisectDate = d3.bisector(function(d) {
          return d.time;
        }).left;
        var i = bisectDate(data, x0, 1);

        var time = data[i - 1].time;
        var amount = data[i - 1].amount;

        tooltip.style("display", "block")
          .style("left", mouse[0] + "px")
          .style("top", "70px")
          .html(time + "<br/>" + "Amount: " + amount);

        indicatorLine.style("visibility", "visible")
          .attr('x1', mouse[0])
          .attr('y1', 0)
          .attr('x2', mouse[0])
          .attr('y2', focusAreaHeight)

        d3.select(this).attr("stroke-width", 5);
      })
      .on("mouseleave", function(d) {
        tooltip.style("display", "none");
        indicatorLine.style("visibility", "hidden");
        d3.select(this).attr("stroke-width", null)
      });

    d3.select("#panel > svg").remove();

  });
}


/* Map Functions */

function drawMap() {
  active = d3.select(null);

  mapWidth = document.getElementById('map').offsetWidth;
  mapHeight = document.getElementById('map').offsetHeight;

  var mapContainer = d3.select("#map");

  if (mapHeight < 720) {
    mapHeight = 720;
    mapContainer.classed("scrolled", true);
  } else mapContainer.classed("scrolled", false);

  var mapSvg = mapContainer.append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  mapViewport = mapSvg.append("g")

  mapViewport.attr("transform", "scale(" + (mapWidth / 1640) + ") translate(" + 140 / (mapWidth / 1440) + "," + 95 / (mapWidth / 1440) + ")");

  const projection = d3.geoMercator()
    .translate([140 / (mapWidth / 1440), 95 / (mapWidth / 1440)])
    .scale(mapWidth / 1640);

  const path = d3.geoPath()
    .projection(projection);


  mapZoom = d3.zoom()
    .scaleExtent([mapWidth / 1640, 6])
    .translateExtent([140 / (mapWidth / 1440), 95 / (mapWidth / 1440)])
    .on('zoom', zoomed);


  // mapViewport.call(mapZoom);

  mapViewport.transition()
    .duration(1)
    .call(mapZoom.transform, d3.zoomIdentity.scale(mapWidth / 1640).translate(140 / (mapWidth / 1440), 95 / (mapWidth / 1440)));


  drawDistricts();
  // drawInfrastructure();
  drawBuildings();
}

function drawDistricts() {
  d3.dsv(";", "data/neighborhoods.csv", function(d) {
    return {
      neighborhood: d.neighborhood,
      coordinates: d.coordinates,
      number: parseInt(d.number),
      centerX: parseInt(d.x),
      centerY: parseInt(d.y),
      fillColor: "dfebf7",
      strokeColor: "fff"
    };
  }).then(function(data) {
    var visualization = mapViewport.append("g");

    data.forEach(neighborhood => {
      var polygon = visualization.append("polygon")
        .attr("name", neighborhood.neighborhood)
        .attr("points", neighborhood.coordinates)
        .attr("stroke", "#" + neighborhood.strokeColor)
        .attr("stroke-width", "3")
        .attr("fill", "#" + neighborhood.fillColor)
        .attr("stroke-linecap", "round")
        .attr("pointer-events", "visible")
        .classed("active", true);

      polygon.on("click", function() {
        clicked(polygon, neighborhood.centerX, neighborhood.centerY);
        currentDistrict = neighborhood.neighborhood;
        updateSunburst = true;
        updateElementsByDistrict(currentDistrict);
      });

    });

    data.forEach(neighborhood => {
      var text = visualization.append('text')
        .attr('x', neighborhood.centerX)
        .attr('y', neighborhood.centerY)
        .attr('class', 'district_label active')
        .text(neighborhood.neighborhood);

      if (neighborhood.neighborhood == "wilson forrest") text.attr('x', parseInt(text.attr('x')) + 30);
      if (neighborhood.neighborhood == "scenic vista") text.attr('y', parseInt(text.attr('y')) + 20).attr('x', parseInt(text.attr('x')) + 20);
      if (neighborhood.neighborhood == "terrapin springs") text.attr('y', parseInt(text.attr('y')) - 20);
      if (neighborhood.neighborhood == "palace hills") text.attr('x', parseInt(text.attr('x')) - 10);
      if (neighborhood.neighborhood == "northwest") text.attr('x', parseInt(text.attr('x')) + 10).attr('y', parseInt(text.attr('y')) + 20);
      if (neighborhood.neighborhood == "downtown") text.attr('x', parseInt(text.attr('x')) + 10);
    });
  });
}


function drawBuildings() {
  d3.dsv(";", "data/buildings.csv", function(d) {
    return {
      neighborhood: d.neighborhood,
      x: d.x,
      y: d.y,
      type: d.type,
      name: d.name
    };
  }).then(function(data) {
    var visualization = mapViewport.append("g");

    data.forEach(building => {
      // Hospitals are red, power plant is orange
      var color = building.type == "hospital" ? "#ff3434" : "#ffab1a";

      visualization.append("circle")
        .attr("name", building.neighborhood)
        .attr("cx", building.x)
        .attr("cy", building.y)
        .attr("r", 3)
        .attr("stroke", "black")
        .classed("active", true)
        .attr("fill", color);

      visualization.append('text')
        .attr('x', parseInt(building.x) + 6)
        .attr('y', parseInt(building.y) - 6)
        .attr('class', 'label')
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("name", building.neighborhood)
        .classed("active", true)
        .text(building.name);
    });
  });
}

function drawInfrastructure() {
  d3.dsv(";", "data/infrastructure.csv", function(d) {
    return {
      type: d.type,
      name: d.name,
      coordinates: d.coordinates
    };
  }).then(function(data) {
    var visualization = mapViewport.append("g").classed("infra", true);

    data.forEach(infra => {
      var color = infra.type == "street" || infra.type == "highway" ? "grey" : "black"
      visualization.append("polygon")
        .attr("name", infra.name)
        .attr("points", infra.coordinates)
        //.attr("stroke", color)
        .attr("stroke-width", "1")
        .attr("fill", color);
    });
  });
}

function activateTab(e, tab) {
  if (!d3.select("#panel ." + tab).classed("active")) {
    d3.select("#panel .mode.active").classed("active", false);
    d3.select(e).classed("active", true);

    d3.select("#panel .tab.active").classed("active", false);
    d3.select("#panel ." + tab).classed("active", true);

    activeTab = tab;
    updateElementsByDistrict(currentDistrict);
    if (tab == "resources") resourceMode("nuclear");
    if (tab == "words") {
      moveBrush = true;
      d3.select(".brush").call(brush.move, sliderX);
    }
  }
}

function clicked(polygon, x, y) {
  var scale;

  if (x && y && centered !== x + " " + y) {
    scale = 2.6;
    centered = x + " " + y;

    translate = [(mapWidth / 2) - (scale * x), (mapHeight / 2) - (scale * y)];

    /* Disactivate all districts */
    mapViewport.selectAll("polygon").classed("active", false);
    mapViewport.selectAll(".district_label").classed("active", false);
    mapViewport.selectAll(".label").classed("active", false);
    mapViewport.selectAll("circle").classed("active", false);
    mapViewport.selectAll("polygon").classed("chosen", false);

    /* Activate only chosen district */
    polygon.classed("active", true);
    polygon.classed("chosen", true);
    mapViewport.selectAll(".district_label").filter(function() {
      return d3.select(this).text() == polygon.attr("name")
    }).classed("active", true);
    mapViewport.selectAll(".label").filter(function() {
      return d3.select(this).attr("name") == polygon.attr("name")
    }).classed("active", true);
    mapViewport.selectAll("circle").filter(function() {
      return d3.select(this).attr("name") == polygon.attr("name")
    }).classed("active", true);

    commonMode = false;

  } else {
    x = mapWidth / 2;
    y = mapHeight / 2;
    scale = mapWidth / 1640;
    centered = null;

    translate = [130, 80];

    /* RESET / Activate all districts */
    mapViewport.selectAll("polygon").classed("active", true);
    mapViewport.selectAll(".district_label").classed("active", true);
    mapViewport.selectAll(".label").classed("active", true);
    mapViewport.selectAll("circle").classed("active", true);
    mapViewport.selectAll("polygon").classed("chosen", false);

    commonMode = true;
  }

  mapViewport.transition()
    .duration(600)
    .style("stroke-width", 1.5 + "px")
    .call(mapZoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

}

function zoomed() {
  /*
  mapViewport.selectAll("polygon").style("opacity", 1 / d3.event.transform.k / 2);
    mapViewport.selectAll(".district_label").style("opacity", 1 / d3.event.transform.k / 2);
    mapViewport.selectAll(".label").style("opacity", 1 / d3.event.transform.k / 2);
    mapViewport.selectAll("circle").style("opacity", 1 / d3.event.transform.k / 2);

    var polygon = mapViewport.selectAll("polygon").filter(function() {
      return d3.select(this).classed("hover")
    }).style("opacity", d3.event.transform.k / 1.4);

    polygon.classed("active", true);
    mapViewport.selectAll(".district_label").filter(function() {
      return d3.select(this).text() == polygon.attr("name")
    }).style("opacity", d3.event.transform.k / 1.4);
    mapViewport.selectAll(".label").filter(function() {
      return d3.select(this).attr("name") == polygon.attr("name")
    }).style("opacity", d3.event.transform.k / 1.4);
    mapViewport.selectAll("circle").filter(function() {
      return d3.select(this).attr("name") == polygon.attr("name")
    }).style("opacity", d3.event.transform.k / 1.4);*/


  if (d3.event.transform.k > 1.2) {
    if (d3.select("#map .scale-map").classed("show")) d3.select("#map .scale-map").classed("show", false);
  } else {
    if (!d3.select("#map .scale-map").classed("show")) d3.select("#map .scale-map").classed("show", true);
  }


  mapViewport.attr('transform', d3.event.transform);
}

function dateFromString(string) {
  var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  var dateArray = reggie.exec(string);
  var dateObject = new Date(
    (+dateArray[1]),
    (+dateArray[2]) - 1, // Careful, month starts at 0!
    (+dateArray[3]),
    (+dateArray[4]),
    (+dateArray[5]),
    0
  );

  return dateObject;
}

function updateElementsByDistrict(district) {
  if (commonMode || currentDistrict == undefined || currentDistrict == null || currentDistrict == "") {
    drawWordCloud(allSlicedData);
    drawHashtagCloud(allSlicedData);

    if (updateSunburst) drawSunburst(slicedData);

    if (updateChords) {
      createChordCharts(slicedData, false);
    }
    getMessageBox(allSlicedData);
    getVoiceOfPeople(slicedData);

  } else {
    var dataByLocations = d3.nest()
      .key(d => d.location)
      .entries(slicedData);

    var allDataByLocations = d3.nest()
        .key(d => d.location)
        .entries(allSlicedData);

    // Find index of location in resources data messages

    var i;
    for (i = 0; i < dataByLocations.length; i++) {
      if (dataByLocations[i].key.toLowerCase() == district) break;
    }

    // Find index of location in all data messages

    var j;
    for (j = 0; j < allDataByLocations.length; j++) {
      if (allDataByLocations[j].key.toLowerCase() == district) break;
    }

    if (dataByLocations[i] != undefined && dataByLocations[i] != null) {
      if (allDataByLocations[j] != undefined && allDataByLocations[j] != null) {
        drawWordCloud(allDataByLocations[j].values);
        drawHashtagCloud(allDataByLocations[j].values);
        getMessageBox(allDataByLocations[j].values);
      }
      
      drawSunburst(dataByLocations[i].values);

      if (updateChords) {
        createChordCharts(dataByLocations[i].values, true);
      }

      getVoiceOfPeople(dataByLocations[i].values);
    }

  }

  updateChords = true;
}


function drawWordCloud(data) {
  var text = "";

  data.map(function(d) {
    text = text + d.cleanedMessage + " ";
  });

  var counts = text.replace(/[^\w\s]/g, "").split(/\s+/).reduce(function(map, word) {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, Object.create(null));

  delete counts[""];
  var words = [];

  var max = d3.extent(Object.values(counts), function(d) {
    return d;
  })[1];

  for (var i in counts) {
    var obj = {
      "text": i,
      "size": counts[i]
    }
    words.push(obj);
  }

  words = words.sort(function(a, b) {
    return a.size < b.size;
  });

  if (words.length <= 30) words = words.slice(0, words.length - 1);
  else words = words.slice(0, 30);

  var wordSizeLinear = d3.scaleSqrt().domain([0, d3.extent(words, function(d) {
    return d.size;
  })[1]]).range([7, 30]);
  var wordColorLinear = d3.scaleLinear().domain(d3.extent(words, function(d) {
    return wordSizeLinear(d.size);
  })).range([0.45, 1]);

  var width = 190;
  var height = 210;

  d3.selectAll("#wordcloud > svg").remove();

  d3.layout.cloud()
    .size([width, height])
    .words(words.map(function(d, i) {
      var amount = parseInt(wordSizeLinear(d.size))
      var lightness = 0;

      if (amount != undefined && amount != null && !isNaN(amount)) lightness = wordColorLinear(amount);
      var color = d3.interpolateBlues(lightness);
      var commonColor = '#0e2948';

      return {
        text: d.text,
        size: parseInt(wordSizeLinear(d.size)),
        color: commonColor
      };
    }))
    .rotate(function() {
      return 0;
    })
    .font("Impact")
    .fontSize(function(d) {
      return d.size
    })
    .on("end", drawWordCloudFunction)
    .start();
}

function drawHashtagCloud(data) {
  var text = "";

  data.map(function(d) {
    text = text + d.hashtags + " ";
  });

  var counts = text.replace(/[^\w\s]/g, "").split(/\s+/).reduce(function(map, word) {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, Object.create(null));

  delete counts[""];
  var words = [];

  var max = d3.extent(Object.values(counts), function(d) {
    return d;
  })[1];

  for (var i in counts) {
    var obj = {
      "text": "#" + i,
      "size": counts[i]
    }
    words.push(obj);
  }

  words = words.sort(function(a, b) {
    return a.size < b.size;
  });

  if (words.length <= 30) words = words.slice(0, words.length - 1);
  else words = words.slice(0, 30);

  var wordSizeLinear = d3.scaleSqrt().domain([0, d3.extent(words, function(d) {
    return d.size;
  })[1]]).range([7, 30]);
  var wordColorLinear = d3.scaleLinear().domain(d3.extent(words, function(d) {
    return wordSizeLinear(d.size);
  })).range([0.45, 1]);

  var width = 190;
  var height = 210;

  d3.selectAll("#hashtagcloud > svg").remove();

  d3.layout.cloud()
    .size([width, height])
    .words(words.map(function(d, i) {
      var amount = parseInt(wordSizeLinear(d.size))
      var lightness = 0;

      if (amount != undefined && amount != null && !isNaN(amount)) lightness = wordColorLinear(amount);
      var color = d3.interpolateBlues(lightness);
      var commonColor = '#0e2948';

      return {
        text: d.text,
        size: parseInt(wordSizeLinear(d.size)),
        color: commonColor
      };
    }))
    .rotate(function() {
      // return ~~(Math.random() * 2) * 90;
      return 0;
    })
    .font("Impact")
    .fontSize(function(d) {
      return d.size
    })
    .on("end", drawHashtagCloudFunction)
    .start();
}


function drawSunburst(dataset) {
  d3.selectAll("#sunburst > .sunburst-viz > svg").remove();
  

  var FOOD_DATA = generateResourceData(dataset, FOOD);
  var GAS_DATA = generateResourceData(dataset, GAS);
  var MEDICAL_DATA = generateResourceData(dataset, MEDICAL);
  var NUCLEAR_DATA = generateResourceData(dataset, NUCLEAR);
  var POWER_DATA = generateResourceData(dataset, POWER);
  var RESCUE_DATA = generateResourceData(dataset, RESCUE);
  var TRANSPORTATION_DATA = generateResourceData(dataset, TRANSPORTATION);
  var SEWER_DATA = generateResourceData(dataset, SEWER);
  var SHELTER_DATA = generateResourceData(dataset, SHELTER);
  var VOLUNTEERS_DATA = generateResourceData(dataset, VOLUNTEERS);

  /*
  var nuclearData = generateResourceData(dataset, nuclear);
  var waterData = generateResourceData(dataset, water)
  var energyData = generateResourceData(dataset, energy);
  var hospitalData = generateResourceData(dataset, hospital);
  var firefighterData = generateResourceData(dataset, firefighter);
  var sheltersData = generateResourceData(dataset, shelters);
  var trafficData = generateResourceData(dataset, traffic);
  var garbageData = generateResourceData(dataset, garbage);
  var gasData = generateResourceData(dataset, gas);
  */


  var json = {
    name: 'Need for resources',
    color: '#fff',
    children: [
      generateJSONChildren(FOOD_DATA[0], 'FOOD', teal),
      generateJSONChildren(GAS_DATA[0], 'GAS', pink),
      generateJSONChildren(MEDICAL_DATA[0], 'MEDICAL', red),
      generateJSONChildren(NUCLEAR_DATA[0], 'NUCLEAR', yellow),
      generateJSONChildren(POWER_DATA[0], 'POWER', green),
      generateJSONChildren(RESCUE_DATA[0], 'RESCUE', orange),
      generateJSONChildren(TRANSPORTATION_DATA[0], 'TRANSPORTATION', gray),
      generateJSONChildren(SEWER_DATA[0], 'SEWER', blue),
      generateJSONChildren(SHELTER_DATA[0], 'SHELTER', purple),
      generateJSONChildren(VOLUNTEERS_DATA[0], 'VOLUNTEERS', brown),
    ]
  };

  function1(json).then(function() {

    setTimeout(function() {


      resource = activeResource;

      if (activeTab != "common") {
        d3.select("#sunburst").selectAll(".slice").each(function(d) {
          if (resource != d.data.name.toLowerCase()) {
            if (d.parent != undefined && d.parent != null)
              if (resource != d.parent.data.name.toLowerCase()) d3.select(this).classed("hide", true);
              else d3.select(this).classed("hide", false);
          } else d3.select(this).classed("hide", false);
        });

        updateSunburstPercentageWithDataset(activeResource, dataset);

      }


    }, 1);
  });


}

function function1(json, callback) {
  return new Promise(function(fullfill, reject) {
    sizeOfTweets = getAmountTweets(json);
    var amount = 0;

    Sunburst().data(json)
      .size('size')
      .width(350)
      .height(350)
      .showLabels(true)
      .color('color')
      .tooltipContent((d, node) => `Total amount: <i>${node.value}</i><br>Percentage: <i>${((node.value * 100)/sizeOfTweets).toFixed(1)}</i>%`)
      (document.getElementById('sunburst'))
      .onClick(function(e) {
         if (document.querySelectorAll('.sunburst-tooltip').length > 2) {
          d3.select(".sunburst-tooltip").remove();
        }

        activeTab = "resource";

        var resource = e.name.toLowerCase();
        amount = e.__dataNode.value;

        if (e.__dataNode.parent.data.name.toLowerCase() != "need for resources") {
          resource = e.__dataNode.parent.data.name.toLowerCase();
          amount = e.__dataNode.parent.value;
        }

        d3.select("#sunburst").selectAll(".slice").each(function(d) {
          if (resource != d.data.name.toLowerCase()) {
            if (d.parent != undefined && d.parent != null)
              if (resource != d.parent.data.name.toLowerCase()) d3.select(this).classed("hide", true);
              else d3.select(this).classed("hide", false);
          } else {
            d3.select(this).classed("hide", false);
          }
        });

        moveBrush = true;
        resourceMode(resource);

        var percentage = (amount * 100 / sizeOfTweets).toFixed(1);
        d3.select("#sunburst").select(".info").text("~ " + percentage + "%");

        if (document.querySelectorAll('.sunburst-tooltip').length > 2) {
          d3.select(".sunburst-tooltip").remove();
        }

      });

    fullfill();
    reject();
  });
}

function getAmountTweets(data) {
  var size = 0;
  for (var i = 0; i < data['children'].length; i++) {
    for (var j = 0; j < data['children'][i]['children'].length; j++) {
      size += data['children'][i]['children'][j]['size'];
    }
  }
  return size;
}

function resourceMode(resource) {

  if (resource == "common") {
    d3.select("#sunburst").selectAll(".slice").classed("hide", false);
  } else {
    d3.select("#sunburst").selectAll(".slice").each(function(d) {
      if (resource != d.data.name.toLowerCase()) {
        if (d.parent != undefined && d.parent != null)
          if (resource != d.parent.data.name.toLowerCase()) d3.select(this).classed("hide", true);
          else d3.select(this).classed("hide", false);
      } else d3.select(this).classed("hide", false);
    });
  }

  d3.select("#panel .resources .active").classed("active", false);
  d3.select("#panel .resources ." + resource).classed("active", true);

  var resourceData;

  if (resource == "food") resourceData = generateResourceData(initialData, FOOD);
  if (resource == "gas") resourceData = generateResourceData(initialData, GAS);
  if (resource == "medical") resourceData = generateResourceData(initialData, MEDICAL);
  if (resource == "nuclear") resourceData = generateResourceData(initialData, NUCLEAR);
  if (resource == "power") resourceData = generateResourceData(initialData, POWER);
  if (resource == "rescue") resourceData = generateResourceData(initialData, RESCUE);
  if (resource == "transportation") resourceData = generateResourceData(initialData, TRANSPORTATION);
  if (resource == "sewer") resourceData = generateResourceData(initialData, SEWER);
  if (resource == "shelter") resourceData = generateResourceData(initialData, SHELTER);
  if (resource == "volunteers") resourceData = generateResourceData(initialData, VOLUNTEERS);

  //if (resource == "common") resourceData = generateResourceData(initialData, nuclear);
  /*
  if (resource == "nuclear") resourceData = generateResourceData(initialData, nuclear);
  if (resource == "gas") resourceData = generateResourceData(initialData, gas);
  if (resource == "water") resourceData = generateResourceData(initialData, water);
  if (resource == "traffic") resourceData = generateResourceData(initialData, traffic);
  if (resource == "shelters") resourceData = generateResourceData(initialData, shelters);
  if (resource == "firefighter") resourceData = generateResourceData(initialData, firefighter);
  if (resource == "hospital") resourceData = generateResourceData(initialData, hospital);
  if (resource == "garbage") resourceData = generateResourceData(initialData, garbage);
  if (resource == "energy") resourceData = generateResourceData(initialData, energy);
  */


  activeResource = resource;

  if (resource == "common") {
    activeTab = "common";
    d3.select("#sunburst").select(".info").text("");
  } else {
    activeTab = "resource";

    var dataByTime = d3.nest()
      // s = ms / 1000
      // h = s / 3600
      .key(d => parseInt(d.time.getTime() / tick))
      .sortKeys((a, b) => d3.ascending(+a, +b))
      .entries(resourceData[1]);

    resourceAmountData = [];
    dataByTime.forEach(function(elem, index) {
      var dataByLocation = d3.nest()
        .key(d => d.location)
        .sortKeys((a, b) => d3.ascending(+a, +b))
        .entries(elem.values);


      resourceAmountData.push({
        time: new Date(parseInt(elem.key) * tick),
        amount: elem.values.length,
        values: dataByLocation
      });
    });

    updateSunburstPercentage(resource);
  }


  updateChords = false;
  updateSunburst = false;
  d3.select(".brush").call(brush.move, sliderX);

}

function updateSunburstPercentageWithDataset(resource, dataset) {

	/*
  if (resource == "nuclear") resourceCalcData = generateResourceData(dataset, nuclear);
  if (resource == "gas") resourceCalcData = generateResourceData(dataset, gas);
  if (resource == "water") resourceCalcData = generateResourceData(dataset, water);
  if (resource == "traffic") resourceCalcData = generateResourceData(dataset, traffic);
  if (resource == "shelters") resourceCalcData = generateResourceData(dataset, shelters);
  if (resource == "firefighter") resourceCalcData = generateResourceData(dataset, firefighter);
  if (resource == "hospital") resourceCalcData = generateResourceData(dataset, hospital);
  if (resource == "garbage") resourceCalcData = generateResourceData(dataset, garbage);
  if (resource == "energy") resourceCalcData = generateResourceData(dataset, energy);
  */

  if (resource == "food") resourceCalcData = generateResourceData(dataset, FOOD);
  if (resource == "gas") resourceCalcData = generateResourceData(dataset, GAS);
  if (resource == "medical") resourceCalcData = generateResourceData(dataset, MEDICAL);
  if (resource == "nuclear") resourceCalcData = generateResourceData(dataset, NUCLEAR);
  if (resource == "power") resourceCalcData = generateResourceData(dataset, POWER);
  if (resource == "rescue") resourceCalcData = generateResourceData(dataset, RESCUE);
  if (resource == "transportation") resourceCalcData = generateResourceData(dataset, TRANSPORTATION);
  if (resource == "sewer") resourceCalcData = generateResourceData(dataset, SEWER);
  if (resource == "shelter") resourceCalcData = generateResourceData(dataset, SHELTER);
  if (resource == "volunteers") resourceCalcData = generateResourceData(dataset, VOLUNTEERS);

  var percentage = (sum(resourceCalcData[0]) * 100 / sizeOfTweets).toFixed(1);

  if (!isNaN(percentage) && percentage != null && percentage != undefined)
    d3.select("#sunburst").select(".info").text("~ " + percentage + "%");
  else d3.select("#sunburst").select(".info").text("0%");
}

function updateSunburstPercentage(resource) {
	/*
  if (resource == "nuclear") resourceCalcData = generateResourceData(slicedData, nuclear);
  if (resource == "gas") resourceCalcData = generateResourceData(slicedData, gas);
  if (resource == "water") resourceCalcData = generateResourceData(slicedData, water);
  if (resource == "traffic") resourceCalcData = generateResourceData(slicedData, traffic);
  if (resource == "shelters") resourceCalcData = generateResourceData(slicedData, shelters);
  if (resource == "firefighter") resourceCalcData = generateResourceData(slicedData, firefighter);
  if (resource == "hospital") resourceCalcData = generateResourceData(slicedData, hospital);
  if (resource == "garbage") resourceCalcData = generateResourceData(slicedData, garbage);
  if (resource == "energy") resourceCalcData = generateResourceData(slicedData, energy);
  */

  if (resource == "food") resourceCalcData = generateResourceData(slicedData, FOOD);
  if (resource == "gas") resourceCalcData = generateResourceData(slicedData, GAS);
  if (resource == "medical") resourceCalcData = generateResourceData(slicedData, MEDICAL);
  if (resource == "nuclear") resourceCalcData = generateResourceData(slicedData, NUCLEAR);
  if (resource == "power") resourceCalcData = generateResourceData(slicedData, POWER);
  if (resource == "rescue") resourceCalcData = generateResourceData(slicedData, RESCUE);
  if (resource == "transportation") resourceCalcData = generateResourceData(slicedData, TRANSPORTATION);
  if (resource == "sewer") resourceCalcData = generateResourceData(slicedData, SEWER);
  if (resource == "shelter") resourceCalcData = generateResourceData(slicedData, SHELTER);
  if (resource == "volunteers") resourceCalcData = generateResourceData(slicedData, VOLUNTEERS);

  var percentage = (sum(resourceCalcData[0]) * 100 / sizeOfTweets).toFixed(1);

  if (!isNaN(percentage) && percentage != null && percentage != undefined)
    d3.select("#sunburst").select(".info").text("~ " + percentage + "%");
  else d3.select("#sunburst").select(".info").text("0%");
}

function sum(obj) {
  var sum = 0;
  for (var el in obj) {
    if (obj.hasOwnProperty(el)) {
      sum += parseFloat(obj[el]);
    }
  }
  return sum;
}

function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

/* */

function capitalize(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function generateResourceData(dataset, resourceSet) {
  var dataByResource = [];

  var map = {};
  for (var i = 0; i < dataset.length; i++) {
    var label = dataset[i]['label'];
    for (var j = 0; j < resourceSet.length; j++) {
      var n = resourceSet[j];
      if (label.includes(n)) {

        if (!map[n]) map[n] = 1;
        else {
          var val = map[n] + 1;
          map[n] = val;
        }

        dataByResource.push(dataset[i]);
        break;
      }


    }
  }

  return [map, dataByResource];
}

function generateJSONChildren(map, tag, colorMap) {
  var item = {},
    children = [],
    index = 0;
  item['name'] = tag;
  item['color'] = colorMap[index];
  item['children'] = [];

  for (var elem in map) {
    var subItem = {};
    subItem['name'] = elem;
    index++;
    subItem['color'] = colorMap[index];
    subItem['size'] = map[elem];
    children.push(subItem);
  }
  item['children'] = children;
  //console.log(item);
  return item;
}

function generateAmountResource(dataset, tag) {

  var amount = 0,
    resource = [];
  for (var i = 0; i < dataset.length; i++) {
    if (tag === 'FOOD')
      resource = FOOD;
    else if (tag === 'GAS')
      resource = GAS;
    else if (tag === 'MEDICAL')
      resource = MEDICAL;
    else if (tag === 'NUCLEAR')
      resource = NUCLEAR;
  	else if (tag === 'POWER')
      resource = POWER;
  	else if (tag === 'RESCUE')
      resource = RESCUE;
  	else if (tag === 'SEWER')
      resource = SEWER;
  	else if (tag === 'SHELTER')
      resource = SHELTER;
  	else if (tag === 'TRANSPORTATION')
      resource = TRANSPORTATION;
  	else if (tag === 'VOLUNTEERS')
      resource = VOLUNTEERS;

    for (var j = 0; j < resource.length; j++) {
      if (dataset[i]['label'].includes(resource[j])) {
        amount++;
      }
    }
  }
  return amount;
}

function generateResourcesBasedOnLocation(dataset, locationLabel) {
	/*
  var resourceTags = ['nuclear', 'energy', 'water', 'hospital', 'shelters', 'firefighter',
    'traffic', 'garbage', 'gas'
  ];
  */

  var resourceTags = [
	"FOOD",
	"GAS",
	"MEDICAL",
	"NUCLEAR",
	"POWER",
	"RESCUE",
	"SEWER",
	"SHELTER",
	"TRANSPORTATION",
	"VOLUNTEERS"
  ];

  var locationMessages = [],
    item = [];

  for (var i = 0; i < dataset.length; i++) {
    if (dataset[i]["location"] === locationLabel) {
      locationMessages.push(dataset[i]);
    }
  }
  var foodSize = generateAmountResource(locationMessages, 'FOOD');
  var gasSize = generateAmountResource(locationMessages, 'GAS');
  var medicalSize = generateAmountResource(locationMessages, 'MEDICAL');
  var nuclearSize = generateAmountResource(locationMessages, 'NUCLEAR');
  var powerSize = generateAmountResource(locationMessages, 'POWER');
  var rescueSize = generateAmountResource(locationMessages, 'RESCUE');
  var sewerSize = generateAmountResource(locationMessages, 'SEWER');
  var shelterSize = generateAmountResource(locationMessages, 'SHELTER');
  var transportationSize = generateAmountResource(locationMessages, 'TRANSPORTATION');
  var volunteersSize = generateAmountResource(locationMessages, 'VOLUNTEERS');

  item['FOOD'] = foodSize;
  item['GAS'] = gasSize;
  item['MEDICAL'] = medicalSize;
  item['NUCLEAR'] = nuclearSize;
  item['POWER'] = powerSize;
  item['RESCUE'] = rescueSize;
  item['SEWER'] = sewerSize;
  item['SHELTER'] = shelterSize;
  item['TRANSPORTATION'] = transportationSize;
  item['VOLUNTEERS'] = volunteersSize;
  //console.log(item);
  return item;
}

function generateJSONRadarchart(map, tag, colorHex) {
  var item = {},
    axes = [],
    index = 0;
  item['name'] = tag;
  item['axes'] = [];
  item['color'] = colorHex;

  for (var elem in map) {
    var subItem = {};
    subItem['axis'] = elem;
    subItem['value'] = map[elem];
    axes.push(subItem);
  }
  item['axes'] = axes;
  return item;
}

function generateChordchartData(dataset, tag) {
  var map = createChordRow(dataset, tag);

  var foodMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var gasMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var medicalMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var nuclearMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var powerMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var rescueMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var sewerMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var shelterMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var transportationMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var volunteersMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


  //9 resources
  // Location + number of resources
  /*
  var nuclearMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ]; //orange
  var energyMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //green
  var waterMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //red
  var hospitalMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //purple
  var sheltersMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //brown
  var fireMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //pink
  var trafficMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //gray
  var garbageMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //lime
  var gasMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //blue
  */


  var matrixData = {};
  matrixData[tag] = map;

  matrixData["FOOD"] = foodMap;
  matrixData["GAS"] = gasMap;
  matrixData["MEDICAL"] = medicalMap;
  matrixData["NUCLEAR"] = nuclearMap;
  matrixData["POWER"] = powerMap;
  matrixData["RESCUE"] = rescueMap;
  matrixData["SEWER"] = sewerMap;
  matrixData["SHELTER"] = shelterMap;
  matrixData["TRANSPORTATION"] = transportationMap;
  matrixData["VOLUNTEERS"] = volunteersMap;

  /*
  matrixData["Nuclear"] = nuclearMap;
  matrixData['Energy'] = energyMap;
  matrixData['Water'] = waterMap;
  matrixData['Hospital'] = hospitalMap;
  matrixData['Shelters'] = sheltersMap;
  matrixData['Firefighter'] = fireMap;
  matrixData['Traffic'] = trafficMap;
  matrixData['Garbage'] = garbageMap;
  matrixData['Gas'] = gasMap;
  */

  return matrixData;
}

function createChordCharts(dataset, zoom) {

  var tags = ["Palace Hills", "Northwest", "Old Town", "Safe Town", "Downtown", "Southwest", "Weston", "Southton", "West Parton", "Oak Willow", "Broadview", "Chapparal", "Terrapin Springs", 'Scenic Vista', "Cheddarford", "Wilson Forest", "Pepper Mill", "Easton", "East Parton"];

  d3.selectAll('#chords > svg').remove();

  var mapWidth = document.getElementById('map').offsetWidth;
  var mapHeight = document.getElementById('map').offsetHeight;
  var width, height;


  if (mapHeight < 720) {
    mapHeight = 720;
  }

  d3.select('#chords').style("width", mapWidth + "px").style("height", mapHeight + "px");

  for (var i = 0; i < 19; i++) {
    var matrixData = generateChordchartData(dataset, tags[i]);

    matrix = Object.values(matrixData);
    matrixKeys = Object.keys(matrixData);

    if (zoom) {
      width = 420, height = 400;

    } else {
      width = 190, height = 170;
    }


    var svg = d3.select("#chords").append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', tags[i].replace(" ", "")),
      outerRadius = Math.min(width, height) * 0.5 - 50,
      innerRadius = outerRadius - 1;


    if (zoom) {
      if (dataset[0] != undefined || dataset[0] != null) {
        if (dataset[0]['location'] === 'Palace Hills')
          svg.style('transform', 'translate(0px,165px)');
        else if (dataset[0]['location'] === 'Northwest')
          svg.style('transform', 'translate(-190px,165px)');
        else if (dataset[0]['location'] === 'Old Town')
          svg.style('transform', 'translate(-340px,165px)');
        else if (dataset[0]['location'] === 'Safe Town')
          svg.style('transform', 'translate(-520px,75px)');
        else if (dataset[0]['location'] === 'East Parton')
          svg.style('transform', 'translate(-650px,165px)');
        else if (dataset[0]['location'] === 'Easton')
          svg.style('transform', 'translate(-820px,135px)');
        else if (dataset[0]['location'] === 'Southwest')
          svg.style('transform', 'translate(0,50px)');
        else if (dataset[0]['location'] === 'Weston')
          svg.style('transform', 'translate(0,-300px)');
        else if (dataset[0]['location'] === 'Southton')
          svg.style('transform', 'translate(0,-450px)');
        else if (dataset[0]['location'] === 'West Parton')
          svg.style('transform', 'translate(-170px,-460px)');
        else if (dataset[0]['location'] === 'Oak Willow')
          svg.style('transform', 'translate(-300px,-600px)');
        else if (dataset[0]['location'] === 'Broadview')
          svg.style('transform', 'translate(-460px,-230px)');
        else if (dataset[0]['location'] === 'Chapparal')
          svg.style('transform', 'translate(-580px,-460px)');
        else if (dataset[0]['location'] === 'Terrapin Springs')
          svg.style('transform', 'translate(-750px,-460px)');
        else if (dataset[0]['location'] === 'Scenic Vista')
          svg.style('transform', 'translate(-790px,-420px)');
        else if (dataset[0]['location'] === 'Pepper Mill')
          svg.style('transform', 'translate(-840px,-100px)');
        else if (dataset[0]['location'] === 'Cheddarford')
          svg.style('transform', 'translate(-800px,30px)');
        else if (dataset[0]['location'] == 'Wilson Forest')
          svg.style('transform', 'translate(-800px,-170px)');
      } else {
        //svg.style('transform', 'translate(-800px,-170px)');
      }


    }

    var formatValue = d3.formatPrefix(",.0", 1e3);

    var chord = d3.chord()
      .padAngle(0.15)
      .sortSubgroups(d3.descending);

    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    var ribbon = d3.ribbon()
      .radius(innerRadius);



    // var colors = ['#FF4C40',"#FFD300","#39FF14","#57A0D3","#FF0800",'#8B008B','#EE7417','#636363','#FF6666','#964514',"#469990"];
    // var colors = ['#469990', '#FF6666', '#ff2019', '#ffd719', '#78cd2d', '#EE7417', '#67a9d7', '#b966b9', '#727272', '#964514'];
    var colors = ['#964514', '#469990', '#FF6666', '#ff2019', '#ffd719', '#78cd2d', '#EE7417', '#67a9d7', '#b966b9', '#727272'];
    var color = d3.scaleOrdinal()
      .domain(d3.range(11))
      .range(colors);

    var g;


    g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(165)")
      .datum(chord(matrix));



    var group = g.append("g")
      .attr("class", "groups")
      .selectAll("g")
      .data(function(chords) {
        return chords.groups;
      })
      .enter().append("g");

    group.append("path")
      .style("fill", function(d) {
        return color(d.index);
      })
      .style("stroke", function(d) {
        return d3.rgb(color(d.index)).darker();
      })
      .attr("d", arc);

    var groupTick = group.selectAll(".group-tick")
      .data(function(d) {
        return groupTicks(d, 1e3);
      })
      .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 75) +
          ") translate(" + outerRadius + ",2)";
      });

    groupTick.append("line")
      .attr("x2", 6);

    groupTick
      .filter(function(d) {
        return d.value % 5e3 === 0;
      })
      .append("text")
      .attr("font-size", "12px")
      .attr("font-style", "bold")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90) translate(-30, 15)")
      // .attr("transform", function(d) { return d.angle > Math.PI/2 && d.angle < Math.PI*3/2 ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) {
        return d.angle > Math.PI / 2 && d.angle < Math.PI * 3 / 2 ? "end" : null;
      })
      .text(function(d) {
        return matrixKeys[d.index];
      });

    g.append("g")
      .attr("class", "ribbons")
      .selectAll("path")
      .data(function(chords) {
        return chords;
      })
      .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function(d) {
        return color(d.target.index);
      })
      .style("stroke", function(d) {
        return d3.rgb(color(d.target.index)).darker();
      });
  }

}

function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {
      index: d.index,
      value: value,
      angle: value * k + d.startAngle
    };
  });
}

function drawChordLegend() {

  var legend = d3.select("#chordLegend").append('svg').attr('width', 300).attr('height', 400);
  legend.append("circle").attr("cx", 200).attr("cy", 130).attr("r", 6).style("fill", "#ff7f00")
  legend.append("circle").attr("cx", 200).attr("cy", 160).attr("r", 6).style("fill", "#24a221")
  legend.append("circle").attr("cx", 200).attr("cy", 190).attr("r", 6).style("fill", "#d8241f")
  legend.append("circle").attr("cx", 200).attr("cy", 220).attr("r", 6).style("fill", "#9564bf")
  legend.append("circle").attr("cx", 200).attr("cy", 250).attr("r", 6).style("fill", "#8d5649")
  legend.append("circle").attr("cx", 200).attr("cy", 280).attr("r", 6).style("fill", "#e574c3")
  legend.append("circle").attr("cx", 200).attr("cy", 310).attr("r", 6).style("fill", "#7f7f7f")
  legend.append("circle").attr("cx", 200).attr("cy", 340).attr("r", 6).style("fill", "#bcbf00")
  legend.append("circle").attr("cx", 200).attr("cy", 370).attr("r", 6).style("fill", "#00bed1")
  legend.append("text").attr("x", 220).attr("y", 130).text("Nuclear").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 160).text("Energy").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 190).text("Water").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 220).text("Hospital").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 250).text("Shelters").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 280).text("Firefighter").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 310).text("Traffic").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 340).text("Garbage").style("font-size", "16px").attr("alignment-baseline", "middle")
  legend.append("text").attr("x", 220).attr("y", 370).text("Gas").style("font-size", "16px").attr("alignment-baseline", "middle")

}

function createChordRow(dataset, locationLabel) {
  var row = [];

  var resourceTags = ['FOOD', 'GAS', 'MEDICAL', 'NUCLEAR', 'POWER', 'RESCUE', 'SEWER', 'SHELTER', 'TRANSPORTATION', 'VOLUNTEERS'];

  var resources = generateResourcesBasedOnLocation(dataset, locationLabel);
  //For the location
  row.push(0);

  for (var j = 0; j < resourceTags.length; j++) {
    if (resources[resourceTags[j]] == undefined)
      row.push(0);
    else
      row.push(resources[resourceTags[j]]);
  }
  return row;
}


/* */

function getMessageBox(data) {
  var count = data.length;
  var messageCount = document.getElementById("messageCount");
  messageCount.innerHTML = count;

  var messageBox = document.getElementById('messageBox');

  while (messageBox.hasChildNodes()) {
    messageBox.removeChild(messageBox.lastChild);
  }

  for (var i = 0; i < data.length; i += 70) {
    var li = document.createElement("li");
    li.setAttribute('role', 'presentation');

    var a = document.createElement('a');
    a.setAttribute('role', 'menuitem');
    a.setAttribute('href', '#');
    a.setAttribute('style', 'align-items: center');

    var accountName = document.createElement('strong');
    accountName.setAttribute('style', 'font-size:16px');
    accountName.innerHTML = data[i]['account'] + "&nbsp;&nbsp;&nbsp;";

    var formatTime = d3.timeFormat("%B %d, %I:%M");
    var date = formatTime(data[i]['time']);
    var timeDate = document.createElement('span');
    timeDate.setAttribute('style', 'font-size:14px');
    timeDate.innerHTML = date;

    var br = document.createElement('br');

    var message = data[i]['message'];
    var msg = document.createElement('span');
    msg.setAttribute('style', 'font-size:16px');
    msg.innerHTML = message;


    var img = document.createElement('img');
    if (data[i]["location"] == "Palace Hills") {
      img.setAttribute('src', 'images/palace.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Northwest") {
      img.setAttribute('src', 'images/northwest.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Old Town") {
      img.setAttribute('src', 'images/oldtown.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Safe Town") {
      img.setAttribute('src', 'images/safetown.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Southwest") {
      img.setAttribute('src', 'images/southwest.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Downtown") {
      img.setAttribute('src', 'images/downtown.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Wilson Forest") {
      img.setAttribute('src', 'images/wilsonforest.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Broadview") {
      img.setAttribute('src', 'images/broadview.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Chapparal") {
      img.setAttribute('src', 'images/chapparal.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Terrapin Springs") {
      img.setAttribute('src', 'images/terappinsprings.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Pepper Mill") {
      img.setAttribute('src', 'images/peppermill.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Cheddarford") {
      img.setAttribute('src', 'images/cheddarford.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Easton") {
      img.setAttribute('src', 'images/easton.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Weston") {
      img.setAttribute('src', 'images/weston.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Southton") {
      img.setAttribute('src', 'images/southton.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Oak Willow") {
      img.setAttribute('src', 'images/oakwillow.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "East Parton") {
      img.setAttribute('src', 'images/eastparton.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "West Parton") {
      img.setAttribute('src', 'images/westparton.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    } else if (data[i]["location"] === "Scenic Vista") {
      img.setAttribute('src', 'images/scenicvista.png');
      img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
    }

    a.appendChild(img);
    a.appendChild(accountName);
    a.appendChild(timeDate);
    a.appendChild(br);
    a.appendChild(msg);
    li.appendChild(a);
    messageBox.appendChild(li);

  }
}


function getVoiceOfPeople(slicedData){

  if (slicedData.length > 0) {
    //Filtering based on the sliced data
    var topMessage = slicedData[0]['time'],
      lastMessage = slicedData[slicedData.length-1]['time'];

      //console.log(topMessage);
      //console.log(lastMessage);

    
    var data = [];

    d3.csv('data/circus_data.csv').then(function(dataset)
    {
      dataset.forEach(function(row)
      {
        var date = new Date(row['time'].replace(/ /g,"T"));
        if(topMessage < date && date < lastMessage){
          data.push(row);
        }
      });

      d3.csv('data/concert_data.csv').then(function(dataset)
      {
        dataset.forEach(function(row)
        {
          var date = new Date(row['time'].replace(/ /g,"T"));
          if(topMessage < date && date < lastMessage)
            data.push(row);
          });

        d3.csv('data/vigil_data.csv').then(function(dataset)
        {
          dataset.forEach(function(row)
          {
            var date = new Date(row['time'].replace(/ /g,"T"));
            if(topMessage < date && date < lastMessage)
              data.push(row);
          });

          var count = data.length;
          var messageCount = document.getElementById("voiceCount");
          messageCount.innerHTML = count;

          var messageBox = document.getElementById('voiceBox');

          while (messageBox.hasChildNodes()) {
            messageBox.removeChild(messageBox.lastChild);
          }

      for (var i = 0; i < data.length; i ++) {
            var li = document.createElement("li");
            li.setAttribute('role', 'presentation');

            var a = document.createElement('a');
            a.setAttribute('role', 'menuitem');
            a.setAttribute('href', '#');
            a.setAttribute('style', 'align-items: center');

            var accountName = document.createElement('strong');
            accountName.setAttribute('style', 'font-size:16px');
            accountName.innerHTML = data[i]['account'] + "&nbsp;&nbsp;&nbsp;";

            var timeDate = document.createElement('span');
            var date = new Date(data[i]['time'].replace(/ /g,"T"));
            var formatTime = d3.timeFormat("%B %d, %I:%M");
            var formattedDate = formatTime(date);
            timeDate.setAttribute('style', 'font-size:14px');
            timeDate.innerHTML = formattedDate;

            var br = document.createElement('br');

            var message = data[i]['message'];
            var msg = document.createElement('span');
            msg.setAttribute('style', 'font-size:16px');
            msg.innerHTML = message;


            var img = document.createElement('img');
            if (data[i]["location"] === "Palace Hills") {
              img.setAttribute('src', 'images/palace.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Northwest") {
              img.setAttribute('src', 'images/northwest.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Old Town") {
              img.setAttribute('src', 'images/oldtown.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Safe Town") {
              img.setAttribute('src', 'images/safetown.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Southwest") {
              img.setAttribute('src', 'images/southwest.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Downtown") {
              img.setAttribute('src', 'images/downtown.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Wilson Forest") {
              img.setAttribute('src', 'images/wilsonforest.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Broadview") {
              img.setAttribute('src', 'images/broadview.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Chapparal") {
              img.setAttribute('src', 'images/chapparal.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Terrapin Springs") {
              img.setAttribute('src', 'images/terappinsprings.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Pepper Mill") {
              img.setAttribute('src', 'images/peppermill.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Cheddarford") {
              img.setAttribute('src', 'images/cheddarford.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Easton") {
              img.setAttribute('src', 'images/easton.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Weston") {
              img.setAttribute('src', 'images/weston.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Southton") {
              img.setAttribute('src', 'images/southton.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Oak Willow") {
              img.setAttribute('src', 'images/oakwillow.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "East Parton") {
              img.setAttribute('src', 'images/eastparton.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "West Parton") {
              img.setAttribute('src', 'images/westparton.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            } else if (data[i]["location"] === "Scenic Vista") {
              img.setAttribute('src', 'images/scenicvista.png');
              img.setAttribute('style', 'width:50px;height:50px;float:left;margin-right: 10px;');
            }

            a.appendChild(img);
            a.appendChild(accountName);
            a.appendChild(timeDate);
            a.appendChild(br);
            a.appendChild(msg);
            li.appendChild(a);
            messageBox.appendChild(li);

          }

        });
      });
    });
  }

}

/*
function eventClick(e) {
  console.log(e);
}
*/

$('#events-panel .event-item').click(function() {
  var date = new Date($(this).attr('alt'));
  var maxDate = new Date("2020-04-10T12:00:00");

  if (xContext(date) + 130 > xContext(maxDate)) {
    d3.select(".brush").call(brush.move, [xContext(date), xContext(maxDate)]);
    activeEventTimeStart = xContext(date);
    activeEventTimeEnd = xContext(maxDate);
  }
  else {
    d3.select(".brush").call(brush.move, [xContext(date), xContext(date) + 130]);
    activeEventTimeStart = xContext(date);
    activeEventTimeEnd = xContext(date) + 130;
  }
  

  $("#events-panel .event-item").removeClass("active");
  $(this).addClass("active");
});
