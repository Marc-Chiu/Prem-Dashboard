import { useState, useEffect, useRef } from "react";
import { bubbleChart } from "src/charts/bubble.js";
import { getSummaryStatPoints } from "./util.js";

export function DraftStandings({ members }) {
  return (
    <div className="grid grid-cols-2 gap-10">
      {/* League Standings */}
      <div className="card standing">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
          League Standings
        </h2>
        <ol className="space-y-2">
          {members
            .sort((a, b) => b[0].total - a[0].total) // Sort descending by total
            .map((member, index) => (
              <li
                key={member[1].entry_id}
                className="placement grid grid-cols-2"
              >
                <span className="text-left">{member[1].entry_name}</span>
                <span>{member[0].total}</span>
              </li>
            ))}
        </ol>
      </div>

      {/* League Points */}
      <div className="card standing">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
          League Points
        </h2>
        <ol className="space-y-2">
          {members
            .sort((a, b) => b[0].points_for - a[0].points_for) // Sort descending by points_for
            .map((member, index) => (
              <li key={member[1].entry_id} className="grid grid-cols-2">
                <span className="text-left">{member[1].entry_name}</span>
                <span>{member[0].points_for}</span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}

export function BubbleChartComponent({ leagueData }) {
  const chartRef = useRef(null); // Create a ref to hold the chart container
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      const chart = bubbleChart(leagueData);
      chartRef.current.appendChild(chart);
    }
  }, [leagueData]); // Re-run the effect if leagueData changes
  return <div className="card standing" ref={chartRef}></div>;
}

export function ScoreByPosition({ leagueEntries }) {
  const names = leagueEntries.reduce((map, entry) => {
    map[entry.entry_id] = entry.entry_name;
    return map;
  }, {});

  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      const pointsData = await getSummaryStatPoints(leagueEntries);
      console.log(pointsData);
      setPoints(pointsData);
      setLoading(false);
    };

    fetchPoints();
  }, [leagueEntries]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-3 grid grid-cols-4 gap-4">
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Goalkeepers Points</h1>
        <ol>
          {points
            .sort(
              (a, b) =>
                b.summary.get("Goalkeepers") - a.summary.get("Goalkeepers"),
            )
            .map((member) => (
              <li
                key={names[member.name]}
                className="flex justify-between py-0.5"
              >
                <span className="font-medium">{names[member.name]}</span>
                <span> {member.summary.get("Goalkeepers")}</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Defenders Points</h1>
        <ol>
          {points
            .sort(
              (a, b) => b.summary.get("Defenders") - a.summary.get("Defenders"),
            )
            .map((member) => (
              <li key={member} className="flex justify-between py-0.5">
                <span className="font-medium">{names[member.name]}</span>
                <span> {member.summary.get("Defenders")}</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Midfielders Points</h1>
        <ol>
          {points
            .sort(
              (a, b) =>
                b.summary.get("Midfielders") - a.summary.get("Midfielders"),
            )
            .map((member) => (
              <li
                key={names[member.name]}
                className="flex justify-between py-0.5"
              >
                <span className="font-medium">{names[member.name]}</span>
                <span> {member.summary.get("Midfielders")}</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="card standing">
        <h1 className="mb-4 text-lg font-bold">Forwards Points</h1>
        <ol>
          {points
            .sort(
              (a, b) => b.summary.get("Forwards") - a.summary.get("Forwards"),
            )
            .map((member) => (
              <li
                key={names[member.name]}
                className="flex justify-between py-0.5"
              >
                <span className="font-medium">{names[member.name]}</span>
                <span> {member.summary.get("Forwards")}</span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}
