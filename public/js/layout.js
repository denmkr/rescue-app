//alert("Hello! I am an alert box!!");

/* Map variables */
var projection, mapWidth, mapHeight, mapViewport, centered;
var mapZoom;
var currentDistrict;
var commonMode = true;

/* Amount chart variables */
var tick = 3600 * 1000;
var initialData, amountData, dataByTime, slicedData;

var container = d3.select("#vis-container");

var margins = {
    top: 20,
    right: 30,
    bottom: 50,
    left: 30
};

/* Panel vsriables */
var activeTab = 'words';

//LDA - NMF topics 
var dictionary = [
  "power", "nuclear","plant", "safe", "radiation", 
  "routes", "precautionary","pending", "notice", "action", "inspection", "closed", "safety", "bridge", 
  "repair",  "testing", "failure", "integrity", "defects", "damages", 
  "shelter", "disaster", "water", "bottled", "sewer", "boil", "department", "contaminated", "neighborhoods", "health",
  "fast","service","break", "fatalities","hearing","trust", "friend", "wife", "monitoring","city","safer", "cooperation",
  "connection","battery","broken","dead","earthquake","shaking","feel","hard","ambulance","town","reports", "energy",
  "public","radio","route","feel","evacuation", "active", "build", "seek","dangerous","victims","heavy","search","evacuating"
  ,"buildings","time","hospital","people","congestion","severe","experience","collapsed","street","lapping","rolling","accident",
  "scene","roads","chains","rescue","workers","trapped","helping","trained","teams","volunteers","destroy","limitation","school","library","hazard","effect","trees",
  "food","hospitals","warehouse","stores","supplies","generators","night","donations","suffered","emergency","shelters","damages","integrity","helpful","happen","headset",
  "lose","fire","explosion","life","help","electricity","electirical"];

/* Creating hierarchy for Sunburst with these categories */
var nuclear = ["nuclear","power","safe","radiation","failure","disaster","feel","energy","hazard","damages","fatalities"];
var water = ["water","failure","bottled","contaminated","boil","fatalities","sewer","supplies","infrastructure","pipes","pipe"];
var energy = ["power","electricity","failure","service","break","energy","battery","generators","electrical"];
var hospital = ["health","fast","help","ambulance","reports","victims","hospital","severe","accident","hospitals","donations","emergency",
  "helpful","life","dead","serum","death","psychologist"];
var firefighter = ["lose","fire","service","friend","wife","cooperation","connection","search","rescue","helping","trapped","teams","volunteers"]
var shelters = ["shelter","shelters","roof","buildings","warehouse","stores","supplies"];
var traffic = ["congestion","closed","road","connection","route","roads","bridge","closed","dangerous","repair",
  "delay","street","traffic","airport"];
var garbage = ["contaminated","contamination","garbage","dirty","smelly","waste"];
var gas = ["congestion","gas","smell","damages","repair"];

//Color schemes 
var yellow = ["#F9A602","#FFD300","#FADA5E","#F8DE7E","#DAA520","#FCF4A3","#FCD12A","#FFC30B","#FCE205","#FFBF00","#FEDC56",'#FFDDAF'];
var blue = ["#57A0D3","#4F97A3","#4682B4","#6593F5","#89CFF0","#588BAE","#95C8D8","#B0DFE5","#3FE0D0","#73C2FB","#008ECC","#0080FF"];
var green = ["#39FF14","#0b6623","#708238","#3f704d","#c7ea46","#00A86B","#4CBB17","#50C878","#679267","#2E8B57","#50C878","#00A572"];
var red = ["#FF0800","#b20000",'#FF2400','#ED2939','#CD5C5C','#C21807','#E0115F','#B22222','#960018','#800000','#A45A52','#EA3C53','#D21F3C','#CA3433','#BF0A30','#B80F0A','#80021F','#5E1914','#e50000'];
var orange = ['#EE7417','#EF7215','#F79862','#F05E23','#BE5504','#D7722C','#CB5C0D','#B3672B','#EF8200','#FDA50F','#FD6A02','#F9812A','#FC6600'];
var purple = ['#8B008B','#9370DB','#9400D3','#9932CC','#BA55D3','#800080','#D8BF08','#DDA0DD','#EE82EF','#DA70D6','#C71585','#DB7093'];
var gray = ['#636363','#787878','#828282','#919191','#A1A1A1','#ABABAB','#B8B8B8','#C2C2C2','#CFCFCF','#636363', '#555555','#454545','#363636','#424242','#999999'];
var brown = ['#964514','#6B4226','#733D1A','#8B4513','#D2691E','#BC7642','#603311','#AA5303'];
var pink = ['#FF6666','#FF6A6A','#FFC1C1','#FA8072','#FFE4E1','#F08080','#CD5555'];


drawMap();
drawChart();
drawChordLegend();


