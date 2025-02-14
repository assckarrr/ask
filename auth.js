import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.redirect("/login");
    } catch (err) {
        res.status(400).send("Error creating user.");
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send("Invalid Credentials");
    }

    req.session.user = user;
    res.redirect("/dashboard");
});

// Logout Route
router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

export default router;
