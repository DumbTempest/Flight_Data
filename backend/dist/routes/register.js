"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessAndRefreshToken = exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../lib/models/Users"));
exports.router = express_1.default.Router();
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await Users_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (err) {
        throw new Error("Something went wrong generating tokens");
    }
};
exports.generateAccessAndRefreshToken = generateAccessAndRefreshToken;
exports.router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if ([name, email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingUser = await Users_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }
        const user = await Users_1.default.create({
            name,
            email,
            password,
        });
        const { accessToken } = await (0, exports.generateAccessAndRefreshToken)(user._id);
        const createdUser = await Users_1.default.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            return res.status(500).json({ success: false, message: "Error creating user" });
        }
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { user: createdUser, accessToken }
        });
    }
    catch (error) {
        console.error("Register error:", error instanceof Error ? error.message : "Unknown error");
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.default = exports.router;
//# sourceMappingURL=register.js.map