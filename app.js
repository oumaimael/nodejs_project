//importing modules
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

//launching app
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const cors = require('cors');
app.use(cors());

// Serve static files from 'app' directory
app.use(express.static("app"));

// Export for Cloudflare Workers
module.exports = {
    async fetch(request, env, ctx) {
        // Basic adapter for Express on Workers (requires nodejs_compat)
        // Note: This is a simplified adapter. For full support, consider using a library.
        // However, since we are using nodejs_compat, we might be able to use a lighter wrapper.
        // But standard Express relies on Node.js http.IncomingMessage and http.ServerResponse.
        // We will try to use a basic response for now to verify deployment, 
        // as full Express support on Workers often requires 'hono' or specific adapters.

        // For now, let's try to return a simple response if the DB fails, 
        // or try to run the app if possible. 
        // Given the complexity of wrapping Express manually, and the user's "mysql" dependency 
        // which will definitely fail, the primary goal is to fix the "Missing entry-point" error.

        return new Response("Hello from Cloudflare Workers! Note: The MySQL connection will likely fail as Workers cannot connect to localhost.", {
            headers: { "content-type": "text/plain" }
        });
    }
};

// Only listen if not in a Worker environment (simple check)
if (typeof addEventListener === 'undefined') {
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
}


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