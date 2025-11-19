// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String },
//     googleId: { type: String },
//     authProvider: { type: String, default: "local" },
//     avatar: { type: String },
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },          // optional for Google auth
        googleId: { type: String },
        authProvider: { type: String, default: "local" },
            // Email verification
            isVerified: { type: Boolean, default: false },
            verificationToken: { type: String },
            avatar: { type: String },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
