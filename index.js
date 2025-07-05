const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

let wins = 0;
let losses = 0;

app.get("/", (req, res) => {
  res.send(`Wins: ${wins} | Losses: ${losses}`);
});

app.get("/addwin", (req, res) => {
  wins++;
  res.send(`Wins: ${wins} | Losses: ${losses}`);
});

app.get("/addloss", (req, res) => {
  losses++;
  res.send(`Wins: ${wins} | Losses: ${losses}`);
});

app.get("/reset", (req, res) => {
  wins = 0;
  losses = 0;
  res.send(`Reset. Wins: ${wins} | Losses: ${losses}`);
});

app.get("/record", (req, res) => {
  if (req.query.raw === "1") {
    // Plain text for Nightbot
    res.send(`Record: ${wins}W - ${losses}L`);
  } else {
    // OBS Styled Overlay
    const color = "#a68fe2"; // 💡 Change this one variable to change all colors
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="5">
          <link href="https://fonts.googleapis.com/css2?family=Merienda:wght@700&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              color: ${color};
              font-size: 36px;
              font-family: 'Merienda', cursive;
              text-shadow:
                0 0 5px ${color},
                0 0 10px ${color},
                0 0 20px ${color},
                0 0 40px ${color};
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
          </style>
        </head>
        <body>
          Record: ${wins}W - ${losses}L
        </body>
      </html>
    `);
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
