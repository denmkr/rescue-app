var arr = [];

//Locations
var palaceHills = [];
var northWest = [];
var oldTown = [];
var safeTown = [];
var southWest = [];
var downTown = [];
var wilsonForest = [];
var scenicVista = [];
var broadView = [];
var chapparal = [];
var terrapinSprings = [];
var pepperMill = [];
var cheddarFord = [];
var easton = [];
var weston = [];
var southton = [];
var oakWillow = [];
var eastParton = [];	
var westParton = [];

function init(){
	var minDate = new Date(2020,4,6);
	d3.csv('data/related_data.csv')
	  .then(function(data) {
	  	data.forEach(function(d){
			var date = new Date(d["Time"]);
			if(date<=paramDate)
				arr.push(d);
		});
	  	console.log(arr);
	})
	.catch(function(error){
	    console.log(error);  
	})
}

init();

//General View for the Radarplot
function callDataBasedOnTime(date){
	var paramDate = new Date(date);
	var minDate = new Date(2020,4,6);
	//console.log(paramDate);
	d3.csv('data/related_data.csv')
	  .then(function(data) {
	  	data.forEach(function(d){
			var date = new Date(d["Time"]);
			if(minDate<date<paramDate)
				arr.push(d);
		});
	  	//console.log(arr);
	})
	.catch(function(error){
	    console.log(error);  
	})

	arr.forEach(function(d){
		//console.log(d);
		if(d["Location"] === "Palace Hills")
        	palaceHills.push(d);
	    else if(d["Location"] === "Northwest")
	        northWest.push(d);
	    else if(d["Location"] === "Old Town")
	        oldTown.push(d);
	    else if(d["Location"] === "Safe Town")
	        safeTown.push(d);
	    else if(d["Location"] ==="Southwest")
	        southWest.push(d);
	    else if(d["Location"] === "Downtown")
	        downTown.push(d);
	    else if(d["Location"] === "Wilson Forest")
	        wilsonForest.push(d);
	    else if(d["Location"] === "Broadview")
	        broadView.push(d);
	    else if(d["Location"] === "Chapparal")
	        chapparal.push(d);
	    else if(d["Location"] === "Terrapin Springs")
	        terrapinSprings.push(d);
	    else if(d["Location"] === "Pepper Mill")
	        pepperMill.push(d);
	    else if(d["Location"] ==="Cheddarford")
	        cheddarFord.push(d);
	    else if(d["Location"] ==="Easton")
	        easton.push(d);
	    else if(d["Location"] === "Weston")
	        weston.push(d);
	    else if(d["Location"] === "Southton")
	        southton.push(d);
	    else if(d["Location"] === "Oak Willow")
	        oakWillow.push(d);
	    else if(d["Location"] === "East Parton")
	        eastParton.push(d);
	    else if(d["Location"] === "West Parton")
	        westParton.push(d);
	    else if(d["Location"] === "Scenic Vista")
	    	scenicVista.push(d);
		});
	//console.log(palaceHills);
}

//Sunburst and wordmap will work with this function
function getLocationNameFromMap(name,data)
{

		if(name === "palace hills")
			generateMapCloud(palaceHills);
	    else if(name=== "northwest")
	        generateMapCloud(northWest);
	    else if(name === "old town")
	    	generateMapCloud(oldTown);
	    else if(name === "safe town")
			generateMapCloud(safeTown);
	    else if(name ==="southwest")
	    	generateMapCloud(southWest);
	    else if(name === "downtown")
	    	generateMapCloud(downTown);
	    else if(name === "wilson forest")
	    	generateMapCloud(wilsonForest);
	    else if(name === "broadview")
	    	generateMapCloud(broadView);
	    else if(name === "chapparal")
	    	generateMapCloud(chapparal);
	    else if(name === "terrapin springs")
	    	generateMapCloud(terrapinSprings);
	    else if(name === "pepper mill")
	    	generateMapCloud(pepperMill);
	    else if(name ==="cheddarford")
	    	generateMapCloud(cheddarFord);
	    else if(name ==="easton")
	    	generateMapCloud(easton);
	    else if(name === "weston")
	    	generateMapCloud(weston);
	    else if(name === "southton")
	    	generateMapCloud(southton);
	    else if(name === "oak willow")
	    	generateMapCloud(oakWillow);
	    else if(name === "east parton")
	    	generateMapCloud(eastParton);
	    else if(name === "west parton")
	    	generateMapCloud(westParton);
	    else if(name === "scenic vista")
	    	generateMapCloud(scenicVista);
   
}

function generateMapCloud(locationData)
{
	var text=arrayToText(locationData);

	var counts = text.replace(/[^\w\s]/g, "").split(/\s+/).reduce(function(map, word){
    	map[word] = (map[word]||0)+1;
    	return map;
	}, Object.create(null));
	delete counts[""];
	console.log(counts);

	var words = [];

	for (var i in counts){
		var obj= {
			"text":i,
			"size":counts[i]
		}
		words.push(obj);
	}

	var width = 500;
	var height = 500;
	d3.selectAll("#wordcloud > svg").remove();

    d3.layout.cloud()
        .size([width, height])
        .words(words)
        .rotate(function() {
            return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .fontSize(function(d) {
            return d.size;
        })
        .on("end", drawSkillCloud)
        .start();

}

 function arrayToText(array)
 {
	 var text="";
	 for(var i=0;i<array.length;i++)
	 {
	    text = text + array[i]["Cleaned message"] + "\n";
	 }
	 return text;
 } 

