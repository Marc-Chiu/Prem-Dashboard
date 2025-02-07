import * as d3 from "d3";
import { getPlayerLineup } from "./api.js";

let cachedData = null;

const PLAYER_POSITIONS_PROMISE = fetch("public/data/player-positions.csv")
  .then((response) => response.text())
  .then((text) => d3.csvParse(text))
  .catch((error) => {
    console.error("Error fetching CSV:", error);
    return [];
  });

const PLAYER_DATA_PROMISE = fetch("public/data/player-data.json")
  .then((response) => response.json())
  .catch((error) => {
    console.error("Error fetching JSON:", error);
    return [];
  });

async function loadData() {
  const [PLAYER_POSITIONS, PLAYER_DATA] = await Promise.all([PLAYER_POSITIONS_PROMISE, PLAYER_DATA_PROMISE]);
  return { PLAYER_POSITIONS, PLAYER_DATA };
}

export async function getCachedData() {
  if (!cachedData) {
    cachedData = await loadData();
  }
  return cachedData;
}

// function calcPoint(position, )

/***
 * @param {number} playerId
 * @returns {Promise<Array>} an array of player points for each gameweek
 */

async function playerPointsSummary(playerId, name) {
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
        goals_points:
          posRecord.position == "Goalkeepers" || posRecord.position == "Defenders"
            ? player.stats.goals_scored * 6
            : posRecord.position == "Defenders"
              ? player.stats.goals_scored * 5
              : player.stats.goals_scored * 4,
        assists: player.stats.assists,
        assists_points: player.stats.assists * 3,
        clean_sheets: player.stats.clean_sheets,
        clean_sheet_points:
          player.stats.clean_sheets == 0
            ? 0
            : posRecord.position == "Goalkeepers" || posRecord.position == "Defenders"
              ? 4
              : posRecord.position == "Midfielders"
                ? 1
                : 0,
        minutes: player.stats.minutes,
        minutes_points: player.stats.minutes > 60 ? 2 : player.stats.minutes > 0 ? 1 : 0,
        yellow_cards: player.stats.yellow_cards,
        red_cards: player.stats.red_cards,
        goals_conceded: player.stats.goals_conceded,
        player_id: playerId,
        player_name: name,
      };
    });
  });

  return await Promise.all(gameweekPromises);
}

async function leaguePointsSummary(leagueMembers) {
  let data = new Map();
  // Create an array of promises for computing player points
  const playerPointsPromises = leagueMembers.map(async (member) => {
    await playerPointsSummary(member.entry_id, member.player_first_name).then((points) => {
      data.set(member.entry_id, points);
      return points;
    });
  });

  // Wait for all promises to resolve
  await Promise.all(playerPointsPromises);
  return data;
}

function byPositionRollup(leagueMembers, allPlayerPoints) {
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
