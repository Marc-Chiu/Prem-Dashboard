const BASE_URL =
  "https://kej4uue6m7.execute-api.us-east-1.amazonaws.com/Production/";

async function getLeagueData(leagueId) {
  try {
    const leagueData = await fetch(`${BASE_URL}league/${leagueId}/details`);
    const data = await leagueData.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching league data:", error);
    return null;
  }
}

async function getPlayerLineup(week, player_id) {
  try {
    const leagueData = await fetch(
      `${BASE_URL}entry/${player_id}/event/${week}`,
    );
    const data = await leagueData.json();
    return data;
  } catch (error) {
    console.error("Error fetching league data:", error);
    return null;
  }
}

export { getPlayerLineup, getLeagueData };