/* Time Slider Functions */
function drawTimeSlider(data, xFocus, focusVis, yLine, xAxisFocus) {
  var contextAreaHeight = 60;
  var contextVisWidth = window.innerWidth - 55;

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

  var xContext = d3.scaleTime().domain(d3.extent(data, function (d) {
      return d.time;
  })).range([0, contextVisWidth]);
  var yContext = d3.scaleLinear().domain([0, d3.extent(data.map(function (d) {
      return d.amount
  }))[1] + 100]).range([contextAreaHeight, 0]);

  // To organize our code, we add one group for the context visualization
  var contextVis = d3.select("#time").append("svg").attr("width", contextVisWidth).attr("height", "80px").append("g").style("transform", "translate(18px, 0)");

  var xAxisContext = d3.axisBottom(xContext).ticks();
  contextVis.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + contextAreaHeight + ")")
    .call(xAxisContext);

  // Init two line generators
  var lineContext = d3.area()
    .x(function (d) {
        return xContext(d.time);
    })
    .y0(contextAreaHeight)
    .y1(function (d) {
        return yContext(d.amount);
    })
    .curve(curve);

  contextVis.append("linearGradient")        
    .attr("id", "area-gradient")      
    .attr("gradientUnits", "userSpaceOnUse")  
    .attr("x1", 0).attr("y1", yContext(0))      
    .attr("x2", 0).attr("y2", yContext(140))    
    .selectAll("stop")            
      .data([                
          {offset: "0%", color: "#2e6b3f"},  
          {offset: "15%", color: "#a1ce76"},    
          {offset: "40%", color: "#fae19c"},    
          {offset: "70%", color: "#e88759"},  
          {offset: "100%", color: "#a4252c"}  
      ])            
    .enter().append("stop")      
      .attr("offset", function(d) { return d.offset; })  
      .attr("stop-color", function(d) { return d.color; });

  // Add the two lines for rain and temperature
  contextVis.append("path")
    .datum(data)
    .attr("class", "line line-temp")
    .attr("d", lineContext);

  /*
  * Add Interactive Features here
  */

  var brush = d3.brushX()
    .extent([[0, 0], [contextVisWidth, contextAreaHeight]])
    .on("brush end", function() {
      var s = d3.event.selection || xContext.range();
      
      xFocus.domain(s.map(xContext.invert, xContext));

      var left = new Date(parseInt(xFocus.domain()[0].getTime() / tick) * tick);
      var right = new Date(parseInt(xFocus.domain()[1].getTime() / tick) * tick);

      leftIndex = amountData.map(function(e) { return e.time.getTime() }).indexOf(left.getTime());
      rightIndex = amountData.map(function(e) { return e.time.getTime() }).indexOf(right.getTime());
    
      data = amountData.slice(leftIndex, rightIndex);
      slicedData = data;
      

      districtAmounts = {};
      data.map(d1 => {
          d1.values.map(d2 => {
              var name = d2.key.toLowerCase();
              var count = districtAmounts[name];

              if (isNaN(count)) districtAmounts[name] = d2.values.length;
              else districtAmounts[name] = count + d2.values.length;
          });
      });

      var districtLinear = d3.scaleLinear().domain([0, d3.extent(Object.values(districtAmounts), function(d) { return d; })[1]]).range([0.95, 0]);

      mapViewport.selectAll("polygon").each(function(d) {
        var name = d3.select(this).attr("name");
        var amount = districtAmounts[name];
        var lightness = 0.95;

        if (amount != undefined && amount != null) {
          lightness = districtLinear(amount);
        }
  
        // var color = d3.hsl(201, 0.5, lightness);
        var color = d3.interpolateRdYlGn(lightness);
        d3.select(this).style("fill", color);

        if (lightness < 0.3) {
          if (name != "scenic vista") {
            mapViewport.selectAll(".district_label").filter(function() {
              return d3.select(this).text() == name
            }).classed("white", true);
          }
        }
        else {
          mapViewport.selectAll(".district_label").filter(function() {
            return d3.select(this).text() == name
          }).classed("white", false);
        }
      });

      focusVis.select(".line-temp").attr("d", yLine);
      focusVis.select(".x.axis").call(xAxisFocus);

      if (contextVis.select(".brush").attr("pointer-events") == "all") {
        leftIndex = initialData.map(function(e) { return parseInt(e.time.getTime() / tick) * tick }).indexOf(left.getTime());
        rightIndex = initialData.map(function(e) { return parseInt(e.time.getTime() / tick) * tick }).lastIndexOf(right.getTime());

        slicedData = initialData.slice(leftIndex, rightIndex);
        updateElementsByDistrict(currentDistrict);
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

  d3.dsv(",", "data/related_data.csv", function (d) {
    return {
      time: dateFromString(d.Time),
      location: d.Location,
      account: d.Account,
      message: d.Message,
      cleanedMessage: d["Cleaned message"],
      hashtags: d.Hashtags
    };
  }).then(function (data) {
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

      amountData.push({time: new Date(parseInt(elem.key) * tick), amount: elem.values.length, values: dataByLocation});
    });

    data = amountData;

    // Init Scales
    var xFocus = d3.scaleTime().domain(d3.extent(data, function (d) {
      return d.time;
    })).range([0, visWidth]);

    var yFocus = d3.scaleLinear().domain(d3.extent(data.map(function (d) {
      return d.amount
    }))).range([focusAreaHeight, 0]);

    // In order to organize our code, we add one group for the focus visualization (the large lien chart)
    var focusVis = viewport.append("g");

    // Initialize a line generator for each line
    var yLine = d3.area()
      .x(function (d) {
        return xFocus(d.time);
      })
      .y0(function (d) {
        return focusAreaHeight;
      })
      .y1(function (d) {
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

    /* Draw time slider */
    drawTimeSlider(data, xFocus, focusVis, yLine, xAxisFocus);
  
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

      var bisectDate = d3.bisector(function(d) { return d.time; }).left;
      var i = bisectDate(data, x0, 1);

      var time = data[i-1].time;
      var amount = data[i-1].amount;

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
  var mapSvg = mapContainer.append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

  mapViewport = mapSvg.append("g")
  mapViewport.attr("transform", "scale(0.75) translate(240,25)");

  const projection = d3.geoMercator()
    .translate([0, 0])
    .scale(0.85);

  const path = d3.geoPath()
    .projection(projection);

  mapZoom = d3.zoom()
    .scaleExtent([0.85, 6])
    .translateExtent([[-50, -50], [mapWidth + 120, mapHeight + 120]])
    .on('zoom', zoomed);

  mapViewport.call(mapZoom);
  mapViewport.transition()
    .duration(1)
    .call(mapZoom.transform, d3.zoomIdentity.scale(0.85).translate(0, 0));

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
            updateElementsByDistrict(currentDistrict,neighborhood);
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
    var visualization = mapViewport.append("g");

    data.forEach(infra => {
      var color = infra.type == "street" || infra.type == "highway" ? "grey" : "black"
      visualization.append("polygon")
        .attr("name", infra.name)
        .attr("points", infra.coordinates)
        .attr("stroke", color)
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
  }
}

function clicked(polygon, x, y) {
  var scale;

  if (x && y && centered !== x + " " + y) {
    scale = 3;
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
    scale = 0.85;
    centered = null;

    translate = [0, 0];

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
  
    if (d3.event.transform.k > 1.25) {
      if (d3.select("#map img").classed("show")) d3.select("#map img").classed("show", false);
    }
    else {
      if (!d3.select("#map img").classed("show")) d3.select("#map img").classed("show", true);
    }
  
    //mapViewport.attr('transform', d3.event.transform); 
}

function dateFromString(string) {
  var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  var dateArray = reggie.exec(string); 
  var dateObject = new Date(
    (+dateArray[1]),
    (+dateArray[2])-1, // Careful, month starts at 0!
    (+dateArray[3]),
    (+dateArray[4]),
    (+dateArray[5]),
    0
  );

  return dateObject;
}

function updateElementsByDistrict(district) {
  if (commonMode || currentDistrict == undefined || currentDistrict == null || currentDistrict == "") {
    /*if (activeTab === "words") {
      drawWordCloud(slicedData);
      drawHashtagCloud(slicedData);
    }
    if (activeTab === "resources") {
      drawSunburst(slicedData);
    }
    if (activeTab === "chord") {
      //drawRadarchart(slicedData);
      drawChordchart(slicedData);
    } */


    createChordChart(slicedData);
    drawWordCloud(slicedData);
    drawHashtagCloud(slicedData);
    drawSunburst(slicedData);
    getMessageBox(slicedData);
    //createPositiveMood(slicedData);
    //createNegativeMood(slicedData);
  }
  else {
    var dataByLocations = d3.nest()
      .key(d => d.location)
      .entries(slicedData);

    var i;
    for (i = 0; i<dataByLocations.length; i++) {
      if (dataByLocations[i].key.toLowerCase() == district) break;
    }

    /*if (activeTab == "words") {
      drawWordCloud(dataByLocations[i].values);
      drawHashtagCloud(dataByLocations[i].values);
    }
    if (activeTab == "resources") drawSunburst(dataByLocations[i].values);
    if (activeTab == "chord") drawChordchart(dataByLocations[i].values);*/
    createChordChart(dataByLocations[i].values);
    drawWordCloud(dataByLocations[i].values);
    drawHashtagCloud(dataByLocations[i].values);
    drawSunburst(dataByLocations[i].values);
    getMessageBox(dataByLocations[i].values);
    //createPositiveMood(dataByLocations[i].values);
    //createNegativeMood(dataByLocations[i].values);
  }
}


function drawWordCloud(data) {
  var text = "";

  data.map(function(d) {
    text = text + d.cleanedMessage + " ";
  });

  var counts = text.replace(/[^\w\s]/g, "").split(/\s+/).reduce(function(map, word) {
      map[word] = (map[word]||0)+1;
      return map;
  }, Object.create(null));

  delete counts[""];
  var words = [];

  var max = d3.extent(Object.values(counts), function(d) { return d; })[1];

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
  
  var wordSizeLinear = d3.scaleSqrt().domain([0, d3.extent(words, function(d) { return d.size; })[1]]).range([0, 100]);
  var wordColorLinear = d3.scaleLinear().domain(d3.extent(words, function(d) { return wordSizeLinear(d.size); })).range([0.45, 1]); 

  var width = 480;
  var height = 300;

  d3.selectAll("#wordcloud > svg").remove();

  d3.layout.cloud()
    .size([width, height])
    .words(words.map(function(d, i) {
      var amount = parseInt(wordSizeLinear(d.size))
      var lightness = 0;

      if (amount != undefined && amount != null) lightness = wordColorLinear(amount);
      var color = d3.interpolateBlues(lightness);

      return {text: d.text, size: parseInt(wordSizeLinear(d.size)), color: color};
    }))
    .rotate(function() {
      return ~~(Math.random() * 2) * 90;
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
      map[word] = (map[word]||0)+1;
      return map;
  }, Object.create(null));

  delete counts[""];
  var words = [];

  var max = d3.extent(Object.values(counts), function(d) { return d; })[1];

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
  
  var wordSizeLinear = d3.scaleSqrt().domain([0, d3.extent(words, function(d) { return d.size; })[1]]).range([0, 50]);
  var wordColorLinear = d3.scaleLinear().domain(d3.extent(words, function(d) { return wordSizeLinear(d.size); })).range([0.45, 1]); 

  var width = 300;
  var height = 300;

  d3.selectAll("#hashtagcloud > svg").remove();

  d3.layout.cloud()
    .size([width, height])
    .words(words.map(function(d, i) {
      var amount = parseInt(wordSizeLinear(d.size))
      var lightness = 0;

      if (amount != undefined && amount != null) lightness = wordColorLinear(amount);
      var color = d3.interpolateBlues(lightness);

      return {text: d.text, size: parseInt(wordSizeLinear(d.size)), color: color};
    }))
    .rotate(function() {
      return ~~(Math.random() * 2) * 90;
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

  var nuclearData = generateResourceData(dataset, nuclear);
  var waterData = generateResourceData(dataset, water)
  var energyData = generateResourceData(dataset,energy);
  var hospitalData = generateResourceData(dataset, hospital);
  var firefighterData = generateResourceData(dataset, firefighter);
  var sheltersData = generateResourceData(dataset, shelters);
  var trafficData = generateResourceData(dataset, traffic);
  var garbageData = generateResourceData(dataset, garbage);
  var gasData = generateResourceData(dataset, gas);
 
  var json = {
    name:'resources',
    color: '#fff',
    children: [
      generateJSONChildren(nuclearData[0], 'nuclear', yellow), 
      generateJSONChildren(waterData[0], 'water', blue),
      generateJSONChildren(energyData[0],'energy', green),
  	  generateJSONChildren(hospitalData[0], 'hospital', red),
      generateJSONChildren(firefighterData[0], 'firefighter', orange),
      generateJSONChildren(sheltersData[0], 'shelters', purple),
      generateJSONChildren(trafficData[0], 'traffic', gray),
      generateJSONChildren(garbageData[0], 'garbage', brown),
      generateJSONChildren(gasData[0], 'gas', pink)
    ]
  };

  var size = getAmountTweets(json);
  Sunburst().data(json)
    .size('size')
    .width(500)
    .height(500)
    .showLabels(true)
    .color('color')
    .tooltipContent((d, node) => `Total amount: <i>${node.value}</i><br>Percentage: <i>${Math.floor((node.value * 100)/size)}</i>%`)
    (document.getElementById('sunburst'));
}

function getAmountTweets(data)
{
  var size = 0;
  for(var i=0;i<data['children'].length;i++)
  {
    for(var j=0;j<data['children'][i]['children'].length;j++)
    {
      size += data['children'][i]['children'][j]['size'];
    }
  }
  return size;
}


function resourceMode(resource) {
  var resourceData;
  if (resource == "nuclear") resourceData = generateResourceData(slicedData, nuclear);
  console.log(resourceData);
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
  for (var i=0;i<dataset.length;i++) {
	var message = dataset[i]['cleanedMessage'];
    resourceSet.forEach(function(n) {
      if (message.includes(n)) {
        if (!map[n]) map[n] = 1;
        else {
          var val = map[n] + 1;
          map[n] = val;
        }

        dataByResource.push(dataset[i]);
      }    
	});
  }

  return [map, dataByResource];
}

function generateJSONChildren(map,tag,colorMap) {
	var item = {}, children =[], index = 0;
	item['name'] = tag;
	item['color'] = colorMap[index];
	item['children'] = [];

	for(var elem in map)
	{
	  var subItem = {};
	  subItem['name'] = elem;
	  index++;
	  subItem['color'] = colorMap[index];
	  subItem['size'] = map[elem];
	  children.push(subItem);
	}
	item['children']=children;
	//console.log(item);
	return item;
}

function generateAmountResource(dataset,tag)
{
  var amount = 0, resource = [];
  for(var i=0;i<dataset.length;i++)
  {
    if(tag === 'nuclear')
      resource = nuclear;
    else if(tag === 'energy')
      resource = energy;
    else if(tag === 'water')
      resource = water;
    else if(tag === 'hospital')
      resource = hospital;
    else if(tag === 'shelters')
      resource = shelters;
    else if(tag === 'firefighter')
      resource = firefighter;
    else if(tag === 'traffic')
      resource = traffic;
    else if(tag === 'garbage')
      resource = garbage;
    else if(tag === 'gas')
      resource = gas;

    for(var j=0;j<resource.length;j++)
    {
      if(dataset[i]['cleanedMessage'].includes(resource[j])){
        amount ++;
      }
    }
  }
  return amount;
}

function generateResourcesBasedOnLocation(dataset,locationLabel)
{
  var resourceTags = ['nuclear','energy','water','hospital','shelters','firefighter',
  'traffic','garbage','gas'];

  var locationMessages = [], item = [];

  for(var i=0;i<dataset.length;i++)
  {
    if(dataset[i]["location"] === locationLabel){
      locationMessages.push(dataset[i]);
    }
  }
  var nuclearSize = generateAmountResource(locationMessages,'nuclear');
  var energySize = generateAmountResource(locationMessages,'energy');
  var waterSize = generateAmountResource(locationMessages,'water');
  var hospitalSize = generateAmountResource(locationMessages,'hospital');
  var shelterSize = generateAmountResource(locationMessages,'shelters');
  var fireSize = generateAmountResource(locationMessages,'firefighter');
  var trafficSize = generateAmountResource(locationMessages,'traffic');
  var garbageSize = generateAmountResource(locationMessages,'garbage');
  var gasSize = generateAmountResource(locationMessages,'gas');

  item['nuclear'] = nuclearSize;
  item['energy'] = energySize;
  item['water'] = waterSize;
  item['hospital'] = hospitalSize;
  item['shelters'] = shelterSize;
  item['firefighter'] = fireSize;
  item['traffic'] = trafficSize;
  item['garbage'] = garbageSize;
  item['gas'] = gasSize;
  //console.log(item);
  return item;
}

function generateJSONRadarchart(map,tag,colorHex)
{
  var item = {}, axes =[], index = 0;
  item['name'] = tag;
  item['axes'] = [];
  item['color'] = colorHex;

  for(var elem in map)
  {
    var subItem = {};
    subItem['axis'] = elem;
    subItem['value'] = map[elem];
    axes.push(subItem);
  }
  item['axes']=axes;
  return item;
}


function generateChordchartData(dataset, tag)
{
   var map = createChordRow(dataset,tag);
    //9 resources
  var nuclearMap = [0,0,0,0,0,0,0,0,0,0]; //orange
  var energyMap = [0,0,0,0,0,0,0,0,0,0]; //green
  var waterMap = [0,0,0,0,0,0,0,0,0,0]; //red
  var hospitalMap = [0,0,0,0,0,0,0,0,0,0]; //purple
  var sheltersMap = [0,0,0,0,0,0,0,0,0,0]; //brown
  var fireMap = [0,0,0,0,0,0,0,0,0,0]; //pink
  var trafficMap = [0,0,0,0,0,0,0,0,0,0]; //gray
  var garbageMap = [0,0,0,0,0,0,0,0,0,0]; //lime
  var gasMap =[0,0,0,0,0,0,0,0,0,0]; //blue

  var matrixData = {};
  matrixData[tag] = map;
  matrixData["Nuclear"] = nuclearMap;
  matrixData['Energy'] = energyMap;
  matrixData['Water'] = waterMap;
  matrixData['Hospital'] = hospitalMap;
  matrixData['Shelters'] = sheltersMap;
  matrixData['Firefighter'] = fireMap;
  matrixData['Traffic'] = trafficMap;
  matrixData['Garbage'] = garbageMap;
  //matrixData['Gas'] = gasMap;

  return matrixData;
}

function createChordChart(dataset){

 var tags = ["Palace Hills", "Northwest", "Old Town", "Safe Town", "Downtown","Southwest","Weston","Southton","West Parton","Oak Willow","Broadview","Chapparal","Terrapin Springs",'Scenic Vista',"Cheddarford","Wilson Forest","Pepper Mill"
  ,"Easton", "East Parton"];

  d3.selectAll('#chord > svg').remove();

  for(var i=0;i<19;i++)
  {
    var matrixData = generateChordchartData(dataset,tags[i]); 

    matrix= Object.values(matrixData);
    matrixKeys = Object.keys(matrixData);

  var width = 450, height= 450;

    
  var svg = d3.select("#chord").append('svg')
    .attr('width',width)
    .attr('height',height)
    .attr('id',tags[i].replace(" ","")),
      outerRadius = Math.min(width, height) * 0.5 - 150,
      innerRadius = outerRadius - 10;

  var formatValue = d3.formatPrefix(",.0", 1e3);

  var chord = d3.chord()
      .padAngle(0.25)
      .sortSubgroups(d3.descending);

  var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var ribbon = d3.ribbon()
      .radius(innerRadius);

  var colors = ['#FF4C40',"#FFD300","#39FF14","#57A0D3","#FF0800",'#8B008B','#EE7417','#636363','#FF6666','#964514'];
  var color = d3.scaleOrdinal()
      .domain(d3.range(10))
      .range(colors);

  var g;

  if(i == 0 || i == 1 || i == 2 || i == 3 || i == 8 || i == 9 || i == 10 || i == 11 || i == 12 || i == 18)
  {
    g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(105)")
      .datum(chord(matrix));
  }
  else if(i == 4 || i == 5 || i == 6 || i == 7 )
  {
      g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(55)")
      .datum(chord(matrix));
  }
  else
  {

    g = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(90)")
      .datum(chord(matrix));
  }


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

}

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

function drawChordLegend()
{

  var legend = d3.select("#chordLegend").append('svg').attr('width',300).attr('height',400);
  legend.append("circle").attr("cx",200).attr("cy",130).attr("r", 6).style("fill", "#ff7f00")
  legend.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "#24a221")
  legend.append("circle").attr("cx",200).attr("cy",190).attr("r", 6).style("fill", "#d8241f")
  legend.append("circle").attr("cx",200).attr("cy",220).attr("r", 6).style("fill", "#9564bf")
  legend.append("circle").attr("cx",200).attr("cy",250).attr("r", 6).style("fill", "#8d5649")
  legend.append("circle").attr("cx",200).attr("cy",280).attr("r", 6).style("fill", "#e574c3")
  legend.append("circle").attr("cx",200).attr("cy",310).attr("r", 6).style("fill", "#7f7f7f")
  legend.append("circle").attr("cx",200).attr("cy",340).attr("r", 6).style("fill", "#bcbf00")
  legend.append("circle").attr("cx",200).attr("cy",370).attr("r", 6).style("fill", "#00bed1")
  legend.append("text").attr("x", 220).attr("y", 130).text("Nuclear").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 160).text("Energy").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 190).text("Water").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 220).text("Hospital").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 250).text("Shelters").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 280).text("Firefighter").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 310).text("Traffic").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 340).text("Garbage").style("font-size", "16px").attr("alignment-baseline","middle")
  legend.append("text").attr("x", 220).attr("y", 370).text("Gas").style("font-size", "16px").attr("alignment-baseline","middle")

}

function createChordRow(dataset,locationLabel)
{
  var row = [];
  var resourceTags = ['nuclear','energy','water','hospital','shelters','firefighter',
  'traffic','garbage','gas'];

  var resources = generateResourcesBasedOnLocation(dataset,locationLabel);
  //For the location
  row.push(0);
  
  for(var j=0;j<resourceTags.length;j++)
  {
    if(resources[resourceTags[j]] === undefined)
        row.push(0);
    else
        row.push(resources[resourceTags[j]]);
  }
  return row;
}

function getMessageBox(data)
{
  console.log(data);
  var count = data.length;
  var messageCount = document.getElementById("messageCount");
  messageCount.innerHTML = count;

  var messageBox = document.getElementById('messageBox');

  while (messageBox.hasChildNodes()) {
    messageBox.removeChild(messageBox.lastChild);
}

  for(var i=0;i<data.length;i+=10)
  {
     var li = document.createElement("li");
     li.setAttribute('role','presentation');
     
     var a = document.createElement('a');
     a.setAttribute('role','menuitem');
     a.setAttribute('href','#');
     a.setAttribute('style','align-items: center');

     var accountName = document.createElement('strong');
     accountName.setAttribute('style','font-size:25px');
     accountName.innerHTML = data[i]['account'] + "&nbsp;&nbsp;&nbsp;";

     var formatTime = d3.timeFormat("%B %d, %I:%M");
     var date = formatTime(data[i]['time']);
     var timeDate = document.createElement('span');
     timeDate.setAttribute('style','font-size:18px');
     timeDate.innerHTML = date;

     var br = document.createElement('br');

     var message = data[i]['message'];
     var msg = document.createElement('span');
     msg.setAttribute('style','font-size:22px');
     msg.innerHTML = message;


     var img = document.createElement('img');
     if(data[i]["location"] === "Palace Hills")
     {
        img.setAttribute('src','images/palace.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
     else if(data[i]["location"] === "Northwest")
     {
        img.setAttribute('src','images/northwest.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
     else if(data[i]["location"]  === "Old Town")
     {
        img.setAttribute('src','images/oldtown.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"] === "Safe Town")
     {
        img.setAttribute('src','images/safetown.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  ==="Southwest")
      {
        img.setAttribute('src','images/southwest.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Downtown")
      {
        img.setAttribute('src','images/downtown.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Wilson Forest")
      {
        img.setAttribute('src','images/wilsonforest.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Broadview")
     {
        img.setAttribute('src','images/broadview.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Chapparal")
      {
        img.setAttribute('src','images/chapparal.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Terrapin Springs")
      {
        img.setAttribute('src','images/terappinsprings.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Pepper Mill")
      {
        img.setAttribute('src','images/peppermill.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  ==="Cheddarford")
     {
        img.setAttribute('src','images/cheddarford.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  ==="Easton")
      {
        img.setAttribute('src','images/easton.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Weston")
      {
        img.setAttribute('src','images/weston.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "Southton")
       {
        img.setAttribute('src','images/southton.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"] === "Oak Willow")
      {
        img.setAttribute('src','images/oakwillow.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"]  === "East Parton")
      {
        img.setAttribute('src','images/eastparton.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"] === "West Parton")
      {
        img.setAttribute('src','images/westparton.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
     }
      else if(data[i]["location"] === "Scenic Vista")
      {
        img.setAttribute('src','images/scenicvista.png');
        img.setAttribute('style','width:70px;height:70px;float:left;');
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


function createPositiveMood(data)
{
  var positiveEmotions = ["joy","happy","pleased","cheerfull","exuberant","euphoric",
  "merry","overjoyed","elated","glad","top","great","excited","thrilled","charged",
  "pumped","astonished","astounded","amazed","startled","dumbstruck","surprised",
  "interested","captivated","fascinated","absorbed","engrossed","satisfied","fulfilled",
  "gratified","satiated","emotional","moved","overwhelmed","overcome",
  "impassioned","relaxed","calm","soothed","content","tranquil","serene",
  "composed","amazing","ambitious","amused","a reason for being",
  "ableabound","abounding","abounds","abracadabra","absolute",
  "absolutely","absorbed","abundance","abundant","abundant gratification",
  "acaronar","accentuactivity","accept","acceptable","acceptance","accepted",
  "accepting","accessible","acclaim","acclaimed","acclamation","accolade","accolades","accommodate","accommodated","accommodating","accommodation","accommodative","accomplish","accomplished","accomplishment","accomplishments","accountability","accuracy","accurate","accurately","achievable","achieve","achievement","achievements","acknowledgement","actability","action","action for happiness","activate","active","active and constructive steps","acts of kindness","acumen","adaptability","adaptable","adaptive","add","addition","adequate","adjustable","admirable","admirably","admiration","admire","admired","admirer","admiring","admiringly","adorable","adore","adored","adorer","adoring","adoringly","adroit","adroitly","adulated","adulation","adulatory","advanced","advantage","advantageous","advantageously","advantages","adventure","adventuresome","adventurous","advocated","affability","affable","affably","affection","affectionate","affinity","affirm","affirmation","affirmative","affluence","affluent","afford","affordable","affordably","ageless","agile","agilely","agility","agree","agreeable","agreeableness","agreeably","aid","aim","air","airness","alacrity","alert","alertness","aligned","alive","aliveness","all is well","allow","allowing","allure","alluring","alluringly","aloha","alternative healing","altitudinarian","altrucause","altruism","altruistic","altruistically","amaze","amazed","amazement","amazes","amazing","amazing words","amazingly","ambition","ambitious","ambitiously","ameliorate","amenity","amiability","amiabily","amiable","amicability","amicable","amicably","amin","amity","ample","amply","amuse","amused","amusing","amusingly","angel","angelic","animate","animated","animateness","animating","animation","anticipation","apotheosis","appeal","appealing","applaud","appreciable","appreciate","appreciated","appreciates","appreciation","appreciation of beauty","appreciative","appreciative joy","appreciatively","appreciativeness","appropriate","approval","approve","ardent","ardor","aroused","art of appreciation","art of stillness","art of well-being","assertive","assertiveness","assume your own value","assurance","astonished","astonishing","astonishingly","astonishment","astounding","astronomical","attentiveness","attraction","attractive","attributional style questionnaire (asq)","audacity","authentic","authentic happiness","authenticity","awaken","aware","awareness","awe","awed","awekening","awesome","awesomeness","badassery","balance","balanced","be extraordinary","be happy","beatify","beatitude","beautiful","beautifully","beautify","beauty","beauty in all things","being at rest","beingness","believable","belong","belonging","beloved","benefactor","beneficial","benefit","benefits","benevolence","benevolent","benevolently","benevolently cheerful state of mind","best","best of all possible worlds","best-selling","better","better and better","better-known","better-than-expected","beyond","beyond fabulous","beyond thank you","big vision","biophilia","blasting","blazing","bless","blessed","blessing","blinding","bliss","blisscipline","blissful","blissfulness","bliss-on-tap","blithesome","blood-brothers","bloom","blossom","blossoming","bohemian soul","boho-soul","boldness","bonus","bravery","breathtaking","breeziness","bright","brightness","brilliance","brilliant","brio","briskness","bubbling","bullishness","buoyancy","busting","calm","candor","capability","capable","capably","capital","care","carefree","carefreeness","carefulness","caress","caring","celebrate","celebration","centered","centering","centering meditation","certain","certainty","chakra","challenge","champ","champion","change","charisma","charismatic","charitable","charity","charm","charmer","charming","cheerful","cheerful mood","cheerful willingness","cheerfulness","cheers","choice","citizen of mastery","clarity","clean","cleanliness","clear","clear-headed","closeness","co-creating","co-creator","cohesion","collaboration","collected","comfort","comfortable","comforting","commitment","communication","communion","community","companionship","compassion","compassionate","competence","competency","competent","complimentary words","concentration","confidence","confident","congruence","connect","connected","connectedness","connection","conquer","consciousness","considerate","consideration","consistency","consistent","content","contented","contentment","continual stream of syncronicity","continuity","continuous","contribution","conviction","convincing","cool","cooperation","cordial","corking","courage","courteous","courtesy","coziness","crank (up)","create","creative","creative process","creativeness","creativity","cuddle","cuddling","curiosity","curious","cute","cuteness","dandy","daring","dauwtrappen","dazzle","dazzled","debonair","decent","decisiveness","dedicated","deeper part of you","defencelessness","delicate","delicious","deliciousness","delight","delighted","delightful","delightfully","dependability","deserve","deservedness","deservingness","desirable","desire","detachment","determination","devoted","devotion","dignity","diligence","direction","discipline","discovery","discretion","dis-identify","disney","diversity","divine","do","dope","dope chill out","dream","dreamy","drive","duty","dynamic","eager","eagerness","earnest","ease","ease-of-mind","easier","easily","easy","easy to approach","easy to talk to","ebullience","ecosophy","ecstatic","ecstatify","educate","educated","education","effectiveness","efficacy","efficiency","efficient","effortless ease","effortlessly","effortlessness","ekaggata","elated","elation","electric","elegance","elevate","elevated","embody the love","embrace","empathize","empathy","emphatic","empower","empowered","empowering","empowering words","emulate","enable","enabled","enchanted","encourage","encouraged","encouragement","encouraging words","endurance","energetic","energize","energy","engage","engaged","engaging","engrossed","enjoy","enjoyment","enlightenment","enlivened","enormous","enough","enthralled","enthusiasm","enthusiastic","entranced","equality","equanimity","equanimous","equitable","equitably","equity","erlebnis","eternal","eudaemonist","eudaimonia","eudaimonism","eudaimonistic","eunoia","evolve","exaltation","exalting","excellence","excellent","exceptional","excite","excited","excited anticipation","excitement","exciting","exemplary","exhilarating","expansive","expectant","experience","expertise","exploration","expressing","expressiveness","exquisite","exstatisfy","extra","extraordinary","exuberance","exuberant","exultant","fabulous","fair","fairness","faith","faithful","fame","family","famous","fancy","fantabulous","fantastic","fascinate","fascinated","favorite","fearless","feasible","feel good","feeling good","feistiness","feisty","festive","festiveness","fidelity","fine","fit","flashy","flaunting","flawless","flawlessly","flexibility","flourish","flourishing","flow","flowing","focus","fondle","food","forgive","forgiveness","forgiving","fortitude","fortuitous","free","freecycle","freedom","fric-tionlessly","friend","friendliness","friendly","friendship","frugality","ftw","fulfill","fulfilled","fun","funerific","funny jokes","funology","future","game-changer","gargantuan","gemutlichkeit","generate","generator of life","generavity","generosity","generous","genial","genius","gentleman","genuine","gibigiana","giddy","gift","giggling","gigil","ginger","give","giving","glad","glamor","glory","glow","god","goddess","godliness","going the extra mile","good","good fortune","good health","good indwelling spirit","good word","good words","good-feeling","good-humored","goodness","goodwill","gorgeous","gorgeousness","grace","gracefully","graciousness","grand","grandiosity","gratefulness","gratitude","great","greatful","groovy","grounded","grow","growth","guidance","guide","guiding","gypsy soul","halo","handsome","happily","happiness","happy","happy hearted","happy words","harmonious","harmonize","harmony","harness","health","healthy","heart","heartfelt","heart-opening","heartwarming","heaven","heavenly","heedful","heightened","hello","help","helpful","helpfulness","helping","hero","heroism","highly distinguished","high-spiritedness","holiness","holistic","holy","holy spirit","honest","honesty","honor","hope","hopefulness","hospitable","hospitality","hot","huge","human","human flourishing","humble","humor","ichariba chode","idea","idealism","ikigai","illuminated","illumination","illustrious","imagination","improvement","inclusion","incomparable","incredible","incredible cuteness","independence","indwelling","ineffable","infinite","infinity","influence","ingenuity","in-love","inner","inner spirit","inner-peace","innocent","innovate","innovation","inquisitive","insight","insightful","insightfulness","inspiration","inspirational","inspirational words","inspire","inspired","inspiring word","inspiring words","integrity","intelligence","intelligent","intensity","intention","interconnected","interconnectivity","interest","interested","interesting","intimacy","intrepid","intrigued","intuition","intuitiveness","inventiveness","investing","invigorate","invigorated","invincible","involve","involved","iridescent","jammin’","joke","jolly","jovial","joy","joyful","joyous","jubilant","jubilingo","just","justice","juvenescent","kaajhuab","kalon","keen","keep-up","kilig","kind","kind words","kind-heart","kindly","kindness","kiss","kittens","knowledge","koibito kibun","laugh","laughing","leader","leadership","leading","learn","learning","leeway","let go","letting go","liberty","life","life-of-the-party","light","light fog","light-hearted","lightworker","like","live","liveliness","lively","lives through","living","logic","longevity","lovable","love","love fulfilled","love words","lovely","lover of beauty","loving","loving acceptance","loving feelings","loving-kindness","loyal","loyalty","luck","lucky","lustrous","lustrous colors","luxury","magic","magnetic to love","magnificent","majesty","major","making-a-difference","many","marvelous","mastery","maturity","meaning","meaningful","meaningful words","meditation","meliorism","mellow","memorable","mench","mercy","merit","mild","mind-blowing","mindful","mindfulness","mindsight","miracle","mirthful","modesty","more","morphing","motivate","motivated words","motivating words","motivation","motivational","motivational words","moved","movement","moving","mutuality","myriad","namaste","nature-made","neat","neoteny","new","nice","nice words","nirvana","noble","non-resistance","non-resistant","nourish","nourished","nourishing","nourishment","novaturient","nurture","nurturing","obedient","ok","om mani padme hum","omg","on","oneness","one-pointedness","onwards","open","open hearted","opening","openly","open-minded","openness","opportunity","optimism","optimist","optimistic","order","orenda","organization","orientation","original","originality","outcome","outernationalist","outgoing","outstanding","overcome","overly optimistic","owning your power","pacify","paradise","paradisiac","pardon","participation","passion","passionate","patience","peace","peace of mind","peaceful words","pep","peppiness","perceptiveness","perfect","perfection","perkiness","permalicious","perseverance","persistence","personal-growth","petrichor","philocalist","pick-me-up","pious","piquancy","play","playful","playfulness","please","pleased","pleasure","plucky","polite","politeness","pollyannaism","posichoice","posidriving","posifit","posilenz","posimass","posiminder","posiratio","posiripple","posirippler","posiripples","posisinger","posisite","posistrength","positibilitarian","positive","positive attitude","positive beliefs","positive circumstances","positive emotions","positive energy","positive events","positive feelings","positive mind","positive thinking","positive thoughts","positive vocabulary","positive words","positraction","positude","posivalues","posiword","possibilitarian","pour your love","power","power words","powerful","powerful positive words","powerful possibility","powerful words","power-on","power-up","practicality","precious","precision","preparedness","presence","preservation","pretty","priceless","pride","privacy","privilege","proactive","proactivity","progress","promptness","pronia","propitious","prosperity","prosperous","protect","proto","proud","punctual","punctuality","puppies","pure","purpose","quaint","quality","quality words","queenly","quickening","quiddity","quiescent","quiescent mind","quiet","quietness","radiant","radiate","rainbow","rapture","rapturous","rasasvada","rationality","readiness","ready","real","reality","reason","reborn","recognition","recognize","recommend","refresh","refreshed","rejuvenate","rejuvenated","relatedness","relationships","relax","relaxed","releasing","relent","reliability","reliable","relief","relieve","relieved","religion","remarkable","renew","renewed","renowned","repose","resilience","resilient","resourcefulness","respect","respected","responsibility","rest","rested","restore","restored","revelation","reverence","revived","righteousness","rightful","ripe","risk-taking","romance","romantic","rosiness","sacred","sacred space","safe","safety","salvation","satisfied","save","savings","savour","savouring","scope","secure","secured","security","self-compassion","self-esteem","self-expression","self-forgiveness","self-kindness","selflessness","self-love","self-respect","serendipity","serene","serenity","serve","service","sexiness","sexual expression","sexy","shape-shifting virtuoso","shelter","shift in focus","shine","shining","show up more present","simple","simplicity","simplify","sincerity","skill","skilled","sleep","smart","smile","smiling","soul","soulful","soulmate","soul-stretching","space","spacious","spark","sparkle","sparkles","special","spectacular","spellbound","spirit","splendid","spontaneity","spontaneous","spunky","stability","start","steadfastness","stellar","still","stimulated","stimulating","stimulation","strength","strive","strong words","studious","study","stupendous","style","sublime","succulent","sufficient","sunniness","sunshine","supercharge","supercharged","superpower","support","supported","supporting","supreme","surprised","sustain","sustained","swag","swaggy","sweet","sweetheart","sweetness","sympathetic","symptoms of greatness","syncronicity","synergy","systematization","tact","teach","teachable","team","teamwork","temul","tenacity","tender","tenderly","thank","thankful","thankfulness","thank-you","therapy","thrilled","thrive","thriving","tickled","tidsoptimist","time","time optimist","timeliness","to be","to be known","to be seen","to let go","to-know","tolerance","to-matter","touch","touched","tradition","tranquil","tranquility","transform","transformation","transformative","transparent","triumph","trust","trusting","truth","truthfulness","ubuntu","ultimate","unabashed","unabashed pleasure","unbearably cute","unbelievable","unconditional","understand","understanding","understood","unflappable","unhurry","unification","unification of mind","unique","unity","unreal","up","upgrade","up-leveled","uplift","upskill","useful","user-friendly","utter amazement","valid","valuable","value","values","variety","veneration","verify","versatility","very","viable","vibrant","victorious","victory","vigor","vim","virtue","virtuous","vitality","vocabuleverage","vow","vulnerability","vulnerable","walwalun","warm","warmth","water","wealth","web of relatedness","welcome","welfare","well","well-being","wellness","whole","wholeheartedly","wholeheartedness","will","willing","willing to learn","willingness","win","winnable","winning","wisdom","wise","won","wonder","wonderful","wonder-working","wondrous","world-builder","worth","worthiness","worthiness to take up space","worthy","wow","xenial","xenodochial","xenophile","xfactor","xo","x-ray vision,","yaraana","yay","yea","yeah","yearn","yen","yes","yesability","yesable","yippee","you are loved","young","young-at-heart","your true value","youth","youthful","yugen","yummy","zany","zappy","zeal","zealous","zest","zest for life","zestful","zesty","zing","zippy"];


  var total = data.length;
  var amount = 0;

  for(var i=0;i<data.length;i+=10)
  {
    for(var j=0;j<positiveEmotions.length;j++)
    {
      if(data[i]['message'].includes(positiveEmotions[j]))
        amount++;
    }
  } 

  var result = Math.floor((amount / total) * 100);
  console.log("Positive: " +result);

}

function createNegativeMood(data)
{
  var negativeEmotions = ["abandoned","abused","accused","addicted","afraid","aggravated","aggressive",
  "alone","angry","anguish","annoyed","anxious","apprehensive","argumentative","artificial","ashamed",
  "assaulted","at a loss","at risk","atrocious","attacked","avoided","awful","awkward","bad","badgered",
  "baffled","banned","barren","beat","beaten down","belittled","berated","betrayed","bitched at","bitter",
  "bizzare","blacklisted","blackmailed","blamed","bleak","blown away","blur","bored","boring","bossed-around",
  "bothered","bothersome","bounded","boxed-in","broken","bruised","brushed-off","bugged","bullied","bummed","bummed out","burdened","burdensome","burned","burned-out","caged in","careless","chaotic","chased","cheated","cheated on","chicken","claustrophobic","clingy","closed","clueless","clumsy","coaxed","codependent","coerced","cold","cold-hearted","combative","commanded","compared","competitive","compulsive","conceited","concerned","condescended to","confined","conflicted","confronted","confused","conned","consumed","contemplative","contempt","contentious","controlled","convicted","cornered","corralled","cowardly","crabby","cramped","cranky","crap","crappy","crazy","creeped out","creepy","critical","criticized","cross","crowded","cruddy","crummy","crushed","cut-down","cut-off","cynical","damaged","damned","dangerous","dark","dazed","dead","deceived","deep","defamed","defeated","defective","defenseless","defensive","defiant","deficient","deflated","degraded","dehumanized","dejected","delicate","deluded","demanding","demeaned","demented","demoralized","demotivated","dependent","depleted","depraved","depressed","deprived","deserted","deserving of pain/punishment","desolate","despair","despairing","desperate","despicable","despised","destroyed","destructive","detached","detest","detestable","detested","devalued","devastated","deviant","devoid","diagnosed","dictated to","different","difficult","directionless","dirty","disabled","disagreeable","disappointed","disappointing","disapproved of","disbelieved","discardable","discarded","disconnected","discontent","discouraged","discriminated","disdain","disdainful","disempowered","disenchanted","disgraced","disgruntled","disgust","disgusted","disheartened","dishonest","dishonorable","disillusioned","dislike","disliked","dismal","dismayed","disorganized","disoriented","disowned","displeased","disposable","disregarded","disrespected","dissatisfied","distant","distracted","distraught","distressed","disturbed","dizzy","dominated","doomed","double-crossed","doubted","doubtful","down","down and out","down in the dumps","downhearted","downtrodden","drained","dramatic","dread","dreadful","dreary","dropped","drunk","dry","dumb","dumped","dumped on","duped","edgy","egocentric","egotistic","egotistical","elusive","emancipated","emasculated","embarrassed","emotional","emotionless","emotionally bankrupt","empty","encumbered","endangered","enraged","enslaved","entangled","evaded","evasive","evicted","excessive","excluded","exhausted","exploited","exposed","failful","fake","false","fear","fearful","fed up","flawed","forced","forgetful","forgettable","forgotten","fragile","freaked out","frightened","frigid","frustrated","furious","gloomy","glum","gothic","grey","grief","grim","gross","grossed-out","grotesque","grouchy","grounded","grumpy","guilt-tripped","guilty","harassed","hard","hard-hearted","harmed","hassled","hate","hateful","hatred","haunted","heartbroken","heartless","heavy-hearted","helpless","hesitant","hideous","hindered","hopeless","horrible","horrified","horror","hostile","hot-tempered","humiliated","hung up","hung over","hurried","hurt","hysterical","idiotic","ignorant","ignored","ill","ill-tempered","imbalanced","imposed-upon","impotent","imprisoned","impulsive","in the dumps","in the way","inactive","inadequate","incapable","incommunicative","incompetent","incompatible","incomplete","incorrect","indecisive","indifferent","indoctrinated","inebriated","ineffective","inefficient","inferior","infuriated","inhibited","inhumane","injured","injusticed","insane","insecure","insignificant","insincere","insufficient","insulted","intense","interrogated","interrupted","intimidated","intoxicated","invalidated","invisible","irrational","irritable","irritated","isolated","jaded","jealous","jerked around","joyless","judged","kept apart","kept away","kept in","kept out","kept quiet","labeled","laughable","laughed at","lazy","leaned on","lectured to","left out","let down","lied about","lied to","limited","little","lonely","lonesome","longing","lost","lousy","loveless","low","mad","made fun of","man handled","manipulated","masochistic","messed with","messed up","messy","miffed","miserable","misled","mistaken","mistreated","mistrusted","misunderstood","mixed-up","mocked","molested","moody","nagged","needy","negative","nervous","neurotic","nonconforming","numb","nuts","nutty","objectified","obligated","obsessed","obsessive","obstructed","odd","offended","on display","opposed","oppressed","out of place","out of touch","over-controlled","over-protected","overwhelmed","pain","panic","paranoid","passive","pathetic","pessimistic","petrified","phony","picked on","pissed","pissed off","plain","played with","pooped","poor","powerless","pre-judged","preached to","preoccupied","predjudiced","pressured","prosecuted","provoked","psychopathic","psychotic","pulled apart","pulled back","punished","pushed","pushed away","put down","puzzled","quarrelsome","queer","questioned","quiet","rage","raped","rattled","regret","rejected","resented","resentful","responsible","retarded","revengeful","ridiculed","ridiculous","robbed","rotten","sad","sadistic","sarcastic","scared","scarred","screwed","screwed over","screwed up","self-centered","self-conscious","self-destructive","self-hatred","selfish","sensitive","shouted at","shy","singled-out","slow","small","smothered","snapped at","spiteful","stereotyped","strange","stressed","stretched","stuck","stupid","submissive","suffering","suffocated","suicidal","superficial","suppressed","suspicious"];
  
  var total = data.length;
  var amount = 0;

  for(var i=0;i<data.length;i+=10)
  {
    for(var j=0;j<negativeEmotions.length;j++)
    {
      if(data[i]['message'].includes(negativeEmotions[j]))
        amount++;
    }
  } 
  console.log(amount);
  var result = Math.floor((amount / total) * 100);
  console.log("Negative: "+result);

}