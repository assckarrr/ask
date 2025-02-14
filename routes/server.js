import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js"; // Import task routes

dotenv.config();
const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Use express-session for authentication
app.use(session({
    secret: process.env.SESSION_SECRET || "my_secret_key",
    resave: false,
    saveUninitialized: false
}));

// Connect to MongoDB Atlas
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Stop server on connection error
    }
}
connectDB();

// Import authentication routes
app.use("/", authRoutes);

// Import task routes
app.use("/tasks", taskRoutes);

// Render login and register pages
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

// Redirect "/" to "/login" so users see the login page first
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

