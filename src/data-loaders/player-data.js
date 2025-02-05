import fs from "fs";

const FANTASY_URL = "https://fantasy.premierleague.com/api";
const DRAFT_URL = "https://draft.premierleague.com/api";

const response = await fetch(DRAFT_URL + "/league/11135/details");
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);

const leagueData = await response.json();
const gameweeks =
  leagueData.matches.filter((match) => match.finished == true).length / 6;

const allPlayerData = [];

for (let i = 1; i <= gameweeks; i++) {
  const playerData = await fetch(FANTASY_URL + "/event/" + i + "/live");
  if (!playerData.ok) throw new Error(`fetch failed: ${playerData.status}`);
  const data = await playerData.json();
  allPlayerData.push(data);
}

// Output JSON.
fs.writeFileSync("public/data/player-data.json", JSON.stringify(allPlayerData));
