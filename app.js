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

app.get("/cats", (req, res) => {

});

//listen to port
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});