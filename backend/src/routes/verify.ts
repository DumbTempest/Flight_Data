import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../lib/models/Users";

export const router: Router = express.Router();

interface JwtPayload {
    _id: string;
    email?: string;
    name?: string;
}

router.get("/verify", async (req: Request, res: Response) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token missing",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string
        ) as JwtPayload;

        const user = await User.findById(decoded._id)
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
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token verification failed",
        });
    }
});

export default router;
