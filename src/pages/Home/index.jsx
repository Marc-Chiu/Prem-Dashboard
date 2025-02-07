import * as React from "react";
import { useState, useEffect } from "react";
import {
  BubbleChartComponent,
  DraftStandings,
  ScoreByPosition,
  XWinsComponent,
  PointsByAction,
} from "src/pages/Home/summary_cards.jsx";
import { getLeagueData } from "src/pages/Home/api.js";
import { leaguePointsSummary, joinData } from "src/pages/Home/util.js";
import { LeagueDataContext, WeeklyPointsContext } from "src/pages/Home/contex.js";

export function LeagueSummaryComponent() {
  const [selectedLeagueID, setSelectedLeagueID] = useState(null);

  const GenerateSummary = () => {
    const leagueID = document.getElementById("leagueID").value.trim();
    setSelectedLeagueID(leagueID);
  };

  useEffect(() => {}, [selectedLeagueID]);

  return (
    <div className="justify-centers flex min-h-screen justify-center pt-20">
      <div className="pd-2 flex flex-col items-center gap-2">
        <div id="enter-league" className="pd-2 flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl">Enter League ID</h1>
          <a href="https://draft.premierleague.com/api/bootstrap-dynamic">
            <p className="text-sm">Click here to find league ID</p>
          </a>
        </div>
        <div id="league-input" className="flex gap-2">
          <input
            type="text"
            id="leagueID"
            className="rounded-2xl border-2 border-gray-500 px-4 py-2 text-center"
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                GenerateSummary(e);
              }
            }}
          />
          <button className="rounded-2xl bg-gray-500 px-4 py-2 text-white hover:bg-gray-700" onClick={GenerateSummary}>
            Sumbit
          </button>
        </div>
        <Graphs leagueID={selectedLeagueID}></Graphs>
      </div>
    </div>
  );
}

function Graphs({ leagueID }) {
  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState(null);
  const [weeklyPoints, setPointsByPosition] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!leagueID) {
      return;
    }
    const fetchLeagueData = async () => {
      try {
        const data = await getLeagueData(leagueID);
        const weeklyPoints = await leaguePointsSummary(data.league_entries);
        setLeagueData(data);
        setPointsByPosition(weeklyPoints);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [leagueID]);

  if (!leagueID) {
    return <div className="text-3xl">Enter a League ID to view the summary</div>;
  }

  if (error) {
    return <div>Error: Please Enter a Valid ID</div>;
  }

  if (!leagueData || leagueData.league.scoring != "h") {
    return <div>Please Enter a valid league</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div id="league-charts" className="card chart">
      <div id="league-summary-container">
        <div>
          <h2 className="mb-6 text-center text-xl font-bold text-gray-800">{leagueData.league.name}</h2>
          <div className="grid grid-cols-1 gap-4">
            <LeagueDataContext.Provider value={leagueData}>
              <WeeklyPointsContext.Provider value={weeklyPoints}>
                <DraftStandings members={joinData(leagueData.league_entries, leagueData.standings)}></DraftStandings>
                <BubbleChartComponent></BubbleChartComponent>
                <ScoreByPosition data={weeklyPoints}></ScoreByPosition>
                <XWinsComponent></XWinsComponent>
                <PointsByAction></PointsByAction>
              </WeeklyPointsContext.Provider>
            </LeagueDataContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeagueSummaryComponent;
