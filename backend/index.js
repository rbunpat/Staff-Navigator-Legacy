const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 8080;
const secretKey = "mysecretkey";
const db = new sqlite3.Database("coordinates.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the tracker database.");
});

db.on("error", (err) => {
  console.error("Database error: " + err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// const db = new sqlite3.Database("users.db", (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log("Connected to the tracker database.");
//   });

//   db.on("error", (err) => {
//     console.error("Database error: " + err.message);
//   });

//   db.run(`CREATE TABLE IF NOT EXISTS positions (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT NOT NULL,
//     passwordHash TEXT NOT NULL
//   )`);

const user = {
  username: "username",
  passwordHash: "$2a$10$J2CrI8pgUewapv.HfdLijehK4D2MkjsTex6ls.VOfYCGWbL4rowl6", // "password"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use("/assets", express.static("./public/assets"));

app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.render("login");
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    if (decoded.username !== user.username) {
      throw new Error("Invalid username");
    }
    res.sendFile("index.html", { root: __dirname + "/public" });
  } catch (err) {
    res.render("login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sqlRegex = /([';]|--)/;
  if (sqlRegex.test(username) || sqlRegex.test(password)) {
    res.render("login", { error: "nice try lmao, but no sql injection here :)" });
    return;
  }

  if (
    username === user.username &&
    bcrypt.compareSync(password, user.passwordHash)
  ) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.redirect("/");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});


// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   if (
//     username === user.username &&
//     bcrypt.compareSync(password, user.passwordHash)
//   ) {
//     const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
//     res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
//     res.redirect("/");
//   } else {
//     res.render("login", { error: "Invalid username or password" });
//   }
// });

app.get("/data", function (req, res) {
  console.log(req.originalUrl);
  res.send("404 Not Found");
});

app.post("/data/save", function (req, res) {
  console.log(req.originalUrl);
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).send("Latitude and longitude are required.");
  }

  const query = `INSERT INTO positions (latitude, longitude) VALUES (?, ?)`;
  const params = [latitude, longitude];

  db.run(query, function (err) {
    if (err) {
      return res.status(500).send(`{
    "status": "400 Bad Request"
}`);
    }
    res.send(`{
"status": "200 OK"
}`);
  });
});

app.get("/data/json", function (req, res) {
  console.log(req.originalUrl);
  const limit = parseInt(req.query.limit) || 1;
  const query = `SELECT latitude, longitude, created_at FROM positions ORDER BY created_at DESC LIMIT ${limit}`;

  db.all(query, function (err, rows) {
    if (err) {
      return res.status(500).send(`{
        "status": "400 Bad Request"
    }`);
    }
    if (!rows.length) {
      return res.status(404).send(`{
        "status": "No Positions in Database"
    }`);
    }
    const positions = rows.map((row) => ({
      latitude: row.latitude,
      longitude: row.longitude,
      timestamp: row.created_at,
    }));
    res.send(JSON.stringify(positions));
  });
});

app.get("/data/json/single", function (req, res) {
  console.log(req.originalUrl);
  const limit = parseInt(req.query.limit) || 1;
  const query = `SELECT latitude, longitude FROM positions ORDER BY created_at DESC LIMIT 1`;

  db.all(query, function (err, rows) {
    if (err) {
      return res.status(500).send(`{
        "status": "400 Bad Request"
    }`);
    }
    if (!rows.length) {
      return res.status(404).send(`{
        "status": "No Positions in Database"
    }`);
    }
    const positions = rows.map((row) => ({
      latitude: row.latitude,
      longitude: row.longitude,
    }));
    res.send(JSON.stringify(positions));
  });
});

app.get("/data/plain", function (req, res) {
  console.log(req.originalUrl);
  const limit = parseInt(req.query.limit) || 1;
  const query = `SELECT latitude, longitude FROM positions ORDER BY created_at DESC LIMIT ${limit}`;

  db.all(query, function (err, rows) {
    if (err) {
      return res.status(500).send("400 Bad Request, See " + githubLink);
    }
    if (!rows.length) {
      return res.status(404).send("No positions found.");
    }
    const coordinates = rows
      .map((row) => `${row.latitude}, ${row.longitude}`)
      .join("\n");
    res.send(coordinates);
  });
});

app.get("/data/array", function (req, res) {
  console.log(req.originalUrl);
  const limit = parseInt(req.query.limit) || 1;
  const query = `SELECT latitude, longitude FROM positions ORDER BY created_at DESC LIMIT ${limit}`;

  db.all(query, function (err, rows) {
    if (err) {
      return res.status(500).send("400 Bad Request, See " + githubLink);
    }
    if (!rows.length) {
      return res.status(404).send("No positions found.");
    }
    const positions = rows.map((row) => `${row.latitude}, ${row.longitude}`);
    res.send(positions);
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
