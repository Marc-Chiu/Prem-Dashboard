import { useState, useEffect, useRef, useContext } from "react";
import { bubbleChart } from "src/charts/bubble.js";
import { xWinsChart } from "src/charts/xWins.js";
import { byPositionRollup } from "./util";
import { LeagueDataContext } from "./contex";
import * as d3 from "d3";

function createCircleSVG(color) {
  const svg = d3.create("svg").attr("width", 20).attr("height", 20);
  svg
    .append("g")
    .append("circle")
    .attr("transform", `translate(10, 10)`)
    .attr("r", 10)
    .attr("fill", color)
    .attr("stroke-width", 1);
  return svg.node();
}

function Circle({ color }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = "";
      const svgNode = createCircleSVG(color);
      containerRef.current.appendChild(svgNode);
    }
  }, [color]);

  return <div className="flex items-center justify-center" ref={containerRef} />;
}

export function DraftStandings({ members }) {
  const color = d3
    .scaleOrdinal()
    .domain(members.map((d) => d[1].entry_name).sort((a, b) => a < b))
    .range(d3.schemeSet3);
  return (
    <div className="grid grid-cols-3 gap-10">
      {/* League Standings */}
      <div className="card standing">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-800">League Standings</h2>
        <ol className="space-y-2">
          {members
            .sort((a, b) => a[0].rank - b[0].rank) // Sort descending by total
            .map((member) => (
              <li
                key={member[1].entry_id}
                className="placement grid grid-cols-[2fr_1fr_1fr]"
                style={{ "--color": color(member[1].entry_name) }}
              >
                <span className="text-left">{member[1].entry_name}</span>
                <span className="text-right">{member[0].total}</span>
                <Circle color={color(member[1].entry_name)}></Circle>
              </li>
            ))}
        </ol>
      </div>
      {/* League Points */}
      <div className="card standing">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-800">Points For</h2>
        <ol className="space-y-2">
          {members
            .sort((a, b) => b[0].points_for - a[0].points_for) // Sort descending by points_for
            .map((member) => (
              <li key={member[1].entry_id} className="grid grid-cols-[2fr_1fr_1fr]">
                <span className="text-left">{member[1].entry_name}</span>
                <span>{member[0].points_for}</span>
                <Circle color={color(member[1].entry_name)}></Circle>
              </li>
            ))}
        </ol>
      </div>
      {/* League Points Against*/}
      <div className="card standing">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-800">Points Against</h2>
        <ol className="space-y-2">
          {members
            .sort((a, b) => b[0].points_against - a[0].points_against) // Sort descending by points_for
            .map((member) => (
              <li key={member[1].entry_id} className="grid grid-cols-[2fr_1fr_1fr]">
                <span className="text-left">{member[1].entry_name}</span>
                <span>{member[0].points_against}</span>
                <Circle color={color(member[1].entry_name)}></Circle>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}

export function BubbleChartComponent() {
  const leagueData = useContext(LeagueDataContext);
  const chartRef = useRef(null); // Create a ref to hold the chart container
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      const chart = bubbleChart(leagueData);
      chartRef.current.appendChild(chart);
    }
  }, [leagueData]);
  return <div className="card standing" ref={chartRef}></div>;
}

export function ScoreByPosition({ data }) {
  const leagueMembers = useContext(LeagueDataContext).league_entries;
  const points = byPositionRollup(leagueMembers, data);

  return (
    <div className="my-3 grid grid-cols-4 gap-4">
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Goalkeepers Points</h1>
        <ol>
          {points
            .sort((a, b) => b.summary.get("Goalkeepers") - a.summary.get("Goalkeepers"))
            .map((member) => (
              <li key={member.name} className="flex justify-between py-0.5">
                <span className="font-medium">{member.name}</span>
                <span> {member.summary.get("Goalkeepers")}</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Defenders Points</h1>
        <ol>
          {points
            .sort((a, b) => b.summary.get("Defenders") - a.summary.get("Defenders"))
            .map((member) => (
              <li key={member.name} className="flex justify-between py-0.5">
                <span className="font-medium">{member.name}</span>
                <span> {member.summary.get("Defenders")}</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Midfielders Points</h1>
        <ol>
          {points
            .sort((a, b) => b.summary.get("Midfielders") - a.summary.get("Midfielders"))
            .map((member) => (
              <li key={member.name} className="flex justify-between py-0.5">
                <span className="font-medium">{member.name}</span>
                <span> {member.summary.get("Midfielders")}</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Forwards Points</h1>
        <ol>
          {points
            .sort((a, b) => b.summary.get("Forwards") - a.summary.get("Forwards"))
            .map((member) => (
              <li key={member.name} className="flex justify-between py-0.5">
                <span className="font-medium">{member.name}</span>
                <span> {member.summary.get("Forwards")}</span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}

export function XWinsComponent() {
  const leagueData = useContext(LeagueDataContext);
  const chartRef = useRef(null); // Create a ref to hold the chart container
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      const chart = xWinsChart(leagueData);
      console.log(chart);
      chartRef.current.appendChild(chart);
    }
  });
  return <div className="card standing m-0" ref={chartRef}></div>;
}
