import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function radialChart(points) {
  const longitude = d3
    .scalePoint(new Set(Plot.valueof(points, "key")), [180, -180])
    .padding(0.5)
    .align(1);
  return Plot.plot({
    width: 450,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [0, -90],
      // Note: 0.625° corresponds to max. length (here, 0.5), plus enough room for the labels
      domain: d3.geoCircle().center([0, 90]).radius(1.35)(),
    },
    color: "blue",
    marks: [
      // grey discs
      Plot.geo([1, 0.8, 0.6, 0.4, 0.2], {
        geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
        stroke: "black",
        fill: "black",
        strokeOpacity: 0.3,
        fillOpacity: 0.03,
        strokeWidth: 0.5,
      }),

      // white axes
      Plot.link(longitude.domain(), {
        x1: longitude,
        y1: 90 - 1,
        x2: 0,
        y2: 90,
        stroke: "white",
        strokeOpacity: 0.5,
        strokeWidth: 2.5,
      }),

      // tick labels
      Plot.text([0.2, 0.4, 0.6, 0.8, 1], {
        x: 180,
        y: (d) => 90 - d,
        dx: 2,
        textAnchor: "start",
        text: (d) => `${100 * d}%`,
        fill: "currentColor",
        stroke: "white",
        fontSize: 8,
      }),

      // axes labels
      Plot.text(longitude.domain(), {
        x: longitude,
        y: 90 - 1.15,
        text: Plot.identity,
        lineWidth: 5,
      }),

      // areas
      Plot.area(points, {
        x1: ({ key }) => longitude(key),
        y1: ({ value }) => 90 - value,
        x2: 0,
        y2: 90,
        fill: "blue",
        stroke: "blue",
        curve: "cardinal-closed",
      }),

      // points
      Plot.dot(points, {
        x: ({ key }) => longitude(key),
        y: ({ value }) => 90 - value,
        fill: "blue",
        stroke: "white",
      }),

      // interactive labels
      Plot.text(
        points,
        Plot.pointer({
          x: ({ key }) => longitude(key),
          y: ({ value }) => 90 - value,
          text: (d) => `${(100 * d.value).toFixed(0)}%`,
          textAnchor: "start",
          dx: 4,
          fill: "currentColor",
          stroke: "white",
          maxRadius: 10,
        }),
      ),
    ],
  });
}

// const stats = await FileAttachment("/data/attack_stats.json").json();
// const data = Object.entries(stats).map(([key, value]) => {
//         return {
//         id: key,
//         ...value
//         };
// }).filter(d => d["Top stats"]["Minutes played"] > 0);
// const radialData = d3.map(data, d => ({
//         id: d.id,
//         "xG + xA": (d["Top stats"]["xG + xA"] / (d["Top stats"]["Minutes played"] + .001)  * 90),
//         "Chances Created per 90": (d["Top stats"]["Chances created"] / (d["Top stats"]["Minutes played"] + .001) * 90),
//         "Conversion Rate": (d["Top stats"]["Goals"]),
//         "Shots per 90": (d["Top stats"]["Total shots"] / (d["Top stats"]["Minutes played"] + .001) * 90),
//         "Dispossessed per 90": (d["Attack stats"]["Dispossessed"] / (d["Top stats"]["Minutes played"] + .001)* 90),
//         "Touches per 90": (d["Attack stats"]["Touches"] / (d["Top stats"]["Minutes played"] + .001) * 90),
//         "Minutes Played": d["Top stats"]["Minutes played"]
// }));

// const chancesCreatedRank = d3.rank(radialData, d => d["Chances Created per 90"]);
// const shotsRank = d3.rank(radialData, d => d["Shots per 90"]);
// const xGxARank = d3.rank(radialData, d => d["xG + xA"]);
// const shotConversionRank = d3.rank(radialData, d => d["Conversion Rate"]);
// const dispossessedRank = d3.rank(radialData, d => d["Dispossessed per 90"]);
// const touchesRank = d3.rank(radialData, d => d["Touches per 90"]);
// const minutesPlayedRank = d3.rank(radialData, d => d["Minutes Played"]);

// const NUM_PLAYERS = radialData.length;

// const radialRank = radialData.map((player, index) => ({
//         id: parseInt(player.id),
//         "xG + xA": xGxARank[index] / NUM_PLAYERS,
//         "Chances Created per 90": chancesCreatedRank[index] / NUM_PLAYERS,
//         "Conversion Rate": shotConversionRank[index] / NUM_PLAYERS,
//         "Shots per 90": shotsRank[index] / NUM_PLAYERS,
//         "Dispossessed per 90": dispossessedRank[index] / NUM_PLAYERS,
//         "Touches per 90": touchesRank[index] / NUM_PLAYERS,
//         "Minutes Played": minutesPlayedRank[index] / NUM_PLAYERS
// }));

// function renderRadialCharts(playerRadialData) {
//         return html`<div style= "margin-right: 20px">${radialChart(playerRadialData)}</div>`
// }

// import { playerState, playerStateEvent } from "./sharedState.js";
// let player1RadialData = getRadialPoints(playerState.player1ID);
// let player2RadialData = getRadialPoints(playerState.player2ID);

// const radialContainer = document.getElementById("radial-container");

// radialContainer.appendChild(renderRadialCharts(player1RadialData));
// radialContainer.appendChild(renderRadialCharts(player2RadialData));

// playerStateEvent.addEventListener("playerIDUpdate", (event) => {
//         console.log(playerState.player1ID, playerState.player2ID);
//         // Trigger re-render or update radial data
//         player1RadialData = getRadialPoints(playerState.player1ID);
//         player2RadialData = getRadialPoints(playerState.player2ID);

//         radialContainer.innerHTML = "";

//         radialContainer.appendChild(renderRadialCharts(player1RadialData));
//         radialContainer.appendChild(renderRadialCharts(player2RadialData));
// });

function getRadialPoints(playerId) {
  return radialRank
    .flatMap(({ id, ...values }) =>
      Object.entries(values).map(([key, value]) => ({ id, key, value })),
    )
    .filter((d) => d.id == playerId);
}
