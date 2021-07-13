var minDate = new Date(2020,3,6);
var maxDate = new Date(2020,3,10);

var slider = d3
    .sliderHorizontal()
    .min(minDate)
    .max(maxDate)
    .step(1)
    .ticks(5)
    .width(300)
    .displayValue(false)
    .on('onchange', val => {
      d3.select('#value').text(val);
      callDataBasedOnTime(val);
    });

    slider.tickFormat(d3.timeFormat("%B %d, %Y"));

  d3.select('#slider')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)')
    .call(slider);

   
