const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    authProvider: { type: String, default: "local" },
    avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
