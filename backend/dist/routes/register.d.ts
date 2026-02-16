import type { Router } from "express";
import { Types } from "mongoose";
export declare const router: Router;
export declare const generateAccessAndRefreshToken: (userId: string | Types.ObjectId) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export default router;
//# sourceMappingURL=register.d.ts.map