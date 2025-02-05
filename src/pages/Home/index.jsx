import * as React from "react";
import { useState, useEffect } from "react";
import {
  BubbleChartComponent,
  DraftStandings,
  ScoreByPosition,
} from "src/pages/Home/summary_cards.jsx";
import
import { getLeagueData } from "./api.js";
import * as d3 from "d3";

function joinData(array1, array2) {
  array1.sort((a, b) => b.id - a.id);
  array2.sort((a, b) => b.league_entry - a.league_entry);
  return d3.zip(array2, array1);
}

export function LeagueSummaryComponent() {
  const [selectedLeagueID, setSelectedLeagueID] = useState(null);
  const [leagueData, setLeagueData] = useState(null);
  const [pointsByPosition, setPointsByPosition] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLeagueData = async () => {
      if (selectedLeagueID) {
        setError(false); //
        const data = await getLeagueData(selectedLeagueID);
        if (data && data.league) {
          setLeagueData(data);
        } else {
          setLeagueData(null);
          setError(true);
        }
      }
    };

    fetchLeagueData();
  }, [selectedLeagueID]);

  const GenerateSummary = (event) => {
    const leagueID = document.getElementById("leagueID").value.trim();
    if (leagueID) {
      setSelectedLeagueID(leagueID);
    }
  };

  return (
    <div className="justify-centers flex min-h-screen justify-center pt-20">
      <div className="pd-2 flex flex-col items-center gap-2">
        <div className="pd-2 flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl">Enter League ID</h1>
          <a href="https://draft.premierleague.com/api/bootstrap-dynamic">
            <p className="text-sm">Click here to find league ID</p>
          </a>
        </div>
        <div className="flex gap-2">
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
          <button
            className="rounded-2xl bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            onClick={GenerateSummary}
          >
            Sumbit
          </button>
        </div>
        <div className="card chart">
          <div id="league-summary-container">
            {error ? (
              <h2>League Not Found</h2>
            ) : leagueData ? (
              leagueData.league.scoring != "h" ? (
                <h2>League is not h2h</h2>
              ) : (
                <div>
                  <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
                    {leagueData.league.name}
                  </h2>
                  <div>
                    <DraftStandings
                      members={joinData(
                        leagueData.league_entries,
                        leagueData.standings,
                      )}
                    ></DraftStandings>
                    <BubbleChartComponent
                      leagueData={leagueData}
                    ></BubbleChartComponent>
                    <ScoreByPosition
                      leagueEntries={leagueData.league_entries}
                    ></ScoreByPosition>
                  </div>
                </div>
              )
            ) : (
              <h2></h2>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeagueSummaryComponent;
