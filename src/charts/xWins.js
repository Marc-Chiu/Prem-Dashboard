import * as d3 from "d3";

const findMedian = (x) => {
  const p1 = d3.map(x, (d) => d.league_entry_1_points);
  const p2 = d3.map(x, (d) => d.league_entry_2_points);
  return p1.concat(p2);
};

const get_gameweek_points = (data) => {
  const week_points_median = new Map();

  data.forEach((values, key) => {
    const median = findMedian(values);
    week_points_median.set(key, median);
  });
  return week_points_median;
};

export function xWinsChart(data, containerWidth) {
  const margin = { top: 40, bottom: 55, left: 30, right: 60 };
  const visWidth = containerWidth - margin.left - margin.right; // set the width the be the max width allowed by the screen
  const visHeight = 400 - margin.top - margin.bottom; // set the height to be 400

  const names = data.league_entries.map((d) => d.entry_name);
  const matches = data.matches.filter((d) => d.finished == true);
  const matches_by_gameweek = d3.group(matches, (d) => d.event);
  const playerIds = data.league_entries.map((d) => d.entry_id);
  const points_by_week = get_gameweek_points(matches_by_gameweek);
  const players = data.league_entries.map((d) => d.id);

  const points_for = (x) => {
    const pf = new Map();

    matches_by_gameweek.forEach((values, key) => {
      values = values.filter((d) => d.league_entry_1 == x || d.league_entry_2 == x);
      if (values[0].league_entry_1 == x) {
        pf.set(key, values[0].league_entry_1_points);
      } else {
        pf.set(key, values[0].league_entry_2_points);
      }
    });

    return pf;
  };

  const win_probability = (x) => {
    const win_prob = new Map();
    const pf = points_for(x);

    pf.forEach((values, key) => {
      const probability = d3.bisectLeft(points_by_week.get(key), pf.get(key)) / 12;
      win_prob.set(key, probability);
    });

    return win_prob;
  };

  const wins = (x) => {
    const wins = new Map();

    matches_by_gameweek.forEach((values, key) => {
      values = values.filter((d) => d.league_entry_1 == x || d.league_entry_2 == x);
      if (values[0].league_entry_1 == x) {
        if (values[0].league_entry_1_points > values[0].league_entry_2_points) {
          wins.set(key, "win");
        } else if (values[0].league_entry_1_points == values[0].league_entry_2_points) {
          wins.set(key, "draw");
        } else {
          wins.set(key, "loss");
        }
      } else {
        if (values[0].league_entry_1_points < values[0].league_entry_2_points) {
          wins.set(key, "win");
        } else if (values[0].league_entry_1_points == values[0].league_entry_2_points) {
          wins.set(key, "draw");
        } else {
          wins.set(key, "loss");
        }
      }
    });

    return wins;
  };

  const total_wins = (arr) => {
    let w = 0;
    arr.forEach((values, key) => {
      if (values == "win") {
        w += 1;
      }
    });
    return w;
  };

  const luck_score = (x) => {
    const expected_wins = d3.sum(win_probability(x).values());
    const actual_wins = total_wins(wins(x));

    return { id: x, xW: expected_wins, wins: actual_wins };
  };

  const luck_scores = new Array();

  players.forEach((value, key) => {
    luck_scores.push(luck_score(value));
  });

  // create scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(d3.map(luck_scores, (d) => d.xW)))
    .range([0, visWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(d3.map(luck_scores, (d) => d.wins)))
    .range([visHeight, 0])
    .nice();

  // create and select an svg element that is the size of the bars plus margins
  const svg = d3
    .create("svg")
    .attr("width", visWidth + margin.left + margin.right)
    .attr("height", visHeight + margin.top + margin.bottom);

  // create a boundry box where we can insert the meat of the data
  const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Append a circle for each data point.
  g.selectAll("circle")
    .data(luck_scores)
    .join("circle")
    .attr("cx", (d) => xScale(d.xW))
    .attr("cy", (d) => yScale(d.wins))
    .attr("r", 2);

  const name = (id) => {
    return data.league_entries.filter((d) => d.id == id)[0].player_first_name;
  };
  // Append Text
  g.selectAll("text")
    .data(luck_scores)
    .join("text")
    .attr("x", (d) => xScale(d.xW))
    .attr("y", (d) => yScale(d.wins))
    .attr("dy", "-0.5em") // Adjusts text position above the circle
    .text((d) => name(d.id))
    .attr("font-size", "0.8em")
    .attr("fill", "black")
    .attr("text-anchor", "middle");

  // // creating the axis
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  g.append("g")
    // move x-axis to the bottom
    .attr("transform", `translate(0,${visHeight})`)
    .call(xAxis);

  g.append("g").call(yAxis);

  const xAxisLabel = g
    .append("text")
    .attr("x", visWidth / 2)
    .attr("y", visHeight + margin.bottom + margin.top - 50)
    .attr("fill", "black")
    .style("font-size", ".75em")
    .text("Expected Wins")
    .style("text-transform", "capitalize")
    .attr("text-anchor", "middle"); // Center the text horizontally

  const yAxisLabel = g
    .append("text")
    .attr("x", -20)
    .attr("y", -5)
    .attr("fill", "black")
    .style("font-size", ".75em")
    .text("Wins")
    .style("text-transform", "capitalize");

  g.append("line")
    .attr("x1", 0)
    .attr("y2", 0)
    .attr("x2", visWidth)
    .attr("y1", visHeight)
    .style("stroke", "grey")
    .style("stroke-width", 1)
    .style("stroke-dasharray", 5);

  return svg.node();
}
