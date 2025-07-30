const express = require("express");
const cors = require("cors");
const fs = require("fs");

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
function getChannelData(channel) {
  const name = channel.toLowerCase();
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
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.wins++;
  saveRecords();

  res.send(`Added win for ${channel}. Wins: ${data.wins}, Losses: ${data.losses}`);
});

// Add loss
app.get("/addloss", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.losses++;
  saveRecords();

  res.send(`Added loss for ${channel}. Wins: ${data.wins}, Losses: ${data.losses}`);
});

// Add death
app.get("/adddeath", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.death++;
  saveRecords();

  res.send(`Added one death for ${channel}. Total deaths: ${data.death}`);
});

app.get("/adddeaths", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const death = req.query.death;
  if (!channel || !death) return res.send("Missing ?channel= or ?death=");

  const data = getChannelData(channel);
  data.death += death;
  saveRecords();

  res.send(`Add ${death} to ${channel}. New Total: ${data.death}.`);
});

app.get("/setdeath", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const death = req.query.death;
  if (!channel || !death) return res.send("Missing ?channel= or ?death=");

  const data = getChannelData(channel);
  data.death = death;
  saveRecords();

  res.send(`Set deaths for ${channel} to ${death}`);
});

// Reset record
app.get("/reset", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.wins = 0;
  data.losses = 0;
  saveRecords();

  res.send(`${channel}'s record has been reset.`);
});

// Reset deaths
app.get("/resetDeath", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.death = 0;
  saveRecords();

  res.send(`${channel}'s death counter has been reset.`);
});

// Set color
app.get("/setcolor", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const color = req.query.color;
  if (!channel || !color) return res.send("Missing ?channel= or ?color=");

  const data = getChannelData(channel);
  data.color = color;
  saveRecords();

  res.send(`Set color for ${channel} to ${color}`);
});

// Set font
app.get("/setfont", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const font = req.query.font;
  if (!channel || !font) return res.send("Missing ?channel= or ?font=");

  const data = getChannelData(channel);
  data.font = font;
  saveRecords();

  res.send(`Set font for ${channel} to ${font}`);
});

// Show record overlay
app.get("/record", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const raw = req.query.raw === "1";
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

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

// Show death overlay
app.get("/showdeaths", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const raw = req.query.raw === "1";
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

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

// Export data
app.get("/export", (req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=records.json");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(records, null, 2));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tracker running on port ${PORT}`));
