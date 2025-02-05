import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export function bubbleChart(leagueData) {
  const data = transformData(leagueData);
  const teams = new Set(data.map((d) => d.name));
  const weeks = new Set(data.map((d) => d.gameweek));

  return Plot.plot({
    width: window.innerWidth - 200,
    height: 400,
    marginTop: 20,
    marginBottom: 40,
    marginLeft: 120,
    marginRight: 60,
    title: "League Standings Over Time", // Title of the chart
    x: {
      axis: "bottom",
      label: "Gameweek", // Label for x-axis
      domain: weeks, // Gameweeks start at 1
    },
    y: {
      axis: null,
      label: "Rank", // Label for y-axis
      domain: [1, teams.size], // Rankings start at 1 (top rank)
      reverse: true, // Reverse y-axis to show top rank at the top
    },
    color: {
      label: "Teams", // Color legend label
      domain: Array.from(new Set(data.map((d) => d.name))), // Extract unique team names
      range: d3.schemeTableau12, // Use a Tableau color scheme for distinct colors
    },
    marks: [
      bumpMarks(data, {
        x: "gameweek", // Map to x-axis
        z: "name", // Group by team name
        order: "points", // Sort based on cumulative points
        reverse: true, // Reverse order for descending ranking
      }),
    ],
  });
}

function bumpMarks(data, { r = 3, curve = "bump-x", tip, ...options }) {
  options = Plot.stackY2(options);
  return Plot.marks(
    Plot.line(data, { ...options, tip, stroke: options.z, curve, fill: null }),
    Plot.dot(data, { ...options, fill: options.z, r }),
    Plot.text(data, { fill: options.z, dy: -9, ...options, text: options.y }),
    Plot.text(
      data,
      Plot.selectFirst({
        ...options,
        text: options.z,
        dx: -(5 + (r || options.strokeWidth / 2)),
        textAnchor: "end",
        fill: "currentColor",
      })
    ),
    Plot.text(
      data,
      Plot.selectLast({
        ...options,
        text: options.z,
        dx: 5 + (r || options.strokeWidth / 2),
        textAnchor: "start",
        fill: "currentColor",
      })
    )
  );
}

function transformData(leagueData) {
  const transformedData = leagueData.matches
    .filter((match) => match.finished)
    .flatMap((match) => {
      const league1Points =
        match.league_entry_1_points > match.league_entry_2_points
          ? 3 // Win
          : match.league_entry_1_points < match.league_entry_2_points
            ? 0 // Loss
            : 1; // Draw

      const league2Points =
        match.league_entry_2_points > match.league_entry_1_points
          ? 3 // Win
          : match.league_entry_2_points < match.league_entry_1_points
            ? 0 // Loss
            : 1; // Draw;

      return [
        {
          name: match.league_entry_1,
          points: league1Points,
          gameweek: match.event,
        },
        {
          name: match.league_entry_2,
          points: league2Points,
          gameweek: match.event,
        },
      ];
    }); // Only include completed matches

  const idToNameMap = new Map(leagueData.league_entries.map((player) => [player.id, player.entry_name]));

  const playerPoints = new Map();
  const flattenedData = [];

  for (const record of transformedData.sort((a, b) => a.gameweek - b.gameweek)) {
    const { name: id, points, gameweek } = record;

    const cumulativePoints = (playerPoints.get(id) || 0) + points;
    playerPoints.set(id, cumulativePoints);

    flattenedData.push({
      name: idToNameMap.get(id) || "Unknown",
      points: cumulativePoints,
      gameweek,
    });
  }
  return flattenedData;
}
