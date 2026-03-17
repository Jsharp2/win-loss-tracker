const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
const TWITCH_BROADCASTER_ID = process.env.TWITCH_BROADCASTER_ID;


const app = express();
app.use(cors());

let records = {};
let activePolls = {};

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
      font: "Merienda",
      goodRez: 0,
      badRez: 0,
      percent: 0,
    };
  }
  return records[name];
}

// Save to records.json
function saveRecords() {
  fs.writeFileSync("./records.json", JSON.stringify(records, null, 2));
}

app.get("/twitch/callback", async (req, res) => {

  const code = req.query.code;

  try {

    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: "https://win-loss-tracker.onrender.com/twitch/callback"
        }
      }
    );

    console.log("ACCESS TOKEN:", response.data.access_token);

    res.send("Twitch authorization complete. Check server logs.");

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.send("OAuth failed");

  }

});

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

// Add Good Rez
app.get("/addGoodRez", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.goodRez++;
  data.percent = Math.round((data.goodRez / (data.goodRez + data.badRez)) * 10000) / 100;
  saveRecords();

  res.send(`Added a good rez for ${channel}. Good Rez: ${data.goodRez}, Bad Rez: ${data.badRez}. Percent: ${data.percent}`);
});

// Add Bad Rez
app.get("/addBadRez", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);
  data.badRez++;
  data.percent = Math.round((data.goodRez / (data.goodRez + data.badRez)) * 10000) / 100;
  saveRecords();

  res.send(`Added a bad rez for ${channel}. Good Rez: ${data.goodRez}, Bad Rez: ${data.badRez}. Percent: ${data.percent}`);
});



// Add Good Rezs
app.get("/setGoodRezs", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const deathParam = req.query.death;

  if (!channel || !deathParam) return res.send("Missing ?channel= or ?death=");

  const deathsToAdd = parseInt(deathParam, 10);
  if (isNaN(deathsToAdd) || deathsToAdd < 0) {
    return res.send("Invalid death count. Must be a non-negative number.");
  }

  const data = getChannelData(channel);
  data.goodRez = deathsToAdd;
  data.percent = Math.round((data.goodRez / (data.goodRez + data.badRez)) * 10000) / 100;
  saveRecords();

  res.send(`Set good rezs for ${channel} to ${deathsToAdd}. Good Rez: ${data.goodRez}, Bad Rez: ${data.badRez}. Percent: ${data.percent}`);
});

// Add Bad Rezs
app.get("/setBadRezs", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const deathParam = req.query.death;

  if (!channel || !deathParam) return res.send("Missing ?channel= or ?death=");

  const deathsToAdd = parseInt(deathParam, 10);
  if (isNaN(deathsToAdd) || deathsToAdd < 0) {
    return res.send("Invalid death count. Must be a non-negative number.");
  }

  const data = getChannelData(channel);
  data.badRez = deathsToAdd;
  data.percent = Math.round((data.goodRez / (data.goodRez + data.badRez)) * 10000) / 100;
  saveRecords();

  res.send(`Set bad rezs for ${channel} to  ${deathsToAdd}. Good Rez: ${data.goodRez}, Bad Rez: ${data.badRez}. Percent: ${data.percent}`);
});

