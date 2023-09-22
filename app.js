const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());
let db = null;

result = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server stated at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error at ${e.message}`);
    process.exit(1);
  }
};
result();

//API 1

app.get("/players/", async (request, response) => {
  const playerDetails = `SELECT player_id AS playerId,
  player_name AS playerName
  FROM player_details;`;
  const viewPlayers = await db.all(playerDetails);
  response.send(viewPlayers);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const specificPlayer = `SELECT player_id AS playerId,
  player_name AS playerName FROM player_details WHERE player_id = ${playerId};`;
  const playerDetailsResponse = await db.get(specificPlayer);
  response.send(playerDetailsResponse);
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `UPDATE player_details 
    SET player_name = '${playerName}'`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

// API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetails = `SELECT match_id AS matchId, match, year FROM match_details
    WHERE match_id = ${matchId};
    `;
  const matchDetailsResponse = await db.get(matchDetails);
  response.send(matchDetailsResponse);
});

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const matchDetailsResponse = `SELECT match_id AS matchId, match, year FROM player_match_score NATURAL JOIN match_details
     WHERE player_id = ${playerId}`;
  const result = await db.all(matchDetailsResponse);
  response.send(result);
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerIdQuery = `SELECT player_id AS playerId, player_name AS playerName 
    FROM player_match_score  NATURAL JOIN player_details
    WHERE match_id = ${matchId}`;
  const playerIdResponse = await db.all(playerIdQuery);
  response.send(playerIdResponse);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerScoreQuery = `SELECT player_id AS playerId, player_name AS playerName, SUM(score) AS totalScore, SUM(fours) AS totalFours, SUM(sixes) AS totalSixes
    FROM player_details NATURAL JOIN player_match_score 
    WHERE player_id = ${playerId} ;
    `;
  const stats = await db.get(playerScoreQuery);
  response.send(stats);
});

module.exports = app;
