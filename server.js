import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // Hash passwords
import User from "./models/user.js"; // Import User model
import authRoutes from "./routes/auth.js"; // Correct Path

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

// Render login and register pages
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

// ✅ Handle user registration (POST /register)
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("❌ User already exists. Try logging in.");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Store user session and redirect to dashboard
        req.session.user = newUser;
        res.redirect("/dashboard");

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Server Error. Please try again.");
    }
});

// Redirect "/" to "/login" so users see the login page first
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
