//importing modules
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();

//launching app
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const cors = require('cors');
app.use(cors());

// Import API handlers
const catsHandler = require('./api/cats');
const usersHandler = require('./api/users');

// API routes MUST come before static files
app.all('/api/cats', async (req, res) => {
    await catsHandler(req, res);
});

app.all('/api/users', async (req, res) => {
    await usersHandler(req, res);
});

// Serve static files from 'app' directory (AFTER API routes)
app.use(express.static("app"));

// Start server
app.listen(port, () => {
    console.log(`🚀 Local dev server running on http://localhost:${port}`);
    console.log(`📊 Using Supabase: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
});



const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//get cat from db

app.get("/cats", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("SELECT * From cats", (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(rows);
        });
    });
});

//get cat by id
app.get("/cats/:id", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("SELECT * FROM cats where id = ?", [req.params.id], (qErr, rows) => {
            const sql = "SELECT * FROM cats WHERE id =" + req.query.id;
            //SELECT * FROM cat WHERE id = '5; DROP TABLE cat'
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(rows);
        });
    });
});

//add a cat
app.post("/cats", (req, res) => {
    const { name, tag, description, img } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("INSERT INTO cats (name, tag, description, img) VALUES (?, ?, ?, ?)", [name, tag, description, img], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(rows);
        })
    })
});
//delete record
app.delete("/cats/:id", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("DELETE FROM cats where id = ?", [req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json({ message: `record Num : ${req.params.id} deleted successfully` });
        });
    });
});


// Update cat
app.put("/cats/:id", (req, res) => {
    const { name, tag, description, img } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" })
        }
        connection.query("UPDATE cats SET name = ?, tag = ?, description = ?, img = ? WHERE id = ?", [name, tag, description, img, req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(`Message: Record Num : ${req.params.id} updated successfully`);
        })
    })
});



//get user from db

app.get("/users", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("SELECT * From users", (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(rows);
        });
    });
});

//get user by id
app.get("/users/:id", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("SELECT * FROM users where id = ?", [req.params.id], (qErr, rows) => {
            const sql = "SELECT * FROM users WHERE id =" + req.query.id;
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(rows);
        });
    });
});

//add a user
app.post("/users", (req, res) => {
    const { userName, email, password } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("INSERT INTO users (userName, email, password) VALUES (?, ?, ?)", [userName, email, password], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(rows);
        })
    })
});
//delete user
app.delete("/users/:id", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" });
        }
        connection.query("DELETE FROM users where id = ?", [req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json({ message: `record Num : ${req.params.id} deleted successfully` });
        });
    });
});


// Update user
app.put("/users/:id", (req, res) => {
    const { userName, email, password } = req.body;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error" })
        }
        connection.query("UPDATE users SET userName = ?, email = ?, password = ? WHERE id = ?", [userName, email, password, req.params.id], (qErr, rows) => {
            connection.release();
            if (qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json(`Message: Record Num : ${req.params.id} updated successfully`);
        })
    })
});