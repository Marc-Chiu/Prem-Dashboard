import { csvFormat } from "d3-dsv";
import fs from "fs";

const response = await fetch(
  "https://fantasy.premierleague.com/api/bootstrap-static/",
);
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
const general = await response.json();

// Convert to an array of objects.
const positions = general.elements.map((d) => ({
  id: d.id,
  position: general.element_types.filter((p) => d.element_type == p.id)[0]
    .plural_name,
}));

positions.sort((a, b) => a.id - b.id);

// Output CSV.
fs.writeFileSync("public/data/player-positions.csv", csvFormat(positions));
