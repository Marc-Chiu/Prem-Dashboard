import * as d3 from "d3";
import { getPlayerLineup } from "./api.js";
import { LeagueDataContext } from "./contex.js";
import { useContext } from "react";
import { use } from "react";

const PLAYER_POSITIONS_PROMISE = fetch("src/data/player-positions.csv")
  .then((response) => response.text())
  .then((text) => d3.csvParse(text))
  .catch((error) => {
    console.error("Error fetching CSV:", error);
    return [];
  });

const PLAYER_DATA_PROMISE = fetch("src/data/player-data.json")
  .then((response) => response.json())
  .catch((error) => {
    console.error("Error fetching JSON:", error);
    return [];
  });

// This function loads both files in parallel.
async function loadData() {
  const [PLAYER_POSITIONS, PLAYER_DATA] = await Promise.all([PLAYER_POSITIONS_PROMISE, PLAYER_DATA_PROMISE]);
  return { PLAYER_POSITIONS, PLAYER_DATA };
}

// Cache the loaded data so that it is only read once.
let cachedData = null;

export async function getCachedData() {
  if (!cachedData) {
    cachedData = await loadData();
  }
  return cachedData;
}

/***
 * @param {number} playerId
 * @returns {Promise<Array>} an array of player points for each gameweek
 */

async function playerPointsSummary(playerId) {
  const { PLAYER_POSITIONS, PLAYER_DATA } = await getCachedData();
  const GAMEWEEK = PLAYER_DATA.length;
  //let wasted_players = 0;

  // create an array of promises for each gameweek
  const gameweekPromises = Array.from({ length: GAMEWEEK }, async (_, i) => {
    const lineup = await getPlayerLineup(i + 1, playerId);
    return lineup.picks.slice(0, 11).map((pick) => {
      // if (PLAYER_DATA[i - 1]["elements"][pick.element - 1].stats.minutes == 0) {
      //   wasted_players++;
      // }'
      const player = PLAYER_DATA[i]["elements"][pick.element - 1];
      const posRecord = PLAYER_POSITIONS.find((row) => +row.id === pick.element);
      if (!posRecord) {
        console.error(`Position not found for player ID: ${pick.element}`);
      }
      return {
        points: player.stats.total_points,
        positions: posRecord.position,
        id: pick.element,
        goals: player.stats.goals_scored,
        assists: player.stats.assists,
        clean_sheets: player.stats.clean_sheets,
        minutes: player.stats.minutes,
        yellow_cards: player.stats.yellow_cards,
        red_cards: player.stats.red_cards,
        goals_conceded: player.stats.goals_conceded,
      };
    });
  });

  return await Promise.all(gameweekPromises);
}

async function leaguePointsSummary(leagueMembers) {
  let data = new Map();
  // Create an array of promises for computing player points
  const playerPointsPromises = leagueMembers.map(async (member) => {
    await playerPointsSummary(member.entry_id).then((points) => {
      data.set(member.entry_id, points);
      return points;
    });
  });

  // Wait for all promises to resolve
  await Promise.all(playerPointsPromises);
  return data;
}

function byPositionRollup(leagueMembers, allPlayerPoints) {
  console.log(leagueMembers);
  console.log(allPlayerPoints);
  let summaryStats = new Array();

  leagueMembers.forEach((member) => {
    const playerPoints = allPlayerPoints.get(member.entry_id);

    const summary = d3.rollup(
      playerPoints.flat(),
      (v) => d3.sum(v, (d) => d.points),
      (d) => d.positions,
    );
    summaryStats.push({
      id: member.entry_id,
      name: member.entry_name,
      summary: summary,
    });
  });

  return summaryStats;
}

export function joinData(array1, array2) {
  array1.sort((a, b) => b.id - a.id);
  array2.sort((a, b) => b.league_entry - a.league_entry);
  return d3.zip(array2, array1);
}

export { leaguePointsSummary, byPositionRollup };
