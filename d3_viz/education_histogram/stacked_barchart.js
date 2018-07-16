// Borrowed from https://bl.ocks.org/mjfoster83/7c9bdfd714ab2f2e39dd5c09057a55a0

d3.csv("04_unique_jobs.csv", function(error, data) {
    if (error) throw error;

    // Populate values in the job title dropdown using data from the json
    var options = jobDrop
        .selectAll('option')
        .data(data.map( function (d) {return d.cleaned_job_title} )).enter()
        .append('option')
        .text(function (d) { return d; });

});

var eduData = []
// Load the salary json data
d3.csv("04_edu_data_bar_chart.csv", function(error, data) {
    if (error) throw error;
    eduData = data

    // updateGraph(salaryData, 'accountant', 'Ohio')
});

// Attach the job title dropdown to the div
var jobDrop = d3.select("#jobDropdown")
    .append('select')
    .attr('class','select')
    .on('change',onChange);

function onChange() {
    var jobValue = jobDrop.node().value;
    console.log(jobValue);
    updateGraph(eduData, jobValue)
};

// Set the margins
var margin = {top: 100, right: 100, bottom: 100, left: 100},
  width = 850 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// Create SVG
var svg = d3.select("#stackedBarchart")
        .append("svg")
        .style("width", 1000 + "px")
        .style("height", 1000 + "px")
        .attr("width", 1000)
        .attr("height", 1000)
        .append("g")
        .attr("class", "svg");

g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set x scale
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

// set y scale
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// set the colors
var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

function updateGraph(data, jobValue) {

    var filteredData = data.filter(function(d) {
        return (d.cleaned_job_title == jobValue) });

    filteredData.sort(function(d) { return d.count_records; });
    var keys = filteredData.map(function(d) { return d.subject_name });

    x.domain([0, d3.max(filteredData, function(d) { return d.count_records; })]);
    y.domain(filteredData.map(function(d) { return d.final_degree_category; }));
    z.domain(keys);

    g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(filteredData))
      .enter().append("g")
        // .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.count_records); })
        .attr("y", function(d) { return y(d.final_degree_category); })
        .attr("width", 5)
        .attr("height", y.bandwidth())
      // .on("mouseover", function() { tooltip.style("display", null); })
      // .on("mouseout", function() { tooltip.style("display", "none"); })
      // .on("mousemove", function(d) {
      //   console.log(d);
      //   var xPosition = d3.mouse(this)[0]+margin.top;
      //   var yPosition = d3.mouse(this)[1]+margin.left;
      //   tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      //   tooltip.select("text").text(d.count_records);
      // })
;

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + width + ")")
        .call(d3.axisBottom(y));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(x).ticks(null, "s"))
      .append("text")
        .attr("x", 2)
        .attr("y", x(x.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start");

    // var legend = g.append("g")
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", 10)
    //     .attr("text-anchor", "end")
    //   .selectAll("g")
    //   .data(keys.slice().reverse())
    //   .enter().append("g")
    //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // legend.append("rect")
    //     .attr("x", width - 19)
    //     .attr("width", 19)
    //     .attr("height", 19)
    //     .attr("fill", z);

    // legend.append("text")
    //     .attr("x", width - 24)
    //     .attr("y", 9.5)
    //     .attr("dy", "0.32em")
    //     .text(function(d) { return d; });

    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
        
    tooltip.append("rect")
      .attr("width", 60)
      .attr("height", 20)
      .attr("fill", "white")
      .style("opacity", 0.5);

    tooltip.append("text")
      .attr("x", 30)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");
}