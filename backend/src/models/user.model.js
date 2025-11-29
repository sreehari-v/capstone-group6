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
        // Optional profile fields
        age: { type: Number },
        height: { type: Number }, // centimeters
        weight: { type: Number }, // kilograms
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: null },
        // (sessions removed: session management was a prototype and has been reverted)
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
