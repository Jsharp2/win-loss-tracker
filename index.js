const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

let records = {};

// Load records from file
try {
  const data = fs.readFileSync("./records.json", "utf8");
  records = JSON.parse(data);
  console.log("✅ Loaded records from file.");
} catch (err) {
  console.error("❌ Failed to load records.json:", err.message);
  records = {};
}

// Utility function
function getUserData(user) {
  const name = user.toLowerCase();
  if (!records[name]) {
    records[name] = {
      wins: 0,
      losses: 0,
      death: 0,
      color: "#ffffff",
      font: "Merienda"
    };
  }
  return records[name];
}

// Save to records.json
function saveRecords() {
  fs.writeFileSync("./records.json", JSON.stringify(records, null, 2));
}

// Add win
app.get("/addwin", (req, res) => {
  const user = req.query.user;
  if (!user) return res.send("Missing ?user=");

  const data = getUserData(user);
  data.wins++;
  saveRecords();
  res.send(`Added win for ${user}. Wins: ${data.wins}, Losses: ${data.losses}`);
});

// Add loss
app.get("/addloss", (req, res) => {
  const user = req.query.user;
  if (!user) return res.send("Missing ?user=");

  const data = getUserData(user);
  data.losses++;
  saveRecords();
  res.send(`Added loss for ${user}. Wins: ${data.wins}, Losses: ${data.losses}`);
});

// Reset
app.get("/reset", (req, res) => {
  const user = req.query.user;
  if (!user) return res.send("Missing ?user=");

  const data = getUserData(user);
  data.wins = 0;
  data.losses = 0;
  saveRecords();
  res.send(`Reset record for ${user}.`);
});

// Set color
app.get("/setcolor", (req, res) => {
  const user = req.query.user;
  const color = req.query.color;
  if (!user || !color) return res.send("Missing ?user= or ?color=");

  const data = getUserData(user);
  data.color = color;
  saveRecords();
  res.send(`Set color for ${user} to ${color}`);
});

// Set font
app.get("/setfont", (req, res) => {
  const user = req.query.user;
  const font = req.query.font;
  if (!user || !font) return res.send("Missing ?user= or ?font=");

  const data = getUserData(user);
  data.font = font;
  saveRecords();
  res.send(`Set font for ${user} to ${font}`);
});

app.get("/adddeath", (req, res) => {
  const user = req.query.user;
  if (!user) return res.send("Missing ?user=");

  const data = getUserData(user);
  data.death++;
  saveRecords();
  res.send(`Added one death for ${user}.`);
});

app.get("/showdeaths", (req, res) => {
  const user = req.query.user;
  const raw = req.query.raw === "1";
  if (!user) return res.send("Missing ?user=");

  const data = getUserData(user);

  if (raw) {
    return res.send(`Deaths: ${data.death}`);
  }

  const safeFont = encodeURIComponent(data.font);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="refresh" content="10">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: transparent;
          font-size: 48px;
          font-family: '${data.font}', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: ${data.color};
          text-shadow:
            0 0 5px ${data.color},
            0 0 10px ${data.color},
            0 0 20px ${data.color};
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=${safeFont}&display=swap" rel="stylesheet">
    </head>
    <body>
      Deaths: ${data.death}
    </body>
    </html>
  `);
});

// OBS overlay
app.get("/record", (req, res) => {
  const user = req.query.user;
  const raw = req.query.raw === "1";
  if (!user) return res.send("Missing ?user=");

  const data = getUserData(user);

  if (raw) {
    return res.send(`Record: ${data.wins}W - ${data.losses}L`);
  }

  const safeFont = encodeURIComponent(data.font);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="refresh" content="10">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: transparent;
          font-size: 48px;
          font-family: '${data.font}', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: ${data.color};
          text-shadow:
            0 0 5px ${data.color},
            0 0 10px ${data.color},
            0 0 20px ${data.color};
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=${safeFont}&display=swap" rel="stylesheet">
    </head>
    <body>
      Record: ${data.wins}W - ${data.losses}L
    </body>
    </html>
  `);
});

// Export records
app.get("/export", (req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=records.json");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(records, null, 2));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tracker running on port ${PORT}`));
