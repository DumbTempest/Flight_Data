import express from "express";
import type { Router } from "express";
import User from "../lib/models/Users";
import { Types } from "mongoose";

export const router: Router = express.Router();

export const generateAccessAndRefreshToken = async (userId: string | Types.ObjectId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new Error("Something went wrong generating tokens");
    }
};

router.get("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if ([name, email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        const { accessToken } = await generateAccessAndRefreshToken(user._id);

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            return res.status(500).json({ success: false, message: "Error creating user" });
        }

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { user: createdUser, accessToken }
        });
    } catch (error: unknown) {
        console.error("Register error:", error instanceof Error ? error.message : "Unknown error");
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;