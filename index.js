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
  res.send(`Added win. Wins: ${wins} | Losses: ${losses}`);
});

app.get("/addloss", (req, res) => {
  losses++;
  res.send(`Added loss. Wins: ${wins} | Losses: ${losses}`);
});

app.get("/reset", (req, res) => {
  wins = 0;
  losses = 0;
  res.send(`Reset. Wins: ${wins} | Losses: ${losses}`);
});

app.get("/record", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="5">
        <style>
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            color: #b64ed1; /* Neon green */
            font-size: 36px;
            font-family: 'Orbitron', sans-serif;
            text-shadow: 0 0 5px #b64ed1, 0 0 10px #b64ed1, 0 0 20px #b64ed1;
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
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
