import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { ensureAuth } from "../middleware/auth.js"; // Protect route

const router = express.Router();

// ✅ Login Route
router.post("/login", async (req, res) => {
    console.log("🔹 Request Body:", req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        console.log("❌ No user found for email:", email);
        return res.status(401).send("Invalid Credentials");
    }

    // ✅ Check if account is locked
    if (user.isAccountLocked()) {
        const unlockTime = new Date(user.lockUntil);
        console.log("⛔ Account is locked until:", unlockTime);
        return res.status(403).send(`Account is locked. Try again after ${unlockTime}`);
    }

    console.log("✅ Found user in database:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔹 Password Match:", isMatch);

    if (!isMatch) {
        console.log("❌ Incorrect password for:", email);

        // Increase failed login attempts
        user.failedLoginAttempts += 1;

        // Lock account if failed attempts reach 5
        if (user.failedLoginAttempts >= 5) {
            user.isLocked = true;
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
            console.log("⛔ Account locked due to too many failed attempts.");
        }

        await user.save();
        return res.status(401).send("Invalid Credentials");
    }

    // ✅ Successful login: Reset failed attempts
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    await user.save();

    req.session.user = user;
    console.log("✅ Login successful for:", email);
    res.redirect("/dashboard");
});


// ✅ Middleware: Проверка авторизации
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");
}

// ✅ Профиль пользователя (Dashboard)
router.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.session.user });
});

// ✅ Обновление профиля
router.post("/update-profile", isAuthenticated, async (req, res) => {
    try {
        const { name, email } = req.body;
        await User.findByIdAndUpdate(req.session.user._id, { name, email });
        req.session.user.name = name;
        req.session.user.email = email;
        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).send("Error updating profile");
    }
});

// ✅ Смена пароля
router.post("/change-password", isAuthenticated, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.session.user._id);

        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(401).send("Incorrect current password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.session.user._id, { password: hashedPassword });
        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).send("Error changing password");
    }
});

// ✅ Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

// ✅ Delete Account Route
router.post("/account/delete", ensureAuth, async (req, res) => {
    try {
        const userId = req.session.user._id;

        // 🗑 Delete user from the database
        await User.findByIdAndDelete(userId);

        // 🗑 Destroy session and log out user
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Error deleting account.");
            }
            res.redirect("/register"); // Redirect to signup page after deletion
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).send("Server error while deleting account.");
    }
});

export default router;
