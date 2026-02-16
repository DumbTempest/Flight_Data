import express from "express";
import type { Router } from "express";
import User from "../lib/models/Users";
import { generateAccessAndRefreshToken } from "./register";

export const router: Router = express.Router();

router.post("/", async (req, res)  => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User logged in successfully",
                data: { user: loggedInUser, accessToken, refreshToken }
            });
    } catch (error: unknown) {
        console.error("Register error:", error instanceof Error ? error.message : "Unknown error");
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;