//Borrowed from https://bl.ocks.org/alandunning/7008d0332cc28a826b37b3cf6e7bd998

// hide visualization when first started
document.getElementById('d3').style.display='none'

// Load unique job titles json data
d3.json("05_unique_jobs.json", function(error, json) {
    if (error) throw error;

    // Populate values in the job title dropdown using data from the json
    var options = jobDrop
        .selectAll('option')
        .data(json.map( function (d) {return d.cleaned_job_title} )).enter()
        .append('option')
        .text(function (d) { return d; });

});

// Load unique states json data
d3.json("05_unique_states.json", function(error, json) {
    if (error) throw error;

    // Populate values in the state dropdown using data from the json
    var options = stateDrop
        .selectAll('option')
        .data(json.map( function (d) {return d.state} )).enter()
        .append('option')
        .text(function (d) { return d; });

});

var salaryData = []
// Load the salary json data
d3.json("05_salary_data_bar_chart.json", function(error, json) {
    if (error) throw error;
    salaryData = json.data

    updateGraph(salaryData, 'account executive', 'All')
});

// Attach the job title dropdown to the div
var jobDrop = d3.select("#jobDropdown")
    .append('select')
    .attr('class','select')
    .on('change',onChange);

// Attach the state dropdown to the div
var stateDrop = d3.select("#stateDropdown")
    .append('select')
    .attr('class','select')
    .on('change',onChange);

// Set the margins
var margin = {top: 100, right: 100, bottom: 100, left: 100},
  width = 850 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// Create SVG
var svg = d3.select("#graph")
        .append("svg")
        .style("width", 1000 + "px")
        .style("height", 1000 + "px")
        .attr("width", 1000)
        .attr("height", 1000)
        .append("g")
        .attr("class", "svg");

// Create tooltip
var tooltip = d3.select("body").append("div").attr("class", "toolTip");

// Set x and y axis range
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleBand().range([height, 0]);

// Set location for graph
var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function onChange() {
    //var jobValue = jobDrop.node().value;
    //console.log(jobValue);
    var stateValue = stateDrop.node().value;
    console.log(stateValue);
    updateGraph(salaryData, jobValue, stateValue)
};

function updateGraph(data, jobValue, stateValue) {

    var filteredData = data.filter(function(d) {
        return (d.cleaned_job_title == jobValue) && 
        ((d.state == stateValue) | ('All' == stateValue)) });

    console.log(filteredData.length)
    if (filteredData.length == 0) {
        console.log("no data")
        svg.selectAll(".axis").remove();
        svg.selectAll(".x").remove();
        svg.selectAll(".y").remove();
        g.selectAll(".bar").remove();
        g.selectAll(".medianbar").remove();
        g.append("text").style("font-size", "3em").text("No Data");
        
        return
    }
    
    g.selectAll("text").remove(); 

    // Group the data by name and experience level
    dataGrouped = d3.nest()
      .key(function(d) { return d.experiences; })
      .rollup(function(v) { return {
            min: d3.min(v, function(d) { return d.min; }),
            lower: d3.mean(v, function(d) { return d.lower_quantile; }),
            median: d3.mean(v, function(d) { return d.median; }),
            mean: d3.mean(v, function(d) { return d.mean; }),
            upper: d3.mean(v, function(d) { return d.upper_quantile; }),
            max: d3.max(v, function(d) { return d.max; }),
            count: d3.sum(v, function(d) { return d.count; }),
      }; })
      .sortKeys(d3.descending)
      .entries(filteredData);

    // Set domain for x and y axis
    x.domain([d3.min(dataGrouped, function(d) { return d.value.lower; })-1000, 
        d3.max(dataGrouped, function(d) { return d.value.upper; })+1000]);
    y.domain(dataGrouped.map(function(d) { return d.key; })).padding(0.1);

    svg.selectAll(".axis").remove();
    svg.selectAll(".x").remove();
    svg.selectAll(".y").remove();
    
    // Number formatter
    var formatSmallSuffix = d3.format(".2s"),
        formatLargeSuffix = d3.format(".3s"),
        formatMoney = function(d) {
            if (d < 100000) { return "$" + formatSmallSuffix(d); }
            else { return "$" + formatLargeSuffix(d); }
        }

    // Create x-axis ticks and lines
    var xLines = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10).tickFormat(function(d) 
            { return formatMoney(d); }).tickSizeInner([-height]));

    // Create y-axis ticks and lines
    var yLines = g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".bar").remove()

    // Create bars for graph and create tooltip
    g.selectAll(".bar")
        .data(dataGrouped)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.value.lower); })
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.key); })
        .attr("width", function(d) { return x(d.value.upper) - x(d.value.lower); })
        .on("mousemove", function(d){
          //  tooltip
              g.append("text")
              .style('fill', 'blue')
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY + "px")
              .style("display", "inline-block");
              
              g.select("text")
              .append("tspan")
              .attr("x", 0)
              .attr("y", 0)
              .text("Experience: " + (d.key))
              .append("tspan")
              .text(" Min: " + formatMoney(d.value.min))
              .append("tspan")
              .text(" Lower Quartile: " + formatMoney(d.value.lower))
              .append("tspan")
              .text(" Median: " + formatMoney(d.value.median))
              .append("tspan")
              .text(" Mean: " + formatMoney(d.value.mean)) 
              .append("tspan")
              .text(" Upper Quartile: " + formatMoney(d.value.upper))
              .append("tspan")
              .text(" Max: " + formatMoney(d.value.max)) 
              .append("tspan")
              .text(" Count: " + (d.value.count));
        })
        .on("mouseout", function(d){ g.selectAll("text").remove();});

    g.selectAll(".medianbar").remove()

    // Create bars for median
    g.selectAll(".medianbar")
        .data(dataGrouped)
        .enter()
        .append("rect")
        .attr("class", "medianbar")
        .attr("x", function(d) { return x(d.value.median)-1; })
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.key); })
        .attr("width", 2)
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY + "px")
              .style("display", "block")
              .html("Experience: " + (d.key) + "<br><span>Min: " + 
                    formatMoney(d.value.min) + "</span><br><span> Lower Quartile: " + 
                    formatMoney(d.value.lower) + "</span><br><span> Median: " + 
                    formatMoney(d.value.median) + "</span><br><span> Mean: " + 
                    formatMoney(d.value.mean) + "</span><br><span> Upper Quartile: " + 
                    formatMoney(d.value.upper) + "</span><br><span> Max: " + 
                    formatMoney(d.value.max) + "</span><br><span> Count: " + 
                    (d.value.count)
                    );
        })
        .on("mouseout", function(d){ g.selectAll("text").remove();});
};