app.get("/resetRez", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

  data.badRez = 0;
  data.goodRez = 0;
  saveRecords();

  res.send(`Rezs reset for ${channel}`);
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

app.get("/startRezPoll", async (req, res) => {

  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  try {

    const response = await axios.post(
      "https://api.twitch.tv/helix/polls",
      {
        broadcaster_id: TWITCH_BROADCASTER_ID,
        title: "Was it a good rez?",
        choices: [
          { title: "Yes" },
          { title: "No" }
        ],
        duration: 60
      },
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${TWITCH_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const poll = response.data.data[0];

    activePolls[channel] = {
      twitchPollId: poll.id,
      active: true
    };

    res.send("Twitch rez poll started!");

    setTimeout(() => finishRezPoll(channel), 61000);

  } catch (err) {

    console.error(err.response?.data || err.message);
    res.send("Failed to start Twitch poll");

  }

});

app.get("/voteYes", (req, res) => {

  const channel = req.query.channel?.toLowerCase();
  const user = req.query.user?.toLowerCase();

  if (!channel || !user)
    return res.send("Missing ?channel= or ?user=");

  const poll = activePolls[channel];

  if (!poll || !poll.active)
    return res.send("No active poll");

  if (poll.voters.has(user))
    return res.send("You already voted");

  poll.voters.add(user);
  poll.yes++;

  res.send("Vote counted");

});

app.get("/voteNo", (req, res) => {

  const channel = req.query.channel?.toLowerCase();
  const user = req.query.user?.toLowerCase();

  if (!channel || !user)
    return res.send("Missing ?channel= or ?user=");

  const poll = activePolls[channel];

  if (!poll || !poll.active)
    return res.send("No active poll");

  if (poll.voters.has(user))
    return res.send("You already voted");

  poll.voters.add(user);
  poll.no++;

  res.send("Vote counted");

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

//Sets knives
app.get("/setknife", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const knife = req.query.death;
  if (!channel || !knife) return res.send("Missing ?channel= or ?death=");

  const data = getChannelData(channel);
  data.knives = knife;
  saveRecords();

  res.send(`Set knives for ${channel} to ${knife}`);
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

// Reset knives
app.get("/knifereset", (req, res) => {
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

// Show rez  overlay
app.get("/showrezper", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  const raw = req.query.raw === "1";
  if (!channel) return res.send("Missing ?channel=");

  const data = getChannelData(channel);

  if (raw) {
    return res.send(`Record: ${data.wins}W - ${data.losses}L`);
  }

  let desc;

if (data.goodRez + data.badRez == 0)
{
  desc = `Rez: ${data.goodRez} / ${data.badRez} / 0%`;
}
else
{
  desc = `Rez: ${data.goodRez} / ${data.badRez} / ${((data.goodRez / (data.goodRez + data.badRez)) * 100).toFixed(2)}%`;
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
      ${desc}
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

app.get("/showRezPoll", (req, res) => {
  const channel = req.query.channel?.toLowerCase();
  if (!channel) return res.send("Missing ?channel=");

  const poll = activePolls[channel];
  const data = getChannelData(channel);

  if (!poll || !poll.active) {
    return res.send("");
  }

  const safeFont = encodeURIComponent(data.font);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="refresh" content="2">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: transparent;
          font-size: 48px;
          font-family: '${data.font}', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: ${data.color};
          text-shadow:
            0 0 5px ${data.color},
            0 0 10px ${data.color},
            0 0 20px ${data.color};
          text-align: center;
        }

        .voteRow {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 10px 0;
        }

        img {
          height: 64px;   /* 👈 Change emote size here */
          width: auto;
        }

      </style>

      <link href="https://fonts.googleapis.com/css2?family=${safeFont}&display=swap" rel="stylesheet">
    </head>

    <body>

      <div>Was it a good rez?</div>

      <div class="voteRow">
        <img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_4af923b4a6df4001b529141413990892/default/dark/1.0"
        <div>Yes: ${poll.yes}</div>
      </div>

      <div class="voteRow">
        <img src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_c4450bfb31ef45b8ab157ba099b37081/default/dark/1.0" height="48">
        <div>No: ${poll.no}</div>
      </div>

    </body>
    </html>
  `);
});

async function finishRezPoll(channel) {

  const pollData = activePolls[channel];
  if (!pollData) return;

  try {

    const response = await axios.get(
      `https://api.twitch.tv/helix/polls?broadcaster_id=${TWITCH_BROADCASTER_ID}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${TWITCH_ACCESS_TOKEN}`
        }
      }
    );

    const poll = response.data.data[0];

    const yesVotes = poll.choices[0].votes;
    const noVotes = poll.choices[1].votes;

    const data = getChannelData(channel);

    if (yesVotes >= noVotes) {
      data.goodRez++;
    } else {
      data.badRez++;
    }

    data.percent = Math.round((data.goodRez / (data.goodRez + data.badRez)) * 10000) / 100;

    saveRecords();

    console.log(`Twitch poll result: YES ${yesVotes} / NO ${noVotes}`);

  } catch (err) {

    console.error(err.response?.data || err.message);

  }

}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tracker running on port ${PORT}`));
