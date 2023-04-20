const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const sendEmail = require('./utils/sendEmail');

const userDb = new sqlite3.Database("user.db", (err) => {
    if (err) {
      console.error("User Database error: " + err.message);
    }
    console.log("User Database Connected");
  });
  
userDb.on("error", (err) => {
    console.error("User Database error: " + err.message);
});
userDb.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password_hash REAL NOT NULL,
    cane_id INTEGER NOT NULL
)`);

const resetDb = new sqlite3.Database("passwordreset.db", (err) => {
    if (err) {
      console.error("Password Reset Database error: " + err.message);
    }
    console.log("Password Reset Database Connected");
  });
  
resetDb.on("error", (err) => {
    console.error("Password Reset Database error: " + err.message);
});
resetDb.run(`CREATE TABLE IF NOT EXISTS passreset (
    reset_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    resettoken_hash REAL NOT NULL
)`);

const coordinatesDb = new sqlite3.Database("coordinates.db", (err) => {
    if (err) {
      console.error("Coordinates Database error: " + err.message);
    }
    console.log("Coordinates Database Connected");
  });
  
coordinatesDb.on("error", (err) => {
    console.error("Coordinates Database error: " + err.message);
});
coordinatesDb.run(`CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longtitude REAL NOT NULL,
    cane_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

const jwtSecret = "SLq1ayCHHKj1GZB";

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static("./public/assets"));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    console.log('/ GET');
    res.render("index");
});

app.get("/login", (req, res) => {
    console.log('/login GET');
    res.render("login");
});

app.get("/register", (req, res) => {
    console.log('/register GET');
    res.render("register");
});

app.get("/forgotpassword", (req, res) => {
    console.log('/forgotpassword GET');
    res.render("forgotpassword");
});


app.get("/dashboard", (req, res) => {
    console.log('/dashboard GET');
    
    const token = req.cookies.token;
    if (!token) {
        res.redirect("/login");
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded) {
            res.render("dashboard");
        }
    } catch (err) {
        console.log(err);
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    console.log('/logout GET');
    res.clearCookie("token");
    res.redirect("/");
});

app.get("/username", (req, res) => {
    console.log('/username GET');
    const token = req.cookies.token;
    if (!token) {
        res.status(401).send("Unauthorized");
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded) {
            res.send(decoded.email);
        }
    } catch (err) {
        console.log(err);
        res.status(401).send("Unauthorized");
    }
});

app.get("/coordinates", (req, res) => {
    console.log('/coordinates GET');
    const token = req.cookies.token;
    if (!token) {
        res.status(401).send("Unauthorized");
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded) {
            const query = `SELECT cane_id FROM users WHERE email = ?`;
            const params = [decoded.email];
            userDb.get(query, params, (err, row) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send("Internal Server error");
                    return;
                }
                if (!row) {
                    res.status(401).send("Unauthorized");
                    return;
                }
                const query = `SELECT * FROM positions WHERE cane_id = ?`;
                const params = [row.cane_id];
                coordinatesDb.all(query, params, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send("Internal Server error");
                        return;
                    }
                    res.send(rows);
                });
            });
        }
    } catch (err) {
        console.log(err);
        res.status(401).send("Unauthorized");
    }
});

app.get("/caneid", (req, res) => {
    console.log('/caneid GET');

    const token = req.cookies.token;
    if (!token) {
        res.status(401).send("Unauthorized");
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded) {
            const query = `SELECT cane_id FROM users WHERE email = ?`;
            const params = [decoded.email];
            userDb.get(query, params, (err, row) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send("Internal Server error");
                    return;
                }
                if (!row) {
                    res.status(401).send("Unauthorized");
                    return;
                }
                res.send(row.cane_id.toString());
            });
        }
    } catch (err) {
        console.log(err);
        res.status(401).send("Unauthorized");
    }
});

app.get("/resetpassword/:id/:token", (req, res) => {
    console.log('/resetpassword GET');
    const { id, token } = req.params;
    res.render("resetpassword", { id: id, token: token });
});


app.post("/login", (req, res) => {
    console.log('/login POST');

    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;
    const params = [email];

    userDb.get(query, params, (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server error");
            return;
        }
        if (!row) {
            res.render("login", { error: "Invalid email address or password" });
            return;
        }
        const passwordHash = row.password_hash;
        bcrypt.compare(password, passwordHash, (err, result) => {
            if (err) {
                console.error(err.message);
                res.status(500).send("Internal Server error");
                return;
            }
            if (!result) {
                res.render("login", { error: "Invalid email address or password" });
                return;
            }
            const token = jwt.sign({ email }, jwtSecret);
            res.cookie("token", token);
            res.redirect("/dashboard");
        });
    });
});

