import * as d3 from "d3";
import { getPlayerLineup } from "./api.js";

const PLAYER_POSITIONS = await fetch("public/data/player-positions.csv")
  .then((response) => response.text())
  .then((text) => d3.csvParse(text))
  .catch((error) => console.error("Error fetching CSV:", error));

const PLAYER_DATA = await fetch("public/data/player-data.json")
  .then((response) => response.json())
  .then((data) => {
    return data;
  })
  .catch((error) => console.error("Error fetching JSON:", error));
const GAMEWEEK = PLAYER_DATA.length;

/***
 * @param {number} playerId
 * @returns {Promise<Array>} an array of player points for each gameweek
 */

async function computePlayerPoints(playerId) {
  let lineups = [];
  let wasted_players = 0;

  // create an array of promises for each gameweek
  const gameweekPromises = Array.from({ length: GAMEWEEK }, (_, i) => {
    const lineup = getPlayerLineup(i + 1, playerId);
  });
  for (let i = 1; i <= GAMEWEEK; i++) {
    const lineup = await getPlayerLineup(i, playerId);
    const playerIds = lineup.picks.slice(0, 12).map((pick) => {
      if (PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.minutes == 0) {
        wasted_players++;
      }
      return {
        points:
          PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.total_points,
        positions: PLAYER_POSITIONS[pick.element - 1]["position"],
        id: pick.element,
        goals:
          PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.goals_scored,
        assists: PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.assists,
        clean_sheets:
          PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.clean_sheets,
        minutes: PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.minutes,
        yellow_cards:
          PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.yellow_cards,
        red_cards:
          PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.red_cards,
        goals_conceded:
          PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.goals_conceded,
      };
    });
    lineups.push(playerIds);
  }
  return lineups;
}

async function getSummaryStatPoints(leagueMembers) {
  let summaryStats = new Array();

  // Create an array of promises for computing player points
  const playerPointsPromises = leagueMembers.map((member) =>
    computePlayerPoints(member.entry_id),
  );

  // Wait for all promises to resolve
  const allPlayerPoints = await Promise.all(playerPointsPromises);

  // Process the results
  leagueMembers.forEach((member, index) => {
    const playerPoints = allPlayerPoints[index];
    const summary = d3.rollup(
      playerPoints.flat(),
      (v) => d3.sum(v, (d) => d.points),
      (d) => d.positions,
    );
    summaryStats.push({
      name: member.entry_id,
      summary: summary,
    });
  });

  return summaryStats;
}

export { getSummaryStatPoints };
