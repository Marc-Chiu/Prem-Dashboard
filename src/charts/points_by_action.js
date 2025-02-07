import * as d3 from "d3";

const SCORING = ["goals_points", "assists_points", "minutes_points", "clean_sheet_points"];

function summaryStats(data) {
  let map = new Map();

  data.forEach((value, key) => {
    const points = new Map();
    const weeks = value.flat();
    SCORING.forEach((category) => {
      const cat_points = {
        id: value[0].player_name,
        category: category,
        value: d3.sum(weeks, (d) => d[category]),
      };
      points.set(category, cat_points);
    });
    map.set(key, points);
  });

  return map;
}

export function points_by_action(data, leagueData, containerWidth) {
  const barchartData = summaryStats(data);
  const members = leagueData.league_entries.map((member) => member.entry_id);

  const margin = { top: 40, bottom: 0, left: 30, right: 30 };
  const visWidth = containerWidth - margin.left - margin.right; // set the width the be the max width allowed by the screen
  const visHeight = 400 - margin.top - margin.bottom; // set the height to be 400

  const series = d3
    .stack()
    .keys(SCORING) // distinct series keys, in input order
    .value(([, D], key) => D.get(key).value)(
    // get value for each series key and stack
    barchartData,
  ); // group by stack then series key

  // Prepare the scales for positional and color encodings.
  const x = d3
    .scaleBand()
    .domain(members)
    .range([margin.left, visWidth - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
    .rangeRound([visHeight - margin.bottom, margin.top]);

  const color = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key))
    .range(d3.schemeSpectral[series.length])
    .unknown("#ccc");

  // A function to format the value in the tooltip.
  const formatValue = (x) => (isNaN(x) ? "N/A" : x.toLocaleString("en"));

  // create and select an svg element that is the size of the bars plus margins
  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", visWidth + margin.left + margin.right)
    .attr("height", visHeight + margin.top + margin.bottom);

  // create a boundry box where we can insert the meat of the data
  const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg
    .append("g")
    .selectAll()
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((D) => D.map((d) => ((d.key = D.key), d)))
    .join("rect")
    .attr("x", (d) => x(d.data[0]))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .append("title")
    .text((d) => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).population)}`);

  // Append the horizontal axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${visHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.selectAll(".domain").remove());

  // Append the vertical axis.
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call((g) => g.selectAll(".domain").remove());

  // Add legend at the top of the chart
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${margin.left}, ${margin.top - 30})`);

  SCORING.forEach((category, i) => {
    const legendItem = legend.append("g").attr("transform", `translate(${i * (containerWidth / 10)}, 0)`);

    legendItem.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(category));

    legendItem
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(category)
      .style("font-size", "12px")
      .style("fill", "#000");
  });

  return Object.assign(svg.node(), { scales: { color } });
}
