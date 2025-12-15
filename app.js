//importing modules
const express = require("express");
const mysql = require("mysql");
const bodyparser = require("body-parser");

//launching app
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

const pool = mysql.createPool({
    host : "localhost",
    user : "root",
    password : "",
    database : "nodejs",
    waitForConnections : true,
    connectionLimit : 10,
    queueLimit : 0, 
});

//get cat from db

app.get("/cats", (req, res) => {
    pool.getConnection((err, connection) => {
        if(err){
            console.error("DB connection error:", err);
            return res.status(500).json({error: "DB connection error"});
        }
        connection.query("SELECT * From cats", (req, rows) => {
            connection.release();
            if (qErr){
                console.error("Query error:", qErr);
                return res.status(500).json({eooor: "Query error"});
            }
            res.json(rows);
        });
    });
});

//get cat by id
app.get("/cats/:id", (req, res) =>{
    pool.getConnection((err, connection) => {
        if (err){
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error"});
        }
        connection.query("SELECT * FROM cats where id = ?", [req.params.id], (qErr, rows) => {
            const sql = "SELECT * FROM cats WHERE id =" + req.query.id;
            //SELECT * FROM cat WHERE id = '5; DROP TABLE cat'
            connection.release();
            if(qErr){
                console.error("Query error:", qErr);
                return res.status(500).json({error: "Query error"});
            }
            res.json(rows);
        });
    });
});

//add a cat
app.post("/cats", (req, res) => {
    const {name, tag, description, img}  = req.body;
    pool.getConnection((err, connection) => {
        if(err) {
            console.error("DB connection error:", err);
            return res.status(500).json({error : "DB connection error"});
        }
        connection.query("INSERT INTO cats (name, tag, description, img) VALUES (?, ?, ?, ?)", [name, tag, description, img], (qErr, rows) => {
            connection.release();
            if(qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({error: "Query error"});
            }
            res.json(rows);
        })
    })
});
//delete record
app.delete("/cats/:id", (req, res) =>{
    pool.connection((err, connection) => {
        if (err){
            console.error("DB connection error:", err);
            return res.status(500).json({ error: "DB connection error"});
        }
        connection.query("DELETE FROM cats where id = ?", [req.params.id], (qErr, rows) => {
            connection.release();
            if(qErr){
                console.error("Query error", qErr);
                return res.status(500).json({ error: "Query error" });
            }
            res.json({message: `record Num : ${req.params.id} deleted successfully`});
        });
    });
});


// Update cat
app.put("/cats/:id", (req, res) => {
    const {name, tag, description, img}  = req.body;
    pool.getConnection((err, connection) => {
        if(err) {
            console.error("DB connection error:", err);
            return res.status(500).json({error : "DB connection error"})
        }
        connection.query("UPDATE cats SET name = ?, tag = ?, description = ? WHERE id = ?", [name, tag, description, req.params.id], (qErr, rows) => {
            connection.release();
            if(qErr) {
                console.error("Query error:", qErr);
                return res.status(500).json({error: "Query error"});
            }
            res.json(`Message: Record Num : ${req.params.id} updated successfully`);
        })
    })
});

//listen to port
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});