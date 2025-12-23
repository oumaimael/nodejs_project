//importing modules
const express = require("express");
const { createClient } = require('@supabase/supabase-js'); // Added Supabase
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();

//launching app
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const sessionStore = new pgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: false // User said table exists
});

app.use(cookieParser());
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const cors = require('cors');
app.use(cors({
    origin: true, // Allow all origins (or specify your frontend URL)
    credentials: true // Allow cookies
}));

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
// Start server only if not running in Vercel (Vercel exports the app)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Local dev server running on http://localhost:${port}`);
        console.log(`Using Supabase: ${process.env.SUPABASE_URL ? 'true' : 'false'}`);
    });
}

module.exports = app;

//get all cats from db
app.get("/cats", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cats')
            .select('*');

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//get cat by id
app.get("/cats/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cats')
            .select('*')
            .eq('id', req.params.id)
            .single(); // Use single() to get one record

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: "Cat not found" });
        }

        res.json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//add a cat
app.post("/cats", async (req, res) => {
    const { name, tag, description, img } = req.body;

    try {
        const { data, error } = await supabase
            .from('cats')
            .insert([{ name, tag, description, img }])
            .select(); // Returns the inserted row

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data[0]); // Return the inserted cat
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//delete cat record
app.delete("/cats/:id", async (req, res) => {
    try {
        const { error } = await supabase
            .from('cats')
            .delete()
            .eq('id', req.params.id);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: `Record Num: ${req.params.id} deleted successfully` });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update cat
app.put("/cats/:id", async (req, res) => {
    const { name, tag, description, img } = req.body;

    try {
        const { data, error } = await supabase
            .from('cats')
            .update({ name, tag, description, img })
            .eq('id', req.params.id)
            .select(); // Optional: returns updated row

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({
            message: `Record Num: ${req.params.id} updated successfully`,
            data: data[0] // Return updated data
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//get all users from db
app.get("/users", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//get user by id
app.get("/users/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.id)
            .single(); // Use single() to get one record

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//add a user
app.post("/users", async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{ userName, email, password }])
            .select(); // Returns the inserted row

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data[0]); // Return the inserted user
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//delete user
app.delete("/users/:id", async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: `Record Num: ${req.params.id} deleted successfully` });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update user
app.put("/users/:id", async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ userName, email, password })
            .eq('id', req.params.id)
            .select(); // Optional: returns updated row

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({
            message: `Record Num: ${req.params.id} updated successfully`,
            data: data[0] // Return updated data
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});