import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date, default: null }
});


// Unlock the account if lock time has passed
UserSchema.methods.isAccountLocked = function () {
    if (this.isLocked && this.lockUntil && new Date() > this.lockUntil) {
        this.failedLoginAttempts = 0;
        this.isLocked = false;
        this.lockUntil = null;
        return false;
    }
    return this.isLocked;
};


// ✅ Check if model already exists before defining it
const User = mongoose.models.User || mongoose.model("User", UserSchema);







export default User;