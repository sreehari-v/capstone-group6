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
