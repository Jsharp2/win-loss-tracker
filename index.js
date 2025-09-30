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
      pokeloss: 0,
      runloss: 0,
      death: 0,
      knives: 0,
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

// Add knife
app.get("/addknife", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.knives++;
  saveRecords();

  res.send(`${channel} has gotten:  ${data.knives} knife kills`);
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
  const deathParam = req.query.death;

  if (!channel || !deathParam) return res.send("Missing ?channel= or ?death=");

  const deathsToAdd = parseInt(deathParam, 10);
  if (isNaN(deathsToAdd) || deathsToAdd < 0) {
    return res.send("Invalid death count. Must be a non-negative number.");
  }

  const data = getChannelData(channel);
  data.death += deathsToAdd;
  saveRecords();

  res.send(`Added ${deathsToAdd} deaths to ${channel}. New Total: ${data.death}.`);
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
app.get("/knifereset", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.wins = 0;
  data.losses = 0;
  saveRecords();

  res.send(`${channel}'s record has been reset.`);
});

// Reset knives
app.get("/reset", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.knives = 0;
  saveRecords();

  res.send(`${channel}'s knife kills reset.`);
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


app.get("/nuzloss", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

  data.runloss += 1;
  data.pokeloss = 0;
  saveRecords();

  res.send(`Run Loss. F in Chat`);
});

app.get("/nuzdeaths", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const deadPoke = req.query.name;
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.pokeloss += 1;
  saveRecords();

  res.send(`RIP ${deadPoke}. o7`);
});

// Show record overlay
app.get("/shownuzdeaths", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const raw = req.query.raw === "1";
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

  if (raw) {
    return res.send(`L Plus Ratio`);
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
      Graveyard: ${data.pokeloss}
    </body>
    </html>
  `);
});

// Show record overlay
app.get("/shownuzlosses", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const raw = req.query.raw === "1";
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

  if (raw) {
    return res.send(`L Plus Ratio`);
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
      Run: ${data.runloss}
    </body>
    </html>
  `);
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

// Show death overlay
app.get("/showknifekills", (req, res) => {
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
      Knives: ${data.knives}
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
