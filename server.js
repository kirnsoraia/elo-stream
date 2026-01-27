import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIGURAÇÕES =====
const FACEIT_API_KEY = "d7d99ce4-db81-49e0-904e-d05c7afd665a";
const FACEIT_NICK = "xsekh";
const STEAM_ID_64 = "76561198953388206";

// ===== FACEIT =====
async function getFaceit() {
  const res = await fetch(
    `https://api.faceit.com/data/v4/players?nickname=${FACEIT_NICK}`,
    {
      headers: {
        Authorization: `Bearer ${FACEIT_API_KEY}`,
      },
    }
  );
  const data = await res.json();

const game = data.games?.cs2 || data.games?.csgo;

return {
  level: game?.skill_level ?? "N/A",
  elo: game?.faceit_elo ?? "N/A",
};

}

// ===== PREMIER =====
async function getPremier() {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=730&steamid=${STEAM_ID_64}`
  );
  const data = await res.json();

  const rating = data.playerstats.stats.find(
    (s) => s.name === "cs2_premier_rating"
  )?.value;

  return rating ?? "N/A";
}

// ===== ROTA =====
app.get("/", async (req, res) => {
  const faceit = await getFaceit();
  const premier = await getPremier();

  res.send(
    `Faceit lvl ${faceit.level} (${faceit.elo} elo) | Premier ${premier}`
  );
});

app.listen(PORT, () => console.log("Online"));
