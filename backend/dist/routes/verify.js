"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = __importDefault(require("../lib/models/Users"));
exports.router = express_1.default.Router();
exports.router.get("/verify", async (req, res) => {
    try {
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token missing",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await Users_1.default.findById(decoded._id)
            .select("-password -refreshToken")
            .exec();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Token valid",
            data: user,
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token verification failed",
        });
    }
});
exports.default = exports.router;
//# sourceMappingURL=verify.js.map