app.post("/register", async (req, res) => {
    console.log('/register POST');

    const { email, password, caneserial} = req.body;
    const turnstileResponse = req.body['cf-turnstile-response'];
    const caneQuery = `SELECT * FROM users WHERE cane_id = ?`;
    const emailQuery = `SELECT * FROM users WHERE email = ?`;
    const caneParams = [caneserial];
    const emailParams = [email];
    const cfSecretKey = 'turnstilekey';
    const turnstileUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    let turnstileForm = new FormData();
    turnstileForm.append('secret', cfSecretKey)
    turnstileForm.append('response', turnstileResponse);

    const result = await fetch(turnstileUrl, {
        body: turnstileForm,
        method: 'POST',
    });

    const outcome = await result.json();
    if (outcome.success) {
        userDb.get(caneQuery, caneParams, (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).send("Internal Server error");
                return;
            }
            if (row) {
                res.render("register", { error: "Cane serial already registered" });
                return;
            }
            userDb.get(emailQuery, emailParams, (err, row) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send("Internal Server error");
                    return;
                }
                if (row) {
                    res.render("register", { error: "Email already registered" });
                    return;
                }
                const hash = bcrypt.hashSync(password, 10);
                const insertQuery = `INSERT INTO users (email, password_hash, cane_id) VALUES (?, ?, ?)`;
                const insertParams = [email, hash, caneserial];
                userDb.run(insertQuery, insertParams, (err) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send("Internal Server error");
                        return;
                    }
                    res.render("login", { message: "Registration successful, please login" });
                }
                );
            });
        });
    }
    else {
        res.render("register", { error: "Invalid captcha" });
        return;
    }
});

app.post("/resetpassword", async (req, res) => {
    console.log('/resetpassword POST');

    const email = req.body.email;
    
    const mailCheckQuery = `SELECT * FROM users WHERE email = ?`;
    const mailCheckParams = [email];
    userDb.get(mailCheckQuery, mailCheckParams, (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server error");
            return;
        }
        if (!row) {
            res.render("forgotpassword", { error: "Email not registered" });
            return;
        }
        
        const findTokenQuery = `SELECT * FROM passreset WHERE user_id = ?`;
        const findTokenParams = [row.id];
        console.log(findTokenParams);
        resetDb.get(findTokenQuery, findTokenParams, async (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).send("Internal Server error");
                return;
            }
            else {
                console.log('generate new token and send mail, then hash it and store it into db');
                const token = crypto.randomBytes(32).toString('hex');
                console.log(findTokenParams);
                const link = `putyourhostnamehere/resetpassword/${findTokenParams[0]}/${token}`;
                await sendEmail(email, "Password Reset - Staff Navigator", link);
                const resetTokenHash = bcrypt.hashSync(token, 10);
                const userIdForInsert = findTokenParams[0];
                const newResetQuery = `INSERT OR REPLACE INTO passreset (user_id, resettoken_hash) VALUES (?, ?)`;
                const newResetParams = [userIdForInsert, resetTokenHash];
                resetDb.run(newResetQuery, newResetParams, (err) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send("Internal Server error");
                        return;
                    }
                });
                res.render("forgotpassword", { message: "Password reset link sent to email" });

            }
        });
    });
});

app.post("/resetpassword/:id/:token", async (req, res) => {
    console.log('/resetpassword/:id/:token POST');
    const userId = req.params.id;
    const token = req.params.token;
    const { password } = req.body;
    console.log(userId, token, password)
    const findTokenQuery = `SELECT * FROM passreset WHERE user_id = ? ORDER BY reset_id DESC LIMIT 1`;
    const findTokenParams = [userId];
    resetDb.get(findTokenQuery, findTokenParams, (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Internal Server error");
            return;
        }
        if (!row) {
            res.render("forgotpassword", { error: "Invalid token1" });
            return;
        }
        const resetTokenHash = row.resettoken_hash;
        console.log(resetTokenHash);
        bcrypt.compare(token, resetTokenHash, (err, result) => {
            if (err) {
                console.error(err.message);
                res.status(500).send("Internal Server error");
                return;
            }
            if (!result) {
                res.render("forgotpassword", { error: "Invalid token2" });
                return;
            }
            const hash = bcrypt.hashSync(password, 10);
            const updateQuery = `UPDATE users SET password_hash = ? WHERE id = ?`;
            const updateParams = [hash, userId];
            userDb.run(updateQuery, updateParams, (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send("Internal Server error");
                    return;
                }
                const deleteQuery = `DELETE FROM passreset WHERE user_id = ?`;
                const deleteParams = [userId];
                resetDb.run(deleteQuery, deleteParams, (err) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send("Internal Server error");
                        return;
                    }
                    res.render("login", { message: "Password reset successful, please login" });
                });
                
            });
        });
    });

});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
