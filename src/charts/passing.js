import * as d3 from "d3";

export function passingChart(data) {

        // defining width and height
        const w = 2000;
        const h = 300;
        const svg = d3.create("svg")
          .attr("width", w)
          .attr("height", h)
          .attr("viewBox", [0, 0, w, h])
          .attr("style", "max-width: 100%; height: auto;");

        // Margin object with four properties
        const margin = {top: 20, right: 20, bottom: 20, left: 30};

        // Create innerWidth and innerHeight for our margin
        const innerW = w - margin.right - margin.left;
        const innerH = h - margin.top - margin.bottom;

        // Append a g element to our svg and give it a new origin inside svg
        const g = svg.append('g')
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Create group elements for our axes
        const xAxisG = g.append('g')
          .attr('transform', "translate(0," + innerH + ")");
        const yAxisG = g.append('g');

        // Create functions that get x and y values
        const xValue = d => d["Top stats"]?.["Accurate passes"]?.["total"];
        const yValue = d => d["Attack stats"]?.["Passes into final third"];

        // Define a couple of linear scales
        const xScale = d3.scaleLinear();
        const yScale = d3.scaleLinear();

        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);

        // Set scales' domain (actual values) and range (plotted values)
        xScale
          .domain(d3.extent(data, xValue)) // d3.extent captures the min. & max from a set of values
          .range([0, innerW]);

        yScale
          .domain(d3.extent(data, yValue))
          .range([innerH, 0]);

        // Append circles to our g element and attach the dataset to them
        const circles = g
          .selectAll('circle')
          .data(data)
          .enter()
          .append('circle');

        // Create tooltip element
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("border", "1px solid black")
          .style("padding", "8px")
          .style("display", "none");  // Initially hidden

        // Add interactivity with mouseover and mouseout events
        circles
          .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
              .html(`${d["id"]}`);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", () => {
            tooltip.style("display", "none");
          });

        // Provide attributes to our circles
        circles
          .attr('cx', d => xScale(xValue(d)))  // Use the scales to convert the original values
          .attr('cy', d => yScale(yValue(d)))
          .attr('r', 5)
          .attr('fill', 'maroon')
          .attr('opacity', 0.7);

        // Call axes
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        return svg.node();  // Return the DOM node of the SVG
      } // No need to call `display()`