"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const Users_1 = __importDefault(require("../lib/models/Users"));
const register_1 = require("./register");
exports.router = express_1.default.Router();
exports.router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const user = await Users_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }
        const { accessToken, refreshToken } = await (0, register_1.generateAccessAndRefreshToken)(user._id);
        const loggedInUser = await Users_1.default.findById(user._id).select("-password -refreshToken");
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
    }
    catch (error) {
        console.error("Register error:", error instanceof Error ? error.message : "Unknown error");
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.default = exports.router;
//# sourceMappingURL=login.js.map